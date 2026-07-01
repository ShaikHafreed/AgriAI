// app/screens/OrganicPrepScreen.jsx — Day 9
// Shows organic preparation methods + YouTube videos for recommended crops
// Language: EN/TE/HI with video search in preferred language

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Linking, Image, Platform, Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { getOrganicData } from '../../utils/organicDataset';

// ── Replace with your YouTube Data API v3 key ─────────────────────────────────
const YOUTUBE_API_KEY = 'AIzaSyClwh0MJFTaJZi4aSOhc67RsJ7Q-WguQKk';
const YOUTUBE_SEARCH  = 'https://www.googleapis.com/youtube/v3/search';

const C = {
  green: '#1B5E20', greenLight: '#388E3C', greenPale: '#E8F5E9',
  amber: '#E65100', amberLight: '#FFF3E0',
  blue: '#0277BD', blueLight: '#E1F5FE',
  red: '#C62828',
  bg: '#F1F8E9', card: '#FFFFFF',
  text: '#212121', textMuted: '#558B2F', border: '#C8E6C9',
  youtube: '#FF0000',
};

// ─── VIDEO CARD ───────────────────────────────────────────────────────────────
function VideoCard({ video, lang }) {
  const openVideo = () => {
    const url = `https://www.youtube.com/watch?v=${video.id}`;
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity style={S.videoCard} onPress={openVideo} activeOpacity={0.85}>
      <View style={S.thumbnailWrap}>
        <Image
          source={{ uri: `https://img.youtube.com/vi/${video.id}/mqdefault.jpg` }}
          style={S.thumbnail}
          resizeMode="cover"
        />
        <View style={S.playButton}>
          <Ionicons name="play" size={24} color="#fff" />
        </View>
      </View>
      <View style={S.videoInfo}>
        <Text style={S.videoTitle} numberOfLines={2}>{video.title}</Text>
        <View style={S.channelRow}>
          <MaterialCommunityIcons name="youtube" size={14} color={C.youtube} />
          <Text style={S.channelName}>{video.channel}</Text>
        </View>
        <View style={S.watchBtn}>
          <Text style={S.watchBtnText}>
            {lang === 'TE' ? '▶ చూడండి' : lang === 'HI' ? '▶ देखें' : '▶ Watch'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── PREPARATION CARD ─────────────────────────────────────────────────────────
function PrepCard({ prep, lang, expanded, onToggle }) {
  const heightAnim = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  return (
    <View style={S.prepCard}>
      <TouchableOpacity style={S.prepHeader} onPress={onToggle} activeOpacity={0.8}>
        <View style={{ flex: 1 }}>
          <Text style={S.prepName}>{prep.name[lang]}</Text>
          <Text style={S.prepDesc} numberOfLines={expanded ? undefined : 2}>{prep.description[lang]}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={C.green} />
      </TouchableOpacity>

      {expanded && (
        <View style={S.prepBody}>
          {/* Ingredients */}
          <View style={S.prepSection}>
            <Text style={S.prepSectionTitle}>
              {lang === 'TE' ? '🧪 పదార్థాలు' : lang === 'HI' ? '🧪 सामग्री' : '🧪 Ingredients'}
            </Text>
            {prep.ingredients[lang].map((ing, i) => (
              <View key={i} style={S.ingredientRow}>
                <View style={S.ingredientDot} />
                <Text style={S.ingredientText}>{ing}</Text>
              </View>
            ))}
          </View>

          {/* Steps */}
          <View style={S.prepSection}>
            <Text style={S.prepSectionTitle}>
              {lang === 'TE' ? '📋 తయారీ విధానం' : lang === 'HI' ? '📋 बनाने की विधि' : '📋 Preparation Steps'}
            </Text>
            {prep.steps[lang].map((step, i) => (
              <View key={i} style={S.stepRow}>
                <View style={S.stepNum}>
                  <Text style={S.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={S.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Timing + Benefit */}
          <View style={S.prepMetaRow}>
            <View style={[S.prepMeta, { backgroundColor: C.amberLight, borderColor: C.amber }]}>
              <Text style={S.prepMetaIcon}>⏰</Text>
              <Text style={S.prepMetaLabel}>
                {lang === 'TE' ? 'వేసే సమయం' : lang === 'HI' ? 'उपयोग समय' : 'When to Apply'}
              </Text>
              <Text style={S.prepMetaVal}>{prep.timing[lang]}</Text>
            </View>
            <View style={[S.prepMeta, { backgroundColor: C.greenPale, borderColor: C.green }]}>
              <Text style={S.prepMetaIcon}>✨</Text>
              <Text style={S.prepMetaLabel}>
                {lang === 'TE' ? 'ఫలితం' : lang === 'HI' ? 'फायदा' : 'Benefit'}
              </Text>
              <Text style={S.prepMetaVal}>{prep.benefit[lang]}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function OrganicPrepScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cropName = params.crop || 'Rice';
  const initLang = params.lang || 'EN';

  const [lang, setLang]             = useState(initLang);
  const [organicData, setOrganicData] = useState(null);
  const [videos, setVideos]         = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [expandedPrep, setExpandedPrep] = useState(0);

  useEffect(() => {
    const data = getOrganicData(cropName);
    setOrganicData(data);
    if (data) {
      // Show hardcoded videos first
      setVideos(data.videos[lang] || data.videos['EN'] || []);
      // Then search live videos
      fetchYouTubeVideos(data.searchQueries[lang] || data.searchQueries['EN']);
    }
  }, [cropName]);

  useEffect(() => {
    if (organicData) {
      setVideos(organicData.videos[lang] || organicData.videos['EN'] || []);
      fetchYouTubeVideos(organicData.searchQueries[lang] || organicData.searchQueries['EN']);
    }
  }, [lang]);

  const fetchYouTubeVideos = async (query) => {
    setLoadingVideos(true);
    try {
      if (YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY') {
        // No API key — keep hardcoded videos
        setLoadingVideos(false);
        return;
      }

      const url = `${YOUTUBE_SEARCH}?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=5&relevanceLanguage=${lang === 'TE' ? 'te' : lang === 'HI' ? 'hi' : 'en'}&key=${YOUTUBE_API_KEY}`;
      const res  = await fetch(url);
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        const liveVideos = data.items.map(item => ({
          id:      item.id.videoId,
          title:   item.snippet.title,
          channel: item.snippet.channelTitle,
          thumb:   item.snippet.thumbnails?.medium?.url,
          live:    true,
        }));
        setVideos(liveVideos);
      }
    } catch (e) {
      console.log('YouTube error:', e);
    } finally {
      setLoadingVideos(false);
    }
  };

  // Get display name for crop in current language
  const cropDisplayName = organicData
    ? (lang === 'TE' ? organicData.TE : lang === 'HI' ? organicData.HI : cropName)
    : cropName;

  return (
    <SafeAreaView style={S.root}>
      <LinearGradient colors={[C.green, C.greenLight]} style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle}>
            {lang === 'TE' ? `${cropDisplayName} సేంద్రీయ సేద్యం` : lang === 'HI' ? `${cropDisplayName} जैविक खेती` : `${cropDisplayName} Organic Farming`}
          </Text>
          <Text style={S.headerSub}>
            {lang === 'TE' ? 'పురాతన సేంద్రీయ తయారీ విధానాలు' : lang === 'HI' ? 'प्राचीन जैविक तैयारी विधियां' : 'Ancient organic preparation methods'}
          </Text>
        </View>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </LinearGradient>

      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>

        {/* Crop banner */}
        <View style={S.cropBanner}>
          <Text style={S.cropBannerEmoji}>🌾</Text>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={S.cropBannerName}>{cropDisplayName}</Text>
            <Text style={S.cropBannerSub}>
              {lang === 'TE' ? `${organicData?.preparations?.length || 0} సేంద్రీయ తయారీ విధానాలు` : lang === 'HI' ? `${organicData?.preparations?.length || 0} जैविक तैयारी विधियां` : `${organicData?.preparations?.length || 0} organic preparation methods`}
            </Text>
          </View>
        </View>

        {/* Organic Preparations */}
        {organicData ? (
          <View style={S.section}>
            <Text style={S.sectionTitle}>
              {lang === 'TE' ? '🌿 సేంద్రీయ తయారీ విధానాలు' : lang === 'HI' ? '🌿 जैविक तैयारी विधियां' : '🌿 Organic Preparation Methods'}
            </Text>
            <Text style={S.sectionSub}>
              {lang === 'TE' ? 'రసాయనాలు లేకుండా పొలాన్ని సారవంతంగా చేసే పురాతన విధానాలు' : lang === 'HI' ? 'बिना रसायन के खेत को उपजाऊ बनाने की प्राचीन विधियां' : 'Ancient methods to enrich your farm without chemicals'}
            </Text>
            {organicData.preparations.map((prep, i) => (
              <PrepCard
                key={i}
                prep={prep}
                lang={lang}
                expanded={expandedPrep === i}
                onToggle={() => setExpandedPrep(expandedPrep === i ? -1 : i)}
              />
            ))}
          </View>
        ) : (
          <View style={S.noDataCard}>
            <MaterialCommunityIcons name="sprout-outline" size={48} color={C.textMuted} />
            <Text style={S.noDataText}>
              {lang === 'TE' ? 'ఈ పంటకు సేంద్రీయ డేటా త్వరలో అందుబాటులో వస్తుంది' : lang === 'HI' ? 'इस फसल का जैविक डेटा जल्द उपलब्ध होगा' : 'Organic data for this crop coming soon'}
            </Text>
          </View>
        )}

        {/* YouTube Videos */}
        <View style={S.section}>
          <View style={S.sectionRow}>
            <Text style={S.sectionTitle}>
              {lang === 'TE' ? '▶ YouTube వీడియోలు' : lang === 'HI' ? '▶ YouTube वीडियो' : '▶ YouTube Videos'}
            </Text>
            {loadingVideos && <ActivityIndicator size="small" color={C.green} />}
          </View>
          <Text style={S.sectionSub}>
            {lang === 'TE' ? 'మీ భాషలో సేంద్రీయ సేద్యం వీడియోలు' : lang === 'HI' ? 'आपकी भाषा में जैविक खेती वीडियो' : 'Organic farming videos in your language'}
          </Text>

          {videos.length > 0 ? (
            videos.map((video, i) => (
              <VideoCard key={i} video={video} lang={lang} />
            ))
          ) : !loadingVideos ? (
            <View style={S.noVideoCard}>
              <MaterialCommunityIcons name="youtube" size={40} color={C.textMuted} />
              <Text style={S.noDataText}>
                {lang === 'TE' ? 'వీడియోలు లోడ్ కాలేదు. YouTube లో వెతకండి.' : lang === 'HI' ? 'वीडियो लोड नहीं हुए। YouTube पर खोजें।' : 'Videos unavailable. Add YouTube API key.'}
              </Text>
              <TouchableOpacity
                style={S.youtubeSearchBtn}
                onPress={() => {
                  const query = organicData?.searchQueries?.[lang] || `${cropName} organic farming`;
                  Linking.openURL(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
                }}
              >
                <MaterialCommunityIcons name="youtube" size={18} color="#fff" />
                <Text style={S.youtubeSearchBtnText}>
                  {lang === 'TE' ? 'YouTube లో వెతకండి' : lang === 'HI' ? 'YouTube पर खोजें' : 'Search on YouTube'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Quick tip */}
        <View style={S.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={C.amber} />
          <Text style={S.tipText}>
            {lang === 'TE'
              ? '💡 టిప్: ఈ తయారీలను ఉపయోగించే ముందు చిన్న భాగంలో పరీక్షించండి. ఆవు ఉత్పత్తులు స్థానికంగా తీసుకోండి.'
              : lang === 'HI'
              ? '💡 टिप: इन तैयारियों को उपयोग से पहले छोटे हिस्से पर परखें। गाय उत्पाद स्थानीय रूप से लें।'
              : '💡 Tip: Always test these preparations on a small area first. Use locally sourced cow products for best results.'}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root:               { flex: 1, backgroundColor: C.bg },
  header:             { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: 14, paddingHorizontal: 14 },
  headerTitle:        { color: '#fff', fontSize: 14, fontWeight: '700' },
  headerSub:          { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 1 },
  scroll:             { padding: 14 },
  cropBanner:         { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, elevation: 2 },
  cropBannerEmoji:    { fontSize: 44 },
  cropBannerName:     { fontSize: 22, fontWeight: '800', color: C.green },
  cropBannerSub:      { fontSize: 12, color: C.textMuted, marginTop: 4 },
  section:            { marginBottom: 24 },
  sectionRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionTitle:       { fontSize: 16, fontWeight: '700', color: C.green },
  sectionSub:         { fontSize: 12, color: C.textMuted, marginBottom: 12, lineHeight: 18 },
  prepCard:           { backgroundColor: C.card, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border, elevation: 2, overflow: 'hidden' },
  prepHeader:         { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 10 },
  prepName:           { fontSize: 15, fontWeight: '700', color: C.green, marginBottom: 4 },
  prepDesc:           { fontSize: 12, color: C.textMuted, lineHeight: 18 },
  prepBody:           { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: C.border },
  prepSection:        { marginTop: 14 },
  prepSectionTitle:   { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 8 },
  ingredientRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  ingredientDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  ingredientText:     { fontSize: 13, color: C.text },
  stepRow:            { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  stepNum:            { width: 22, height: 22, borderRadius: 11, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepNumText:        { fontSize: 11, color: '#fff', fontWeight: '700' },
  stepText:           { fontSize: 13, color: C.text, flex: 1, lineHeight: 20 },
  prepMetaRow:        { flexDirection: 'row', gap: 10, marginTop: 14 },
  prepMeta:           { flex: 1, borderRadius: 10, padding: 10, borderWidth: 1 },
  prepMetaIcon:       { fontSize: 16, marginBottom: 4 },
  prepMetaLabel:      { fontSize: 10, fontWeight: '600', color: C.textMuted, textTransform: 'uppercase', marginBottom: 2 },
  prepMetaVal:        { fontSize: 11, color: C.text, lineHeight: 16 },
  videoCard:          { backgroundColor: C.card, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border, elevation: 2, overflow: 'hidden', flexDirection: 'row' },
  thumbnailWrap:      { width: 120, height: 90, position: 'relative' },
  thumbnail:          { width: 120, height: 90, backgroundColor: '#000' },
  playButton:         { position: 'absolute', top: '50%', left: '50%', marginTop: -16, marginLeft: -16, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,0,0,0.85)', alignItems: 'center', justifyContent: 'center' },
  videoInfo:          { flex: 1, padding: 10 },
  videoTitle:         { fontSize: 12, fontWeight: '600', color: C.text, lineHeight: 18, marginBottom: 4 },
  channelRow:         { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  channelName:        { fontSize: 11, color: C.textMuted },
  watchBtn:           { backgroundColor: C.youtube, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  watchBtnText:       { fontSize: 11, color: '#fff', fontWeight: '700' },
  noDataCard:         { alignItems: 'center', padding: 30, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 20 },
  noVideoCard:        { alignItems: 'center', padding: 24, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border },
  noDataText:         { fontSize: 14, color: C.textMuted, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  youtubeSearchBtn:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.youtube, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, marginTop: 14 },
  youtubeSearchBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  tipCard:            { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: C.amberLight, borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: C.amber },
  tipText:            { flex: 1, fontSize: 13, color: C.text, lineHeight: 20 },
});
