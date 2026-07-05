// app/screens/ChatScreen.jsx — Day 9 ULTIMATE
// Smart image analysis: crops, soil, test reports, pests, leaves
// Professional UI + context-aware AI responses

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Animated, Alert, Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { GROQ_RECOMMEND_URL, GROQ_DIAGNOSE_URL } from '../../utils/apiConfig';

const GROQ_WORKER   = GROQ_RECOMMEND_URL;
const VISION_WORKER = GROQ_DIAGNOSE_URL;
const CHAT_KEY      = 'agriai_chat_v2';

const C = {
  green: '#1B5E20', greenLight: '#388E3C', greenPale: '#E8F5E9',
  bg: '#F0F4F0', card: '#FFFFFF',
  text: '#1A1A1A', textMuted: '#4A7A4A', border: '#C8E6C9',
  userBubble: '#1B5E20', aiBubble: '#FFFFFF',
  amber: '#E65100', amberLight: '#FFF8F0',
  blue: '#0277BD', blueLight: '#E3F2FD',
  purple: '#6A1B9A', purpleLight: '#F3E5F5',
  red: '#C62828',
};

// ── Image type options ────────────────────────────────────────────────────────
const IMAGE_TYPES = {
  EN: [
    { id: 'crop',    icon: '🌾', label: 'Crop / Plant',      prompt: 'Analyze this crop/plant image. Identify: 1) Plant health status 2) Any diseases, pests or deficiencies visible 3) Growth stage 4) Organic treatment recommendations with specific preparations like Jeevamrutha, Neem extract, Panchagavya. 5) Prevention tips. Be specific and practical.' },
    { id: 'soil',    icon: '🌍', label: 'Soil Sample',       prompt: 'Analyze this soil image. Assess: 1) Soil color and texture 2) Likely soil type (clay/sandy/loamy/black) 3) Estimated organic matter content 4) Potential issues visible 5) Recommended organic amendments like vermicompost, green manure 6) Best crops for this soil type.' },
    { id: 'pest',    icon: '🐛', label: 'Pest / Insect',     prompt: 'Identify this pest/insect in the image. Provide: 1) Pest name and type 2) Crops it attacks 3) Damage caused 4) Life cycle stage visible 5) Organic control methods: Neem oil, Panchagavya, sticky traps, biological controls 6) Urgency level and immediate action needed.' },
    { id: 'leaf',    icon: '🍃', label: 'Leaf Disease',      prompt: 'Analyze this leaf image for diseases. Identify: 1) Disease name 2) Pathogen type (fungal/bacterial/viral) 3) Severity (mild/moderate/severe) 4) Spread pattern 5) Organic fungicides or treatments: Copper sulfate, Neem, Buttermilk spray 6) Steps to prevent spread to other plants.' },
    { id: 'report',  icon: '📋', label: 'Soil Test Report',  prompt: 'Read and interpret this soil test report. Explain: 1) Each parameter in simple farmer language 2) What values are normal vs concerning 3) Specific organic amendments needed for each deficiency 4) How to apply these amendments 5) Expected improvement timeline 6) Best crops to grow based on this report.' },
    { id: 'other',   icon: '📸', label: 'Other / General',   prompt: 'Analyze this farming-related image. Provide detailed observations and practical organic farming recommendations based on what you see.' },
  ],
  TE: [
    { id: 'crop',    icon: '🌾', label: 'పంట / మొక్క',     prompt: 'ఈ పంట/మొక్క చిత్రాన్ని విశ్లేషించండి. 1) మొక్క ఆరోగ్యం 2) వ్యాధులు, పురుగులు లేదా పోషక లోపాలు 3) పెరుగుదల దశ 4) జీవామృతం, వేప కషాయం, పంచగవ్య వంటి సేంద్రీయ చికిత్సలు 5) నివారణ చర్యలు చెప్పండి. తెలుగులో మాత్రమే సమాధానం ఇవ్వండి.' },
    { id: 'soil',    icon: '🌍', label: 'నేల నమూనా',        prompt: 'ఈ నేల చిత్రాన్ని విశ్లేషించండి. 1) నేల రంగు మరియు అమరిక 2) నేల రకం 3) సేంద్రీయ పదార్థం 4) సమస్యలు 5) వర్మీ కంపోస్ట్, పచ్చి ఎరువు సిఫారసులు 6) అనువైన పంటలు తెలుగులో చెప్పండి.' },
    { id: 'pest',    icon: '🐛', label: 'పురుగు / కీటకం',   prompt: 'ఈ పురుగు/కీటకాన్ని గుర్తించండి. 1) పురుగు పేరు 2) దాడి చేసే పంటలు 3) నష్టం 4) వేప నూనె, పంచగవ్య, జీవ నియంత్రణ వంటి సేంద్రీయ పద్ధతులు 5) అత్యవసర చర్యలు తెలుగులో చెప్పండి.' },
    { id: 'leaf',    icon: '🍃', label: 'ఆకు వ్యాధి',       prompt: 'ఈ ఆకు చిత్రంలో వ్యాధిని గుర్తించండి. 1) వ్యాధి పేరు 2) కారణం 3) తీవ్రత 4) వ్యాప్తి 5) నీమ్, మజ్జిగ, రాగి వంటి సేంద్రీయ చికిత్సలు తెలుగులో చెప్పండి.' },
    { id: 'report',  icon: '📋', label: 'నేల పరీక్ష నివేదిక', prompt: 'ఈ నేల పరీక్ష నివేదికను చదివి అర్థం చేసుకోండి. 1) రైతు భాషలో ప్రతి అంశం వివరించండి 2) సేంద్రీయ మెరుగుదలలు 3) ఏ పంటలు వేయాలి తెలుగులో చెప్పండి.' },
    { id: 'other',   icon: '📸', label: 'ఇతరం',            prompt: 'ఈ వ్యవసాయ చిత్రాన్ని విశ్లేషించి తెలుగులో సేంద్రీయ సలహాలు ఇవ్వండి.' },
  ],
  HI: [
    { id: 'crop',    icon: '🌾', label: 'फसल / पौधा',       prompt: 'इस फसल/पौधे की फोटो का विश्लेषण करें। 1) पौधे का स्वास्थ्य 2) रोग, कीट या पोषण की कमी 3) वृद्धि अवस्था 4) जीवामृत, नीम काढ़ा, पंचगव्य जैसे जैविक उपचार 5) रोकथाम के उपाय हिंदी में बताएं।' },
    { id: 'soil',    icon: '🌍', label: 'मिट्टी का नमूना',  prompt: 'इस मिट्टी की फोटो का विश्लेषण करें। 1) मिट्टी का रंग और बनावट 2) मिट्टी का प्रकार 3) जैविक पदार्थ 4) समस्याएं 5) वर्मीकम्पोस्ट, हरी खाद सिफारिशें 6) उपयुक्त फसलें हिंदी में बताएं।' },
    { id: 'pest',    icon: '🐛', label: 'कीट / कीड़ा',      prompt: 'इस कीट/कीड़े की पहचान करें। 1) कीट का नाम 2) जिन फसलों पर हमला करता है 3) नुकसान 4) नीम तेल, पंचगव्य, जैविक नियंत्रण 5) तत्काल कार्रवाई हिंदी में बताएं।' },
    { id: 'leaf',    icon: '🍃', label: 'पत्ती का रोग',     prompt: 'इस पत्ती की फोटो में रोग की पहचान करें। 1) रोग का नाम 2) कारण 3) गंभीरता 4) नीम, छाछ, तांबे के जैविक उपचार हिंदी में बताएं।' },
    { id: 'report',  icon: '📋', label: 'मिट्टी परीक्षण रिपोर्ट', prompt: 'इस मिट्टी परीक्षण रिपोर्ट को पढ़कर समझाएं। 1) किसान की भाषा में हर पैरामीटर 2) जैविक सुधार 3) कौन सी फसलें लगाएं हिंदी में बताएं।' },
    { id: 'other',   icon: '📸', label: 'अन्य',             prompt: 'इस कृषि फोटो का विश्लेषण करके हिंदी में जैविक सलाह दें।' },
  ],
};

