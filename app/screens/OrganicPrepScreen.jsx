// app/screens/OrganicPrepScreen.jsx — Day 9 FINAL CLEAN
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Platform, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { getOrganicData } from '../../utils/organicDataset';
import { safeGoBack } from '../../utils/navHelpers';

const C = {
  green:'#1B5E20', greenLight:'#388E3C', greenPale:'#E8F5E9',
  amber:'#E65100', amberLight:'#FFF3E0', blue:'#0277BD',
  bg:'#F1F8E9', card:'#FFFFFF', text:'#212121', textMuted:'#558B2F',
  border:'#C8E6C9', youtube:'#FF0000',
};

// ── Search card — opens YouTube in browser ────────────────────────────────────
function SearchCard({ query, title, lang }) {
  const open = () => Linking.openURL(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  );
  return (
    <TouchableOpacity style={S.searchCard} onPress={open} activeOpacity={0.85}>
      <View style={S.searchIcon}>
        <MaterialCommunityIcons name="youtube" size={28} color={C.youtube} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={S.searchTitle} numberOfLines={2}>{title}</Text>
        <Text style={S.searchSub}>
          {lang === 'TE' ? '▶ YouTube లో చూడండి' : lang === 'HI' ? '▶ YouTube पर देखें' : '▶ Open in YouTube'}
        </Text>
      </View>
      <Ionicons name="open-outline" size={18} color={C.textMuted} />
    </TouchableOpacity>
  );
}

