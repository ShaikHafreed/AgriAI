// app/screens/HomeScreen.jsx — Day 10
// Full offline support: cached weather, location, season data

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Vibration,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { Accelerometer } from 'expo-sensors';
import { tr } from '../../utils/i18n';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import OfflineBanner from '../../components/OfflineBanner';
import { cacheSet, cacheGetStale, checkOnline } from '../../utils/offlineManager';
import { WORKER_BASE_URL } from '../../utils/apiConfig';
import DrawerMenu from '../../components/DrawerMenu';
import BottomNavBar, { BOTTOM_NAV_HEIGHT } from '../../components/BottomNavBar';

const getSeasonName = (lang) => {
  const m = new Date().getMonth() + 1;
  if (m >= 6 && m <= 9)  return { label: lang==='TE'?'ఖరీఫ్ సీజన్':lang==='HI'?'खरीफ मौसम':'Kharif Season', emoji:'🌧️', color:'#1565C0', crops:'Rice, Maize, Cotton, Soybean', months:'June - September' };
  if (m >= 10 || m <= 1) return { label: lang==='TE'?'రబీ సీజన్':lang==='HI'?'रबी मौसम':'Rabi Season',   emoji:'❄️', color:'#6A1B9A', crops:'Wheat, Mustard, Barley, Peas', months:'October - January' };
  return { label: lang==='TE'?'వేసవి సీజన్':lang==='HI'?'ग्रीष्म मौसम':'Summer Season', emoji:'☀️', color:'#E65100', crops:'Watermelon, Cucumber, Sunflower', months:'February - May' };
};

const getGreeting = (lang) => {
  const h = new Date().getHours();
  return h < 12 ? tr('goodMorning', lang) : h < 17 ? tr('goodAfternoon', lang) : tr('goodEvening', lang);
};