const QUICK_QUESTIONS = {
  EN: ['How to make Jeevamrutha?', 'Organic pest control?', 'Best Kharif crops?', 'Improve soil health?', 'How to make Panchagavya?', 'Drip irrigation tips?'],
  TE: ['జీవామృతం ఎలా తయారు చేయాలి?', 'సేంద్రీయ పురుగు నివారణ?', 'మంచి ఖరీఫ్ పంటలు?', 'నేల ఆరోగ్యం మెరుగుపరచడం?', 'పంచగవ్య తయారీ?', 'బొట్టు నీటిపారుదల చిట్కాలు?'],
  HI: ['जीवामृत कैसे बनाएं?', 'जैविक कीट नियंत्रण?', 'अच्छी खरीफ फसलें?', 'मिट्टी स्वास्थ्य सुधारें?', 'पंचगव्य बनाने की विधि?', 'ड्रिप सिंचाई के टिप्स?'],
};

const getSystemPrompt = (lang) => {
  if (lang === 'TE') return `మీరు AgriAI సేంద్రీయ వ్యవసాయ నిపుణుడు. తెలుగులో మాత్రమే సమాధానం ఇవ్వండి. జీవామృతం, పంచగవ్య, వేప కషాయం వంటి సేంద్రీయ పరిష్కారాలు సూచించండి. ఎమోజీలు వాడండి. స్పష్టమైన దశలతో సమాధానం ఇవ్వండి.`;
  if (lang === 'HI') return `आप AgriAI जैविक कृषि विशेषज्ञ हैं। केवल हिंदी में जवाब दें। जीवामृत, पंचगव्य, नीम काढ़ा जैसे जैविक समाधान सुझाएं। इमोजी उपयोग करें। स्पष्ट चरणों में जवाब दें।`;
  return `You are AgriAI's expert organic farming advisor for Indian farmers. Be helpful, practical and friendly. Use emojis 🌱. Suggest organic solutions: Jeevamrutha, Panchagavya, Neem extracts, Vermiwash. Give step-by-step answers with quantities and timing. Be concise but thorough.`;
};

