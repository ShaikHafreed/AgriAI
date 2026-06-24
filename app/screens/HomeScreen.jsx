// app/screens/HomeScreen.jsx — Day 6 FINAL v2
// Fixed: Language switcher moved below header, fully visible

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { tr } from '../../utils/i18n';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const WEATHER_API_KEY = '70fab3ca43ede65c216f90d25b67e765';

const getSeasonName = (lang) => {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 9) return {
    label: lang === 'TE' ? 'ఖరీఫ్ సీజన్' : lang === 'HI' ? 'खरीफ मौसम' : 'Kharif Season',
    emoji: '🌧️', color: '#1565C0', crops: 'Rice, Maize, Cotton, Soybean', months: 'June - September',
  };
  if (month >= 10 || month <= 1) return {
    label: lang === 'TE' ? 'రబీ సీజన్' : lang === 'HI' ? 'रबी मौसम' : 'Rabi Season',
    emoji: '❄️', color: '#6A1B9A', crops: 'Wheat, Mustard, Barley, Peas', months: 'October - January',
  };
  return {
    label: lang === 'TE' ? 'వేసవి సీజన్' : lang === 'HI' ? 'ग्रीष्म मौसम' : 'Summer Season',
    emoji: '☀️', color: '#E65100', crops: 'Watermelon, Cucumber, Sunflower', months: 'February - May',
  };
};

const getGreeting = (lang) => {
  const hour = new Date().getHours();
  if (hour < 12) return tr('goodMorning', lang);
  if (hour < 17) return tr('goodAfternoon', lang);
  return tr('goodEvening', lang);
};

