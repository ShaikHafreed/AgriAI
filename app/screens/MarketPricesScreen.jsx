// app/screens/MarketPricesScreen.jsx — Day 6 FINAL v4
// Fix: state filter now fetches from API directly (not client-side filter)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tr } from '../../utils/i18n';
import LanguageSwitcher from '../../components/LanguageSwitcher';

// ─── API CONFIG ───────────────────────────────────────────────────────────────
const SAMPLE_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
const MY_KEY     = 'YOUR_DATA_GOV_IN_API_KEY';
const API_KEY    = MY_KEY === 'YOUR_DATA_GOV_IN_API_KEY' ? SAMPLE_KEY : MY_KEY;
const BASE_URL   = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

const buildURL = (state) => {
  let url = `${BASE_URL}?api-key=${API_KEY}&format=json&limit=100`;
  if (state && state !== 'All') {
    url += `&filters[state]=${encodeURIComponent(state)}`;
  }
  return url;
};

const C = {
  green: '#1B5E20', greenLight: '#388E3C', greenPale: '#E8F5E9',
  amber: '#E65100', blue: '#0277BD',
  bg: '#F1F8E9', card: '#FFFFFF',
  text: '#212121', textMuted: '#558B2F', border: '#C8E6C9',
  red: '#C62828',
};

const STATES = [
  'All',
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Maharashtra',
  'Tamil Nadu',
  'Kerala',
  'Rajasthan',
  'Uttar Pradesh',
  'Punjab',
];

