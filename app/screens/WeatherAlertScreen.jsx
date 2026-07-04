// app/screens/WeatherAlertScreen.jsx — Day 8 FINAL
// Notifications removed (not supported in Expo Go SDK 53)
// Uses in-app alerts only + Shake voice navigation

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Platform, Animated, Alert, Vibration,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { Accelerometer } from 'expo-sensors';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { WORKER_BASE_URL } from '../../utils/apiConfig';

const C = {
  green: '#1B5E20', greenLight: '#388E3C', greenPale: '#E8F5E9',
  amber: '#E65100', amberLight: '#FFF3E0',
  blue: '#0277BD', blueLight: '#E1F5FE',
  red: '#C62828', redLight: '#FFEBEE',
  bg: '#F1F8E9', card: '#FFFFFF',
  text: '#212121', textMuted: '#558B2F', border: '#C8E6C9',
};

function AlertCard({ alert }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 200, friction: 20 }).start();
  }, []);

  return (
    <Animated.View style={[S.alertCard, { borderLeftColor: alert.color, transform: [{ scale: scaleAnim }] }]}>
      <View style={S.alertTop}>
        <Text style={S.alertIcon}>{alert.icon}</Text>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[S.alertTitle, { color: alert.color }]}>{alert.title}</Text>
          <Text style={S.alertTime}>{alert.time}</Text>
        </View>
        <View style={[S.alertBadge, { backgroundColor: alert.color + '22' }]}>
          <Text style={[S.alertBadgeText, { color: alert.color }]}>{alert.severity}</Text>
        </View>
      </View>
      <Text style={S.alertMsg}>{alert.message}</Text>
      {alert.tip && (
        <View style={S.alertTip}>
          <Ionicons name="bulb-outline" size={14} color={C.green} />
          <Text style={S.alertTipText}>{alert.tip}</Text>
        </View>
      )}
    </Animated.View>
  );
}

