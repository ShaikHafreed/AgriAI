// components/LanguageSwitcher.jsx — Day 6, rebuilt Day 14 for 6-language support
// A 3-pill inline slider doesn't scale to 6 languages in a header, so this is now
// a compact "current language" button that opens a picker modal. Same props API
// (lang, setLang) as before, so every screen already using it needs no changes.

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const LANGUAGES = [
  { code: 'EN', label: 'English' },
  { code: 'TE', label: 'తెలుగు' },
  { code: 'HI', label: 'हिन्दी' },
  { code: 'TA', label: 'தமிழ்' },
  { code: 'KN', label: 'ಕನ್ನಡ' },
  { code: 'ML', label: 'മലയാളം' },
];

export default function LanguageSwitcher({ lang, setLang }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity style={S.btn} onPress={() => setOpen(true)} activeOpacity={0.75}>
        <Text style={S.btnText}>{lang}</Text>
        <Ionicons name="chevron-down" size={12} color="#1B5E20" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={S.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={S.sheet} onPress={(e) => e.stopPropagation()}>
            {LANGUAGES.map(({ code, label }) => (
              <TouchableOpacity
                key={code}
                style={[S.option, lang === code && S.optionActive]}
                onPress={() => { setLang(code); setOpen(false); }}
                activeOpacity={0.7}
              >
                <Text style={[S.optionText, lang === code && S.optionTextActive]}>{label}</Text>
                {lang === code && <Ionicons name="checkmark" size={18} color="#1B5E20" />}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const S = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  btnText: { fontSize: 12, fontWeight: '700', color: '#1B5E20' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  sheet: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 8, width: 220, elevation: 6 },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  optionActive: { backgroundColor: '#E8F5E9' },
  optionText: { fontSize: 14, fontWeight: '600', color: '#212121' },
  optionTextActive: { color: '#1B5E20', fontWeight: '700' },
});
