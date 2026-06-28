// app/screens/WeatherAlertScreen.jsx — Day 8
// Weather Alerts: in-app + background push notifications
// Shake to activate voice navigation (EN/TE/HI)

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, Platform, Animated, Alert, Vibration,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { Accelerometer } from 'expo-sensors';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';
const WEATHER_KEY = '70fab3ca43ede65c216f90d25b67e765';
const FORECAST_API = 'https://api.openweathermap.org/data/2.5/forecast';

const C = {
  green: '#1B5E20', greenLight: '#388E3C', greenPale: '#E8F5E9',
  amber: '#E65100', amberLight: '#FFF3E0',
  blue: '#0277BD', blueLight: '#E1F5FE',
  red: '#C62828', redLight: '#FFEBEE',
  purple: '#6A1B9A', purpleLight: '#F3E5F5',
  bg: '#F1F8E9', card: '#FFFFFF',
  text: '#212121', textMuted: '#558B2F', border: '#C8E6C9',
};

// ── Alert thresholds ──────────────────────────────────────────────────────────
const THRESHOLDS = {
  highTemp:     { value: 38, label: { EN: 'Extreme Heat',    TE: 'అధిక వేడి',    HI: 'अत्यधिक गर्मी'   }, icon: '🌡️', color: C.red    },
  lowTemp:      { value: 15, label: { EN: 'Cold Warning',    TE: 'చలి హెచ్చరిక', HI: 'ठंड चेतावनी'     }, icon: '❄️', color: C.blue   },
  highHumidity: { value: 85, label: { EN: 'High Humidity',   TE: 'అధిక తేమ',     HI: 'अधिक नमी'        }, icon: '💧', color: C.blue   },
  rain:         { value: 0,  label: { EN: 'Rain Alert',      TE: 'వర్షం హెచ్చరిక',HI: 'बारिश अलर्ट'    }, icon: '🌧️', color: C.blue   },
  strongWind:   { value: 40, label: { EN: 'Strong Wind',     TE: 'బలమైన గాలి',   HI: 'तेज हवा'         }, icon: '💨', color: C.amber  },
  humidity:     { value: 30, label: { EN: 'Low Humidity',    TE: 'తక్కువ తేమ',    HI: 'कम नमी'          }, icon: '🌵', color: C.amber  },
};

// ── Notification setup ────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ── Voice navigation commands ─────────────────────────────────────────────────
const VOICE_COMMANDS = {
  EN: {
    home:    ['home', 'go home', 'main screen', 'dashboard'],
    disease: ['disease', 'crop disease', 'disease detection', 'check disease'],
    market:  ['market', 'market prices', 'prices', 'mandi'],
    crops:   ['crops', 'crop recommendations', 'recommend crops', 'suggest crops'],
    weather: ['weather', 'weather alerts', 'alerts'],
  },
  TE: {
    home:    ['హోమ్', 'హోమ్ పేజీ', 'ముఖ పేజీ', 'డాష్‌బోర్డ్'],
    disease: ['వ్యాధి', 'పంట వ్యాధి', 'వ్యాధి గుర్తింపు'],
    market:  ['మార్కెట్', 'మండీ', 'ధరలు', 'మార్కెట్ ధరలు'],
    crops:   ['పంటలు', 'పంట సిఫారసులు', 'పంటలు సూచించు'],
    weather: ['వాతావరణం', 'హెచ్చరికలు', 'వాతావరణ హెచ్చరిక'],
  },
  HI: {
    home:    ['होम', 'होम पेज', 'मुख्य पृष्ठ', 'डैशबोर्ड'],
    disease: ['बीमारी', 'फसल रोग', 'रोग पहचान'],
    market:  ['मंडी', 'बाजार', 'भाव', 'बाजार भाव'],
    crops:   ['फसलें', 'फसल सुझाव', 'फसल सिफारिश'],
    weather: ['मौसम', 'अलर्ट', 'मौसम चेतावनी'],
  },
};

