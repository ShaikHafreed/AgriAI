// app/screens/ProfileScreen.jsx
// Real identity (Google or guest), live task stats, account + preferences — replaces the
// previous empty stub. Visual reference: https://www.canva.com/d/ZZmVWmBi2uDC0sr

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { ensureAnonAuth, fetchTasks } from '../../utils/taskManager';
import { signInWithGoogle, signOutGoogle } from '../../utils/googleAuth';
import { getGuestProfile } from '../../utils/guestProfile';
import { checkOnline, addNetworkListener } from '../../utils/offlineManager';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import OfflineBanner from '../../components/OfflineBanner';
import { tr } from '../../utils/i18n';

const C = {
  green: '#1B5E20', greenLight: '#388E3C', greenPale: '#E8F5E9',
  amber: '#E65100', red: '#C62828', redLight: '#FFEBEE',
  bg: '#F1F8E9', card: '#FFFFFF',
  text: '#212121', textMuted: '#558B2F', border: '#C8E6C9',
};

const initials = (name) => (name || '?')
  .trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || '?';

function StatCard({ icon, value, label }) {
  return (
    <View style={S.statCard}>
      <Ionicons name={icon} size={20} color={C.green} />
      <Text style={S.statValue}>{value}</Text>
      <Text style={S.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ icon, iconColor, label, sublabel, onPress, danger, right, last }) {
  return (
    <TouchableOpacity style={[S.row, last && S.rowLast]} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <View style={[S.rowIcon, danger && { backgroundColor: C.redLight }]}>
        <Ionicons name={icon} size={18} color={danger ? C.red : (iconColor || C.green)} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[S.rowLabel, danger && { color: C.red }]}>{label}</Text>
        {sublabel ? <Text style={S.rowSublabel}>{sublabel}</Text> : null}
      </View>
      {right || (onPress && <Ionicons name="chevron-forward" size={18} color={C.textMuted} />)}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const [lang, setLang] = useState('EN');
  const [user, setUser] = useState(null); // Firebase currentUser (may be anonymous)
  const [guest, setGuest] = useState(null); // { name, mobile } fallback for mock-OTP path
  const [stats, setStats] = useState({ total: 0, completed: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState(false);
  const [online, setOnline] = useState(true);

  const loadStats = useCallback(async (uid) => {
    if (!uid) return;
    const tasks = await fetchTasks(uid);
    const now = new Date();
    const completed = tasks.filter((t) => t.done).length;
    const upcoming = tasks.filter((t) => !t.done && new Date(t.dueDate) >= now).length;
    setStats({ total: tasks.length, completed, upcoming });
  }, []);

  useEffect(() => {
    getGuestProfile().then(setGuest);
    checkOnline().then(setOnline);
    const unsubNet = addNetworkListener(setOnline);

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await loadStats(u.uid);
      setLoading(false);
    });

    // Triggers anonymous sign-in if there's no session yet — the listener above
    // picks up the resulting auth state, so stats aren't fetched a second time here.
    ensureAnonAuth();

    return () => { unsubAuth(); unsubNet(); };
  }, [loadStats]);

  const isGuestOnly = !user || user.isAnonymous;
  const displayName = !isGuestOnly ? (user.displayName || user.email) : (guest?.name || tr('guestBadge', lang));
  const email = !isGuestOnly ? user.email : null;
  const photoURL = !isGuestOnly ? user.photoURL : null;

  const handleLinkGoogle = async () => {
    setLinking(true);
    try {
      const signedInUser = await signInWithGoogle();
      if (signedInUser) { setUser(signedInUser); await loadStats(signedInUser.uid); }
    } catch (e) {
      Alert.alert('Sign-in failed', e.message || 'Could not sign in with Google.');
    } finally {
      setLinking(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(tr('signOutConfirmTitle', lang), '', [
      { text: tr('cancel', lang), style: 'cancel' },
      {
        text: tr('signOut', lang), style: 'destructive',
        onPress: async () => { await signOutGoogle(); router.replace('/screens/LoginScreen'); },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={S.root}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={C.green} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={S.root}>
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient colors={[C.green, C.greenLight]} style={S.header}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ position: 'absolute', top: Platform.OS === 'ios' ? 8 : 4, right: 14 }}>
            <LanguageSwitcher lang={lang} setLang={setLang} />
          </View>

          <View style={S.avatarWrap}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={S.avatarImg} />
            ) : (
              <View style={S.avatarFallback}><Text style={S.avatarInitials}>{initials(displayName)}</Text></View>
            )}
          </View>
          <Text style={S.name}>{displayName}</Text>
          {email ? <Text style={S.email}>{email}</Text> : (
            <View style={S.guestBadge}><Text style={S.guestBadgeText}>{tr('guestBadge', lang)}</Text></View>
          )}
        </LinearGradient>

        <View style={S.statsRow}>
          <StatCard icon="list-outline" value={stats.total} label={tr('totalTasksStat', lang)} />
          <StatCard icon="checkmark-circle-outline" value={stats.completed} label={tr('completedStat', lang)} />
          <StatCard icon="time-outline" value={stats.upcoming} label={tr('upcomingStat', lang)} />
        </View>

        <Text style={S.sectionTitle}>{tr('accountSection', lang)}</Text>
        <View style={S.card}>
          {isGuestOnly && (
            <Row
              icon="logo-google"
              label={linking ? '…' : tr('linkGoogleAccount', lang)}
              sublabel={tr('linkGoogleHint', lang)}
              onPress={linking ? undefined : handleLinkGoogle}
            />
          )}
          <Row icon="log-out-outline" label={tr('signOut', lang)} onPress={handleSignOut} danger last />
        </View>

        <Text style={S.sectionTitle}>{tr('preferencesSection', lang)}</Text>
        <View style={S.card}>
          <Row
            icon="language-outline"
            label={tr('languageLabel', lang)}
            right={<Text style={S.rowValue}>{lang === 'EN' ? 'English' : lang === 'TE' ? 'తెలుగు' : 'हिन्दी'}</Text>}
          />
          <Row
            icon={online ? 'cloud-done-outline' : 'cloud-offline-outline'}
            iconColor={online ? C.green : C.red}
            label={tr('syncStatus', lang)}
            right={<View style={[S.statusDot, { backgroundColor: online ? C.green : C.red }]} />}
            last
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 8 : 4, left: 14, padding: 4 },
  avatarWrap: { marginTop: 30, marginBottom: 12 },
  avatarImg: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)' },
  avatarFallback: { width: 84, height: 84, borderRadius: 42, borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 28, fontWeight: '700', color: '#fff' },
  name: { fontSize: 18, fontWeight: '700', color: '#fff' },
  email: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  guestBadge: { marginTop: 6, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 12 },
  guestBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, marginTop: -18 },
  statCard: { flex: 1, backgroundColor: C.card, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 4, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  statValue: { fontSize: 18, fontWeight: '700', color: C.text },
  statLabel: { fontSize: 10, color: C.textMuted, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.green, marginTop: 24, marginBottom: 8, marginHorizontal: 16 },
  card: { backgroundColor: C.card, borderRadius: 16, marginHorizontal: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.greenPale, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 14, fontWeight: '600', color: C.text },
  rowSublabel: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  rowValue: { fontSize: 13, fontWeight: '600', color: C.textMuted },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
});