// ── Prep card ─────────────────────────────────────────────────────────────────
function PrepCard({ prep, lang, expanded, onToggle }) {
  return (
    <View style={S.prepCard}>
      <TouchableOpacity style={S.prepHeader} onPress={onToggle} activeOpacity={0.8}>
        <View style={{ flex: 1 }}>
          <Text style={S.prepName}>{prep.name[lang] || prep.name.EN}</Text>
          <Text style={S.prepDesc} numberOfLines={expanded ? undefined : 2}>
            {prep.description[lang] || prep.description.EN}
          </Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={C.green} />
      </TouchableOpacity>
      {expanded && (
        <View style={S.prepBody}>
          <Text style={S.prepSectionTitle}>
            {lang === 'TE' ? '🧪 పదార్థాలు' : lang === 'HI' ? '🧪 सामग्री' : '🧪 Ingredients'}
          </Text>
          {(prep.ingredients[lang] || prep.ingredients.EN).map((ing, i) => (
            <View key={i} style={S.ingredRow}>
              <View style={S.dot} />
              <Text style={S.ingredText}>{ing}</Text>
            </View>
          ))}
          <Text style={[S.prepSectionTitle, { marginTop: 12 }]}>
            {lang === 'TE' ? '📋 తయారీ విధానం' : lang === 'HI' ? '📋 बनाने की विधि' : '📋 Steps'}
          </Text>
          {(prep.steps[lang] || prep.steps.EN).map((step, i) => (
            <View key={i} style={S.stepRow}>
              <View style={S.stepNum}><Text style={S.stepNumText}>{i + 1}</Text></View>
              <Text style={S.stepText}>{step}</Text>
            </View>
          ))}
          <View style={S.metaRow}>
            <View style={[S.metaBox, { backgroundColor: C.amberLight, borderColor: C.amber }]}>
              <Text style={S.metaIcon}>⏰</Text>
              <Text style={S.metaLabel}>{lang === 'TE' ? 'సమయం' : lang === 'HI' ? 'समय' : 'When'}</Text>
              <Text style={S.metaVal}>{prep.timing[lang] || prep.timing.EN}</Text>
            </View>
            <View style={[S.metaBox, { backgroundColor: C.greenPale, borderColor: C.green }]}>
              <Text style={S.metaIcon}>✨</Text>
              <Text style={S.metaLabel}>{lang === 'TE' ? 'ఫలితం' : lang === 'HI' ? 'फायदा' : 'Benefit'}</Text>
              <Text style={S.metaVal}>{prep.benefit[lang] || prep.benefit.EN}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function OrganicPrepScreen() {
  const router   = useRouter();
  const params   = useLocalSearchParams();
  const cropName = params.crop || 'Rice';
  const initLang = params.lang || 'EN';

  const [lang, setLang]         = useState(initLang);
  const [organicData, setData]  = useState(null);
  const [expandedPrep, setExp]  = useState(0);

  // ── Build search cards (always instant, no API needed) ───────────────────
  const getSearchCards = (crop, l) => [
    { query: `${crop} organic farming jeevamrutha`,
      title: l==='TE' ? `${crop} సేంద్రీయ వ్యవసాయం - జీవామృతం`
           : l==='HI' ? `${crop} जैविक खेती - जीवामृत`
           : `${crop} Organic Farming - Jeevamrutha` },
    { query: `panchagavya making organic ${crop}`,
      title: l==='TE' ? 'పంచగవ్య తయారీ విధానం'
           : l==='HI' ? 'पंचगव्य बनाने की विधि'
           : 'Panchagavya Making - Complete Guide' },
    { query: `neem kasapa organic pest control ${crop}`,
      title: l==='TE' ? 'వేప కషాయం తయారీ మరియు పురుగు నివారణ'
           : l==='HI' ? 'नीम काढ़ा बनाएं - कीट नियंत्रण'
           : 'Neem Extract for Pest Control' },
    { query: `vermiwash jeevamrutha ${crop} farming telugu`,
      title: l==='TE' ? 'వర్మీవాష్ మరియు జీవామృతం - రైతుల కోసం'
           : l==='HI' ? 'वर्मीवाश और जीवामृत - किसानों के लिए'
           : 'Vermiwash & Jeevamrutha for Farmers' },
  ];

  useEffect(() => {
    const data = getOrganicData(cropName);
    setData(data);
  }, [cropName]);

  const searchCards = getSearchCards(cropName, lang);

  const cropDisplayName = organicData
    ? (lang === 'TE' ? organicData.TE : lang === 'HI' ? organicData.HI : cropName)
    : cropName;

  return (
    <SafeAreaView style={S.root}>
      <LinearGradient colors={[C.green, C.greenLight]} style={S.header}>
        <TouchableOpacity onPress={() => safeGoBack(router)} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle}>
            {lang==='TE' ? `${cropDisplayName} సేంద్రీయ సేద్యం`
           : lang==='HI' ? `${cropDisplayName} जैविक खेती`
           : `${cropName} Organic Farming`}
          </Text>
          <Text style={S.headerSub}>
            {lang==='TE' ? 'పురాతన సేంద్రీయ తయారీ విధానాలు'
           : lang==='HI' ? 'प्राचीन जैविक तैयारी विधियां'
           : 'Ancient organic preparation methods'}
          </Text>
        </View>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </LinearGradient>

      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>

        {/* Banner */}
        <View style={S.banner}>
          <Text style={{ fontSize: 44 }}>🌾</Text>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={S.bannerName}>{cropDisplayName}</Text>
            <Text style={S.bannerSub}>
              {organicData?.preparations?.length || 0}
              {lang==='TE' ? ' సేంద్రీయ తయారీ విధానాలు' : lang==='HI' ? ' जैविक तैयारी विधियां' : ' organic preparations'}
            </Text>
          </View>
        </View>

        {/* Preparations */}
        {organicData?.preparations?.length > 0 ? (
          <View style={S.section}>
            <Text style={S.sectionTitle}>
              {lang==='TE' ? '🌿 సేంద్రీయ తయారీ విధానాలు'
             : lang==='HI' ? '🌿 जैविक तैयारी विधियां'
             : '🌿 Organic Preparation Methods'}
            </Text>
            {organicData.preparations.map((prep, i) => (
              <PrepCard
                key={i} prep={prep} lang={lang}
                expanded={expandedPrep === i}
                onToggle={() => setExp(expandedPrep === i ? -1 : i)}
              />
            ))}
          </View>
        ) : (
          <View style={S.emptyCard}>
            <MaterialCommunityIcons name="sprout-outline" size={44} color={C.textMuted} />
            <Text style={S.emptyText}>
              {lang==='TE' ? 'ఈ పంటకు డేటా త్వరలో వస్తుంది'
             : lang==='HI' ? 'इस फसल का डेटा जल्द आएगा'
             : 'Data for this crop coming soon'}
            </Text>
          </View>
        )}

        {/* YouTube Search Cards — always visible, always instant */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>
            {lang==='TE' ? '▶ YouTube వీడియోలు'
           : lang==='HI' ? '▶ YouTube वीडियो'
           : '▶ YouTube Videos'}
          </Text>
          <Text style={S.sectionSub}>
            {lang==='TE' ? 'క్లిక్ చేయండి → YouTube లో వీడియో చూడండి'
           : lang==='HI' ? 'क्लिक करें → YouTube पर वीडियो देखें'
           : 'Tap any card → opens video on YouTube'}
          </Text>
          {searchCards.map((card, i) => (
            <SearchCard key={i} query={card.query} title={card.title} lang={lang} />
          ))}
        </View>

        {/* Tip */}
        <View style={S.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={C.amber} />
          <Text style={S.tipText}>
            {lang==='TE'
              ? '💡 టిప్: ఈ తయారీలను ఉపయోగించే ముందు చిన్న భాగంలో పరీక్షించండి. స్థానిక ఆవు ఉత్పత్తులు వాడండి.'
              : lang==='HI'
              ? '💡 टिप: इन तैयारियों को पहले छोटे हिस्से पर परखें। स्थानीय गाय उत्पाद उपयोग करें।'
              : '💡 Tip: Always test on a small area first. Use locally sourced cow products for best results.'}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root:          { flex:1, backgroundColor:C.bg },
  header:        { flexDirection:'row', alignItems:'center', paddingTop:Platform.OS==='ios'?8:4, paddingBottom:14, paddingHorizontal:14 },
  headerTitle:   { color:'#fff', fontSize:14, fontWeight:'700' },
  headerSub:     { color:'rgba(255,255,255,0.75)', fontSize:10, marginTop:1 },
  scroll:        { padding:14 },
  banner:        { backgroundColor:C.card, borderRadius:16, padding:16, marginBottom:20, flexDirection:'row', alignItems:'center', borderWidth:1, borderColor:C.border, elevation:2 },
  bannerName:    { fontSize:22, fontWeight:'800', color:C.green },
  bannerSub:     { fontSize:12, color:C.textMuted, marginTop:4 },
  section:       { marginBottom:24 },
  sectionTitle:  { fontSize:16, fontWeight:'700', color:C.green, marginBottom:4 },
  sectionSub:    { fontSize:12, color:C.textMuted, marginBottom:12, lineHeight:18 },
  searchCard:    { backgroundColor:C.card, borderRadius:14, padding:14, marginBottom:10, flexDirection:'row', alignItems:'center', gap:12, borderWidth:1, borderColor:C.border, elevation:2, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.07, shadowRadius:4 },
  searchIcon:    { width:48, height:48, borderRadius:10, backgroundColor:'#FFF0F0', alignItems:'center', justifyContent:'center' },
  searchTitle:   { fontSize:13, fontWeight:'600', color:C.text, lineHeight:18, marginBottom:4 },
  searchSub:     { fontSize:12, color:C.youtube, fontWeight:'600' },
  prepCard:      { backgroundColor:C.card, borderRadius:14, marginBottom:12, borderWidth:1, borderColor:C.border, elevation:2, overflow:'hidden' },
  prepHeader:    { flexDirection:'row', alignItems:'flex-start', padding:14, gap:10 },
  prepName:      { fontSize:15, fontWeight:'700', color:C.green, marginBottom:4 },
  prepDesc:      { fontSize:12, color:C.textMuted, lineHeight:18 },
  prepBody:      { paddingHorizontal:14, paddingBottom:14, borderTopWidth:1, borderTopColor:C.border },
  prepSectionTitle: { fontSize:13, fontWeight:'700', color:C.text, marginTop:14, marginBottom:8 },
  ingredRow:     { flexDirection:'row', alignItems:'center', gap:8, marginBottom:4 },
  dot:           { width:6, height:6, borderRadius:3, backgroundColor:C.green },
  ingredText:    { fontSize:13, color:C.text },
  stepRow:       { flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:8 },
  stepNum:       { width:22, height:22, borderRadius:11, backgroundColor:C.green, alignItems:'center', justifyContent:'center', flexShrink:0 },
  stepNumText:   { fontSize:11, color:'#fff', fontWeight:'700' },
  stepText:      { fontSize:13, color:C.text, flex:1, lineHeight:20 },
  metaRow:       { flexDirection:'row', gap:10, marginTop:14 },
  metaBox:       { flex:1, borderRadius:10, padding:10, borderWidth:1 },
  metaIcon:      { fontSize:16, marginBottom:4 },
  metaLabel:     { fontSize:10, fontWeight:'600', color:C.textMuted, textTransform:'uppercase', marginBottom:2 },
  metaVal:       { fontSize:11, color:C.text, lineHeight:16 },
  emptyCard:     { alignItems:'center', padding:30, backgroundColor:C.card, borderRadius:14, borderWidth:1, borderColor:C.border, marginBottom:20 },
  emptyText:     { fontSize:14, color:C.textMuted, textAlign:'center', marginTop:10 },
  tipCard:       { flexDirection:'row', alignItems:'flex-start', gap:10, backgroundColor:C.amberLight, borderRadius:12, padding:14, borderLeftWidth:3, borderLeftColor:C.amber },
  tipText:       { flex:1, fontSize:13, color:C.text, lineHeight:20 },
});