// ─── ALERT CARD ───────────────────────────────────────────────────────────────
function AlertCard({ alert, lang }) {
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

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function WeatherAlertScreen() {
  const router = useRouter();
  const [lang, setLang]                   = useState('EN');
  const [weather, setWeather]             = useState(null);
  const [forecast, setForecast]           = useState([]);
  const [alerts, setAlerts]               = useState([]);
  const [locationName, setLocationName]   = useState('');
  const [loading, setLoading]             = useState(true);
  const [notifEnabled, setNotifEnabled]   = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    rain: true, highTemp: true, highHumidity: true,
    strongWind: true, lowTemp: false, humidity: false,
  });
  const [isListening, setIsListening]     = useState(false);
  const [voiceHint, setVoiceHint]         = useState('');
  const langRef    = useRef('EN');
  const shakeRef   = useRef(false);
  const lastShake  = useRef(0);
  const pulseAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => { langRef.current = lang; }, [lang]);

  // ── Shake detection ─────────────────────────────────────────────────────────
  useEffect(() => {
    const SHAKE_THRESHOLD = 1.8;
    const SHAKE_COOLDOWN  = 3000;

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const total = Math.sqrt(x*x + y*y + z*z);
      const now   = Date.now();
      if (total > SHAKE_THRESHOLD && now - lastShake.current > SHAKE_COOLDOWN) {
        lastShake.current = now;
        if (!shakeRef.current) activateVoiceNav();
      }
    });
    Accelerometer.setUpdateInterval(200);
    return () => subscription.remove();
  }, []);

  // ── Pulse animation for listening ──────────────────────────────────────────
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  useEffect(() => {
    setupNotifications();
    fetchWeatherData();
  }, []);

  // ── Setup notifications ─────────────────────────────────────────────────────
  const setupNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setNotifEnabled(true);
      // Schedule background weather check every hour
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌾 AgriAI Weather Check',
          body: 'Checking weather conditions for your farm...',
          data: { type: 'weather_check' },
        },
        trigger: {
          seconds: 3600, // every hour
          repeats: true,
        },
      });
    }
  };

  // ── Fetch weather + forecast ────────────────────────────────────────────────
  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLoading(false); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;

      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address) setLocationName(`${address.city || address.district || ''}, ${address.region || ''}`);

      // Current weather
      const wRes  = await fetch(`${WEATHER_API}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_KEY}&units=metric`);
      const wData = await wRes.json();

      // 5-day forecast
      const fRes  = await fetch(`${FORECAST_API}?lat=${latitude}&lon=${longitude}&appid=${WEATHER_KEY}&units=metric&cnt=8`);
      const fData = await fRes.json();

      if (wData.cod === 200) {
        const w = {
          temp:        Math.round(wData.main.temp),
          humidity:    wData.main.humidity,
          windSpeed:   Math.round(wData.wind.speed * 3.6),
          main:        wData.weather[0].main,
          description: wData.weather[0].description,
          feelsLike:   Math.round(wData.main.feels_like),
          pressure:    wData.main.pressure,
        };
        setWeather(w);
        generateAlerts(w, langRef.current);

        // Store forecast
        if (fData.list) {
          setForecast(fData.list.slice(0, 6).map(item => ({
            time:  new Date(item.dt * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            temp:  Math.round(item.main.temp),
            icon:  item.weather[0].main,
            rain:  item.pop ? Math.round(item.pop * 100) : 0,
          })));
        }
      }
    } catch (e) { console.log('Weather error:', e); }
    finally { setLoading(false); }
  };

  // ── Generate alerts from weather data ──────────────────────────────────────
  const generateAlerts = async (w, l) => {
    const newAlerts = [];
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (w.temp >= THRESHOLDS.highTemp.value && alertSettings.highTemp) {
      const alert = {
        id: 'highTemp', icon: '🌡️', color: C.red,
        title:    l === 'TE' ? 'అధిక ఉష్ణోగ్రత హెచ్చరిక' : l === 'HI' ? 'अत्यधिक गर्मी चेतावनी' : 'Extreme Heat Warning',
        message:  l === 'TE' ? `ఉష్ణోగ్రత ${w.temp}°C కి చేరింది. పంటలకు నీరు పెట్టండి.` : l === 'HI' ? `तापमान ${w.temp}°C तक पहुंचा। फसलों को पानी दें।` : `Temperature reached ${w.temp}°C. Water your crops immediately.`,
        tip:      l === 'TE' ? 'పొద్దున 6-8 గంటల మధ్య నీరు పెట్టండి' : l === 'HI' ? 'सुबह 6-8 बजे के बीच पानी दें' : 'Water between 6-8 AM to reduce evaporation',
        severity: l === 'TE' ? 'అత్యవసరం' : l === 'HI' ? 'जरूरी' : 'Critical',
        time: now,
      };
      newAlerts.push(alert);
      sendPushNotification(alert.title, alert.message);
    }

    if (w.humidity >= THRESHOLDS.highHumidity.value && alertSettings.highHumidity) {
      const alert = {
        id: 'highHumidity', icon: '💧', color: C.blue,
        title:    l === 'TE' ? 'అధిక తేమ హెచ్చరిక' : l === 'HI' ? 'अधिक नमी चेतावनी' : 'High Humidity Alert',
        message:  l === 'TE' ? `తేమ ${w.humidity}% ఉంది. శిలీంధ్ర వ్యాధుల ప్రమాదం ఉంది.` : l === 'HI' ? `नमी ${w.humidity}% है। फफूंद रोगों का खतरा है।` : `Humidity at ${w.humidity}%. High risk of fungal diseases.`,
        tip:      l === 'TE' ? 'పంటలపై శిలీంధ్ర నాశని పిచికారీ చేయండి' : l === 'HI' ? 'फसलों पर फफूंदनाशक का छिड़काव करें' : 'Apply fungicide spray on crops as precaution',
        severity: l === 'TE' ? 'హెచ్చరిక' : l === 'HI' ? 'चेतावनी' : 'Warning',
        time: now,
      };
      newAlerts.push(alert);
      sendPushNotification(alert.title, alert.message);
    }

    if ((w.main === 'Rain' || w.main === 'Drizzle' || w.main === 'Thunderstorm') && alertSettings.rain) {
      const alert = {
        id: 'rain', icon: '🌧️', color: C.blue,
        title:    l === 'TE' ? 'వర్షం హెచ్చరిక' : l === 'HI' ? 'बारिश की चेतावनी' : 'Rain Alert',
        message:  l === 'TE' ? `ప్రస్తుతం ${w.description} ఉంది. నీటి పారుదల మానుకోండి.` : l === 'HI' ? `अभी ${w.description} है। सिंचाई न करें।` : `Currently ${w.description}. Avoid irrigation and field work.`,
        tip:      l === 'TE' ? 'కోత పనులు వాయిదా వేయండి' : l === 'HI' ? 'कटाई का काम टालें' : 'Postpone harvesting activities until rain stops',
        severity: l === 'TE' ? 'సమాచారం' : l === 'HI' ? 'जानकारी' : 'Info',
        time: now,
      };
      newAlerts.push(alert);
      sendPushNotification(alert.title, alert.message);
    }

    if (w.windSpeed >= THRESHOLDS.strongWind.value && alertSettings.strongWind) {
      const alert = {
        id: 'wind', icon: '💨', color: C.amber,
        title:    l === 'TE' ? 'బలమైన గాలి హెచ్చరిక' : l === 'HI' ? 'तेज हवा चेतावनी' : 'Strong Wind Warning',
        message:  l === 'TE' ? `గాలి వేగం ${w.windSpeed} km/h. పంటలకు నష్టం కలుగవచ్చు.` : l === 'HI' ? `हवा की गति ${w.windSpeed} km/h। फसलों को नुकसान हो सकता है।` : `Wind speed ${w.windSpeed} km/h. Crops may get damaged.`,
        tip:      l === 'TE' ? 'పొడవైన పంటలకు మద్దతు ఇవ్వండి' : l === 'HI' ? 'लंबी फसलों को सहारा दें' : 'Provide support stakes to tall crops like maize',
        severity: l === 'TE' ? 'హెచ్చరిక' : l === 'HI' ? 'चेतावनी' : 'Warning',
        time: now,
      };
      newAlerts.push(alert);
    }

    if (newAlerts.length === 0) {
      newAlerts.push({
        id: 'safe', icon: '✅', color: C.green,
        title:    l === 'TE' ? 'వాతావరణం అనుకూలంగా ఉంది' : l === 'HI' ? 'मौसम अनुकूल है' : 'Weather Conditions are Good',
        message:  l === 'TE' ? 'ప్రస్తుతం వ్యవసాయానికి మంచి వాతావరణం ఉంది.' : l === 'HI' ? 'अभी खेती के लिए अच्छा मौसम है।' : 'Current weather is suitable for all farming activities.',
        tip:      l === 'TE' ? 'ఈ అనుకూల వాతావరణాన్ని వినియోగించుకోండి' : l === 'HI' ? 'इस अनुकूल मौसम का फायदा उठाएं' : 'Make the most of these good conditions',
        severity: l === 'TE' ? 'సురక్షితం' : l === 'HI' ? 'सुरक्षित' : 'Safe',
        time: now,
      });
    }

    setAlerts(newAlerts);
  };

  // ── Push notification ───────────────────────────────────────────────────────
  const sendPushNotification = async (title, body) => {
    if (!notifEnabled) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true, priority: Notifications.AndroidNotificationPriority.HIGH },
      trigger: null, // immediately
    });
  };

  // ── Voice navigation ────────────────────────────────────────────────────────
  const activateVoiceNav = () => {
    const l = langRef.current;
    shakeRef.current = true;
    setIsListening(true);
    Vibration.vibrate(200);

    const prompt =
      l === 'TE' ? 'మీరు ఏ స్క్రీన్‌కు వెళ్ళాలనుకుంటున్నారు?' :
      l === 'HI' ? 'आप किस स्क्रीन पर जाना चाहते हैं?' :
      'Where would you like to go?';

    // Speak the prompt
    Speech.speak(prompt, {
      language: l === 'TE' ? 'te-IN' : l === 'HI' ? 'hi-IN' : 'en-IN',
      onDone: () => {
        // Show picker after speaking
        showVoiceNavigationPicker(l);
      },
    });
  };

  const showVoiceNavigationPicker = (l) => {
    const options = [
      { label: l === 'TE' ? '🏠 హోమ్'              : l === 'HI' ? '🏠 होम'           : '🏠 Home',              route: '/screens/HomeScreen'               },
      { label: l === 'TE' ? '🔬 వ్యాధి గుర్తింపు'  : l === 'HI' ? '🔬 रोग पहचान'    : '🔬 Disease Detection', route: '/screens/CropDiseaseScreen'        },
      { label: l === 'TE' ? '📈 మార్కెట్ ధరలు'     : l === 'HI' ? '📈 बाजार भाव'    : '📈 Market Prices',     route: '/screens/MarketPricesScreen'       },
      { label: l === 'TE' ? '🌱 పంట సిఫారసులు'     : l === 'HI' ? '🌱 फसल सुझाव'   : '🌱 Crop Recommendations', route: '/screens/CropRecommendationScreen' },
      { label: l === 'TE' ? '❌ రద్దు'              : l === 'HI' ? '❌ रद्द करें'    : '❌ Cancel',             route: null                                },
    ];

    setIsListening(false);
    shakeRef.current = false;

    Alert.alert(
      l === 'TE' ? '🎤 వాయిస్ నావిగేషన్' : l === 'HI' ? '🎤 वॉयस नेविगेशन' : '🎤 Voice Navigation',
      l === 'TE' ? 'ఏ స్క్రీన్‌కు వెళ్ళాలి?' : l === 'HI' ? 'किस स्क्रीन पर जाएं?' : 'Where do you want to go?',
      options.map(o => ({
        text: o.label,
        onPress: () => {
          if (o.route) {
            const confirmMsg =
              l === 'TE' ? `${o.label} కి వెళ్తున్నాం` :
              l === 'HI' ? `${o.label} पर जा रहे हैं` :
              `Navigating to ${o.label}`;
            Speech.speak(confirmMsg, {
              language: l === 'TE' ? 'te-IN' : l === 'HI' ? 'hi-IN' : 'en-IN',
            });
            setTimeout(() => router.push(o.route), 800);
          }
        },
      }))
    );
  };

  const handleLangChange = (newLang) => {
    setLang(newLang);
    langRef.current = newLang;
    if (weather) generateAlerts(weather, newLang);
  };

  const getWeatherEmoji = (main) => ({
    Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
    Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️',
  }[main] || '🌤️');

  const toggleSetting = (key) => {
    setAlertSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const alertLabels = {
    rain:         { EN: '🌧️ Rain Alerts',       TE: '🌧️ వర్షం హెచ్చరికలు',    HI: '🌧️ बारिश अलर्ट'    },
    highTemp:     { EN: '🌡️ Heat Warnings',      TE: '🌡️ వేడి హెచ్చరికలు',     HI: '🌡️ गर्मी चेतावनी'  },
    highHumidity: { EN: '💧 Humidity Alerts',    TE: '💧 తేమ హెచ్చరికలు',       HI: '💧 नमी अलर्ट'       },
    strongWind:   { EN: '💨 Wind Warnings',      TE: '💨 గాలి హెచ్చరికలు',      HI: '💨 हवा चेतावनी'     },
    lowTemp:      { EN: '❄️ Cold Warnings',      TE: '❄️ చలి హెచ్చరికలు',      HI: '❄️ ठंड चेतावनी'    },
    humidity:     { EN: '🌵 Low Humidity',       TE: '🌵 తక్కువ తేమ',           HI: '🌵 कम नमी'          },
  };

  return (
    <SafeAreaView style={S.root}>
      <LinearGradient colors={[C.green, C.greenLight]} style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle}>
            {lang === 'TE' ? 'వాతావరణ హెచ్చరికలు' : lang === 'HI' ? 'मौसम चेतावनी' : 'Weather Alerts'}
          </Text>
          <Text style={S.headerSub}>
            {lang === 'TE' ? 'రియల్-టైమ్ వ్యవసాయ హెచ్చరికలు' : lang === 'HI' ? 'रियल-टाइम कृषि अलर्ट' : 'Real-time farm alerts'}
          </Text>
        </View>
        <LanguageSwitcher lang={lang} setLang={handleLangChange} />
      </LinearGradient>

      {/* Shake hint bar */}
      <Animated.View style={[S.shakeBar, { transform: [{ scale: isListening ? pulseAnim : 1 }] }]}>
        <MaterialCommunityIcons name="vibrate" size={16} color={isListening ? '#fff' : C.green} />
        <Text style={[S.shakeText, { color: isListening ? '#fff' : C.green }]}>
          {isListening
            ? (lang === 'TE' ? '🎤 వింటున్నాం...' : lang === 'HI' ? '🎤 सुन रहे हैं...' : '🎤 Listening...')
            : (lang === 'TE' ? 'ఫోన్ కదిలించండి → వాయిస్ నావిగేషన్' : lang === 'HI' ? 'फोन हिलाएं → वॉयस नेविगेशन' : 'Shake phone → Voice Navigation')}
        </Text>
      </Animated.View>

      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>

        {/* Current weather card */}
        {weather && (
          <View style={S.weatherCard}>
            <View style={S.weatherRow}>
              <View>
                <Text style={S.weatherEmoji}>{getWeatherEmoji(weather.main)}</Text>
                <Text style={S.weatherTemp}>{weather.temp}°C</Text>
                <Text style={S.weatherDesc}>{weather.description}</Text>
                <Text style={S.weatherLoc}>📍 {locationName}</Text>
              </View>
              <View style={S.weatherStats}>
                {[
                  { icon: '💧', label: lang === 'TE' ? 'తేమ' : lang === 'HI' ? 'नमी' : 'Humidity',  val: `${weather.humidity}%` },
                  { icon: '💨', label: lang === 'TE' ? 'గాలి' : lang === 'HI' ? 'हवा' : 'Wind',      val: `${weather.windSpeed} km/h` },
                  { icon: '🌡️', label: lang === 'TE' ? 'అనుభవం' : lang === 'HI' ? 'महसूस' : 'Feels', val: `${weather.feelsLike}°C` },
                ].map((s, i) => (
                  <View key={i} style={S.statRow}>
                    <Text style={S.statIcon}>{s.icon}</Text>
                    <Text style={S.statLabel}>{s.label}: </Text>
                    <Text style={S.statVal}>{s.val}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Hourly forecast */}
        {forecast.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>
              {lang === 'TE' ? '⏱️ గంటల అంచనా' : lang === 'HI' ? '⏱️ घंटे का पूर्वानुमान' : '⏱️ Hourly Forecast'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 10, paddingBottom: 4 }}>
                {forecast.map((f, i) => (
                  <View key={i} style={S.forecastCard}>
                    <Text style={S.forecastTime}>{f.time}</Text>
                    <Text style={{ fontSize: 22 }}>{getWeatherEmoji(f.icon)}</Text>
                    <Text style={S.forecastTemp}>{f.temp}°C</Text>
                    {f.rain > 0 && <Text style={S.forecastRain}>🌧️ {f.rain}%</Text>}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Active alerts */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>
              {lang === 'TE' ? '⚠️ క్రియాశీల హెచ్చరికలు' : lang === 'HI' ? '⚠️ सक्रिय चेतावनियां' : '⚠️ Active Alerts'}
            </Text>
            <TouchableOpacity onPress={() => { setAlerts([]); fetchWeatherData(); }} style={S.refreshBtn}>
              <Ionicons name="refresh-outline" size={18} color={C.green} />
            </TouchableOpacity>
          </View>
          {alerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} lang={lang} />
          ))}
        </View>

        {/* Alert settings */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>
            {lang === 'TE' ? '⚙️ హెచ్చరిక సెట్టింగులు' : lang === 'HI' ? '⚙️ अलर्ट सेटिंग्स' : '⚙️ Alert Settings'}
          </Text>
          <View style={S.settingsCard}>
            {/* Notification master toggle */}
            <View style={[S.settingRow, { borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 4 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="notifications-outline" size={20} color={C.green} />
                <View>
                  <Text style={S.settingLabel}>
                    {lang === 'TE' ? 'పుష్ నోటిఫికేషన్లు' : lang === 'HI' ? 'पुश नोटिफिकेशन' : 'Push Notifications'}
                  </Text>
                  <Text style={S.settingDesc}>
                    {notifEnabled
                      ? (lang === 'TE' ? 'యాప్ మూసినా అందుతాయి' : lang === 'HI' ? 'ऐप बंद होने पर भी मिलेंगे' : 'Alerts even when app is closed')
                      : (lang === 'TE' ? 'అనుమతి లేదు' : lang === 'HI' ? 'अनुमति नहीं है' : 'Permission not granted')}
                  </Text>
                </View>
              </View>
              <Switch
                value={notifEnabled}
                onValueChange={setNotifEnabled}
                trackColor={{ false: C.border, true: C.greenLight }}
                thumbColor={notifEnabled ? C.green : '#fff'}
              />
            </View>

            {Object.entries(alertSettings).map(([key, val]) => (
              <View key={key} style={S.settingRow}>
                <Text style={S.settingLabel}>{alertLabels[key][lang]}</Text>
                <Switch
                  value={val}
                  onValueChange={() => toggleSetting(key)}
                  trackColor={{ false: C.border, true: C.greenLight }}
                  thumbColor={val ? C.green : '#fff'}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Voice navigation card */}
        <View style={S.section}>
          <Text style={S.sectionTitle}>
            {lang === 'TE' ? '🎤 వాయిస్ నావిగేషన్' : lang === 'HI' ? '🎤 वॉयस नेविगेशन' : '🎤 Voice Navigation'}
          </Text>
          <View style={S.voiceCard}>
            <Text style={S.voiceTitle}>
              {lang === 'TE' ? 'ఫోన్ కదిలించండి' : lang === 'HI' ? 'फोन हिलाएं' : 'Shake your phone'}
            </Text>
            <Text style={S.voiceDesc}>
              {lang === 'TE'
                ? 'ఫోన్ కదిలించినప్పుడు వాయిస్ నావిగేషన్ ప్రారంభమవుతుంది. మీరు వెళ్ళాలనుకుంటున్న స్క్రీన్ పేరు చెప్పండి.'
                : lang === 'HI'
                ? 'फोन हिलाने पर वॉयस नेविगेशन शुरू होता है। आप जिस स्क्रीन पर जाना चाहते हैं उसका नाम बोलें।'
                : 'Shake your phone to activate voice navigation. Say the screen name you want to visit.'}
            </Text>

            <View style={S.commandsGrid}>
              {[
                { cmd: lang === 'TE' ? '"హోమ్"'         : lang === 'HI' ? '"होम"'       : '"Home"',              screen: lang === 'TE' ? 'ముఖ పేజీ'   : lang === 'HI' ? 'मुख्य पृष्ठ' : 'Home Screen'           },
                { cmd: lang === 'TE' ? '"వ్యాధి"'        : lang === 'HI' ? '"बीमारी"'    : '"Disease"',           screen: lang === 'TE' ? 'వ్యాధి స్క్రీన్' : lang === 'HI' ? 'रोग पहचान' : 'Disease Screen'        },
                { cmd: lang === 'TE' ? '"మార్కెట్"'      : lang === 'HI' ? '"मंडी"'      : '"Market"',            screen: lang === 'TE' ? 'మార్కెట్ స్క్రీన్' : lang === 'HI' ? 'बाजार स्क्रीन' : 'Market Screen'    },
                { cmd: lang === 'TE' ? '"పంటలు"'         : lang === 'HI' ? '"फसलें"'     : '"Crops"',             screen: lang === 'TE' ? 'పంట స్క్రీన్'  : lang === 'HI' ? 'फसल स्क्रीन' : 'Crop Recs Screen'    },
              ].map((item, i) => (
                <View key={i} style={S.cmdCard}>
                  <Text style={S.cmdText}>{item.cmd}</Text>
                  <Ionicons name="arrow-forward-outline" size={12} color={C.textMuted} />
                  <Text style={S.cmdScreen}>{item.screen}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={S.testShakeBtn} onPress={activateVoiceNav}>
              <MaterialCommunityIcons name="vibrate" size={18} color="#fff" />
              <Text style={S.testShakeBtnText}>
                {lang === 'TE' ? 'వాయిస్ నావిగేషన్ పరీక్షించండి' : lang === 'HI' ? 'वॉयस नेविगेशन टेस्ट करें' : 'Test Voice Navigation'}
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
  root:           { flex: 1, backgroundColor: C.bg },
  header:         { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: 14, paddingHorizontal: 14 },
  headerTitle:    { color: '#fff', fontSize: 15, fontWeight: '700' },
  headerSub:      { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 1 },
  shakeBar:       { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: C.greenPale, borderBottomWidth: 1, borderBottomColor: C.border },
  shakeText:      { fontSize: 12, fontWeight: '600' },
  scroll:         { padding: 14 },
  weatherCard:    { backgroundColor: C.green, borderRadius: 18, padding: 18, marginBottom: 16, elevation: 4, shadowColor: C.green, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  weatherRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  weatherEmoji:   { fontSize: 36, marginBottom: 4 },
  weatherTemp:    { fontSize: 42, fontWeight: '800', color: '#fff' },
  weatherDesc:    { fontSize: 13, color: '#A5D6A7', textTransform: 'capitalize' },
  weatherLoc:     { fontSize: 11, color: '#81C784', marginTop: 4 },
  weatherStats:   { alignItems: 'flex-end', justifyContent: 'center', gap: 8 },
  statRow:        { flexDirection: 'row', alignItems: 'center' },
  statIcon:       { fontSize: 14, marginRight: 4 },
  statLabel:      { fontSize: 12, color: '#C8E6C9' },
  statVal:        { fontSize: 12, color: '#fff', fontWeight: '700' },
  section:        { marginBottom: 20 },
  sectionHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle:   { fontSize: 15, fontWeight: '700', color: C.green },
  refreshBtn:     { padding: 4 },
  forecastCard:   { backgroundColor: C.card, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border, minWidth: 70 },
  forecastTime:   { fontSize: 10, color: C.textMuted, fontWeight: '600', marginBottom: 6 },
  forecastTemp:   { fontSize: 13, fontWeight: '700', color: C.text, marginTop: 4 },
  forecastRain:   { fontSize: 10, color: C.blue, marginTop: 2 },
  alertCard:      { backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  alertTop:       { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  alertIcon:      { fontSize: 24 },
  alertTitle:     { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  alertTime:      { fontSize: 11, color: C.textMuted },
  alertBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  alertBadgeText: { fontSize: 10, fontWeight: '700' },
  alertMsg:       { fontSize: 13, color: C.text, lineHeight: 20, marginBottom: 8 },
  alertTip:       { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: C.greenPale, borderRadius: 8, padding: 8 },
  alertTipText:   { fontSize: 12, color: C.green, flex: 1, lineHeight: 18 },
  settingsCard:   { backgroundColor: C.card, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: C.border, elevation: 1 },
  settingRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  settingLabel:   { fontSize: 13, color: C.text, fontWeight: '600' },
  settingDesc:    { fontSize: 11, color: C.textMuted, marginTop: 1 },
  voiceCard:      { backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border, elevation: 2 },
  voiceTitle:     { fontSize: 16, fontWeight: '700', color: C.green, marginBottom: 6 },
  voiceDesc:      { fontSize: 13, color: C.textMuted, lineHeight: 20, marginBottom: 14 },
  commandsGrid:   { gap: 8, marginBottom: 14 },
  cmdCard:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.greenPale, borderRadius: 10, padding: 10 },
  cmdText:        { fontSize: 13, fontWeight: '700', color: C.green },
  cmdScreen:      { fontSize: 12, color: C.textMuted, flex: 1 },
  testShakeBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.green, borderRadius: 12, padding: 12 },
  testShakeBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