// ─── PRICE CARD ───────────────────────────────────────────────────────────────
function PriceCard({ item, lang }) {
  const modal = parseInt(item.modal_price || 0);
  const min   = parseInt(item.min_price || 0);
  const max   = parseInt(item.max_price || 0);
  const up    = modal >= (min + max) / 2;

  return (
    <View style={S.card}>
      <View style={S.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={S.commodity} numberOfLines={1}>{item.commodity}</Text>
          <Text style={S.market} numberOfLines={1}>📍 {item.market}, {item.district}</Text>
          <Text style={S.stateText}>{item.state}</Text>
        </View>
        <View style={S.priceBox}>
          <Text style={S.modalPrice}>₹{modal.toLocaleString()}</Text>
          <Text style={S.priceLabel}>{tr('perQuintal', lang)}</Text>
          <View style={[S.trendBadge, { backgroundColor: up ? '#E8F5E9' : '#FFEBEE' }]}>
            <Ionicons
              name={up ? 'trending-up' : 'trending-down'}
              size={13}
              color={up ? C.green : C.red}
            />
          </View>
        </View>
      </View>
      <View style={S.cardBottom}>
        <View style={S.rangeRow}>
          {[
            { label: tr('minPrice', lang),   val: min,   color: C.green },
            { label: tr('modalPrice', lang), val: modal, color: C.amber },
            { label: tr('maxPrice', lang),   val: max,   color: C.red },
          ].map((r, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={{ width: 1, backgroundColor: C.border }} />}
              <View style={S.rangeItem}>
                <Text style={S.rangeLabel}>{r.label}</Text>
                <Text style={[S.rangeVal, { color: r.color }]}>₹{r.val.toLocaleString()}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
        {item.arrival_date && (
          <Text style={S.date}>{tr('lastUpdated', lang)}: {item.arrival_date}</Text>
        )}
      </View>
    </View>
  );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function MarketPricesScreen() {
  const router = useRouter();
  const [lang, setLang]                   = useState('EN');
  const [allData, setAllData]             = useState([]);      // all records from API
  const [filtered, setFiltered]           = useState([]);      // search-filtered
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [isOnline, setIsOnline]           = useState(false);
  const [search, setSearch]               = useState('');
  const [selectedState, setSelectedState] = useState('All');

  // ── Fetch from API — called when state changes ────────────────────────────
  const fetchPrices = useCallback(async (state = 'All') => {
    try {
      const url = buildURL(state);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const records = json.records || [];
      if (records.length === 0) throw new Error('empty');
      setAllData(records);
      setFiltered(records);
      setIsOnline(true);
    } catch (err) {
      console.log('API error:', err.message, '— using mock');
      // Only use mock for the selected state
      const mock = getMock(state);
      setAllData(mock);
      setFiltered(mock);
      setIsOnline(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchPrices('All'); }, []);

  // When state chip changes — fetch from API for that state
  const handleStateChange = (state) => {
    setSelectedState(state);
    setSearch('');
    setLoading(true);
    fetchPrices(state);
  };

  // Search filter — client side on top of fetched data
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(allData);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(allData.filter(x =>
      x.commodity?.toLowerCase().includes(q) ||
      x.market?.toLowerCase().includes(q) ||
      x.district?.toLowerCase().includes(q)
    ));
  }, [search, allData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPrices(selectedState);
  };

  return (
    <SafeAreaView style={S.root}>

      {/* ── Header ── */}
      <LinearGradient colors={[C.green, C.greenLight]} style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle}>{tr('marketPricesTitle', lang)}</Text>
          <Text style={S.headerSub}>{tr('marketPricesSubtitle', lang)}</Text>
        </View>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </LinearGradient>

      {/* ── Status Badge ── */}
      <View style={[S.statusBar, { backgroundColor: isOnline ? '#E8F5E9' : '#FFF3E0' }]}>
        <View style={[S.statusDot, { backgroundColor: isOnline ? C.green : C.amber }]} />
        <Text style={[S.statusText, { color: isOnline ? C.green : C.amber }]}>
          {isOnline
            ? (lang === 'TE' ? '🟢 లైవ్ డేటా - data.gov.in' : lang === 'HI' ? '🟢 लाइव डेटा' : '🟢 Live data from data.gov.in')
            : (lang === 'TE' ? '🟡 ఆఫ్‌లైన్ డేటా' : lang === 'HI' ? '🟡 ऑफलाइन डेटा' : '🟡 Offline data — register at data.gov.in for live')}
        </Text>
      </View>

      {/* ── Search ── */}
      <View style={S.searchWrap}>
        <Ionicons name="search-outline" size={18} color={C.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={S.searchInput}
          placeholder={tr('searchCrop', lang)}
          placeholderTextColor={C.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={C.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── State Filter — API fetch on tap ── */}
      <View style={S.filterWrap}>
        <FlatList
          horizontal
          data={STATES}
          keyExtractor={s => s}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
          renderItem={({ item: s }) => (
            <TouchableOpacity
              style={[S.chip, selectedState === s && S.chipActive]}
              onPress={() => handleStateChange(s)}
              disabled={loading}
            >
              <Text style={[S.chipText, selectedState === s && { color: '#fff' }]}>
                {s === 'All' ? tr('allStates', lang) : s}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={S.center}>
          <ActivityIndicator size="large" color={C.green} />
          <Text style={S.loadingText}>
            {selectedState === 'All'
              ? tr('fetchingPrices', lang)
              : (lang === 'TE' ? `${selectedState} ధరలు లోడ్ అవుతున్నాయి...` : lang === 'HI' ? `${selectedState} के भाव लोड हो रहे हैं...` : `Loading ${selectedState} prices...`)}
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={S.center}>
          <MaterialCommunityIcons name="magnify-close" size={48} color={C.textMuted} />
          <Text style={S.emptyText}>{tr('noResults', lang)}</Text>
          <Text style={S.emptySub}>
            {lang === 'TE' ? 'ఈ రాష్ట్రానికి ఈ రోజు ధరలు అందుబాటులో లేవు' : lang === 'HI' ? 'इस राज्य के आज के भाव उपलब्ध नहीं हैं' : 'No prices available for this state today'}
          </Text>
          <TouchableOpacity style={S.retryBtn} onPress={() => handleStateChange('All')}>
            <Text style={S.retryText}>
              {lang === 'TE' ? 'అన్ని రాష్ట్రాలు చూడండి' : lang === 'HI' ? 'सभी राज्य देखें' : 'Show All States'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => `${item.commodity}-${item.market}-${i}`}
          renderItem={({ item }) => <PriceCard item={item} lang={lang} />}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.green]} />
          }
          ListHeaderComponent={() => (
            <Text style={{ fontSize: 12, color: C.textMuted, marginBottom: 10, fontWeight: '600' }}>
              {filtered.length} {lang === 'TE' ? 'వస్తువులు' : lang === 'HI' ? 'वस्तुएं' : 'commodities'}
              {selectedState !== 'All' ? ` · ${selectedState}` : ''}
            </Text>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ─── MOCK DATA (state-aware fallback) ────────────────────────────────────────
function getMock(state = 'All') {
  const all = [
    { commodity: 'Rice',         market: 'Guntur',           district: 'Guntur',      state: 'Andhra Pradesh', min_price: '1800', max_price: '2200', modal_price: '2000', arrival_date: '24/06/2026' },
    { commodity: 'Maize',        market: 'Kurnool',          district: 'Kurnool',     state: 'Andhra Pradesh', min_price: '1200', max_price: '1600', modal_price: '1400', arrival_date: '24/06/2026' },
    { commodity: 'Tomato',       market: 'Madanapalle',      district: 'Chittoor',    state: 'Andhra Pradesh', min_price: '800',  max_price: '1400', modal_price: '1100', arrival_date: '24/06/2026' },
    { commodity: 'Onion',        market: 'Kurnool',          district: 'Kurnool',     state: 'Andhra Pradesh', min_price: '600',  max_price: '1000', modal_price: '800',  arrival_date: '24/06/2026' },
    { commodity: 'Chilli',       market: 'Guntur',           district: 'Guntur',      state: 'Andhra Pradesh', min_price: '8000', max_price: '12000',modal_price: '10000',arrival_date: '24/06/2026' },
    { commodity: 'Groundnut',    market: 'Nellore',          district: 'Nellore',     state: 'Andhra Pradesh', min_price: '4500', max_price: '5500', modal_price: '5000', arrival_date: '24/06/2026' },
    { commodity: 'Paddy',        market: 'Vijayawada',       district: 'Krishna',     state: 'Andhra Pradesh', min_price: '1500', max_price: '1900', modal_price: '1700', arrival_date: '24/06/2026' },
    { commodity: 'Cotton',       market: 'Warangal',         district: 'Warangal',    state: 'Telangana',      min_price: '5500', max_price: '6500', modal_price: '6000', arrival_date: '24/06/2026' },
    { commodity: 'Turmeric',     market: 'Nizamabad',        district: 'Nizamabad',   state: 'Telangana',      min_price: '6000', max_price: '8000', modal_price: '7000', arrival_date: '24/06/2026' },
    { commodity: 'Wheat',        market: 'Hyderabad',        district: 'Hyderabad',   state: 'Telangana',      min_price: '2000', max_price: '2400', modal_price: '2200', arrival_date: '24/06/2026' },
    { commodity: 'Soybean',      market: 'Adilabad',         district: 'Adilabad',    state: 'Telangana',      min_price: '3800', max_price: '4400', modal_price: '4100', arrival_date: '24/06/2026' },
    { commodity: 'Jowar',        market: 'Nalgonda',         district: 'Nalgonda',    state: 'Telangana',      min_price: '2200', max_price: '2800', modal_price: '2500', arrival_date: '24/06/2026' },
    { commodity: 'Bitter gourd', market: 'Davangere APMC',   district: 'Davangere',   state: 'Karnataka',      min_price: '1000', max_price: '3400', modal_price: '2600', arrival_date: '24/06/2026' },
    { commodity: 'Tomato',       market: 'Bangalore',        district: 'Bangalore',   state: 'Karnataka',      min_price: '1200', max_price: '2000', modal_price: '1600', arrival_date: '24/06/2026' },
    { commodity: 'Potato',       market: 'Pune',             district: 'Pune',        state: 'Maharashtra',    min_price: '800',  max_price: '1400', modal_price: '1100', arrival_date: '24/06/2026' },
    { commodity: 'Onion',        market: 'Nashik',           district: 'Nashik',      state: 'Maharashtra',    min_price: '500',  max_price: '900',  modal_price: '700',  arrival_date: '24/06/2026' },
    { commodity: 'Banana',       market: 'Coimbatore',       district: 'Coimbatore',  state: 'Tamil Nadu',     min_price: '600',  max_price: '1200', modal_price: '900',  arrival_date: '24/06/2026' },
    { commodity: 'Coconut',      market: 'Pollachi',         district: 'Coimbatore',  state: 'Tamil Nadu',     min_price: '1500', max_price: '2500', modal_price: '2000', arrival_date: '24/06/2026' },
  ];
  if (state === 'All') return all;
  return all.filter(r => r.state === state);
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  header:      { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: 14, paddingHorizontal: 14 },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  headerSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 1 },
  statusBar:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, gap: 6 },
  statusDot:   { width: 8, height: 8, borderRadius: 4 },
  statusText:  { fontSize: 11, fontWeight: '600', flex: 1 },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, marginHorizontal: 12, marginBottom: 6, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.border, elevation: 1 },
  searchInput: { flex: 1, fontSize: 14, color: C.text },
  filterWrap:  { height: 44, justifyContent: 'center', marginBottom: 4 },
  chip:        { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, height: 34, justifyContent: 'center' },
  chipActive:  { backgroundColor: C.green, borderColor: C.green },
  chipText:    { fontSize: 12, color: C.text, fontWeight: '600' },
  card:        { backgroundColor: C.card, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, overflow: 'hidden' },
  cardTop:     { flexDirection: 'row', padding: 14, alignItems: 'flex-start' },
  commodity:   { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 3 },
  market:      { fontSize: 12, color: C.textMuted, marginBottom: 2 },
  stateText:   { fontSize: 11, color: C.blue },
  priceBox:    { alignItems: 'center', marginLeft: 10 },
  modalPrice:  { fontSize: 22, fontWeight: '800', color: C.green },
  priceLabel:  { fontSize: 10, color: C.textMuted, marginTop: 1 },
  trendBadge:  { marginTop: 4, borderRadius: 10, padding: 4 },
  cardBottom:  { borderTopWidth: 1, borderTopColor: C.border, padding: 12 },
  rangeRow:    { flexDirection: 'row', justifyContent: 'space-around' },
  rangeItem:   { alignItems: 'center', flex: 1 },
  rangeLabel:  { fontSize: 10, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  rangeVal:    { fontSize: 14, fontWeight: '700', marginTop: 2 },
  date:        { fontSize: 10, color: C.textMuted, textAlign: 'center', marginTop: 8 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  loadingText: { color: C.textMuted, fontSize: 14, marginTop: 12, textAlign: 'center' },
  emptyText:   { color: C.text, fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptySub:    { color: C.textMuted, fontSize: 13, marginTop: 6, textAlign: 'center' },
  retryBtn:    { marginTop: 16, backgroundColor: C.green, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText:   { color: '#fff', fontWeight: '700', fontSize: 14 },
});
