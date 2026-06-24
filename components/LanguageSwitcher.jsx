// components/LanguageSwitcher.jsx — Day 6
// Fixed: works from both app/screens/ and root screens/
// No relative imports needed — uses absolute-style from utils

import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';

const LANGS  = ['EN', 'TE', 'HI'];
const PILL_W = 52;
const PILL_H = 26;
const PAD    = 3;

export default function LanguageSwitcher({ lang, setLang }) {
  const activeIndex = LANGS.indexOf(lang);
  const slideAnim   = useRef(new Animated.Value(activeIndex * PILL_W)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeIndex * PILL_W,
      useNativeDriver: true,
      tension: 180,
      friction: 18,
    }).start();
  }, [activeIndex]);

  return (
    <View style={S.track}>
      <Animated.View style={[S.pill, { transform: [{ translateX: slideAnim }] }]} />
      <View style={S.labels}>
        {LANGS.map((l) => (
          <TouchableOpacity key={l} style={S.tab} onPress={() => setLang(l)} activeOpacity={0.7}>
            <Text style={[S.txt, { color: lang === l ? '#1B5E20' : 'rgba(255,255,255,0.8)' }]}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  track:  { borderRadius: 30, position: 'relative', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.20)', padding: PAD, width: PILL_W * 3 + PAD * 2 },
  pill:   { position: 'absolute', left: PAD, top: PAD, width: PILL_W, height: PILL_H, borderRadius: 26, backgroundColor: '#fff', zIndex: 0 },
  labels: { flexDirection: 'row', zIndex: 1 },
  tab:    { width: PILL_W, height: PILL_H, alignItems: 'center', justifyContent: 'center' },
  txt:    { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});
