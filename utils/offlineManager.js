// utils/offlineManager.js — Day 10
// Handles: network detection, cache read/write, offline banner state

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const CACHE_PREFIX = 'agriai_cache_';
const CACHE_TTL    = { weather: 3600000, market: 7200000, crops: 86400000 }; // ms

// ── Network state ─────────────────────────────────────────────────────────────
let _isOnline = true;
let _listeners = [];

export const initNetworkListener = (onStatusChange) => {
  const unsub = NetInfo.addEventListener(state => {
    const online = !!(state.isConnected && state.isInternetReachable !== false);
    if (online !== _isOnline) {
      _isOnline = online;
      _listeners.forEach(fn => fn(online));
      if (onStatusChange) onStatusChange(online);
    }
  });
  return unsub;
};

export const addNetworkListener = (fn) => { _listeners.push(fn); return () => { _listeners = _listeners.filter(f => f !== fn); }; };
export const isOnline = () => _isOnline;
export const getIsOnline = () => _isOnline;

export const checkOnline = async () => {
  const state = await NetInfo.fetch();
  _isOnline = !!(state.isConnected && state.isInternetReachable !== false);
  return _isOnline;
};

// ── Cache ─────────────────────────────────────────────────────────────────────
export const cacheSet = async (key, data) => {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch (e) {}
};

export const cacheGet = async (key, type = 'weather') => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    const ttl = CACHE_TTL[type] || 3600000;
    if (Date.now() - ts > ttl) return null; // expired
    return data;
  } catch (e) { return null; }
};

export const cacheGetStale = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw).data; // return even if expired
  } catch (e) { return null; }
};

export const cacheClear = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (e) {}
};

export const cacheStats = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    return { count: cacheKeys.length, keys: cacheKeys.map(k => k.replace(CACHE_PREFIX, '')) };
  } catch (e) { return { count: 0, keys: [] }; }
};
