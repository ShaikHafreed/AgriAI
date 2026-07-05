// app/screens/CropRecommendationScreen.jsx — Day 7 FINAL v7
// Fixed: reason text in Telugu/Hindi + AI explanation voice speaks full text

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Animated, Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { WORKER_BASE_URL, GROQ_RECOMMEND_URL } from '../../utils/apiConfig';

const RECOMMEND_URL = GROQ_RECOMMEND_URL;

const C = {
  green: '#1B5E20', greenLight: '#388E3C', greenPale: '#E8F5E9',
  amber: '#E65100', amberLight: '#FFF3E0',
  blue: '#0277BD', blueLight: '#E1F5FE',
  purple: '#6A1B9A', purpleLight: '#F3E5F5',
  bg: '#F1F8E9', card: '#FFFFFF',
  text: '#212121', textMuted: '#558B2F', border: '#C8E6C9',
};

const getSeason = () => {
  const m = new Date().getMonth() + 1;
  if (m >= 6 && m <= 9) return 'kharif';
  if (m >= 10 || m <= 1) return 'rabi';
  return 'summer';
};

const getSeasonLabel = (lang) => {
  const s = getSeason();
  return {
    kharif: { EN: 'Kharif (Jun-Sep)', TE: 'ఖరీఫ్', HI: 'खरीफ' },
    rabi:   { EN: 'Rabi (Oct-Jan)',   TE: 'రబీ',   HI: 'रबी'  },
    summer: { EN: 'Summer (Feb-May)', TE: 'వేసవి',  HI: 'ग्रीष्म' },
  }[s][lang];
};

