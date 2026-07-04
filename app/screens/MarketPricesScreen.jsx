// app/screens/MarketPricesScreen.jsx — Day 10 offline support
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tr } from '../../utils/i18n';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import OfflineBanner from '../../components/OfflineBanner';
import { cacheSet, cacheGetStale, checkOnline } from '../../utils/offlineManager';
import { WORKER_BASE_URL } from '../../utils/apiConfig';

const STATES     = ['All','Andhra Pradesh','Telangana','Karnataka','Maharashtra','Tamil Nadu','Kerala','Rajasthan','Uttar Pradesh','Punjab'];
const C = { green:'#1B5E20', greenLight:'#388E3C', greenPale:'#E8F5E9', amber:'#E65100', blue:'#0277BD', bg:'#F1F8E9', card:'#FFFFFF', text:'#212121', textMuted:'#558B2F', border:'#C8E6C9', red:'#C62828' };

function PriceCard({ item, lang }) {
  const modal = parseInt(item.modal_price||0), min = parseInt(item.min_price||0), max = parseInt(item.max_price||0);
  const up = modal >= (min+max)/2;
  return (
    <View style={S.card}>
      <View style={S.cardTop}>
        <View style={{ flex:1 }}>
          <Text style={S.commodity} numberOfLines={1}>{item.commodity}</Text>
          <Text style={S.market} numberOfLines={1}>📍 {item.market}, {item.district}</Text>
          <Text style={{ fontSize:11, color:C.blue }}>{item.state}</Text>
        </View>
        <View style={S.priceBox}>
          <Text style={S.modalPrice}>₹{modal.toLocaleString()}</Text>
          <Text style={{ fontSize:10, color:C.textMuted }}>₹/{lang==='TE'?'క్వింటాల్':lang==='HI'?'क्विंटल':'Quintal'}</Text>
          <View style={[S.trendBadge, { backgroundColor: up?'#E8F5E9':'#FFEBEE' }]}>
            <Ionicons name={up?'trending-up':'trending-down'} size={13} color={up?C.green:C.red} />
          </View>
        </View>
      </View>
      <View style={S.cardBottom}>
        <View style={{ flexDirection:'row', justifyContent:'space-around' }}>
          {[{ label:lang==='TE'?'కనిష్ట':lang==='HI'?'न्यूनतम':'MIN', val:min, color:C.green },
            { label:lang==='TE'?'మోడల్':lang==='HI'?'मोडल':'MODAL',   val:modal,color:C.amber },
            { label:lang==='TE'?'గరిష్ట':lang==='HI'?'अधिकतम':'MAX',  val:max, color:C.red }
          ].map((r,i)=>(
            <React.Fragment key={i}>
              {i>0 && <View style={{ width:1, backgroundColor:C.border }} />}
              <View style={{ alignItems:'center', flex:1 }}>
                <Text style={{ fontSize:10, color:C.textMuted, fontWeight:'600' }}>{r.label}</Text>
                <Text style={{ fontSize:14, fontWeight:'700', color:r.color, marginTop:2 }}>₹{r.val.toLocaleString()}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
        {item.arrival_date && <Text style={{ fontSize:10, color:C.textMuted, textAlign:'center', marginTop:8 }}>{lang==='TE'?'చివరి నవీకరణ':lang==='HI'?'अंतिम अपडेट':'Last updated'}: {item.arrival_date}</Text>}
      </View>
    </View>
  );
}

export default function MarketPricesScreen() {
  const router = useRouter();
  const [lang, setLang]               = useState('EN');
  const [data, setData]               = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [isOnlineData, setIsOnlineData] = useState(true);
  const [search, setSearch]           = useState('');
  const [selectedState, setSelectedState] = useState('All');

  const CACHE_KEY = `market_${selectedState}`;

  const fetchPrices = useCallback(async (state='All') => {
    try {
      const online = await checkOnline();
      setIsOnlineData(online);
      if (online) {
        const url = `${WORKER_BASE_URL}/market-prices?state=${encodeURIComponent(state)}`;
        const res     = await fetch(url);
        const json    = await res.json();
        const records = json.records || [];
        if (records.length > 0) {
          setData(records); setFiltered(records);
          await cacheSet(`market_${state}`, records);
          return;
        }
      }
      // Offline — load cache
      const cached = await cacheGetStale(`market_${state}`);
      if (cached) { setData(cached); setFiltered(cached); return; }
      // Final fallback
      const mock = getMock(state);
      setData(mock); setFiltered(mock);
    } catch (e) {
      const cached = await cacheGetStale(`market_${state}`);
      if (cached) { setData(cached); setFiltered(cached); }
      else { const mock = getMock(state); setData(mock); setFiltered(mock); }
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchPrices('All'); }, []);

  const handleStateChange = (state) => {
    setSelectedState(state); setSearch(''); setLoading(true); fetchPrices(state);
  };

  useEffect(() => {
    if (!search.trim()) { setFiltered(data); return; }
    const q = search.toLowerCase();
    setFiltered(data.filter(x => x.commodity?.toLowerCase().includes(q) || x.market?.toLowerCase().includes(q)));
  }, [search, data]);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:C.bg }}>
      <OfflineBanner />
      <LinearGradient colors={[C.green, C.greenLight]} style={S.header}>
        <TouchableOpacity onPress={()=>router.back()} style={{ padding:4 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex:1, marginLeft:10 }}>
          <Text style={{ color:'#fff', fontSize:15, fontWeight:'700' }}>{tr('marketPricesTitle',lang)}</Text>
          <Text style={{ color:'rgba(255,255,255,0.75)', fontSize:10 }}>
            {isOnlineData ? '🟢 '+tr('marketPricesSubtitle',lang) : '📡 '+(lang==='TE'?'ఆఫ్‌లైన్ డేటా':lang==='HI'?'ऑफलाइन डेटा':'Offline data')}
          </Text>
        </View>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </LinearGradient>

      <View style={{ flexDirection:'row', alignItems:'center', backgroundColor:C.card, margin:12, marginBottom:6, borderRadius:12, paddingHorizontal:12, paddingVertical:10, borderWidth:1, borderColor:C.border }}>
        <Ionicons name="search-outline" size={18} color={C.textMuted} style={{ marginRight:8 }} />
        <TextInput style={{ flex:1, fontSize:14, color:C.text }} placeholder={tr('searchCrop',lang)} placeholderTextColor={C.textMuted} value={search} onChangeText={setSearch} />
        {search.length > 0 && <TouchableOpacity onPress={()=>setSearch('')}><Ionicons name="close-circle" size={18} color={C.textMuted} /></TouchableOpacity>}
      </View>

      <View style={{ height:44, justifyContent:'center', marginBottom:4 }}>
        <FlatList horizontal data={STATES} keyExtractor={s=>s} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:12, gap:8 }}
          renderItem={({ item:s }) => (
            <TouchableOpacity style={[{ paddingHorizontal:14, paddingVertical:7, borderRadius:20, backgroundColor:C.card, borderWidth:1, borderColor:C.border, height:34, justifyContent:'center' }, selectedState===s && { backgroundColor:C.green, borderColor:C.green }]} onPress={()=>handleStateChange(s)}>
              <Text style={[{ fontSize:12, color:C.text, fontWeight:'600' }, selectedState===s && { color:'#fff' }]}>{s==='All'?tr('allStates',lang):s}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
          <ActivityIndicator size="large" color={C.green} />
          <Text style={{ color:C.textMuted, marginTop:12 }}>{tr('fetchingPrices',lang)}</Text>
        </View>
      ) : (
        <FlatList data={filtered} keyExtractor={(item,i)=>`${item.commodity}-${i}`}
          renderItem={({ item })=><PriceCard item={item} lang={lang} />}
          contentContainerStyle={{ paddingHorizontal:12, paddingBottom:30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={()=>{ setRefreshing(true); fetchPrices(selectedState); }} colors={[C.green]} />}
          ListEmptyComponent={<View style={{ alignItems:'center', padding:40 }}><MaterialCommunityIcons name="magnify-close" size={48} color={C.textMuted} /><Text style={{ color:C.text, fontSize:15, fontWeight:'600', marginTop:12 }}>{tr('noResults',lang)}</Text></View>}
          ListHeaderComponent={<Text style={{ fontSize:12, color:C.textMuted, marginBottom:10, fontWeight:'600' }}>{filtered.length} {lang==='TE'?'వస్తువులు':lang==='HI'?'वस्तुएं':'commodities'}{!isOnlineData?' (cached)':''}</Text>}
        />
      )}
    </SafeAreaView>
  );
}

