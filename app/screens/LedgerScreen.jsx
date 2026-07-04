// ============================================================
// AgriAI — Day 12: Farm Ledger (Kharcha & Munafa Tracker)
// Offline-first expense/income tracker with per-crop profit.
// Money data lives in AsyncStorage only — works fully offline.
// ============================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import OfflineBanner from '../../components/OfflineBanner';
import { tr } from '../../utils/i18n';

const LEDGER_KEY = '@agriai_ledger_entries_v1';

const C = {
  green: '#1B5E20',
  greenLight: '#388E3C',
  red: '#C0392B',
  profit: '#1E8449',
  amber: '#E67E22',
};

// ---------- Screen-local translations (uppercase codes, app convention) ----------
const L = {
  EN: {
    subtitle: 'Track every rupee. Know your real profit.',
    expense: 'Expense', income: 'Income', addEntry: 'Add Entry',
    amount: 'Amount (₹)', crop: 'Crop', note: 'Note (optional)', category: 'Category',
    save: 'Save', cancel: 'Cancel',
    totalSpent: 'Total Spent', totalEarned: 'Total Earned',
    netProfit: 'Net Profit', netLoss: 'Net Loss',
    byCrop: 'Profit by Crop', byCategory: 'Spending by Category', recent: 'Recent Entries',
    empty: 'No entries yet. Add your first expense or sale below.',
    deleteConfirm: 'Delete this entry?', yes: 'Yes', no: 'No',
    invalidAmount: 'Please enter a valid amount', needCrop: 'Please enter a crop name',
    cat_seeds: 'Seeds', cat_fertilizer: 'Fertilizer', cat_pesticide: 'Pesticide',
    cat_labor: 'Labor', cat_equipment: 'Equipment', cat_water: 'Water/Fuel',
    cat_transport: 'Transport', cat_sale: 'Crop Sale', cat_other: 'Other',
  },
  TE: {
    subtitle: 'ప్రతి రూపాయిని లెక్కించండి. నిజమైన లాభం తెలుసుకోండి.',
    expense: 'ఖర్చు', income: 'ఆదాయం', addEntry: 'నమోదు చేయండి',
    amount: 'మొత్తం (₹)', crop: 'పంట', note: 'గమనిక (ఐచ్ఛికం)', category: 'వర్గం',
    save: 'సేవ్ చేయండి', cancel: 'రద్దు',
    totalSpent: 'మొత్తం ఖర్చు', totalEarned: 'మొత్తం ఆదాయం',
    netProfit: 'నికర లాభం', netLoss: 'నికర నష్టం',
    byCrop: 'పంట వారీగా లాభం', byCategory: 'వర్గం వారీగా ఖర్చు', recent: 'ఇటీవలి నమోదులు',
    empty: 'ఇంకా నమోదులు లేవు. మీ మొదటి ఖర్చు లేదా అమ్మకాన్ని జోడించండి.',
    deleteConfirm: 'ఈ నమోదును తొలగించాలా?', yes: 'అవును', no: 'కాదు',
    invalidAmount: 'దయచేసి సరైన మొత్తాన్ని నమోదు చేయండి', needCrop: 'దయచేసి పంట పేరు నమోదు చేయండి',
    cat_seeds: 'విత్తనాలు', cat_fertilizer: 'ఎరువులు', cat_pesticide: 'పురుగుమందు',
    cat_labor: 'కూలీలు', cat_equipment: 'పరికరాలు', cat_water: 'నీరు/ఇంధనం',
    cat_transport: 'రవాణా', cat_sale: 'పంట అమ్మకం', cat_other: 'ఇతరం',
  },
  HI: {
    subtitle: 'हर रुपये का हिसाब रखें। असली मुनाफ़ा जानें।',
    expense: 'खर्च', income: 'आय', addEntry: 'एंट्री जोड़ें',
    amount: 'राशि (₹)', crop: 'फ़सल', note: 'नोट (वैकल्पिक)', category: 'श्रेणी',
    save: 'सेव करें', cancel: 'रद्द करें',
    totalSpent: 'कुल खर्च', totalEarned: 'कुल आय',
    netProfit: 'शुद्ध लाभ', netLoss: 'शुद्ध हानि',
    byCrop: 'फ़सल के अनुसार लाभ', byCategory: 'श्रेणी के अनुसार खर्च', recent: 'हाल की एंट्रियां',
    empty: 'अभी कोई एंट्री नहीं। नीचे अपना पहला खर्च या बिक्री जोड़ें।',
    deleteConfirm: 'यह एंट्री हटाएं?', yes: 'हाँ', no: 'नहीं',
    invalidAmount: 'कृपया सही राशि डालें', needCrop: 'कृपया फ़सल का नाम डालें',
    cat_seeds: 'बीज', cat_fertilizer: 'खाद', cat_pesticide: 'कीटनाशक',
    cat_labor: 'मज़दूरी', cat_equipment: 'उपकरण', cat_water: 'पानी/ईंधन',
    cat_transport: 'परिवहन', cat_sale: 'फ़सल बिक्री', cat_other: 'अन्य',
  },
};