export default function WeatherAlertScreen() {
  const router = useRouter();
  const [lang, setLang]                   = useState('EN');
  const [weather, setWeather]             = useState(null);
  const [forecast, setForecast]           = useState([]);
  const [alerts, setAlerts]               = useState([]);
  const [locationName, setLocationName]   = useState('');
  const [loading, setLoading]             = useState(true);
  const [alertSettings, setAlertSettings] = useState({
    rain: true, highTemp: true, highHumidity: true, strongWind: true,
  });
  const [isListening, setIsListening]     = useState(false);
  const langRef   = useRef('EN');
  const lastShake = useRef(0);
  const shakeActive = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { langRef.current = lang; }, [lang]);

  // Pulse animation
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0,  duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  // Shake detection
  useEffect(() => {
    let shakeCount = 0;
    let shakeTimer = null;
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x*x + y*y + z*z);
      const now = Date.now();
      if (mag > 2.5 && now - lastShake.current > 500) {
        lastShake.current = now;
        shakeCount++;
        clearTimeout(shakeTimer);
        shakeTimer = setTimeout(() => { shakeCount = 0; }, 1500);
        if (shakeCount >= 3 && !shakeActive.current) {
          shakeCount = 0;
          activateVoiceNav();
        }
      }
    });
    Accelerometer.setUpdateInterval(100);
    return () => sub.remove();
  }, []);

  useEffect(() => { fetchWeatherData(); }, []);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address) setLocationName(`${address.city || address.district || ''}, ${address.region || ''}`);

      const [wRes, fRes] = await Promise.all([
        fetch(`${WORKER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}`),
        fetch(`${WORKER_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&cnt=6`),
      ]);
      const wData = await wRes.json();
      const fData = await fRes.json();

      if (wData.cod === 200) {
        const w = {
          temp:        Math.round(wData.main.temp),
          humidity:    wData.main.humidity,
          windSpeed:   Math.round(wData.wind.speed * 3.6),
          main:        wData.weather[0].main,
          description: wData.weather[0].description,
          feelsLike:   Math.round(wData.main.feels_like),
        };
        setWeather(w);
        generateAlerts(w, langRef.current);
        if (fData.list) {
          setForecast(fData.list.slice(0, 6).map(item => ({
            time: new Date(item.dt * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            temp: Math.round(item.main.temp),
            icon: item.weather[0].main,
            rain: item.pop ? Math.round(item.pop * 100) : 0,
          })));
        }
      }
    } catch (e) { console.log('Weather error:', e); }
    finally { setLoading(false); }
  };

  const generateAlerts = (w, l) => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const newAlerts = [];

    if (w.temp >= 38 && alertSettings.highTemp) {
      newAlerts.push({
        id: 'heat', icon: '🌡️', color: C.red,
        title:    l === 'TE' ? 'అధిక ఉష్ణోగ్రత హెచ్చరిక' : l === 'HI' ? 'अत्यधिक गर्मी चेतावनी' : 'Extreme Heat Warning',
        message:  l === 'TE' ? `ఉష్ణోగ్రత ${w.temp}°C కి చేరింది. పంటలకు నీరు పెట్టండి.` : l === 'HI' ? `तापमान ${w.temp}°C तक पहुंचा। फसलों को पानी दें।` : `Temperature ${w.temp}°C. Water your crops immediately.`,
        tip:      l === 'TE' ? 'పొద్దున 6-8 గంటల మధ్య నీరు పెట్టండి' : l === 'HI' ? 'सुबह 6-8 बजे पानी दें' : 'Water between 6-8 AM to reduce evaporation',
        severity: l === 'TE' ? 'అత్యవసరం' : l === 'HI' ? 'जरूरी' : 'Critical', time: now,
      });
    }

    if (w.humidity >= 85 && alertSettings.highHumidity) {
      newAlerts.push({
        id: 'humidity', icon: '💧', color: C.blue,
        title:    l === 'TE' ? 'అధిక తేమ హెచ్చరిక' : l === 'HI' ? 'अधिक नमी चेतावनी' : 'High Humidity Alert',
        message:  l === 'TE' ? `తేమ ${w.humidity}%. శిలీంధ్ర వ్యాధుల ప్రమాదం.` : l === 'HI' ? `नमी ${w.humidity}%। फफूंद रोगों का खतरा।` : `Humidity ${w.humidity}%. Risk of fungal diseases.`,
        tip:      l === 'TE' ? 'పంటలపై శిలీంధ్ర నాశని పిచికారీ చేయండి' : l === 'HI' ? 'फफूंदनाशक का छिड़काव करें' : 'Apply fungicide spray as precaution',
        severity: l === 'TE' ? 'హెచ్చరిక' : l === 'HI' ? 'चेतावनी' : 'Warning', time: now,
      });
    }

    if (['Rain','Drizzle','Thunderstorm'].includes(w.main) && alertSettings.rain) {
      newAlerts.push({
        id: 'rain', icon: '🌧️', color: C.blue,
        title:    l === 'TE' ? 'వర్షం హెచ్చరిక' : l === 'HI' ? 'बारिश चेतावनी' : 'Rain Alert',
        message:  l === 'TE' ? `ప్రస్తుతం ${w.description}. నీటి పారుదల మానుకోండి.` : l === 'HI' ? `अभी ${w.description}। सिंचाई न करें।` : `Currently ${w.description}. Avoid irrigation.`,
        tip:      l === 'TE' ? 'కోత పనులు వాయిదా వేయండి' : l === 'HI' ? 'कटाई का काम टालें' : 'Postpone harvesting until rain stops',
        severity: l === 'TE' ? 'సమాచారం' : l === 'HI' ? 'जानकारी' : 'Info', time: now,
      });
    }

    if (w.windSpeed >= 40 && alertSettings.strongWind) {
      newAlerts.push({
        id: 'wind', icon: '💨', color: C.amber,
        title:    l === 'TE' ? 'బలమైన గాలి హెచ్చరిక' : l === 'HI' ? 'तेज हवा चेतावनी' : 'Strong Wind Warning',
        message:  l === 'TE' ? `గాలి వేగం ${w.windSpeed} km/h. పంటలకు నష్టం కలుగవచ్చు.` : l === 'HI' ? `हवा ${w.windSpeed} km/h। फसलों को नुकसान हो सकता है।` : `Wind ${w.windSpeed} km/h. Crops may get damaged.`,
        tip:      l === 'TE' ? 'పొడవైన పంటలకు మద్దతు ఇవ్వండి' : l === 'HI' ? 'लंबी फसलों को सहारा दें' : 'Support tall crops like maize with stakes',
        severity: l === 'TE' ? 'హెచ్చరిక' : l === 'HI' ? 'चेतावनी' : 'Warning', time: now,
      });
    }

    if (newAlerts.length === 0) {
      newAlerts.push({
        id: 'safe', icon: '✅', color: C.green,
        title:    l === 'TE' ? 'వాతావరణం అనుకూలంగా ఉంది' : l === 'HI' ? 'मौसम अनुकूल है' : 'Weather is Good',
        message:  l === 'TE' ? 'ప్రస్తుతం వ్యవసాయానికి మంచి వాతావరణం ఉంది.' : l === 'HI' ? 'अभी खेती के लिए अच्छा मौसम है।' : 'Current weather is suitable for all farming activities.',
        tip:      l === 'TE' ? 'ఈ అనుకూల వాతావరణాన్ని సద్వినియోగం చేసుకోండి' : l === 'HI' ? 'इस अनुकूल मौसम का फायदा उठाएं' : 'Make the most of these good conditions',
        severity: l === 'TE' ? 'సురక్షితం' : l === 'HI' ? 'सुरक्षित' : 'Safe', time: now,
      });
    }
    setAlerts(newAlerts);
  };

  const activateVoiceNav = () => {
    const l = langRef.current;
    setIsListening(true);
    Vibration.vibrate(200);
    const prompt = l === 'TE' ? 'ఏ స్క్రీన్‌కు వెళ్ళాలి?' : l === 'HI' ? 'किस स्क्रीन पर जाएं?' : 'Where would you like to go?';
    Speech.speak(prompt, { language: l === 'TE' ? 'te-IN' : l === 'HI' ? 'hi-IN' : 'en-IN' });

    setTimeout(() => {
      setIsListening(false);
      shakeActive.current = false;
      Alert.alert(
        l === 'TE' ? '🎤 వాయిస్ నావిగేషన్' : l === 'HI' ? '🎤 वॉयस नेविगेशन' : '🎤 Voice Navigation',
        l === 'TE' ? 'ఎక్కడికి వెళ్ళాలి?' : l === 'HI' ? 'कहाँ जाएं?' : 'Where to go?',
        [
          { text: l === 'TE' ? '🏠 హోమ్'              : l === 'HI' ? '🏠 होम'         : '🏠 Home',              onPress: () => { Speech.speak(l==='TE'?'హోమ్ తెరుస్తున్నాం':l==='HI'?'होम खोल रहे हैं':'Opening Home', {language:l==='TE'?'te-IN':l==='HI'?'hi-IN':'en-IN'}); setTimeout(()=>router.push('/screens/HomeScreen'),600); } },
          { text: l === 'TE' ? '🔬 వ్యాధి గుర్తింపు'  : l === 'HI' ? '🔬 रोग पहचान'  : '🔬 Disease',           onPress: () => { setTimeout(()=>router.push('/screens/CropDiseaseScreen'),600); } },
          { text: l === 'TE' ? '📈 మార్కెట్ ధరలు'     : l === 'HI' ? '📈 बाजार भाव'  : '📈 Market',            onPress: () => { setTimeout(()=>router.push('/screens/MarketPricesScreen'),600); } },
          { text: l === 'TE' ? '🌱 పంట సిఫారసులు'     : l === 'HI' ? '🌱 फसल सुझाव' : '🌱 Crops',             onPress: () => { setTimeout(()=>router.push('/screens/CropRecommendationScreen'),600); } },
          { text: l === 'TE' ? '❌ రద్దు'              : l === 'HI' ? '❌ रद्द करें'  : '❌ Cancel',             style: 'cancel', onPress: () => { shakeActive.current = false; } },
        ]
      );
    }, 1500);
  };

  const handleLangChange = (newLang) => {
    setLang(newLang);
    langRef.current = newLang;
    if (weather) generateAlerts(weather, newLang);
  };

  const getWeatherEmoji = (main) => ({ Clear:'☀️', Clouds:'☁️', Rain:'🌧️', Drizzle:'🌦️', Thunderstorm:'⛈️', Mist:'🌫️' }[main] || '🌤️');

  const alertLabels = {
    rain:         { EN: '🌧️ Rain Alerts',    TE: '🌧️ వర్షం హెచ్చరికలు',  HI: '🌧️ बारिश अलर्ट'   },
    highTemp:     { EN: '🌡️ Heat Warnings',  TE: '🌡️ వేడి హెచ్చరికలు',   HI: '🌡️ गर्मी चेतावनी' },
    highHumidity: { EN: '💧 Humidity Alerts', TE: '💧 తేమ హెచ్చరికలు',     HI: '💧 नमी अलर्ट'      },
    strongWind:   { EN: '💨 Wind Warnings',  TE: '💨 గాలి హెచ్చరికలు',    HI: '💨 हवा चेतावनी'    },
  };

  return (
    <SafeAreaView style={S.root}>
      <LinearGradient colors={[C.green, C.greenLight]} style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle}>{lang === 'TE' ? 'వాతావరణ హెచ్చరికలు' : lang === 'HI' ? 'मौसम चेतावनी' : 'Weather Alerts'}</Text>
          <Text style={S.headerSub}>{lang === 'TE' ? 'రియల్-టైమ్ వ్యవసాయ హెచ్చరికలు' : lang === 'HI' ? 'रियल-टाइम कृषि अलर्ट' : 'Real-time farm alerts'}</Text>
        </View>
        <LanguageSwitcher lang={lang} setLang={handleLangChange} />
      </LinearGradient>

      {/* Shake hint */}
      <TouchableOpacity onLongPress={activateVoiceNav} delayLongPress={800} activeOpacity={0.9}>
      <Animated.View style={[S.shakeBar, isListening && { backgroundColor: C.green }, { transform: [{ scale: isListening ? pulseAnim : 1 }] }]}>
        <MaterialCommunityIcons name="vibrate" size={16} color={isListening ? '#fff' : C.green} />
        <Text style={[S.shakeText, { color: isListening ? '#fff' : C.green }]}>
          {isListening
            ? (lang === 'TE' ? '🎤 వింటున్నాం...' : lang === 'HI' ? '🎤 सुन रहे हैं...' : '🎤 Listening...')
            : (lang === 'TE' ? 'ఫోన్ కదిలించండి → వాయిస్ నావిగేషన్' : lang === 'HI' ? 'फोन हिलाएं → वॉयस नेविगेशन' : 'Shake phone → Voice Navigation')}
        </Text>
      </Animated.View>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>

        {/* Current weather */}
        {weather && (
          <View style={S.weatherCard}>
            <View style={S.weatherRow}>
              <View>
                <Text style={{ fontSize: 40, marginBottom: 4 }}>{getWeatherEmoji(weather.main)}</Text>
                <Text style={S.weatherTemp}>{weather.temp}°C</Text>
                <Text style={S.weatherDesc}>{weather.description}</Text>
                <Text style={S.weatherLoc}>📍 {locationName}</Text>
              </View>
              <View style={{ justifyContent: 'center', gap: 8 }}>
                {[
                  { icon: '💧', label: lang==='TE'?'తేమ':lang==='HI'?'नमी':'Humidity', val: `${weather.humidity}%` },
                  { icon: '💨', label: lang==='TE'?'గాలి':lang==='HI'?'हवा':'Wind',    val: `${weather.windSpeed} km/h` },
                  { icon: '🌡️', label: lang==='TE'?'అనుభవం':lang==='HI'?'महसूस':'Feels', val: `${weather.feelsLike}°C` },
                ].map((s, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 14 }}>{s.icon}</Text>
                    <Text style={{ fontSize: 12, color: '#C8E6C9' }}>{s.label}: </Text>
                    <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>{s.val}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Hourly forecast */}
        {forecast.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>{lang==='TE'?'⏱️ గంటల అంచనా':lang==='HI'?'⏱️ घंटे का पूर्वानुमान':'⏱️ Hourly Forecast'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 10, paddingBottom: 4 }}>
                {forecast.map((f, i) => (
                  <View key={i} style={S.forecastCard}>
                    <Text style={S.forecastTime}>{f.time}</Text>
                    <Text style={{ fontSize: 22 }}>{getWeatherEmoji(f.icon)}</Text>
                    <Text style={S.forecastTemp}>{f.temp}°C</Text>
                    {f.rain > 0 && <Text style={{ fontSize: 10, color: C.blue }}>🌧️ {f.rain}%</Text>}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Active alerts */}
        <View style={S.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={S.sectionTitle}>{lang==='TE'?'⚠️ క్రియాశీల హెచ్చరికలు':lang==='HI'?'⚠️ सक्रिय चेतावनियां':'⚠️ Active Alerts'}</Text>
            <TouchableOpacity onPress={fetchWeatherData}>
              <Ionicons name="refresh-outline" size={18} color={C.green} />
            </TouchableOpacity>
          </View>
          {alerts.map(alert => <AlertCard key={alert.id} alert={alert} />)}
        </View>

        {/* Settings */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>{lang==='TE'?'⚙️ హెచ్చరిక సెట్టింగులు':lang==='HI'?'⚙️ अलर्ट सेटिंग्स':'⚙️ Alert Settings'}</Text>
          <View style={S.settingsCard}>
            {Object.entries(alertSettings).map(([key, val]) => (
              <View key={key} style={S.settingRow}>
                <Text style={S.settingLabel}>{alertLabels[key][lang]}</Text>
                <Switch
                  value={val}
                  onValueChange={() => setAlertSettings(p => ({ ...p, [key]: !p[key] }))}
                  trackColor={{ false: C.border, true: C.greenLight }}
                  thumbColor={val ? C.green : '#fff'}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Voice navigation guide */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>{lang==='TE'?'🎤 వాయిస్ నావిగేషన్':lang==='HI'?'🎤 वॉयस नेविगेशन':'🎤 Voice Navigation'}</Text>
          <View style={S.voiceCard}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.green, marginBottom: 6 }}>
              {lang==='TE'?'ఫోన్ కదిలించండి':lang==='HI'?'फोन हिलाएं':'Shake your phone'}
            </Text>
            <Text style={{ fontSize: 13, color: C.textMuted, lineHeight: 20, marginBottom: 14 }}>
              {lang==='TE'?'ఫోన్ కదిలించినప్పుడు వాయిస్ నావిగేషన్ మొదలవుతుంది. మీరు వెళ్ళాలనుకుంటున్న స్క్రీన్ ఎంచుకోండి.':lang==='HI'?'फोन हिलाने पर वॉयस नेविगेशन शुरू होता है। जिस स्क्रीन पर जाना है उसे चुनें।':'Shake phone to activate voice navigation. Select the screen you want to visit.'}
            </Text>
            <TouchableOpacity style={S.testBtn} onPress={activateVoiceNav}>
              <MaterialCommunityIcons name="vibrate" size={18} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
                {lang==='TE'?'వాయిస్ నావిగేషన్ పరీక్షించండి':lang==='HI'?'वॉयस नेविगेशन टेस्ट करें':'Test Voice Navigation'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root:          { flex: 1, backgroundColor: C.bg },
  header:        { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: 14, paddingHorizontal: 14 },
  headerTitle:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  headerSub:     { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 1 },
  shakeBar:      { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: C.greenPale, borderBottomWidth: 1, borderBottomColor: C.border },
  shakeText:     { fontSize: 12, fontWeight: '600' },
  scroll:        { padding: 14 },
  weatherCard:   { backgroundColor: C.green, borderRadius: 18, padding: 18, marginBottom: 16, elevation: 4, shadowColor: C.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  weatherRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  weatherTemp:   { fontSize: 42, fontWeight: '800', color: '#fff' },
  weatherDesc:   { fontSize: 13, color: '#A5D6A7', textTransform: 'capitalize' },
  weatherLoc:    { fontSize: 11, color: '#81C784', marginTop: 4 },
  section:       { marginBottom: 20 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: C.green, marginBottom: 10 },
  forecastCard:  { backgroundColor: C.card, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border, minWidth: 70 },
  forecastTime:  { fontSize: 10, color: C.textMuted, fontWeight: '600', marginBottom: 6 },
  forecastTemp:  { fontSize: 13, fontWeight: '700', color: C.text, marginTop: 4 },
  alertCard:     { backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  alertTop:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  alertIcon:     { fontSize: 24 },
  alertTitle:    { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  alertTime:     { fontSize: 11, color: C.textMuted },
  alertBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  alertBadgeText:{ fontSize: 10, fontWeight: '700' },
  alertMsg:      { fontSize: 13, color: C.text, lineHeight: 20, marginBottom: 8 },
  alertTip:      { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: C.greenPale, borderRadius: 8, padding: 8 },
  alertTipText:  { fontSize: 12, color: C.green, flex: 1, lineHeight: 18 },
  settingsCard:  { backgroundColor: C.card, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: C.border },
  settingRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 0.5, borderBottomColor: C.border },
  settingLabel:  { fontSize: 13, color: C.text, fontWeight: '600' },
  voiceCard:     { backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
  testBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.green, borderRadius: 12, padding: 12 },
});