// ── Speak helper ──────────────────────────────────────────────────────────────
const doSpeak = async (text, lang, onDone) => {
  try {
    Speech.stop();
    if (!text) { if (onDone) onDone(); return; }
    const clean    = text.replace(/[₹#*_`~]/g, ' ').replace(/\s+/g, ' ').trim();
    const langCode = lang === 'TE' ? 'te-IN' : lang === 'HI' ? 'hi-IN' : 'en-IN';

    // Check available voices
    const voices   = await Speech.getAvailableVoicesAsync();
    const hasVoice = voices.some(v =>
      v.language && v.language.startsWith(lang === 'TE' ? 'te' : lang === 'HI' ? 'hi' : 'en')
    );

    if (hasVoice) {
      // Device has the language voice — use it
      const matchedVoice = voices.find(v =>
        v.language && v.language.startsWith(lang === 'TE' ? 'te' : lang === 'HI' ? 'hi' : 'en')
      );
      Speech.speak(clean, {
        language:  langCode,
        voice:     matchedVoice?.identifier,
        pitch:     1.0,
        rate:      0.80,
        onDone:    onDone || (() => {}),
        onError:   onDone || (() => {}),
        onStopped: onDone || (() => {}),
      });
    } else {
      // No Telugu/Hindi voice installed — speak in English as fallback
      // But still speak the text so user hears something
      Speech.speak(clean, {
        language:  'en-IN',
        pitch:     1.0,
        rate:      0.80,
        onDone:    onDone || (() => {}),
        onError:   onDone || (() => {}),
        onStopped: onDone || (() => {}),
      });
    }
  } catch (e) {
    // Last resort — try with no options
    try {
      Speech.speak(text.substring(0, 200));
    } catch (_) {}
    if (onDone) onDone();
  }
};

// ── Mock data — all in correct language ──────────────────────────────────────
const CROPS = {
  kharif: {
    EN: [
      { name:'Rice',    emoji:'🌾', reason:'Rice is a staple crop and thrives in high humidity and temperature. Your region has excellent water availability for paddy farming.',         sow:'July',  duration:'90-120 days',  harvest:'October'  },
      { name:'Maize',   emoji:'🌽', reason:'Maize grows well in warm temperatures with moderate rainfall. It has a shorter growing period giving faster returns.',                        sow:'June',  duration:'80-95 days',   harvest:'September'},
      { name:'Cotton',  emoji:'🌸', reason:'Cotton thrives in black soil regions with high temperatures. Market prices are currently very favourable for cotton farmers.',                sow:'June',  duration:'150-180 days', harvest:'December' },
    ],
    TE: [
      { name:'వరి',          emoji:'🌾', reason:'వరి అనేది మన దేశంలో ప్రధాన ఆహార పంట. అధిక తేమ మరియు ఉష్ణోగ్రత వరి పంటకు చాలా అనుకూలంగా ఉన్నాయి. మీ ప్రాంతంలో నీటి లభ్యత కూడా మంచిగా ఉంది.',       sow:'జూలై',      duration:'తొంభై నుండి నూట ఇరవై రోజులు', harvest:'అక్టోబర్'  },
      { name:'మొక్కజొన్న', emoji:'🌽', reason:'మొక్కజొన్న వేసవి ఉష్ణోగ్రతలో బాగా పెరుగుతుంది. తక్కువ కాలంలో అధిక దిగుబడి వస్తుంది. మార్కెట్లో మంచి డిమాండ్ ఉంది.',                             sow:'జూన్',       duration:'ఎనభై నుండి తొంభై ఐదు రోజులు', harvest:'సెప్టెంబర్'},
      { name:'పత్తి',        emoji:'🌸', reason:'పత్తి నల్ల నేల ప్రాంతాలలో అధిక ఉష్ణోగ్రతలో బాగా పెరుగుతుంది. ప్రస్తుత మార్కెట్ ధర అనుకూలంగా ఉంది. లాభదాయకమైన పంట.',                                sow:'జూన్',       duration:'నూట యాభై నుండి నూట ఎనభై రోజులు', harvest:'డిసెంబర్' },
    ],
    HI: [
      { name:'धान',   emoji:'🌾', reason:'धान हमारे देश की मुख्य खाद्य फसल है। अधिक नमी और तापमान धान की खेती के लिए बहुत अनुकूल है। आपके क्षेत्र में पानी की उपलब्धता भी अच्छी है।',           sow:'जुलाई',    duration:'नब्बे से एक सौ बीस दिन', harvest:'अक्टूबर'  },
      { name:'मक्का', emoji:'🌽', reason:'मक्का गर्म तापमान में अच्छी तरह उगती है। कम समय में अधिक उपज मिलती है। बाजार में भी अच्छी मांग है।',                                                          sow:'जून',      duration:'अस्सी से पचानवे दिन',     harvest:'सितंबर'   },
      { name:'कपास', emoji:'🌸', reason:'कपास काली मिट्टी और उच्च तापमान में अच्छी तरह बढ़ती है। वर्तमान बाजार मूल्य बहुत अनुकूल है। यह एक लाभदायक फसल है।',                                           sow:'जून',      duration:'एक सौ पचास से एक सौ अस्सी दिन', harvest:'दिसंबर'  },
    ],
  },
  rabi: {
    EN: [
      { name:'Wheat',    emoji:'🌾', reason:'Wheat is ideal for Rabi season with cool temperatures. High demand and good profit margins make it a top choice.',                          sow:'November', duration:'120-150 days', harvest:'March'    },
      { name:'Mustard',  emoji:'🌿', reason:'Mustard grows well in mild temperatures and is drought tolerant. Short duration crop with good market demand.',                             sow:'October',  duration:'90-110 days',  harvest:'February' },
      { name:'Chickpea', emoji:'🫘', reason:'Chickpea is a nitrogen-fixing legume that improves soil health. Good profit with low input costs.',                                        sow:'October',  duration:'90-120 days',  harvest:'February' },
    ],
    TE: [
      { name:'గోధుమ',  emoji:'🌾', reason:'గోధుమ రబీ సీజన్‌లో చల్లని ఉష్ణోగ్రతలో బాగా పెరుగుతుంది. అధిక డిమాండ్ మరియు మంచి లాభం ఉంటుంది.',                                          sow:'నవంబర్', duration:'నూట ఇరవై నుండి నూట యాభై రోజులు', harvest:'మార్చి'   },
      { name:'ఆవాలు',  emoji:'🌿', reason:'ఆవాలు తక్కువ నీటితో కూడా బాగా పెరుగుతాయి. తక్కువ కాలంలో మంచి దిగుబడి వస్తుంది.',                                                           sow:'అక్టోబర్', duration:'తొంభై నుండి నూట పది రోజులు',    harvest:'ఫిబ్రవరి'},
      { name:'శనగ',   emoji:'🫘', reason:'శనగ భూమి సారాన్ని పెంచే పంట. తక్కువ ఖర్చుతో మంచి లాభం వస్తుంది.',                                                                              sow:'అక్టోబర్', duration:'తొంభై నుండి నూట ఇరవై రోజులు',  harvest:'ఫిబ్రవరి'},
    ],
    HI: [
      { name:'गेहूं',  emoji:'🌾', reason:'गेहूं रबी मौसम में ठंडे तापमान में अच्छी तरह उगता है। उच्च मांग और अच्छे मुनाफे के कारण यह शीर्ष विकल्प है।',                             sow:'नवंबर',   duration:'एक सौ बीस से एक सौ पचास दिन', harvest:'मार्च'    },
      { name:'सरसों', emoji:'🌿', reason:'सरसों हल्के तापमान में अच्छी तरह उगती है और सूखे को सहन करती है। कम समय में अच्छी बाजार मांग है।',                                          sow:'अक्टूबर', duration:'नब्बे से एक सौ दस दिन',       harvest:'फरवरी'    },
      { name:'चना',   emoji:'🫘', reason:'चना मिट्टी की उर्वरता बढ़ाने वाली फसल है। कम लागत में अच्छा मुनाफा मिलता है।',                                                                sow:'अक्टूबर', duration:'नब्बे से एक सौ बीस दिन',     harvest:'फरवरी'    },
    ],
  },
  summer: {
    EN: [
      { name:'Watermelon', emoji:'🍉', reason:'Watermelon thrives in hot summer conditions. High market demand and quick returns make it profitable.',                                    sow:'February', duration:'75-90 days',  harvest:'May'      },
      { name:'Cucumber',   emoji:'🥒', reason:'Cucumber grows rapidly in warm conditions. Short duration with consistent market demand throughout summer.',                               sow:'February', duration:'45-60 days',  harvest:'April'    },
      { name:'Sunflower',  emoji:'🌻', reason:'Sunflower is drought tolerant and grows well in summer heat. Good oil content ensures strong market prices.',                             sow:'January',  duration:'90-100 days', harvest:'May'      },
    ],
    TE: [
      { name:'పుచ్చకాయ',      emoji:'🍉', reason:'పుచ్చకాయ వేసవి వేడిలో బాగా పెరుగుతుంది. మార్కెట్లో అధిక డిమాండ్ ఉంది మరియు త్వరగా లాభం వస్తుంది.',         sow:'ఫిబ్రవరి', duration:'డెభ్భై ఐదు నుండి తొంభై రోజులు', harvest:'మే'       },
      { name:'దోసకాయ',        emoji:'🥒', reason:'దోసకాయ వేడి వాతావరణంలో వేగంగా పెరుగుతుంది. తక్కువ కాలంలో మంచి దిగుబడి వస్తుంది.',                              sow:'ఫిబ్రవరి', duration:'నలభై ఐదు నుండి అరవై రోజులు',    harvest:'ఏప్రిల్'  },
      { name:'పొద్దుతిరుగుడు', emoji:'🌻', reason:'పొద్దుతిరుగుడు వేసవి వేడికి నిరోధకంగా ఉంటుంది. నూనె విత్తనాలకు మంచి మార్కెట్ ధర లభిస్తుంది.',                    sow:'జనవరి',    duration:'తొంభై నుండి నూరు రోజులు',         harvest:'మే'       },
    ],
    HI: [
      { name:'तरबूज',     emoji:'🍉', reason:'तरबूज गर्मियों में अच्छी तरह उगता है। बाजार में उच्च मांग और त्वरित लाभ के कारण यह फायदेमंद है।',                       sow:'फरवरी',  duration:'पचहत्तर से नब्बे दिन',     harvest:'मई'       },
      { name:'खीरा',      emoji:'🥒', reason:'खीरा गर्म मौसम में तेजी से उगता है। कम समय में अच्छी उपज मिलती है और बाजार में मांग रहती है।',                          sow:'फरवरी',  duration:'पैंतालीस से साठ दिन',      harvest:'अप्रैल'   },
      { name:'सूरजमुखी', emoji:'🌻', reason:'सूरजमुखी गर्मी सहनशील और सूखे में भी अच्छी उपज देती है। तेल के लिए बाजार में अच्छी कीमत मिलती है।',                     sow:'जनवरी', duration:'नब्बे से एक सौ दिन',       harvest:'मई'       },
    ],
  },
};

// ─── CROP CARD ───────────────────────────────────────────────────────────────
function CropCard({ crop, lang, onExplain, explaining, onSpeak, onOrganic }) {
  const rankColors = ['#F59E0B', '#94A3B8', '#CD7F32'];
  return (
    <View style={S.cropCard}>
      <View style={[S.rankBadge, { backgroundColor: rankColors[crop.rank-1] + '22' }]}>
        <Text style={[S.rankText, { color: rankColors[crop.rank-1] }]}>#{crop.rank}</Text>
      </View>
      <View style={S.cropHeader}>
        <Text style={S.cropEmoji}>{crop.emoji}</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={S.cropName}>{crop.name}</Text>
          <Text style={S.cropSuit}>
            {lang === 'TE' ? 'అనుకూలత: ' : lang === 'HI' ? 'उपयुक्तता: ' : 'Suitability: '}
            <Text style={{ color: C.green, fontWeight: '700' }}>{crop.suitability}%</Text>
          </Text>
        </View>
        <View style={S.profitBadge}>
          <Text style={S.profitLabel}>{lang === 'TE' ? 'లాభం' : lang === 'HI' ? 'लाभ' : 'Profit'}</Text>
          <Text style={S.profitValue} numberOfLines={2}>{crop.profit}</Text>
        </View>
      </View>

      {/* Reason — shows in Telugu/Hindi based on lang */}
      <View style={S.reasonBox}>
        <Text style={S.reasonText}>{crop.reason}</Text>
      </View>

      <View style={S.calendarRow}>
        {[
          { label: lang === 'TE' ? 'విత్తనం' : lang === 'HI' ? 'बुआई'  : 'Sow',      val: crop.sow,      icon: '🌱' },
          { label: lang === 'TE' ? 'కాలం'    : lang === 'HI' ? 'अवधि'  : 'Duration', val: crop.duration, icon: '📅' },
          { label: lang === 'TE' ? 'కోత'     : lang === 'HI' ? 'कटाई'  : 'Harvest',  val: crop.harvest,  icon: '🌾' },
        ].map((item, i) => (
          <View key={i} style={S.calendarItem}>
            <Text style={S.calendarIcon}>{item.icon}</Text>
            <Text style={S.calendarLabel}>{item.label}</Text>
            <Text style={S.calendarValue}>{item.val}</Text>
          </View>
        ))}
      </View>

      {/* AI Explain button */}
      <TouchableOpacity
        style={[S.explainBtn, explaining && { opacity: 0.7 }]}
        onPress={() => onExplain(crop, lang)}
        disabled={explaining}
        activeOpacity={0.85}
      >
        {explaining ? <ActivityIndicator size="small" color="#fff" /> : (
          <>
            <MaterialCommunityIcons name="robot-outline" size={16} color="#fff" />
            <Text style={S.explainBtnText}>
              {lang === 'TE' ? 'AI వివరణ పొందండి' : lang === 'HI' ? 'AI से विस्तार जानें' : 'Get AI Explanation'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Organic Prep + YouTube button */}
      <TouchableOpacity
        style={S.organicBtn}
        onPress={() => onOrganic(crop, lang)}
        activeOpacity={0.85}
      >
        <Text style={{ fontSize: 16 }}>🌿</Text>
        <Text style={S.organicBtnText}>
          {lang === 'TE' ? 'సేంద్రీయ తయారీ + YouTube' : lang === 'HI' ? 'जैविक तैयारी + YouTube' : 'Organic Prep + YouTube Videos'}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={C.green} />
      </TouchableOpacity>

      {crop.explanation && (
        <View style={S.explanationBox}>
          <View style={S.explanationHeader}>
            <MaterialCommunityIcons name="robot" size={15} color={C.purple} />
            <Text style={S.explanationLabel}>
              {lang === 'TE' ? 'AI వివరణ' : lang === 'HI' ? 'AI विवरण' : 'AI Explanation'}
            </Text>
            {/* Speaker button for explanation */}
            <TouchableOpacity
              onPress={() => onSpeak(crop.explanation, lang)}
              style={{ marginLeft: 'auto', padding: 4 }}
            >
              <Ionicons name="volume-medium-outline" size={18} color={C.purple} />
            </TouchableOpacity>
          </View>
          <Text style={S.explanationText}>{crop.explanation}</Text>
        </View>
      )}
    </View>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function CropRecommendationScreen() {
  const router = useRouter();
  const [lang, setLang]               = useState('EN');
  const [loading, setLoading]         = useState(false);
  const [recs, setRecs]               = useState([]);
  const [locationName, setLocationName] = useState('');
  const [weather, setWeather]         = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError]             = useState(null);
  const [isSpeaking, setIsSpeaking]   = useState(false);
  const [explainingId, setExplainingId] = useState(null);
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const weatherRef  = useRef(null);
  const locationRef = useRef('');
  const langRef     = useRef('EN');
  const season      = getSeason();

  useEffect(() => { weatherRef.current = weather; }, [weather]);
  useEffect(() => { locationRef.current = locationName; }, [locationName]);
  useEffect(() => { langRef.current = lang; }, [lang]);

  // ── Language change — rebuild recs in new language ───────────────────────
  const handleLangChange = useCallback((newLang) => {
    setLang(newLang);
    langRef.current = newLang;  // update immediately
    Speech.stop();
    setIsSpeaking(false);
    // Rebuild recs with new language crops if showing local/mock data
    setRecs(prev => {
      if (prev.length === 0) return prev;
      // Map current recs to new language using index
      const langCrops = CROPS[season][newLang];
      return prev.map((r, i) => {
        const template = langCrops[i] || langCrops[0];
        return {
          ...r,
          name:     template.name,
          reason:   template.reason,
          sow:      template.sow,
          duration: template.duration,
          harvest:  template.harvest,
          explanation: undefined, // clear old explanation
        };
      });
    });
  }, [season]);

  useEffect(() => { getLocationAndWeather(); }, []);

  const getLocationAndWeather = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocationLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address) {
        const name = `${address.city || address.district || 'Unknown'}, ${address.region || ''}`;
        setLocationName(name);
        locationRef.current = name;
      }
      const res  = await fetch(`${WORKER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}`);
      const data = await res.json();
      if (data.cod === 200) {
        const w = { temp: Math.round(data.main.temp), humidity: data.main.humidity, description: data.weather[0].description };
        setWeather(w);
        weatherRef.current = w;
      }
    } catch (e) { console.log('Location error:', e); }
    finally { setLocationLoading(false); }
  };

  // ── Speak with correct language ───────────────────────────────────────────
  // Use langRef so speak always has current lang even inside async callbacks
  const speak = (text, speakLang) => {
    const l = speakLang || langRef.current;
    setIsSpeaking(true);
    doSpeak(text, l, () => setIsSpeaking(false));
  };

  const stopSpk = () => { Speech.stop(); setIsSpeaking(false); };

  const speakSummary = () => {
    if (recs.length === 0) return;
    const top = recs.slice(0, 3);
    let text = '';
    if (lang === 'TE') {
      text = 'మీ పొలానికి అత్యుత్తమ పంటలు. ';
      top.forEach((c, i) => {
        text += `${['మొదటి','రెండవ','మూడవ'][i]} స్థానం ${c.name}. ${c.reason} `;
      });
    } else if (lang === 'HI') {
      text = 'आपके खेत के लिए सबसे अच्छी फसलें। ';
      top.forEach((c, i) => {
        text += `${['पहली','दूसरी','तीसरी'][i]} फसल ${c.name}। ${c.reason} `;
      });
    } else {
      text = 'Top crop recommendations. ';
      top.forEach((c, i) => { text += `Number ${i+1}: ${c.name}. ${c.reason} `; });
    }
    speak(text, lang);
  };

  const handleMicPress = () => {
    Alert.alert(
      lang === 'TE' ? '🎤 వాయిస్ ఇన్‌పుట్' : lang === 'HI' ? '🎤 वॉयस इनपुट' : '🎤 Voice Input',
      lang === 'TE' ? 'మీ పొలం గురించి చెప్పండి.' : lang === 'HI' ? 'अपने खेत के बारे में बताएं।' : 'Tell us about your farm.',
      [
        { text: lang === 'TE' ? 'సిఫారసులు తీసుకో' : lang === 'HI' ? 'सुझाव लें' : 'Get Recommendations', onPress: () => getRecommendations(lang) },
        { text: lang === 'TE' ? 'రద్దు' : lang === 'HI' ? 'रद्द करें' : 'Cancel', style: 'cancel' },
      ]
    );
  };

  // ── Get recommendations ───────────────────────────────────────────────────
  const getRecommendations = async (activeLang) => {
    const l        = activeLang || lang;
    const loc      = locationRef.current || 'Andhra Pradesh, India';
    const wth      = weatherRef.current;
    const langCrops = CROPS[season][l];

    setLoading(true);
    setError(null);
    setRecs([]);
    fadeAnim.setValue(0);

    try {
      const cropNames = langCrops.map(c => c.name).join(', ');
      const prompt =
        l === 'TE'
          ? `నేను ${loc} లో వ్యవసాయం చేస్తున్నాను. సీజన్: ${getSeasonLabel(l)}. ఉష్ణోగ్రత ${wth?.temp || 32} డిగ్రీలు, తేమ ${wth?.humidity || 65} శాతం. సాధారణ పంటలు: ${cropNames}. నాకు అత్యుత్తమ 3 పంటలను JSON లో చెప్పండి. JSON format: [{"rank":1,"name":"పంట పేరు","emoji":"🌾","suitability":92,"profit":"₹18,000 - ₹25,000 per acre","reason":"2 వాక్యాలు తెలుగులో","sow":"నెల","duration":"కాలవ్యవధి","harvest":"నెల"},{"rank":2,...},{"rank":3,...}]`
          : l === 'HI'
          ? `मैं ${loc} में खेती करता हूं। मौसम: ${getSeasonLabel(l)}। तापमान ${wth?.temp || 32} डिग्री, नमी ${wth?.humidity || 65} प्रतिशत। सामान्य फसलें: ${cropNames}। मुझे 3 फसलें JSON में बताएं। JSON format: [{"rank":1,"name":"फसल का नाम","emoji":"🌾","suitability":92,"profit":"₹18,000 - ₹25,000 per acre","reason":"2 वाक्य हिंदी में","sow":"महीना","duration":"अवधि","harvest":"महीना"},{"rank":2,...},{"rank":3,...}]`
          : `I farm in ${loc}. Season: ${getSeasonLabel(l)}. Temp: ${wth?.temp || 32}°C, Humidity: ${wth?.humidity || 65}%. Give me top 3 crop recommendations as JSON: [{"rank":1,"name":"crop","emoji":"🌾","suitability":92,"profit":"₹18,000-₹25,000 per acre","reason":"2 sentences","sow":"month","duration":"duration","harvest":"month"},{"rank":2,...},{"rank":3,...}]`;

      const res = await fetch(RECOMMEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, lang: l }),
      });

      if (!res.ok) throw new Error(`Worker ${res.status}`);
      const data  = await res.json();
      let raw = (data.reply || '').replace(/```json|```/gi, '').trim();
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('No JSON');
      const parsed = JSON.parse(match[0]);
      setRecs(parsed.map(r => ({ ...r })));
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    } catch (err) {
      // Use built-in crops as fallback
      const fallbackCrops = CROPS[season][l];
      const profits = ['₹18,000 - ₹25,000 per acre', '₹12,000 - ₹18,000 per acre', '₹22,000 - ₹35,000 per acre'];
      const suitabilities = [92, 85, 78];
      setRecs(fallbackCrops.map((c, i) => ({
        rank: i + 1,
        name: c.name,
        emoji: c.emoji,
        suitability: suitabilities[i],
        profit: profits[i],
        reason: c.reason,
        sow: c.sow,
        duration: c.duration,
        harvest: c.harvest,
      })));
      setError(
        l === 'TE' ? 'నమూనా డేటా చూపిస్తున్నాం.' :
        l === 'HI' ? 'नमूना डेटा दिखा रहे हैं।' : 'Showing sample data.'
      );
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    } finally {
      setLoading(false);
    }
  };

  // ── AI Explanation — lang passed directly ────────────────────────────────
  const getCropExplanation = async (crop, activeLang) => {
    // activeLang passed from button press, langRef.current as backup
    const l = activeLang || langRef.current;
    const loc = locationRef.current || 'Andhra Pradesh, India';

    setExplainingId(crop.rank);

    // 1. Show instant fallback so button always responds
    const fallback =
      l === 'TE'
        ? `${crop.name} మీ పొలానికి చాలా అనుకూలమైన పంట. ప్రస్తుత వాతావరణ పరిస్థితులు దీని పెరుగుదలకు మంచివి. సరైన సమయంలో విత్తనాలు వేయండి మరియు తగినంత నీరు అందించండి. ఇది మీకు మంచి దిగుబడి మరియు లాభం తెస్తుంది.`
        : l === 'HI'
        ? `${crop.name} आपके खेत के लिए बहुत उपयुक्त फसल है। मौसम की स्थितियां इसकी वृद्धि के लिए अनुकूल हैं। सही समय पर बुआई करें और पर्याप्त सिंचाई करें। इससे अच्छी पैदावार और मुनाफा मिलेगा।`
        : `${crop.name} is highly suitable for your farm this season. Current conditions favour its growth. Sow at the right time and ensure adequate irrigation for best results.`;

    // Show instantly
    setRecs(prev => prev.map(r => r.rank === crop.rank ? { ...r, explanation: fallback } : r));
    setExplainingId(null);
    speak(fallback, l);  // speak in correct language

    // 2. Fetch better AI explanation in background
    try {
      const prompt =
        l === 'TE'
          ? `${crop.name} పంట గురించి 3-4 వాక్యాలలో తెలుగులో వివరించండి. ${loc} లో ఈ పంట ఎందుకు మంచిది? ఒక ఆచరణాత్మక సలహా ఇవ్వండి.`
          : l === 'HI'
          ? `${crop.name} के बारे में 3-4 वाक्यों में हिंदी में बताएं। ${loc} में यह फसल क्यों अच्छी है? एक व्यावहारिक सुझाव दें।`
          : `In 3-4 sentences, explain why ${crop.name} is an excellent crop for farmers in ${loc} during ${getSeasonLabel('EN')} season. Include one practical farming tip.`;

      const res = await fetch(RECOMMEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, lang: l }),
      });

      if (res.ok) {
        const data   = await res.json();
        const aiText = (data.reply || '').trim();
        if (aiText.length > 30) {
          // Update with AI text and speak again
          setRecs(prev => prev.map(r => r.rank === crop.rank ? { ...r, explanation: aiText } : r));
          speak(aiText, l);
        }
      }
    } catch (e) {
      // Fallback already shown and spoken — no action needed
    }
  };

  return (
    <SafeAreaView style={S.root}>
      <LinearGradient colors={[C.green, C.greenLight]} style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle}>
            {lang === 'TE' ? 'పంట సిఫారసులు' : lang === 'HI' ? 'फसल सुझाव' : 'Crop Recommendations'}
          </Text>
          <Text style={S.headerSub}>
            {lang === 'TE' ? 'AI ఆధారిత పంట సలహా' : lang === 'HI' ? 'AI आधारित फसल सलाह' : 'AI-powered crop advisory'}
          </Text>
        </View>
        <LanguageSwitcher lang={lang} setLang={handleLangChange} />
      </LinearGradient>

      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
        {/* Farm Context */}
        <View style={S.contextCard}>
          <View style={S.contextRow}>
            {[
              { icon: '📍', label: lang === 'TE' ? 'స్థానం'     : lang === 'HI' ? 'स्थान'  : 'Location',  value: locationName || '--' },
              { icon: '🌡️', label: lang === 'TE' ? 'ఉష్ణోగ్రత' : lang === 'HI' ? 'तापमान' : 'Temp',      value: weather ? `${weather.temp}°C` : '--' },
              { icon: '💧', label: lang === 'TE' ? 'తేమ'        : lang === 'HI' ? 'नमी'    : 'Humidity',  value: weather ? `${weather.humidity}%` : '--' },
              { icon: season === 'kharif' ? '🌧️' : season === 'rabi' ? '❄️' : '☀️',
                label: lang === 'TE' ? 'సీజన్' : lang === 'HI' ? 'मौसम' : 'Season',
                value: getSeasonLabel(lang) },
            ].map((item, i) => (
              <View key={i} style={S.contextItem}>
                <Text style={S.contextIcon}>{item.icon}</Text>
                <Text style={S.contextLabel}>{item.label}</Text>
                {locationLoading && i < 3 ? (
                  <ActivityIndicator size="small" color={C.green} style={{ marginTop: 4 }} />
                ) : (
                  <Text style={S.contextValue} numberOfLines={2}>{item.value}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={S.actionRow}>
          <TouchableOpacity style={S.micBtn} onPress={handleMicPress}>
            <Ionicons name="mic-outline" size={22} color={C.green} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[S.getRecBtn, loading && { opacity: 0.5 }]}
            onPress={() => getRecommendations(lang)}
            disabled={loading} activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" size="small" /> : (
              <>
                <MaterialCommunityIcons name="sprout" size={20} color="#fff" />
                <Text style={S.getRecBtnText}>
                  {lang === 'TE' ? 'పంటలు సూచించు' : lang === 'HI' ? 'फसलें सुझाएं' : 'Get Recommendations'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[S.speakBtn, isSpeaking && { backgroundColor: C.greenLight, borderColor: C.greenLight }]}
            onPress={isSpeaking ? stopSpk : speakSummary}
            disabled={recs.length === 0}
          >
            <Ionicons
              name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
              size={22}
              color={isSpeaking ? '#fff' : recs.length > 0 ? C.green : C.border}
            />
          </TouchableOpacity>
        </View>

        {loading && (
          <Text style={S.loadingHint}>
            🤖 {lang === 'TE' ? 'AI మీ పొలం విశ్లేషిస్తోంది...' : lang === 'HI' ? 'AI आपके खेत का विश्लेषण कर रहा है...' : 'AI is analysing your farm...'}
          </Text>
        )}

        {error && (
          <View style={S.errorCard}>
            <Ionicons name="alert-circle-outline" size={18} color={C.amber} />
            <Text style={S.errorText}>{error}</Text>
          </View>
        )}

        {recs.length > 0 && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={S.sectionTitle}>
              {lang === 'TE' ? '🌱 మీ పొలానికి అత్యుత్తమ పంటలు' : lang === 'HI' ? '🌱 आपके खेत की सर्वश्रेष्ठ फसलें' : '🌱 Best Crops for Your Farm'}
            </Text>
            {recs.map((crop) => (
              <CropCard
                key={crop.rank}
                crop={crop}
                lang={lang}
                onExplain={getCropExplanation}
                explaining={explainingId === crop.rank}
                onSpeak={speak}
                onOrganic={(c, l) => router.push({
                  pathname: '/screens/OrganicPrepScreen',
                  params: { crop: c.name, lang: l },
                })}
              />
            ))}
          </Animated.View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root:             { flex: 1, backgroundColor: C.bg },
  header:           { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: 14, paddingHorizontal: 14 },
  headerTitle:      { color: '#fff', fontSize: 15, fontWeight: '700' },
  headerSub:        { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 1 },
  scroll:           { padding: 14 },
  contextCard:      { backgroundColor: C.card, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  contextRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  contextItem:      { alignItems: 'center', flex: 1 },
  contextIcon:      { fontSize: 20, marginBottom: 4 },
  contextLabel:     { fontSize: 9, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' },
  contextValue:     { fontSize: 11, color: C.text, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  actionRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  micBtn:           { width: 48, height: 48, borderRadius: 24, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  getRecBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: C.green, elevation: 3, shadowColor: C.green, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6 },
  getRecBtnText:    { color: '#fff', fontSize: 14, fontWeight: '700' },
  speakBtn:         { width: 48, height: 48, borderRadius: 24, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  loadingHint:      { textAlign: 'center', color: C.textMuted, fontSize: 12, marginBottom: 12, lineHeight: 18 },
  errorCard:        { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: C.amberLight, borderRadius: 12, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: C.amber },
  errorText:        { flex: 1, color: C.amber, fontSize: 12, lineHeight: 18 },
  sectionTitle:     { fontSize: 15, fontWeight: '700', color: C.green, marginBottom: 12 },
  cropCard:         { backgroundColor: C.card, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6 },
  rankBadge:        { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 10 },
  rankText:         { fontSize: 11, fontWeight: '700' },
  cropHeader:       { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cropEmoji:        { fontSize: 40 },
  cropName:         { fontSize: 20, fontWeight: '800', color: C.text },
  cropSuit:         { fontSize: 13, color: C.textMuted, marginTop: 2 },
  profitBadge:      { backgroundColor: C.greenPale, borderRadius: 12, padding: 10, alignItems: 'center', maxWidth: 130 },
  profitLabel:      { fontSize: 10, color: C.green, fontWeight: '600', textTransform: 'uppercase' },
  profitValue:      { fontSize: 11, color: C.green, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  reasonBox:        { backgroundColor: C.blueLight, borderRadius: 10, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: C.blue },
  reasonText:       { fontSize: 13, color: C.text, lineHeight: 20 },
  calendarRow:      { flexDirection: 'row', backgroundColor: C.greenPale, borderRadius: 12, padding: 12, marginBottom: 12, justifyContent: 'space-around' },
  calendarItem:     { alignItems: 'center' },
  calendarIcon:     { fontSize: 18, marginBottom: 4 },
  calendarLabel:    { fontSize: 9, color: C.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  calendarValue:    { fontSize: 11, color: C.text, fontWeight: '700', marginTop: 2 },
  explainBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10, backgroundColor: C.purple },
  organicBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: C.greenPale, borderWidth: 1, borderColor: C.border, marginTop: 8 },
  organicBtnText:   { flex: 1, fontSize: 13, fontWeight: '600', color: C.green },
  explainBtnText:   { color: '#fff', fontSize: 13, fontWeight: '700' },
  explanationBox:   { backgroundColor: C.purpleLight, borderRadius: 12, padding: 12, marginTop: 10, borderLeftWidth: 3, borderLeftColor: C.purple },
  explanationHeader:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  explanationLabel: { fontSize: 11, color: C.purple, fontWeight: '700', textTransform: 'uppercase' },
  explanationText:  { fontSize: 13, color: C.text, lineHeight: 20 },
});
