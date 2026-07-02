// components/OfflineBanner.jsx — Day 10 FIXED
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

export default function OfflineBanner() {
  const [online, setOnline]         = useState(true);
  const [visible, setVisible]       = useState(false);
  const [showGreen, setShowGreen]   = useState(false);
  const slideAnim = useRef(new Animated.Value(-44)).current;

  const show = () => Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  const hide = () => Animated.timing(slideAnim, { toValue: -44, duration: 300, useNativeDriver: true }).start(() => setVisible(false));

  useEffect(() => {
    // Check initial state
    NetInfo.fetch().then(state => {
      const conn = !!(state.isConnected && state.isInternetReachable !== false);
      if (!conn) { setOnline(false); setVisible(true); show(); }
    });

    // Listen for changes
    const unsub = NetInfo.addEventListener(state => {
      const conn = !!(state.isConnected && state.isInternetReachable !== false);
      setOnline(conn);
      if (!conn) {
        setShowGreen(false);
        setVisible(true);
        show();
      } else {
        setShowGreen(true);
        setVisible(true);
        show();
        setTimeout(hide, 2500);
      }
    });
    return () => unsub();
  }, []);

  if (!visible) return null;

  return (
    <Animated.View style={[
      S.banner,
      { backgroundColor: showGreen ? '#2E7D32' : '#C62828', transform: [{ translateY: slideAnim }] }
    ]}>
      <Ionicons name={showGreen ? 'wifi' : 'wifi-outline'} size={14} color="#fff" />
      <Text style={S.text}>
        {showGreen ? '✅ Back online' : '📡 Offline — showing cached data'}
      </Text>
    </Animated.View>
  );
}

const S = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 14 },
  text:   { color: '#fff', fontSize: 12, fontWeight: '600' },
});