export default function HomeScreen() {
  const router = useRouter();
  const [lang, setLang]                           = useState('EN');
  const [weather, setWeather]                     = useState(null);
  const [locationName, setLocationName]           = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingWeather, setIsLoadingWeather]   = useState(true);
  const [refreshing, setRefreshing]               = useState(false);
  const season = getSeasonName(lang);

  const fetchWeather = async (lat, lon) => {
    try {
      setIsLoadingWeather(true);
      const res  = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`);
      const data = await res.json();
      if (data.cod === 200) {
        setWeather({
          temp: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6),
          description: data.weather[0].description,
          main: data.weather[0].main,
          city: data.name,
          rainChance: data.clouds?.all || 0,
        });
      }
    } catch (e) { console.log(e); }
    finally { setIsLoadingWeather(false); }
  };

  const detectLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocationName('Permission denied'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (address) {
        const city = address.city || address.district || address.subregion || 'Unknown';
        setLocationName(`${city}, ${address.region || ''}`);
      }
      await fetchWeather(latitude, longitude);
    } catch (e) { setLocationName('Could not detect location'); }
    finally { setIsLoadingLocation(false); }
  };

  useEffect(() => { detectLocation(); }, []);
  const onRefresh = async () => { setRefreshing(true); await detectLocation(); setRefreshing(false); };

  const getWeatherEmoji = (main) => ({
    Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
    Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️', Haze: '🌫️',
  }[main] || '🌤️');

  const getFarmingAdvisory = () => {
    if (!weather) return tr('loading', lang);
    if (weather.main === 'Rain')   return '🌧️ ' + (lang === 'TE' ? 'వర్షం - నీటి పారుదల మానుకోండి' : lang === 'HI' ? 'बारिश - सिंचाई न करें' : 'Rain expected — avoid irrigation today.');
    if (weather.humidity > 80)     return '💧 ' + (lang === 'TE' ? 'అధిక తేమ - శిలీంధ్ర వ్యాధులు జాగ్రత్త' : lang === 'HI' ? 'अधिक नमी - फफूंद रोग से सावधान' : 'High humidity — watch for fungal diseases.');
    if (weather.temp > 40)         return '🌡️ ' + (lang === 'TE' ? 'అధిక వేడి - పొద్దున నీరు పోయండి' : lang === 'HI' ? 'अत्यधिक गर्मी - सुबह पानी दें' : 'Extreme heat — water crops in morning.');
    return '✅ ' + (lang === 'TE' ? 'మంచి వాతావరణం - వ్యవసాయానికి అనుకూలం' : lang === 'HI' ? 'अच्छा मौसम - खेती के लिए उपयुक्त' : 'Good conditions — suitable for farming.');
  };

  const quickActions = [
    { emoji: '🌱', title: tr('cropRecs', lang),         color: '#E8F5E9', onPress: () => Alert.alert('Coming Soon', 'Day 7!'), soon: true },
    { emoji: '🤖', title: tr('askAgriAI', lang),        color: '#E3F2FD', onPress: () => router.push('/screens/ChatScreen') },
    { emoji: '🔬', title: tr('diseaseDetection', lang), color: '#FFF3E0', onPress: () => router.push('/screens/CropDiseaseScreen') },
    { emoji: '📈', title: tr('marketPrices', lang),     color: '#F3E5F5', onPress: () => router.push('/screens/MarketPricesScreen') },
  ];

  return (
    <SafeAreaView style={S.safe}>
      <ScrollView
        contentContainerStyle={S.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1B5E20']} />}
      >
        {/* ── Header Row: greeting + profile ── */}
        <View style={S.header}>
          <View style={{ flex: 1 }}>
            <Text style={S.greeting}>{getGreeting(lang)} 👋</Text>
            <Text style={S.farmerName}>{tr('welcomeFarmer', lang)}</Text>
            <View style={S.locRow}>
              <Text>📍</Text>
              <Text style={S.locText} numberOfLines={1}>
                {isLoadingLocation ? tr('detectingLocation', lang) : locationName}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={S.profileBtn} onPress={() => router.push('/screens/ProfileScreen')}>
            <Text style={{ fontSize: 26 }}>👨‍🌾</Text>
          </TouchableOpacity>
        </View>

        {/* ── Language Switcher — full width row below header ── */}
        <View style={S.langRow}>
          <Text style={S.langLabel}>
            {lang === 'EN' ? 'Language' : lang === 'TE' ? 'భాష' : 'भाषा'}
          </Text>
          <LanguageSwitcher lang={lang} setLang={setLang} />
        </View>

        {/* ── Weather ── */}
        <View style={S.weatherCard}>
          {isLoadingWeather ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={S.weatherMuted}>  {tr('loading', lang)}</Text>
            </View>
          ) : weather ? (
            <>
              <View style={S.weatherTop}>
                <View>
                  <Text style={{ fontSize: 36, marginBottom: 4 }}>{getWeatherEmoji(weather.main)}</Text>
                  <Text style={S.temp}>{weather.temp}°C</Text>
                  <Text style={S.weatherDesc}>{weather.description}</Text>
                  <Text style={S.weatherCity}>{weather.city}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 5 }}>
                  <Text style={S.weatherStat}>💧 {tr('humidity', lang)}: {weather.humidity}%</Text>
                  <Text style={S.weatherStat}>🌡️ {tr('feelsLike', lang)}: {weather.feelsLike}°C</Text>
                  <Text style={S.weatherStat}>💨 {tr('wind', lang)}: {weather.windSpeed} km/h</Text>
                  <Text style={S.weatherStat}>☁️ {tr('cloud', lang)}: {weather.rainChance}%</Text>
                </View>
              </View>
              <View style={S.advisory}>
                <Text style={{ fontSize: 12, color: '#fff', lineHeight: 18 }}>{getFarmingAdvisory()}</Text>
              </View>
            </>
          ) : (
            <Text style={S.weatherMuted}>{tr('error', lang)}</Text>
          )}
        </View>

        {/* ── Season ── */}
        <View style={[S.seasonCard, { borderLeftColor: season.color }]}>
          <Text style={{ fontSize: 32 }}>{season.emoji}</Text>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={S.seasonName}>{season.label}</Text>
            <Text style={S.seasonMonths}>{season.months}</Text>
            <Text style={S.seasonCrops}>🌾 {season.crops}</Text>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <Text style={S.sectionTitle}>{tr('quickActions', lang)}</Text>
        <View style={S.grid}>
          {quickActions.map((item, i) => (
            <TouchableOpacity key={i} style={[S.actionCard, { backgroundColor: item.color }]} onPress={item.onPress}>
              <Text style={{ fontSize: 32, marginBottom: 6 }}>{item.emoji}</Text>
              <Text style={S.actionTitle}>{item.title}</Text>
              {item.soon && (
                <View style={S.soonBadge}>
                  <Text style={{ fontSize: 9, color: '#fff', fontWeight: 'bold' }}>Soon</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Farm Overview ── */}
        <Text style={S.sectionTitle}>{tr('farmOverview', lang)}</Text>
        <View style={S.farmCard}>
          {[
            { emoji: '📍', labelKey: 'location',      value: isLoadingLocation ? tr('detectingLocation', lang) : locationName },
            { emoji: '🗓️', labelKey: 'currentSeason', value: season.label },
            { emoji: '🌾', labelKey: 'bestCrops',     value: season.crops },
            { emoji: '☀️', labelKey: 'weatherStatus', value: weather ? `${weather.temp}°C, ${weather.description}` : tr('loading', lang) },
          ].map((item, i) => (
            <View key={i} style={[S.farmRow, i < 3 && { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }]}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={S.farmLabel}>{tr(item.labelKey, lang)}</Text>
                <Text style={S.farmValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={S.hint}>{tr('pullRefresh', lang)}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#F1F8E9' },
  scroll:       { paddingHorizontal: 20, paddingBottom: 40 },

  // Header — greeting + profile only
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, paddingBottom: 10 },
  greeting:     { fontSize: 13, color: '#558B2F', fontWeight: '600' },
  farmerName:   { fontSize: 22, fontWeight: 'bold', color: '#1B5E20', marginTop: 2 },
  locRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  locText:      { fontSize: 12, color: '#558B2F', maxWidth: 220 },
  profileBtn:   { width: 48, height: 48, borderRadius: 24, backgroundColor: '#C8E6C9', alignItems: 'center', justifyContent: 'center' },

  // Language switcher row — separate from header
  langRow:      {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1B5E20',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
  },
  langLabel:    { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },

  // Weather
  weatherCard:  { backgroundColor: '#1B5E20', borderRadius: 20, padding: 18, marginBottom: 14, elevation: 4, shadowColor: '#1B5E20', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  weatherTop:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  temp:         { fontSize: 44, fontWeight: 'bold', color: '#fff', lineHeight: 48 },
  weatherDesc:  { fontSize: 13, color: '#A5D6A7', textTransform: 'capitalize' },
  weatherCity:  { fontSize: 12, color: '#81C784', marginTop: 2 },
  weatherStat:  { fontSize: 12, color: '#C8E6C9' },
  weatherMuted: { color: '#C8E6C9', fontSize: 14 },
  advisory:     { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: 10 },

  // Season
  seasonCard:   { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 18, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 5, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  seasonName:   { fontSize: 15, fontWeight: 'bold', color: '#212121', marginBottom: 2 },
  seasonMonths: { fontSize: 11, color: '#757575', marginBottom: 3 },
  seasonCrops:  { fontSize: 12, color: '#388E3C', fontWeight: '600' },

  // Actions
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1B5E20', marginBottom: 12 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 22 },
  actionCard:   { width: '47%', borderRadius: 14, padding: 14, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, position: 'relative' },
  actionTitle:  { fontSize: 13, fontWeight: '700', color: '#212121', textAlign: 'center' },
  soonBadge:    { position: 'absolute', top: 8, right: 8, backgroundColor: '#FF8F00', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },

  // Farm Overview
  farmCard:     { backgroundColor: '#fff', borderRadius: 14, padding: 4, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  farmRow:      { flexDirection: 'row', alignItems: 'center', padding: 12 },
  farmLabel:    { fontSize: 11, color: '#757575', marginBottom: 2 },
  farmValue:    { fontSize: 13, fontWeight: '600', color: '#212121' },
  hint:         { textAlign: 'center', fontSize: 11, color: '#A5D6A7', marginTop: 6 },
});