const EXPENSE_CATS = ['cat_seeds', 'cat_fertilizer', 'cat_pesticide', 'cat_labor', 'cat_equipment', 'cat_water', 'cat_transport', 'cat_other'];
const INCOME_CATS = ['cat_sale', 'cat_other'];

// Indian digit grouping: ₹12,34,567 (not ₹1,234,567)
const formatINR = (n) => {
  const s = Math.abs(Math.round(n)).toString();
  if (s.length <= 3) return '₹' + (n < 0 ? '-' : '') + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return '₹' + (n < 0 ? '-' : '') + rest + ',' + last3;
};

const formatDate = (iso, lang) => {
  const d = new Date(iso);
  const locales = { EN: 'en-IN', TE: 'te-IN', HI: 'hi-IN' };
  try {
    return d.toLocaleDateString(locales[lang] || 'en-IN', { day: 'numeric', month: 'short' });
  } catch (e) {
    return d.toLocaleDateString();
  }
};

export default function LedgerScreen() {
  const router = useRouter();
  const [lang, setLang] = useState('EN');
  const [entries, setEntries] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [entryType, setEntryType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [crop, setCrop] = useState('');
  const [note, setNote] = useState('');
  const [category, setCategory] = useState('cat_seeds');

  const t = L[lang] || L.EN;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LEDGER_KEY);
        if (raw) setEntries(JSON.parse(raw));
      } catch (e) {
        console.warn('Ledger load failed:', e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(LEDGER_KEY, JSON.stringify(entries)).catch((e) =>
      console.warn('Ledger save failed:', e)
    );
  }, [entries, loaded]);

  const stats = useMemo(() => {
    let spent = 0;
    let earned = 0;
    const cropMap = {};
    const catMap = {};
    for (const e of entries) {
      const amt = Number(e.amount) || 0;
      const cropKey = (e.crop || '—').trim().toLowerCase();
      if (!cropMap[cropKey]) cropMap[cropKey] = { label: e.crop || '—', net: 0 };
      if (e.type === 'income') {
        earned += amt;
        cropMap[cropKey].net += amt;
      } else {
        spent += amt;
        cropMap[cropKey].net -= amt;
        catMap[e.category] = (catMap[e.category] || 0) + amt;
      }
    }
    const crops = Object.values(cropMap).sort((a, b) => b.net - a.net);
    const cats = Object.entries(catMap)
      .map(([key, val]) => ({ key, val }))
      .sort((a, b) => b.val - a.val);
    const maxCat = cats.length ? cats[0].val : 1;
    return { spent, earned, net: earned - spent, crops, cats, maxCat };
  }, [entries]);

  const openAdd = (type) => {
    setEntryType(type);
    setCategory(type === 'income' ? 'cat_sale' : 'cat_seeds');
    setAmount('');
    setCrop('');
    setNote('');
    setModalOpen(true);
  };

  const saveEntry = () => {
    const amt = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(amt) || amt <= 0) { Alert.alert('', t.invalidAmount); return; }
    if (!crop.trim()) { Alert.alert('', t.needCrop); return; }
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      type: entryType,
      amount: amt,
      crop: crop.trim(),
      note: note.trim(),
      category,
      date: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev]);
    setModalOpen(false);
  };

  const confirmDelete = useCallback((id) => {
    Alert.alert('', t.deleteConfirm, [
      { text: t.no, style: 'cancel' },
      { text: t.yes, style: 'destructive', onPress: () => setEntries((prev) => prev.filter((e) => e.id !== id)) },
    ]);
  }, [t]);

  const catList = entryType === 'income' ? INCOME_CATS : EXPENSE_CATS;
  const isProfit = stats.net >= 0;

  return (
    <SafeAreaView style={S.root}>
      <OfflineBanner />
      <LinearGradient colors={[C.green, C.greenLight]} style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle}>{tr('farmLedger', lang)}</Text>
          <Text style={S.headerSub}>{t.subtitle}</Text>
        </View>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </LinearGradient>

      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary cards */}
        <View style={S.summaryRow}>
          <View style={[S.summaryCard, { borderLeftColor: C.red }]}>
            <Text style={S.summaryLabel}>{t.totalSpent}</Text>
            <Text style={[S.summaryValue, { color: C.red }]}>{formatINR(stats.spent)}</Text>
          </View>
          <View style={[S.summaryCard, { borderLeftColor: C.profit }]}>
            <Text style={S.summaryLabel}>{t.totalEarned}</Text>
            <Text style={[S.summaryValue, { color: C.profit }]}>{formatINR(stats.earned)}</Text>
          </View>
        </View>

        <View style={[S.netCard, { backgroundColor: isProfit ? C.profit : C.red }]}>
          <Text style={S.netLabel}>{isProfit ? t.netProfit : t.netLoss}</Text>
          <Text style={S.netValue}>{formatINR(Math.abs(stats.net))}</Text>
        </View>

        {/* Profit by crop */}
        {stats.crops.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>{t.byCrop}</Text>
            {stats.crops.map((c) => (
              <View key={c.label} style={S.cropRow}>
                <Text style={S.cropName}>{c.label}</Text>
                <Text style={[S.cropNet, { color: c.net >= 0 ? C.profit : C.red }]}>
                  {c.net >= 0 ? '+' : '−'}{formatINR(Math.abs(c.net))}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Spending by category — pure View bars, no chart lib */}
        {stats.cats.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>{t.byCategory}</Text>
            {stats.cats.map(({ key, val }) => (
              <View key={key} style={S.barRow}>
                <Text style={S.barLabel}>{t[key] || key}</Text>
                <View style={S.barTrack}>
                  <View style={[S.barFill, { width: `${Math.max(6, (val / stats.maxCat) * 100)}%` }]} />
                </View>
                <Text style={S.barValue}>{formatINR(val)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent entries */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t.recent}</Text>
          {entries.length === 0 ? (
            <Text style={S.emptyText}>{t.empty}</Text>
          ) : (
            entries.slice(0, 30).map((e) => (
              <TouchableOpacity
                key={e.id}
                style={S.entryRow}
                onLongPress={() => confirmDelete(e.id)}
                delayLongPress={400}
                activeOpacity={0.7}
              >
                <View style={[S.entryDot, { backgroundColor: e.type === 'income' ? C.profit : C.red }]} />
                <View style={{ flex: 1 }}>
                  <Text style={S.entryCrop}>{e.crop} · {t[e.category] || e.category}</Text>
                  {!!e.note && <Text style={S.entryNote}>{e.note}</Text>}
                  <Text style={S.entryDate}>{formatDate(e.date, lang)}</Text>
                </View>
                <Text style={[S.entryAmt, { color: e.type === 'income' ? C.profit : C.red }]}>
                  {e.type === 'income' ? '+' : '−'}{formatINR(e.amount)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Floating add buttons */}
      <View style={S.fabRow}>
        <TouchableOpacity style={[S.fab, { backgroundColor: C.red }]} onPress={() => openAdd('expense')} activeOpacity={0.85}>
          <Text style={S.fabText}>− {t.expense}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[S.fab, { backgroundColor: C.profit }]} onPress={() => openAdd('income')} activeOpacity={0.85}>
          <Text style={S.fabText}>+ {t.income}</Text>
        </TouchableOpacity>
      </View>

      {/* Add entry modal */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.modalWrap}>
          <View style={S.modalCard}>
            <Text style={S.modalTitle}>
              {t.addEntry} — {entryType === 'income' ? t.income : t.expense}
            </Text>

            <TextInput style={S.input} placeholder={t.amount} placeholderTextColor="#95A5A6" keyboardType="numeric" value={amount} onChangeText={setAmount} />
            <TextInput style={S.input} placeholder={t.crop} placeholderTextColor="#95A5A6" value={crop} onChangeText={setCrop} />
            <TextInput style={S.input} placeholder={t.note} placeholderTextColor="#95A5A6" value={note} onChangeText={setNote} />

            <Text style={S.catLabel}>{t.category}</Text>
            <View style={S.catWrap}>
              {catList.map((c) => (
                <TouchableOpacity key={c} style={[S.catChip, category === c && S.catChipActive]} onPress={() => setCategory(c)}>
                  <Text style={[S.catChipText, category === c && S.catChipTextActive]}>{t[c]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={S.modalBtnRow}>
              <TouchableOpacity style={[S.modalBtn, S.btnCancel]} onPress={() => setModalOpen(false)}>
                <Text style={S.btnCancelText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[S.modalBtn, S.btnSave]} onPress={saveEntry}>
                <Text style={S.btnSaveText}>{t.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F1F8E9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2 },

  scroll: { padding: 16 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    borderLeftWidth: 4, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  summaryLabel: { fontSize: 12, color: '#7F8C8D', marginBottom: 6 },
  summaryValue: { fontSize: 20, fontWeight: '800' },

  netCard: { borderRadius: 16, padding: 18, marginTop: 12, alignItems: 'center' },
  netLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  netValue: { color: '#FFFFFF', fontSize: 30, fontWeight: '900', marginTop: 4 },

  section: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginTop: 16, elevation: 1 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1B3A2A', marginBottom: 12 },

  cropRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ECF0EC',
  },
  cropName: { fontSize: 14, color: '#2C3E50', textTransform: 'capitalize' },
  cropNet: { fontSize: 14, fontWeight: '700' },

  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  barLabel: { width: 90, fontSize: 12, color: '#566B5E' },
  barTrack: { flex: 1, height: 10, backgroundColor: '#ECF0EC', borderRadius: 5, marginHorizontal: 8, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5, backgroundColor: '#E67E22' },
  barValue: { width: 78, fontSize: 11, color: '#566B5E', textAlign: 'right' },

  emptyText: { fontSize: 13, color: '#95A5A6', lineHeight: 20 },

  entryRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ECF0EC',
  },
  entryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  entryCrop: { fontSize: 14, fontWeight: '600', color: '#2C3E50' },
  entryNote: { fontSize: 12, color: '#7F8C8D', marginTop: 2 },
  entryDate: { fontSize: 11, color: '#B2BABB', marginTop: 2 },
  entryAmt: { fontSize: 15, fontWeight: '800' },

  fabRow: { position: 'absolute', bottom: 24, left: 16, right: 16, flexDirection: 'row', gap: 12 },
  fab: {
    flex: 1, borderRadius: 28, paddingVertical: 15, alignItems: 'center', elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 34 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1B3A2A', marginBottom: 16 },
  input: {
    backgroundColor: '#F1F8E9', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#2C3E50', marginBottom: 10,
  },
  catLabel: { fontSize: 13, fontWeight: '700', color: '#566B5E', marginTop: 4, marginBottom: 8 },
  catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16,
    backgroundColor: '#F1F8E9', borderWidth: 1, borderColor: '#E0E7E0',
  },
  catChipActive: { backgroundColor: '#1E8449', borderColor: '#1E8449' },
  catChipText: { fontSize: 12, color: '#566B5E' },
  catChipTextActive: { color: '#FFFFFF', fontWeight: '700' },

  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  btnCancel: { backgroundColor: '#ECF0EC' },
  btnCancelText: { color: '#566B5E', fontWeight: '700' },
  btnSave: { backgroundColor: '#1E8449' },
  btnSaveText: { color: '#FFFFFF', fontWeight: '800' },
});