function getMock(state='All') {
  const all = [
    { commodity:'Rice',   market:'Guntur',   district:'Guntur',   state:'Andhra Pradesh', min_price:'1800', max_price:'2200', modal_price:'2000', arrival_date:'01/07/2026' },
    { commodity:'Maize',  market:'Kurnool',  district:'Kurnool',  state:'Andhra Pradesh', min_price:'1200', max_price:'1600', modal_price:'1400', arrival_date:'01/07/2026' },
    { commodity:'Cotton', market:'Warangal', district:'Warangal', state:'Telangana',      min_price:'5500', max_price:'6500', modal_price:'6000', arrival_date:'01/07/2026' },
    { commodity:'Tomato', market:'Madanapalle', district:'Chittoor', state:'Andhra Pradesh', min_price:'800', max_price:'1400', modal_price:'1100', arrival_date:'01/07/2026' },
    { commodity:'Wheat',  market:'Hyderabad', district:'Hyderabad', state:'Telangana',    min_price:'2000', max_price:'2400', modal_price:'2200', arrival_date:'01/07/2026' },
  ];
  return state === 'All' ? all : all.filter(r => r.state === state);
}

const S = StyleSheet.create({
  header:    { flexDirection:'row', alignItems:'center', paddingTop:Platform.OS==='ios'?8:4, paddingBottom:14, paddingHorizontal:14 },
  card:      { backgroundColor:C.card, borderRadius:16, marginBottom:12, borderWidth:1, borderColor:C.border, elevation:2, overflow:'hidden' },
  cardTop:   { flexDirection:'row', padding:14, alignItems:'flex-start' },
  commodity: { fontSize:16, fontWeight:'700', color:C.text, marginBottom:3 },
  market:    { fontSize:12, color:C.textMuted, marginBottom:2 },
  priceBox:  { alignItems:'center', marginLeft:10 },
  modalPrice:{ fontSize:22, fontWeight:'800', color:C.green },
  trendBadge:{ marginTop:4, borderRadius:10, padding:4 },
  cardBottom:{ borderTopWidth:1, borderTopColor:C.border, padding:12 },
});