export default function HomeScreen() {
  const router = useRouter();
  const [lang, setLang]                 = useState('EN');
  const [weather, setWeather]           = useState(null);
  const [locationName, setLocationName] = useState('');
  const [isLoadingLoc, setIsLoadingLoc] = useState(true);
  const [isLoadingWth, setIsLoadingWth] = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [offline, setOffline]           = useState(false);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const langRef   = useRef('EN');
  const lastShake = useRef(0);
  const shakeRef  = useRef(false);
  const season    = getSeasonName(lang);

  useEffect(() => { langRef.current = lang; }, [lang]);

  // Shake nav — threshold 2.5 to avoid Expo Go dev menu conflict
  useEffect(() => {
    let shakeCount = 0;
    let shakeTimer = null;
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x*x + y*y + z*z);
      const now = Date.now();
      // Use higher threshold 2.5 (Expo Go triggers at ~1.5)
      if (mag > 2.5 && now - lastShake.current > 500) {
        lastShake.current = now;
        shakeCount++;
        clearTimeout(shakeTimer);
        shakeTimer = setTimeout(() => { shakeCount = 0; }, 1500);
        // Require 3 quick shakes to avoid Expo Go conflict
        if (shakeCount >= 3 && !shakeRef.current) {
          shakeCount = 0;
          shakeRef.current = true;
          handleShake();
        }
      }
    });
    Accelerometer.setUpdateInterval(100);
    return () => { sub.remove(); clearTimeout(shakeTimer); };
  }, []);

  const handleShake = () => {
    const l = langRef.current;
    Vibration.vibrate(200);
    Speech.speak(l==='TE'?'ఏ స్క్రీన్‌కు వెళ్ళాలి?':l==='HI'?'किस स्क्रीन पर जाएं?':'Where to go?', { language: l==='TE'?'te-IN':l==='HI'?'hi-IN':'en-IN' });
    Alert.alert(
      l==='TE'?'🎤 వాయిస్ నావిగేషన్':l==='HI'?'🎤 वॉयस नेविगेशन':'🎤 Voice Navigation', '',
      [
        { text: l==='TE'?'🔬 వ్యాధి గుర్తింపు':l==='HI'?'🔬 रोग पहचान':'🔬 Disease Detection',   onPress: () => { shakeRef.current=false; router.push('/screens/CropDiseaseScreen'); } },
        { text: l==='TE'?'📈 మార్కెట్ ధరలు':l==='HI'?'📈 बाजार भाव':'📈 Market Prices',         onPress: () => { shakeRef.current=false; router.push('/screens/MarketPricesScreen'); } },
        { text: l==='TE'?'🌱 పంట సిఫారసులు':l==='HI'?'🌱 फसल सुझाव':'🌱 Crop Recommendations', onPress: () => { shakeRef.current=false; router.push('/screens/CropRecommendationScreen'); } },
        { text: l==='TE'?'🌧️ వాతావరణ హెచ్చరిక':l==='HI'?'🌧️ मौसम अलर्ट':'🌧️ Weather Alerts', onPress: () => { shakeRef.current=false; router.push('/screens/WeatherAlertScreen'); } },
        { text: l==='TE'?'✅ పని నిర్వాహకుడు':l==='HI'?'✅ कार्य प्रबंधक':'✅ Task Manager', onPress: () => { shakeRef.current=false; router.push('/screens/TaskManagerScreen'); } },
        { text: l==='TE'?'❌ రద్దు':l==='HI'?'❌ रद्द':'❌ Cancel', style:'cancel', onPress: () => { shakeRef.current=false; } },
      ]
    );
  };

  const fetchWeather = async (lat, lon) => {
    try {
      setIsLoadingWth(true);
      const online = await checkOnline();
      setOffline(!online);

      if (online) {
        const res  = await fetch(`${WORKER_BASE_URL}/weather?lat=${lat}&lon=${lon}`);
        const data = await res.json();
        if (data.cod === 200) {
          const w = {
            temp:        Math.round(data.main.temp),
            feelsLike:   Math.round(data.main.feels_like),
            humidity:    data.main.humidity,
            windSpeed:   Math.round(data.wind.speed * 3.6),
            description: data.weather[0].description,
            main:        data.weather[0].main,
            city:        data.name,
            rainChance:  data.clouds?.all || 0,
          };
          setWeather(w);
          await cacheSet('weather_home', w);
        }
      } else {
        // Load from cache
        const cached = await cacheGetStale('weather_home');
        if (cached) setWeather(cached);
      }
    } catch (e) {
      const cached = await cacheGetStale('weather_home');
      if (cached) setWeather(cached);
    } finally { setIsLoadingWth(false); }
  };

  const detectLocation = async () => {
    try {
      setIsLoadingLoc(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocationName('Permission denied'); return; }

      // Try cache first if offline
      if (!(await checkOnline())) {
        const cachedLoc = await cacheGetStale('location_name');
        if (cachedLoc) setLocationName(cachedLoc);
        const cachedCoords = await cacheGetStale('location_coords');
        if (cachedCoords) await fetchWeather(cachedCoords.lat, cachedCoords.lon);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      await cacheSet('location_coords', { lat: latitude, lon: longitude });

      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address) {
        const name = `${address.city || address.district || 'Unknown'}, ${address.region || ''}`;
        setLocationName(name);
        await cacheSet('location_name', name);
      }
      await fetchWeather(latitude, longitude);
    } catch (e) {
      const cached = await cacheGetStale('location_name');
      if (cached) setLocationName(cached);
    } finally { setIsLoadingLoc(false); }
  };

  useEffect(() => { detectLocation(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await detectLocation();
    setRefreshing(false);
  };

  const getWeatherEmoji = (main) => ({ Clear:'☀️', Clouds:'☁️', Rain:'🌧️', Drizzle:'🌦️', Thunderstorm:'⛈️', Snow:'❄️', Mist:'🌫️', Fog:'🌫️', Haze:'🌫️' }[main] || '🌤️');

  const getFarmingAdvisory = () => {
    if (!weather) return tr('loading', lang);
    if (weather.main === 'Rain')    return '🌧️ ' + (lang==='TE'?'వర్షం - నీటి పారుదల మానుకోండి':lang==='HI'?'बारिश - सिंचाई न करें':'Rain expected — avoid irrigation today.');
    if (weather.humidity > 80)      return '💧 ' + (lang==='TE'?'అధిక తేమ - శిలీంధ్ర జాగ్రత్త':lang==='HI'?'अधिक नमी - फफूंद से सावधान':'High humidity — watch for fungal diseases.');
    if (weather.temp > 40)          return '🌡️ ' + (lang==='TE'?'అధిక వేడి - పొద్దున నీరు పోయండి':lang==='HI'?'गर्मी - सुबह पानी दें':'Extreme heat — water crops in morning.');
    return '✅ ' + (lang==='TE'?'మంచి వాతావరణం - వ్యవసాయానికి అనుకూలం':lang==='HI'?'अच्छा मौसम - खेती के लिए उपयुक्त':'Good conditions — suitable for farming.');
  };

  const quickActions = [
    { emoji:'🌱', title:tr('cropRecs',lang),         color:'#E8F5E9', onPress:()=>router.push('/screens/CropRecommendationScreen') },
    { emoji:'🤖', title:tr('askAgriAI',lang),        color:'#E3F2FD', onPress:()=>router.push('/screens/ChatScreen')               },
    { emoji:'🔬', title:tr('diseaseDetection',lang), color:'#FFF3E0', onPress:()=>router.push('/screens/CropDiseaseScreen')        },
    { emoji:'📈', title:tr('marketPrices',lang),     color:'#F3E5F5', onPress:()=>router.push('/screens/MarketPricesScreen')       },
    { emoji:'🌧️', title:lang==='TE'?'వాతావరణ హెచ్చరికలు':lang==='HI'?'मौसम अलर्ट':'Weather Alerts',
      color:'#E1F5FE', onPress:()=>router.push('/screens/WeatherAlertScreen'),
      badge: weather?.main==='Rain'||weather?.temp>=38 ? '!' : null },
    { emoji:'✅', title:tr('taskManager',lang),        color:'#FFF8E1', onPress:()=>router.push('/screens/TaskManagerScreen')    },
    { emoji:'💰', title:tr('farmLedger',lang),         color:'#FFFDE7', onPress:()=>router.push('/screens/LedgerScreen')         },
    { emoji:'🏛️', title:tr('govtSchemes',lang),       color:'#EDE7F6', onPress:()=>router.push('/screens/GovtSchemesScreen')   },
  ];

  return (
    <SafeAreaView style={S.safe}>
      <OfflineBanner />
      <ScrollView
        contentContainerStyle={S.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B5E20']} />}
      >
        {/* Offline cached badge */}
        {offline && (
          <View style={S.offlineBadge}>
            <Text style={S.offlineBadgeText}>
              📡 {lang==='TE'?'ఆఫ్‌లైన్ - కాష్ చేసిన డేటా చూపిస్తున్నాం':lang==='HI'?'ऑफलाइन - कैश डेटा दिखा रहे हैं':'Offline — showing cached data'}
            </Text>
          </View>
        )}

        {/* Header */}
        <View style={S.header}>
          <TouchableOpacity style={S.menuBtn} onPress={() => setDrawerOpen(true)}>
            <Text style={{ fontSize: 22, color: '#1B5E20' }}>☰</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={S.greeting}>{getGreeting(lang)} 👋</Text>
            <Text style={S.farmerName}>{tr('welcomeFarmer', lang)}</Text>
            <View style={S.locRow}>
              <Text>📍</Text>
              <Text style={S.locText} numberOfLines={1}>
                {isLoadingLoc ? tr('detectingLocation', lang) : locationName}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={S.profileBtn} onPress={()=>router.push('/screens/ProfileScreen')}>
            <Text style={{ fontSize: 26 }}>👨‍🌾</Text>
          </TouchableOpacity>
        </View>

        {/* Lang + shake/longpress nav */}
        <TouchableOpacity
          style={S.langRow}
          onLongPress={handleShake}
          delayLongPress={800}
          activeOpacity={1}
        >
          <View>
            <Text style={S.langLabel}>{lang==='EN'?'Language':lang==='TE'?'భాష':'भाषा'}</Text>
            <Text style={S.shakeHint}>📳 {lang==='TE'?'నొక్కి పట్టండి → నావిగేషన్':lang==='HI'?'दबाए रखें → नेविगेशन':'Hold → Voice Navigate'}</Text>
          </View>
          <LanguageSwitcher lang={lang} setLang={(l)=>{ setLang(l); langRef.current=l; }} />
        </TouchableOpacity>

        {/* Weather */}
        <View style={S.weatherCard}>
          {isLoadingWth ? (
            <View style={{ flexDirection:'row', alignItems:'center', paddingVertical:10 }}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={S.weatherMuted}>  {tr('loading', lang)}</Text>
            </View>
          ) : weather ? (
            <>
              <View style={S.weatherTop}>
                <View>
                  <Text style={{ fontSize:36, marginBottom:4 }}>{getWeatherEmoji(weather.main)}</Text>
                  <Text style={S.temp}>{weather.temp}°C</Text>
                  <Text style={S.weatherDesc}>{weather.description}</Text>
                  <Text style={S.weatherCity}>{weather.city}</Text>
                </View>
                <View style={{ alignItems:'flex-end', gap:5 }}>
                  <Text style={S.weatherStat}>💧 {tr('humidity',lang)}: {weather.humidity}%</Text>
                  <Text style={S.weatherStat}>🌡️ {tr('feelsLike',lang)}: {weather.feelsLike}°C</Text>
                  <Text style={S.weatherStat}>💨 {tr('wind',lang)}: {weather.windSpeed} km/h</Text>
                  <Text style={S.weatherStat}>☁️ {tr('cloud',lang)}: {weather.rainChance}%</Text>
                </View>
              </View>
              <View style={S.advisory}>
                <Text style={{ fontSize:12, color:'#fff', lineHeight:18 }}>{getFarmingAdvisory()}</Text>
              </View>
            </>
          ) : (
            <Text style={S.weatherMuted}>{lang==='TE'?'వాతావరణ డేటా అందుబాటులో లేదు':lang==='HI'?'मौसम डेटा उपलब्ध नहीं':'Weather data unavailable'}</Text>
          )}
        </View>

        {/* Season */}
        <View style={[S.seasonCard, { borderLeftColor: season.color }]}>
          <Text style={{ fontSize:32 }}>{season.emoji}</Text>
          <View style={{ flex:1, marginLeft:14 }}>
            <Text style={S.seasonName}>{season.label}</Text>
            <Text style={S.seasonMonths}>{season.months}</Text>
            <Text style={S.seasonCrops}>🌾 {season.crops}</Text>
          </View>
        </View>

        {/* Quick actions */}
        <Text style={S.sectionTitle}>{tr('quickActions', lang)}</Text>
        <View style={S.grid}>
          {quickActions.map((item, i) => (
            <TouchableOpacity key={i} style={[S.actionCard, { backgroundColor: item.color }]} onPress={item.onPress}>
              <Text style={{ fontSize:28, marginBottom:6 }}>{item.emoji}</Text>
              <Text style={S.actionTitle}>{item.title}</Text>
              {item.badge && <View style={S.alertDot}><Text style={{ fontSize:9, color:'#fff', fontWeight:'800' }}>{item.badge}</Text></View>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Farm overview */}
        <Text style={S.sectionTitle}>{tr('farmOverview', lang)}</Text>
        <View style={S.farmCard}>
          {[
            { emoji:'📍', labelKey:'location',      value: isLoadingLoc ? tr('detectingLocation',lang) : locationName },
            { emoji:'🗓️', labelKey:'currentSeason', value: season.label },
            { emoji:'🌾', labelKey:'bestCrops',     value: season.crops },
            { emoji:'☀️', labelKey:'weatherStatus', value: weather ? `${weather.temp}°C, ${weather.description}` : tr('loading',lang) },
          ].map((item, i) => (
            <View key={i} style={[S.farmRow, i<3 && { borderBottomWidth:1, borderBottomColor:'#F5F5F5' }]}>
              <Text style={{ fontSize:20, marginRight:10 }}>{item.emoji}</Text>
              <View style={{ flex:1 }}>
                <Text style={S.farmLabel}>{tr(item.labelKey, lang)}</Text>
                <Text style={S.farmValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={S.hint}>{tr('pullRefresh', lang)}</Text>
      </ScrollView>

      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} lang={lang} active="home" />
      <BottomNavBar active="home" lang={lang} />
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe:         { flex:1, backgroundColor:'#F1F8E9' },
  scroll:       { paddingHorizontal:20, paddingBottom:40 + BOTTOM_NAV_HEIGHT },
  offlineBadge: { backgroundColor:'#FFF3E0', borderRadius:10, padding:10, marginTop:8, marginBottom:4, borderLeftWidth:3, borderLeftColor:'#E65100' },
  offlineBadgeText: { fontSize:12, color:'#E65100', fontWeight:'600' },
  header:       { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingTop:16, paddingBottom:10 },
  greeting:     { fontSize:13, color:'#558B2F', fontWeight:'600' },
  farmerName:   { fontSize:22, fontWeight:'bold', color:'#1B5E20', marginTop:2 },
  locRow:       { flexDirection:'row', alignItems:'center', marginTop:4, gap:4 },
  locText:      { fontSize:12, color:'#558B2F', maxWidth:220 },
  profileBtn:   { width:48, height:48, borderRadius:24, backgroundColor:'#C8E6C9', alignItems:'center', justifyContent:'center' },
  menuBtn:      { width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center', marginRight:6 },
  langRow:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#1B5E20', borderRadius:14, paddingHorizontal:16, paddingVertical:10, marginBottom:14 },
  langLabel:    { color:'rgba(255,255,255,0.85)', fontSize:13, fontWeight:'600' },
  shakeHint:    { color:'rgba(255,255,255,0.65)', fontSize:10, marginTop:2 },
  weatherCard:  { backgroundColor:'#1B5E20', borderRadius:20, padding:18, marginBottom:14, elevation:4, shadowColor:'#1B5E20', shadowOffset:{width:0,height:4}, shadowOpacity:0.3, shadowRadius:8 },
  weatherTop:   { flexDirection:'row', justifyContent:'space-between', marginBottom:12 },
  temp:         { fontSize:44, fontWeight:'bold', color:'#fff', lineHeight:48 },
  weatherDesc:  { fontSize:13, color:'#A5D6A7', textTransform:'capitalize' },
  weatherCity:  { fontSize:12, color:'#81C784', marginTop:2 },
  weatherStat:  { fontSize:12, color:'#C8E6C9' },
  weatherMuted: { color:'#C8E6C9', fontSize:14, padding:10 },
  advisory:     { backgroundColor:'rgba(255,255,255,0.12)', borderRadius:10, padding:10 },
  seasonCard:   { backgroundColor:'#fff', borderRadius:14, padding:14, marginBottom:18, flexDirection:'row', alignItems:'center', borderLeftWidth:5, elevation:2 },
  seasonName:   { fontSize:15, fontWeight:'bold', color:'#212121', marginBottom:2 },
  seasonMonths: { fontSize:11, color:'#757575', marginBottom:3 },
  seasonCrops:  { fontSize:12, color:'#388E3C', fontWeight:'600' },
  sectionTitle: { fontSize:17, fontWeight:'bold', color:'#1B5E20', marginBottom:12 },
  grid:         { flexDirection:'row', flexWrap:'wrap', gap:12, marginBottom:22 },
  actionCard:   { width:'47%', borderRadius:14, padding:14, alignItems:'center', elevation:2, position:'relative' },
  actionTitle:  { fontSize:12, fontWeight:'700', color:'#212121', textAlign:'center' },
  alertDot:     { position:'absolute', top:8, right:8, width:18, height:18, borderRadius:9, backgroundColor:'#C62828', alignItems:'center', justifyContent:'center' },
  farmCard:     { backgroundColor:'#fff', borderRadius:14, padding:4, marginBottom:14, elevation:2 },
  farmRow:      { flexDirection:'row', alignItems:'center', padding:12 },
  farmLabel:    { fontSize:11, color:'#757575', marginBottom:2 },
  farmValue:    { fontSize:13, fontWeight:'600', color:'#212121' },
  hint:         { textAlign:'center', fontSize:11, color:'#A5D6A7', marginTop:6 },
});
