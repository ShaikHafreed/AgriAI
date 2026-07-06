// components/DrawerMenu.jsx — Day 13
// Mobile equivalent of a desktop sidebar: a slide-out drawer listing every
// screen. Built as a plain Modal + Animated slide-in (no @react-navigation/
// drawer dependency, no route restructuring) so it drops into any screen
// via a hamburger icon without touching the existing stack navigation.

import React, { useRef, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, Animated, Dimensions, Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { tr } from '../utils/i18n';

const C = {
  green: '#1B5E20', greenLight: '#388E3C', greenPale: '#E8F5E9',
  card: '#FFFFFF', text: '#212121', textMuted: '#558B2F', border: '#C8E6C9',
};

const DRAWER_WIDTH = Math.min(300, Dimensions.get('window').width * 0.8);

const ITEMS = [
  { key: 'home', icon: 'home-outline', labelKey: 'navHome', route: '/screens/HomeScreen' },
  { key: 'cropRecs', icon: 'leaf-outline', labelKey: 'cropRecs', route: '/screens/CropRecommendationScreen' },
  { key: 'chat', icon: 'chatbubble-ellipses-outline', labelKey: 'navChat', route: '/screens/ChatScreen' },
  { key: 'disease', icon: 'medkit-outline', labelKey: 'diseaseDetection', route: '/screens/CropDiseaseScreen' },
  { key: 'market', icon: 'trending-up-outline', labelKey: 'marketPrices', route: '/screens/MarketPricesScreen' },
  { key: 'weather', icon: 'rainy-outline', labelKey: 'navWeather', route: '/screens/WeatherAlertScreen' },
  { key: 'tasks', icon: 'checkmark-circle-outline', labelKey: 'navTasks', route: '/screens/TaskManagerScreen' },
  { key: 'ledger', icon: 'wallet-outline', labelKey: 'navLedger', route: '/screens/LedgerScreen' },
  { key: 'organic', icon: 'flower-outline', labelKey: 'navOrganicPrep', route: '/screens/OrganicPrepScreen' },
  { key: 'schemes', icon: 'business-outline', labelKey: 'govtSchemes', route: '/screens/GovtSchemesScreen' },
  { key: 'profile', icon: 'person-outline', labelKey: 'navProfile', route: '/screens/ProfileScreen' },
];

export default function DrawerMenu({ visible, onClose, lang = 'EN', active }) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -DRAWER_WIDTH,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleNavigate = (item) => {
    onClose();
    if (item.key !== active) router.push(item.route);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={S.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View style={[S.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={S.header}>
          <MaterialCommunityIcons name="sprout" size={30} color="#fff" />
          <Text style={S.headerTitle}>{tr('menuTitle', lang)}</Text>
          <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={S.list}>
          {ITEMS.map((item) => {
            const isActive = item.key === active;
            return (
              <TouchableOpacity
                key={item.key}
                style={[S.item, isActive && S.itemActive]}
                onPress={() => handleNavigate(item)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={20} color={isActive ? C.green : C.textMuted} />
                <Text style={[S.itemText, isActive && S.itemTextActive]}>{tr(item.labelKey, lang)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </Modal>
  );
}

const S = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  drawer: {
    position: 'absolute', top: 0, bottom: 0, left: 0, width: DRAWER_WIDTH,
    backgroundColor: C.card, elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.green, paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingBottom: 16,
  },
  headerTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' },
  list: { paddingTop: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 13 },
  itemActive: { backgroundColor: C.greenPale },
  itemText: { fontSize: 14, fontWeight: '600', color: C.text },
  itemTextActive: { color: C.green, fontWeight: '700' },
});