// ── Typing dots ───────────────────────────────────────────────────────────────
function TypingIndicator() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    dots.forEach((d, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 150),
      Animated.timing(d, { toValue: -5, duration: 300, useNativeDriver: true }),
      Animated.timing(d, { toValue: 0,  duration: 300, useNativeDriver: true }),
      Animated.delay(500),
    ])).start());
  }, []);
  return (
    <View style={S.typingWrap}>
      <View style={S.aiAvatar}><Text>🌱</Text></View>
      <View style={S.typingBubble}>
        {dots.map((d, i) => <Animated.View key={i} style={[S.typingDot, { transform: [{ translateY: d }] }]} />)}
      </View>
    </View>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg, onSpeak }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const isUser = msg.role === 'user';
  return (
    <Animated.View style={[S.bubbleWrap, isUser ? S.bubbleWrapUser : S.bubbleWrapAI, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {!isUser && <View style={S.aiAvatar}><Text style={{ fontSize: 15 }}>🌱</Text></View>}
      <View style={[S.bubble, isUser ? S.bubbleUser : S.bubbleAI]}>
        {/* Image type badge */}
        {msg.imageType && (
          <View style={S.imgTypeBadge}>
            <Text style={S.imgTypeBadgeText}>{msg.imageType}</Text>
          </View>
        )}
        {/* Image */}
        {msg.image && <Image source={{ uri: msg.image }} style={S.msgImage} resizeMode="cover" />}
        {/* Text */}
        {msg.content ? <Text style={[S.bubbleText, { color: isUser ? '#fff' : C.text }]}>{msg.content}</Text> : null}
        <View style={S.bubbleMeta}>
          <Text style={[S.bubbleTime, { color: isUser ? 'rgba(255,255,255,0.55)' : C.textMuted }]}>{msg.time}</Text>
          {!isUser && msg.content && (
            <TouchableOpacity onPress={() => onSpeak(msg.content)} style={{ marginLeft: 6 }}>
              <Ionicons name="volume-medium-outline" size={13} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const router  = useRouter();
  const [lang, setLang]         = useState('EN');
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showImageTypes, setShowImageTypes] = useState(false);
  const scrollRef = useRef(null);
  const langRef   = useRef('EN');

  useEffect(() => { langRef.current = lang; }, [lang]);

  // Load history
  useEffect(() => { loadHistory(); }, []);

  // Welcome message
  useEffect(() => {
    const welcome = {
      id: 'welcome', role: 'assistant', time: getTime(),
      content: lang === 'TE'
        ? '🌱 నమస్కారం! నేను AgriAI సేంద్రీయ వ్యవసాయ నిపుణుడిని.\n\n📸 పంట, నేల, పురుగు, ఆకు వ్యాధి లేదా నేల పరీక్ష నివేదిక ఫోటో పంపండి — నేను వెంటనే విశ్లేషిస్తాను!\n\n✍️ లేదా మీ వ్యవసాయ ప్రశ్న అడగండి.'
        : lang === 'HI'
        ? '🌱 नमस्ते! मैं AgriAI जैविक कृषि विशेषज्ञ हूं।\n\n📸 फसल, मिट्टी, कीट, पत्ती रोग या मिट्टी परीक्षण रिपोर्ट की फोटो भेजें — मैं तुरंत विश्लेषण करूंगा!\n\n✍️ या अपना खेती का सवाल पूछें।'
        : '🌱 Hello! I\'m AgriAI\'s organic farming expert.\n\n📸 Send photos of:\n• Crops / Plants 🌾\n• Soil samples 🌍\n• Pests / Insects 🐛\n• Leaf diseases 🍃\n• Soil test reports 📋\n\nI\'ll analyze instantly and give organic solutions!\n\n✍️ Or just ask any farming question.',
    };
    setMessages(prev => [welcome, ...prev.filter(m => m.id !== 'welcome')]);
  }, [lang]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  const getTime = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(CHAT_KEY);
      if (stored) {
        const hist = JSON.parse(stored);
        if (hist.length > 0) setMessages(prev => [prev.find(m=>m.id==='welcome'), ...hist].filter(Boolean));
      }
    } catch (e) {}
  };

  const saveHistory = async (msgs) => {
    try {
      await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(msgs.filter(m => m.id !== 'welcome').slice(-40)));
    } catch (e) {}
  };

  // ── Image picker + type selector ─────────────────────────────────────────
  const handleImageBtn = () => setShowImageTypes(true);

  const handleImageTypeSelect = (type) => {
    setShowImageTypes(false);
    Alert.alert(
      lang === 'TE' ? '📸 ఫోటో తీయండి' : lang === 'HI' ? '📸 फोटो लें' : '📸 Get Photo',
      '',
      [
        { text: lang === 'TE' ? '📷 కెమెరా'  : lang === 'HI' ? '📷 कैमरा'  : '📷 Camera',  onPress: () => pickImage('camera',  type) },
        { text: lang === 'TE' ? '🖼️ గ్యాలరీ' : lang === 'HI' ? '🖼️ गैलरी' : '🖼️ Gallery', onPress: () => pickImage('gallery', type) },
        { text: lang === 'TE' ? 'రద్దు' : lang === 'HI' ? 'रद्द' : 'Cancel', style: 'cancel' },
      ]
    );
  };

  const pickImage = async (source, typeObj) => {
    try {
      let result;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission needed'); return; }
        result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission needed'); return; }
        result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85 });
      }
      if (!result.canceled && result.assets[0]) {
        await analyzeImage(result.assets[0].uri, typeObj);
      }
    } catch (e) { Alert.alert('Error', 'Could not get image'); }
  };

  const analyzeImage = async (uri, typeObj) => {
    setLoading(true);
    const l = langRef.current;
    const types = IMAGE_TYPES[l];
    const matched = types.find(t => t.id === typeObj.id) || types[0];

    // Compress
    let base64 = '';
    try {
      const comp = await ImageManipulator.manipulateAsync(
        uri, [{ resize: { width: 768 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      base64 = comp.base64;
    } catch (e) { setLoading(false); return; }

    const caption = l === 'TE' ? `${matched.icon} ${matched.label} పంపాను` : l === 'HI' ? `${matched.icon} ${matched.label} भेजी` : `${matched.icon} Sent: ${matched.label}`;
    const userMsg = { role: 'user', image: uri, content: caption, imageType: `${matched.icon} ${matched.label}`, time: getTime() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch(VISION_WORKER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64, prompt: matched.prompt }),
      });
      if (!res.ok) throw new Error('Vision error');
      const data = await res.json();
      const aiMsg = { role: 'assistant', content: (data.reply || '').trim(), time: getTime() };
      setMessages(prev => { const n = [...prev, aiMsg]; saveHistory(n); return n; });
    } catch (e) {
      const err = l === 'TE' ? 'ఫోటో విశ్లేషణ కాలేదు. మళ్ళీ ప్రయత్నించండి.' : l === 'HI' ? 'फोटो विश्लेषण नहीं हुआ।' : 'Could not analyze image. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: err, time: getTime() }]);
    } finally { setLoading(false); }
  };

  // ── Send text ─────────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    const l = langRef.current;
    setInput('');
    const userMsg = { role: 'user', content: msg, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch(GROQ_WORKER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: msg, lang: l, systemPrompt: getSystemPrompt(l) }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data  = await res.json();
      const reply = (data.reply || '').trim();
      if (!reply) throw new Error('empty');
      const aiMsg = { role: 'assistant', content: reply, time: getTime() };
      setMessages(prev => { const n = [...prev, aiMsg]; saveHistory(n); return n; });
    } catch (e) {
      const fb = l === 'TE' ? 'క్షమించండి, ఇంటర్నెట్ తనిఖీ చేసి మళ్ళీ ప్రయత్నించండి.' : l === 'HI' ? 'क्षमा करें, इंटरनेट जांचें और फिर प्रयास करें।' : 'Sorry, please check your internet and try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: fb, time: getTime() }]);
    } finally { setLoading(false); }
  };

  // ── TTS ──────────────────────────────────────────────────────────────────
  const speak = (text) => {
    if (isSpeaking) { Speech.stop(); setIsSpeaking(false); return; }
    const code = langRef.current === 'TE' ? 'te-IN' : langRef.current === 'HI' ? 'hi-IN' : 'en-IN';
    setIsSpeaking(true);
    Speech.speak(text.replace(/[#*_`~]/g, ' '), {
      language: code, pitch: 1.0, rate: 0.82,
      onDone: () => setIsSpeaking(false), onError: () => setIsSpeaking(false),
    });
  };

  const clearChat = () => Alert.alert(
    lang === 'TE' ? 'చాట్ క్లియర్?' : lang === 'HI' ? 'चैट साफ करें?' : 'Clear chat?',
    '',
    [
      { text: lang === 'TE' ? 'రద్దు' : lang === 'HI' ? 'रद्द' : 'Cancel', style: 'cancel' },
      { text: lang === 'TE' ? 'క్లియర్' : lang === 'HI' ? 'साफ करें' : 'Clear', style: 'destructive',
        onPress: async () => { await AsyncStorage.removeItem(CHAT_KEY); setMessages([]); }
      },
    ]
  );

  const imgTypes = IMAGE_TYPES[lang];

  return (
    <SafeAreaView style={S.root}>
      {/* Header */}
      <LinearGradient colors={[C.green, C.greenLight]} style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={S.headerCenter}>
          <View style={S.headerAvatar}><Text style={{ fontSize: 18 }}>🌱</Text></View>
          <View>
            <Text style={S.headerTitle}>{lang === 'TE' ? 'AgriAI అడగండి' : lang === 'HI' ? 'AgriAI से पूछें' : 'Ask AgriAI'}</Text>
            <View style={S.onlineRow}>
              <View style={S.onlineDot} />
              <Text style={S.onlineText}>{lang === 'TE' ? 'సేంద్రీయ వ్యవసాయ నిపుణుడు' : lang === 'HI' ? 'जैविक कृषि विशेषज्ञ' : 'Organic Farming Expert'}</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity onPress={clearChat} style={{ padding: 4 }}>
            <Ionicons name="trash-outline" size={18} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Image type selector sheet */}
        {showImageTypes && (
          <View style={S.imgTypeSheet}>
            <View style={S.imgTypeHeader}>
              <Text style={S.imgTypeTitle}>
                {lang === 'TE' ? '📸 ఏమి పంపాలి?' : lang === 'HI' ? '📸 क्या भेजें?' : '📸 What are you sending?'}
              </Text>
              <TouchableOpacity onPress={() => setShowImageTypes(false)}>
                <Ionicons name="close" size={22} color={C.text} />
              </TouchableOpacity>
            </View>
            <View style={S.imgTypeGrid}>
              {imgTypes.map((type) => (
                <TouchableOpacity key={type.id} style={S.imgTypeCard} onPress={() => handleImageTypeSelect(type)}>
                  <Text style={S.imgTypeEmoji}>{type.icon}</Text>
                  <Text style={S.imgTypeLabel}>{type.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Messages */}
        <ScrollView ref={scrollRef} contentContainerStyle={S.messageList} showsVerticalScrollIndicator={false}>
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} onSpeak={speak} />)}
          {loading && <TypingIndicator />}
        </ScrollView>

        {/* Quick questions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.quickScroll} contentContainerStyle={S.quickRow}>
          {QUICK_QUESTIONS[lang].map((q, i) => (
            <TouchableOpacity key={i} style={S.quickChip} onPress={() => sendMessage(q)} disabled={loading}>
              <Text style={S.quickChipText} numberOfLines={1}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input bar */}
        <View style={S.inputRow}>
          <TouchableOpacity style={S.iconBtn} onPress={handleImageBtn} disabled={loading}>
            <Ionicons name="camera-outline" size={21} color={C.green} />
          </TouchableOpacity>
          <TextInput
            style={S.input}
            value={input}
            onChangeText={setInput}
            placeholder={lang === 'TE' ? 'వ్యవసాయ ప్రశ్న అడగండి...' : lang === 'HI' ? 'खेती का सवाल पूछें...' : 'Ask any farming question...'}
            placeholderTextColor={C.textMuted}
            multiline maxLength={500}
          />
          <TouchableOpacity
            style={[S.sendBtn, (!input.trim() || loading) && { opacity: 0.45 }]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root:           { flex: 1, backgroundColor: C.bg },
  header:         { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: 12, paddingHorizontal: 12, gap: 8 },
  headerCenter:   { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar:   { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:    { color: '#fff', fontSize: 14, fontWeight: '700' },
  onlineRow:      { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  onlineDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: '#69F0AE' },
  onlineText:     { color: 'rgba(255,255,255,0.75)', fontSize: 10 },
  imgTypeSheet:   { backgroundColor: C.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  imgTypeHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  imgTypeTitle:   { fontSize: 16, fontWeight: '700', color: C.text },
  imgTypeGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  imgTypeCard:    { width: '30%', backgroundColor: C.greenPale, borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  imgTypeEmoji:   { fontSize: 28, marginBottom: 6 },
  imgTypeLabel:   { fontSize: 11, fontWeight: '600', color: C.green, textAlign: 'center' },
  messageList:    { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8 },
  bubbleWrap:     { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10, gap: 8 },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapAI:   { justifyContent: 'flex-start' },
  aiAvatar:       { width: 30, height: 30, borderRadius: 15, backgroundColor: C.greenPale, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border, flexShrink: 0 },
  bubble:         { maxWidth: '78%', borderRadius: 18, padding: 12, elevation: 1 },
  bubbleUser:     { backgroundColor: C.userBubble, borderBottomRightRadius: 4 },
  bubbleAI:       { backgroundColor: C.aiBubble, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: C.border },
  bubbleText:     { fontSize: 14, lineHeight: 22 },
  bubbleMeta:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  bubbleTime:     { fontSize: 10 },
  msgImage:       { width: '100%', height: 160, borderRadius: 10, marginBottom: 8 },
  imgTypeBadge:   { backgroundColor: C.greenPale, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6, alignSelf: 'flex-start' },
  imgTypeBadgeText: { fontSize: 10, color: C.green, fontWeight: '700' },
  typingWrap:     { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  typingBubble:   { flexDirection: 'row', gap: 4, backgroundColor: C.aiBubble, borderRadius: 18, borderBottomLeftRadius: 4, padding: 14, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  typingDot:      { width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.textMuted },
  quickScroll:    { maxHeight: 44, borderTopWidth: 1, borderTopColor: C.border },
  quickRow:       { paddingHorizontal: 10, paddingVertical: 6, gap: 8, alignItems: 'center' },
  quickChip:      { backgroundColor: C.greenPale, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: C.border, maxWidth: 210 },
  quickChipText:  { fontSize: 12, color: C.green, fontWeight: '600' },
  inputRow:       { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.card, gap: 8 },
  iconBtn:        { width: 40, height: 40, borderRadius: 20, backgroundColor: C.greenPale, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  input:          { flex: 1, backgroundColor: C.bg, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: C.text, maxHeight: 100, borderWidth: 1, borderColor: C.border },
  sendBtn:        { width: 42, height: 42, borderRadius: 21, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', elevation: 2 },
});
