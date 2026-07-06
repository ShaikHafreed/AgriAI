// app/screens/TaskManagerScreen.jsx — Day 11
// Farm Task Manager: daily tasks, crop calendar auto-suggest, and scheduled reminders.
// Firestore (anon-auth scoped) is the source of truth; AsyncStorage caches for offline reads
// and queues mutations made while offline (see utils/taskManager.js).

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Modal, TextInput, Switch, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import BottomNavBar, { BOTTOM_NAV_HEIGHT } from '../../components/BottomNavBar';
import OfflineBanner from '../../components/OfflineBanner';
import { tr } from '../../utils/i18n';
import {
  ensureAnonAuth, fetchTasks, addTask, deleteTask, toggleTaskDone, flushPendingOps,
} from '../../utils/taskManager';
import {
  configureNotificationHandler, requestNotificationPermission, scheduleTaskReminder,
} from '../../utils/notifications';
import {
  SEASONS, getCurrentSeason, suggestSeasonalTasks, monthName, durationMonths,
} from '../../utils/cropCalendar';
import { addNetworkListener } from '../../utils/offlineManager';
import { safeGoBack } from '../../utils/navHelpers';

const C = {
  green: '#1B5E20', greenLight: '#388E3C', greenPale: '#E8F5E9',
  amber: '#E65100', amberLight: '#FFF3E0',
  red: '#C62828', redLight: '#FFEBEE',
  bg: '#F1F8E9', card: '#FFFFFF',
  text: '#212121', textMuted: '#558B2F', border: '#C8E6C9',
};

const toDate = (v) => (v ? new Date(v) : new Date());

