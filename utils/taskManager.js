// utils/taskManager.js — Day 11
// Firestore-backed task list, scoped to an anonymous Firebase Auth uid, with an
// AsyncStorage read cache + offline mutation queue (same shape as utils/offlineManager.js).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore, collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, query, orderBy,
} from 'firebase/firestore';
import { app, auth } from '../firebaseConfig';
import { checkOnline, cacheSet, cacheGetStale } from './offlineManager';
import { cancelTaskReminder } from './notifications';

const PENDING_KEY = 'agriai_pending_task_ops';
let db = null;
const getDb = () => { if (!db) db = getFirestore(app); return db; };

const ANON_AUTH_TIMEOUT_MS = 8000;

// Resolves to a uid, or null if auth fails/is misconfigured/never responds (e.g. flaky
// rural network) — callers must not hang the UI waiting on Firebase indefinitely.
export const ensureAnonAuth = () => new Promise((resolve) => {
  if (auth.currentUser) { resolve(auth.currentUser.uid); return; }

  let settled = false;
  let unsub = () => {};
  let timer = null;
  const finish = (uid) => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
    unsub();
    resolve(uid);
  };

  unsub = onAuthStateChanged(auth, (user) => {
    if (user) finish(user.uid);
  });
  timer = setTimeout(() => {
    console.log('Anonymous sign-in timed out after', ANON_AUTH_TIMEOUT_MS, 'ms — check network connectivity.');
    finish(null);
  }, ANON_AUTH_TIMEOUT_MS);

  signInAnonymously(auth).catch((e) => {
    console.log('Anonymous sign-in failed — enable Anonymous auth in Firebase Console (Authentication > Sign-in method):', e.code || e.message);
    finish(null);
  });
});

const tasksRef = (uid) => collection(getDb(), 'users', uid, 'tasks');

// ── Pending offline-op queue ─────────────────────────────────────────────────
const loadPending = async () => {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
};
const savePending = async (ops) => {
  try { await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(ops)); } catch (e) {}
};
// Collapses update/delete ops targeting a not-yet-synced 'add' into that same
// queued add, since Firestore has never heard of the local_ id yet.
const queueOp = async (op) => {
  const ops = await loadPending();

  if ((op.op === 'update' || op.op === 'delete') && op.id?.startsWith('local_')) {
    const addIdx = ops.findIndex((o) => o.op === 'add' && o.localId === op.id);
    if (addIdx !== -1) {
      if (op.op === 'update') ops[addIdx].payload = { ...ops[addIdx].payload, ...op.payload };
      else ops.splice(addIdx, 1); // delete cancels the queued add entirely
      await savePending(ops);
      return;
    }
  }

  ops.push({ ...op, ts: Date.now() });
  await savePending(ops);
};

// ── Reads ─────────────────────────────────────────────────────────────────────
export const fetchTasks = async (uid) => {
  const online = await checkOnline();
  if (online) {
    try {
      const snap = await getDocs(query(tasksRef(uid), orderBy('dueDate')));
      const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      await cacheSet('tasks_' + uid, tasks);
      return tasks;
    } catch (e) {
      return (await cacheGetStale('tasks_' + uid)) || [];
    }
  }
  return (await cacheGetStale('tasks_' + uid)) || [];
};

// ── Writes (online: direct Firestore; offline: optimistic cache + queue) ──────
export const addTask = async (uid, task) => {
  const online = await checkOnline();
  const cached = (await cacheGetStale('tasks_' + uid)) || [];

  if (online) {
    const ref = await addDoc(tasksRef(uid), task);
    const tasks = [...cached, { id: ref.id, ...task }];
    await cacheSet('tasks_' + uid, tasks);
    return ref.id;
  }

  const localId = 'local_' + Date.now();
  const tasks = [...cached, { id: localId, ...task }];
  await cacheSet('tasks_' + uid, tasks);
  await queueOp({ op: 'add', localId, payload: task });
  return localId;
};

export const updateTask = async (uid, id, updates) => {
  const online = await checkOnline();
  const cached = (await cacheGetStale('tasks_' + uid)) || [];
  const tasks = cached.map((t) => (t.id === id ? { ...t, ...updates } : t));
  await cacheSet('tasks_' + uid, tasks);

  if (online && !id.startsWith('local_')) {
    await updateDoc(doc(getDb(), 'users', uid, 'tasks', id), updates);
  } else {
    await queueOp({ op: 'update', id, payload: updates });
  }
};

export const toggleTaskDone = async (uid, id, done) => {
  const task = ((await cacheGetStale('tasks_' + uid)) || []).find((t) => t.id === id);
  if (task?.reminderNotifId && done) await cancelTaskReminder(task.reminderNotifId);
  await updateTask(uid, id, { done });
};

export const deleteTask = async (uid, id) => {
  const online = await checkOnline();
  const cached = (await cacheGetStale('tasks_' + uid)) || [];
  const task = cached.find((t) => t.id === id);
  if (task?.reminderNotifId) await cancelTaskReminder(task.reminderNotifId);

  const tasks = cached.filter((t) => t.id !== id);
  await cacheSet('tasks_' + uid, tasks);

  if (online && !id.startsWith('local_')) {
    await deleteDoc(doc(getDb(), 'users', uid, 'tasks', id));
  } else if (!id.startsWith('local_')) {
    await queueOp({ op: 'delete', id });
  }
  // local_-only tasks that were never synced just vanish from cache — nothing to queue.
};

// ── Reconnect flush ────────────────────────────────────────────────────────────
export const flushPendingOps = async (uid) => {
  const ops = await loadPending();
  if (!ops.length) return;

  const failed = [];
  for (const op of ops) {
    try {
      if (op.op === 'add') {
        await addDoc(tasksRef(uid), op.payload);
      } else if (op.op === 'update') {
        await updateDoc(doc(getDb(), 'users', uid, 'tasks', op.id), op.payload);
      } else if (op.op === 'delete') {
        await deleteDoc(doc(getDb(), 'users', uid, 'tasks', op.id));
      }
    } catch (e) { failed.push(op); }
  }
  await savePending(failed);
  await fetchTasks(uid); // refresh cache + resolve local_ ids to real Firestore ids
};
