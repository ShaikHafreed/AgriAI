// components/BottomNavBar.jsx — Day 13
// Persistent-feeling bottom nav with an animated sliding indicator behind the
// active icon (same concept as the "Magic Navigation Menu" reference, rebuilt
// in React Native/Animated — the app has no tab navigator, so each of the 5
// primary screens renders this itself and switches tabs via router.replace()
// to avoid piling up stack history between them).

import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { tr } from '../utils/i18n';

const C = {
  green: '#1B5E20', greenPale: '#E8F5E9',
  card: '#FFFFFF', textMuted: '#558B2F', border: '#C8E6C9',
};

const TABS = [
  { key: 'home', icon: 'home', labelKey: 'navHome', route: '/screens/HomeScreen' },
  { key: 'chat', icon: 'chatbubble-ellipses', labelKey: 'navChat', route: '/screens/ChatScreen' },
  { key: 'tasks', icon: 'checkmark-circle', labelKey: 'navTasks', route: '/screens/TaskManagerScreen' },
  { key: 'ledger', icon: 'wallet', labelKey: 'navLedger', route: '/screens/LedgerScreen' },
  { key: 'profile', icon: 'person', labelKey: 'navProfile', route: '/screens/ProfileScreen' },
];

const TAB_COUNT = TABS.length;

export default function BottomNavBar({ active, lang = 'EN', floating = true }) {
  const router = useRouter();
  const activeIndex = Math.max(0, TABS.findIndex((t) => t.key === active));
  const slideAnim = useRef(new Animated.Value(activeIndex)).current;
  const [barWidth, setBarWidth] = useState(0);
  const tabWidth = barWidth / TAB_COUNT;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex,
      useNativeDriver: true,
      tension: 200,
      friction: 22,
    }).start();
  }, [activeIndex]);

  const handlePress = (tab) => {
    if (tab.key === active) return;
    router.replace(tab.route);
  };

  return (
    <View style={floating ? S.wrap : S.wrapStatic}>
      <View style={S.bar} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
        {barWidth > 0 && (
          <Animated.View
            style={[
              S.indicator,
              {
                width: tabWidth,
                transform: [{
                  translateX: slideAnim.interpolate({
                    inputRange: [0, TAB_COUNT - 1],
                    outputRange: [0, tabWidth * (TAB_COUNT - 1)],
                  }),
                }],
              },
            ]}
          />
        )}
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <TouchableOpacity
              key={tab.key}
              style={S.tab}
              activeOpacity={0.7}
              onPress={() => handlePress(tab)}
            >
              <Ionicons name={isActive ? tab.icon : `${tab.icon}-outline`} size={22} color={isActive ? C.green : C.textMuted} />
              <Text style={[S.label, isActive && S.labelActive]}>{tr(tab.labelKey, lang)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Platform.OS === 'ios' ? 20 : 8, backgroundColor: C.card },
  wrapStatic: { paddingBottom: Platform.OS === 'ios' ? 20 : 8, backgroundColor: C.card },
  bar: {
    flexDirection: 'row', position: 'relative',
    borderTopWidth: 1, borderTopColor: C.border,
    paddingTop: 8,
  },
  indicator: {
    position: 'absolute', top: 0, height: 3,
    backgroundColor: C.green, borderRadius: 2,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4 },
  label: { fontSize: 10, fontWeight: '600', color: C.textMuted },
  labelActive: { color: C.green, fontWeight: '700' },
});

export const BOTTOM_NAV_HEIGHT = Platform.OS === 'ios' ? 76 : 64;