function TaskRow({ task, lang, onToggle, onDelete }) {
  const due = toDate(task.dueDate);
  return (
    <View style={S.taskRow}>
      <TouchableOpacity onPress={() => onToggle(task)} style={S.checkbox}>
        <Ionicons
          name={task.done ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={task.done ? C.green : C.textMuted}
        />
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text style={[S.taskTitle, task.done && S.taskTitleDone]}>
          {task.cropEmoji ? `${task.cropEmoji} ` : ''}{task.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={S.taskDue}>
            {due.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {due.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {task.reminderNotifId && <Ionicons name="notifications" size={12} color={C.amber} />}
        </View>
      </View>
      <TouchableOpacity onPress={() => onDelete(task)} style={{ padding: 6 }}>
        <Ionicons name="trash-outline" size={18} color={C.red} />
      </TouchableOpacity>
    </View>
  );
}

function AddTaskModal({ visible, lang, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [reminder, setReminder] = useState(true);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    if (visible) { setTitle(''); setDueDate(new Date()); setReminder(true); }
  }, [visible]);

  const onDateChange = (event, selected) => {
    setShowDate(Platform.OS === 'ios');
    if (selected) {
      const d = new Date(dueDate);
      d.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setDueDate(d);
    }
  };
  const onTimeChange = (event, selected) => {
    setShowTime(Platform.OS === 'ios');
    if (selected) {
      const d = new Date(dueDate);
      d.setHours(selected.getHours(), selected.getMinutes());
      setDueDate(d);
    }
  };

  const handleSave = () => {
    if (!title.trim()) { Alert.alert('', tr('taskTitle', lang)); return; }
    onSave({ title: title.trim(), dueDate, reminder });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={S.modalBackdrop}>
        <View style={S.modalCard}>
          <Text style={S.modalHeading}>{tr('addTask', lang)}</Text>

          <Text style={S.inputLabel}>{tr('taskTitle', lang)}</Text>
          <TextInput
            style={S.input}
            value={title}
            onChangeText={setTitle}
            placeholder={tr('taskTitle', lang)}
            placeholderTextColor="#9E9E9E"
          />

          <Text style={S.inputLabel}>{tr('dueDate', lang)}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={S.dateBtn} onPress={() => setShowDate(true)}>
              <Ionicons name="calendar-outline" size={16} color={C.green} />
              <Text style={S.dateBtnText}>{dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={S.dateBtn} onPress={() => setShowTime(true)}>
              <Ionicons name="time-outline" size={16} color={C.green} />
              <Text style={S.dateBtnText}>{dueDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
          </View>
          {showDate && (
            <DateTimePicker value={dueDate} mode="date" display={Platform.OS === 'ios' ? 'inline' : 'default'} onChange={onDateChange} />
          )}
          {showTime && (
            <DateTimePicker value={dueDate} mode="time" display="default" onChange={onTimeChange} />
          )}

          <View style={S.reminderRow}>
            <Text style={S.inputLabel}>{tr('setReminder', lang)}</Text>
            <Switch
              value={reminder}
              onValueChange={setReminder}
              trackColor={{ false: C.border, true: C.greenLight }}
              thumbColor={reminder ? C.green : '#fff'}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            <TouchableOpacity style={[S.modalBtn, { backgroundColor: C.border }]} onPress={onClose}>
              <Text style={[S.modalBtnText, { color: C.text }]}>{tr('cancel', lang)}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[S.modalBtn, { backgroundColor: C.green }]} onPress={handleSave}>
              <Text style={[S.modalBtnText, { color: '#fff' }]}>{tr('save', lang)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function TaskManagerScreen() {
  const router = useRouter();
  const [lang, setLang] = useState('EN');
  const [view, setView] = useState('tasks'); // 'tasks' | 'calendar'
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [authError, setAuthError] = useState(false);
  const uidRef = useRef(null);

  const refresh = async () => {
    if (!uidRef.current) return;
    const list = await fetchTasks(uidRef.current);
    setTasks(list);
  };

  // Bail out of an action with a clear message instead of crashing when Firebase
  // Anonymous Auth isn't enabled yet (signInAnonymously fails silently → uid stays null).
  const requireUid = () => {
    if (uidRef.current) return true;
    Alert.alert(
      '⚠️ Setup needed',
      'Task sync isn\'t connected yet. In the Firebase Console, go to Authentication → Sign-in method and enable "Anonymous", then reopen this screen.'
    );
    return false;
  };

  useEffect(() => {
    configureNotificationHandler();
    (async () => {
      const uid = await ensureAnonAuth();
      uidRef.current = uid;
      if (uid) await refresh();
      else setAuthError(true);
      setLoading(false);
    })();

    const unsub = addNetworkListener(async (online) => {
      if (online && uidRef.current) {
        await flushPendingOps(uidRef.current);
        await refresh();
      }
    });
    return unsub;
  }, []);

  const handleToggle = async (task) => {
    if (!requireUid()) return;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)));
    await toggleTaskDone(uidRef.current, task.id, !task.done);
  };

  const handleDelete = (task) => {
    if (!requireUid()) return;
    Alert.alert(
      lang === 'TE' ? 'పని తొలగించాలా?' : lang === 'HI' ? 'कार्य हटाएं?' : 'Delete task?',
      '',
      [
        { text: tr('cancel', lang), style: 'cancel' },
        {
          text: tr('delete', lang), style: 'destructive',
          onPress: async () => {
            setTasks((prev) => prev.filter((t) => t.id !== task.id));
            await deleteTask(uidRef.current, task.id);
          },
        },
      ]
    );
  };

  const handleSaveTask = async ({ title, dueDate, reminder }) => {
    if (!requireUid()) return;
    setModalVisible(false);
    let reminderNotifId = null;
    if (reminder) {
      const granted = await requestNotificationPermission();
      if (granted) reminderNotifId = await scheduleTaskReminder({ title, dueDate });
    }
    await addTask(uidRef.current, {
      title, done: false, dueDate: dueDate.toISOString(), cropEmoji: null, reminderNotifId,
    });
    await refresh();
  };

  const handleAddSeasonalTasks = async () => {
    if (!requireUid()) return;
    const season = getCurrentSeason();
    const drafts = suggestSeasonalTasks(season, lang);
    const granted = await requestNotificationPermission();
    for (const d of drafts) {
      let reminderNotifId = null;
      if (granted) reminderNotifId = await scheduleTaskReminder({ title: d.title, dueDate: d.dueDate });
      await addTask(uidRef.current, {
        title: d.title, done: false, dueDate: d.dueDate.toISOString(), cropEmoji: d.cropEmoji, reminderNotifId,
      });
    }
    await refresh();
    Alert.alert('✅', tr('seasonalTasksAdded', lang));
    setView('tasks');
  };

  // ── Group tasks for the list view ──────────────────────────────────────────
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday); startOfTomorrow.setDate(startOfToday.getDate() + 1);

  const groups = { overdue: [], today: [], upcoming: [], completed: [] };
  [...tasks].sort((a, b) => toDate(a.dueDate) - toDate(b.dueDate)).forEach((t) => {
    if (t.done) { groups.completed.push(t); return; }
    const due = toDate(t.dueDate);
    if (due < startOfToday) groups.overdue.push(t);
    else if (due < startOfTomorrow) groups.today.push(t);
    else groups.upcoming.push(t);
  });

  const sections = [
    { key: 'overdue', label: tr('sectionOverdue', lang), items: groups.overdue },
    { key: 'today', label: tr('sectionToday', lang), items: groups.today },
    { key: 'upcoming', label: tr('sectionUpcoming', lang), items: groups.upcoming },
    { key: 'completed', label: tr('sectionCompleted', lang), items: groups.completed },
  ];

  const currentSeason = getCurrentSeason();

  return (
    <SafeAreaView style={S.root}>
      <OfflineBanner />
      <LinearGradient colors={[C.green, C.greenLight]} style={S.header}>
        <TouchableOpacity onPress={() => safeGoBack(router)} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle}>{tr('taskManager', lang)}</Text>
          <Text style={S.headerSub}>{tr('taskManagerSubtitle', lang)}</Text>
        </View>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </LinearGradient>

      <View style={S.tabBar}>
        <TouchableOpacity style={[S.tab, view === 'tasks' && S.tabActive]} onPress={() => setView('tasks')}>
          <Text style={[S.tabText, view === 'tasks' && S.tabTextActive]}>{tr('tabTasks', lang)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[S.tab, view === 'calendar' && S.tabActive]} onPress={() => setView('calendar')}>
          <Text style={[S.tabText, view === 'calendar' && S.tabTextActive]}>{tr('tabCropCalendar', lang)}</Text>
        </TouchableOpacity>
      </View>

      {authError && (
        <View style={S.authBanner}>
          <Ionicons name="warning-outline" size={16} color={C.red} />
          <Text style={S.authBannerText}>
            Sync setup needed: enable "Anonymous" sign-in for this project in the Firebase Console → Authentication → Sign-in method.
          </Text>
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={C.green} size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
          {view === 'tasks' ? (
            tasks.length === 0 ? (
              <Text style={S.emptyText}>{tr('noTasksYet', lang)}</Text>
            ) : (
              sections.filter((s) => s.items.length > 0).map((s) => (
                <View key={s.key} style={S.section}>
                  <Text style={S.sectionTitle}>{s.label}</Text>
                  {s.items.map((t) => (
                    <TaskRow key={t.id} task={t} lang={lang} onToggle={handleToggle} onDelete={handleDelete} />
                  ))}
                </View>
              ))
            )
          ) : (
            <View style={S.section}>
              <Text style={S.sectionTitle}>{SEASONS[currentSeason].label[lang]}</Text>
              {SEASONS[currentSeason].crops.map((crop) => (
                <View key={crop.key} style={S.cropCard}>
                  <Text style={S.cropTitle}>{crop.emoji} {crop.names[lang] || crop.names.EN}</Text>
                  <View style={S.calendarRow}>
                    <View style={S.calendarItem}>
                      <Text style={S.calendarLabel}>{tr('sow', lang)}</Text>
                      <Text style={S.calendarValue}>{monthName(crop.sowMonth, lang)}</Text>
                    </View>
                    <View style={S.calendarItem}>
                      <Text style={S.calendarLabel}>{tr('duration', lang)}</Text>
                      <Text style={S.calendarValue}>{durationMonths(crop.sowMonth, crop.harvestMonth)} {lang === 'TE' ? 'నెలలు' : lang === 'HI' ? 'महीने' : 'months'}</Text>
                    </View>
                    <View style={S.calendarItem}>
                      <Text style={S.calendarLabel}>{tr('harvest', lang)}</Text>
                      <Text style={S.calendarValue}>{monthName(crop.harvestMonth, lang)}</Text>
                    </View>
                  </View>
                </View>
              ))}
              <TouchableOpacity style={S.seasonalBtn} onPress={handleAddSeasonalTasks}>
                <Ionicons name="notifications-outline" size={18} color="#fff" />
                <Text style={S.seasonalBtnText}>{tr('addReminderTasks', lang)}</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={{ height: 80 + BOTTOM_NAV_HEIGHT }} />
        </ScrollView>
      )}

      {view === 'tasks' && (
        <TouchableOpacity style={S.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      <AddTaskModal visible={modalVisible} lang={lang} onClose={() => setModalVisible(false)} onSave={handleSaveTask} />
      <BottomNavBar active="tasks" lang={lang} />
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: 14, paddingHorizontal: 14 },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 1 },
  tabBar: { flexDirection: 'row', backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: C.green },
  tabText: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  tabTextActive: { color: C.green },
  authBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.redLight, padding: 10, marginHorizontal: 14, marginTop: 10, borderRadius: 10 },
  authBannerText: { flex: 1, fontSize: 11, color: C.red, lineHeight: 16 },
  scroll: { padding: 14 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: C.green, marginBottom: 10 },
  emptyText: { textAlign: 'center', color: C.textMuted, fontSize: 13, marginTop: 60 },
  taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  checkbox: { marginRight: 10 },
  taskTitle: { fontSize: 14, fontWeight: '600', color: C.text },
  taskTitleDone: { textDecorationLine: 'line-through', color: C.textMuted },
  taskDue: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  fab: { position: 'absolute', right: 20, bottom: 24 + BOTTOM_NAV_HEIGHT, width: 54, height: 54, borderRadius: 27, backgroundColor: C.green, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6 },
  cropCard: { backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  cropTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 10 },
  calendarRow: { flexDirection: 'row', justifyContent: 'space-between' },
  calendarItem: { alignItems: 'center', flex: 1 },
  calendarLabel: { fontSize: 10, color: C.textMuted, marginBottom: 2 },
  calendarValue: { fontSize: 12, fontWeight: '700', color: C.green },
  seasonalBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.amber, borderRadius: 12, padding: 14, marginTop: 4 },
  seasonalBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32 },
  modalHeading: { fontSize: 17, fontWeight: '700', color: C.green, marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: C.text, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: C.text },
  dateBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  dateBtnText: { fontSize: 12, color: C.text, fontWeight: '600' },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  modalBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  modalBtnText: { fontSize: 14, fontWeight: '700' },
});
