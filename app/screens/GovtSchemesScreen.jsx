// app/screens/GovtSchemesScreen.jsx — Day 13
// Government farming schemes: eligibility, how to apply, official links.
// Same pattern as OrganicPrepScreen.jsx (expandable cards, EN/TE/HI).

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import OfflineBanner from '../../components/OfflineBanner';
import { tr } from '../../utils/i18n';
import { GOVT_SCHEMES } from '../../utils/govtSchemes';

const C = {
  green: '#1B5E20', greenLight: '#388E3C', greenPale: '#E8F5E9',
  amber: '#E65100', amberLight: '#FFF3E0',
  bg: '#F1F8E9', card: '#FFFFFF',
  text: '#212121', textMuted: '#558B2F', border: '#C8E6C9',
};

function SchemeCard({ scheme, lang, expanded, onToggle }) {
  const name = scheme.name[lang] || scheme.name.EN;
  const fullName = scheme.fullName[lang] || scheme.fullName.EN;
  const description = scheme.description[lang] || scheme.description.EN;
  const eligibility = scheme.eligibility[lang] || scheme.eligibility.EN;
  const howToApply = scheme.howToApply[lang] || scheme.howToApply.EN;

  return (
    <View style={S.card}>
      <TouchableOpacity style={S.cardHeader} onPress={onToggle} activeOpacity={0.8}>
        <Text style={S.cardIcon}>{scheme.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={S.cardName}>{name}</Text>
          <Text style={S.cardFullName} numberOfLines={expanded ? undefined : 1}>{fullName}</Text>
          <Text style={S.cardDesc} numberOfLines={expanded ? undefined : 2}>{description}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color={C.green} />
      </TouchableOpacity>
      {expanded && (
        <View style={S.cardBody}>
          <Text style={S.sectionTitle}>{tr('eligibility', lang)}</Text>
          {eligibility.map((item, i) => (
            <View key={i} style={S.bulletRow}>
              <View style={S.dot} />
              <Text style={S.bulletText}>{item}</Text>
            </View>
          ))}

          <Text style={[S.sectionTitle, { marginTop: 14 }]}>{tr('howToApply', lang)}</Text>
          {howToApply.map((step, i) => (
            <View key={i} style={S.stepRow}>
              <View style={S.stepNum}><Text style={S.stepNumText}>{i + 1}</Text></View>
              <Text style={S.stepText}>{step}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={S.applyBtn}
            onPress={() => Linking.openURL(scheme.officialLink)}
            activeOpacity={0.85}
          >
            <Ionicons name="open-outline" size={16} color="#fff" />
            <Text style={S.applyBtnText}>{tr('visitOfficialSite', lang)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function GovtSchemesScreen() {
  const router = useRouter();
  const [lang, setLang] = useState('EN');
  const [expanded, setExpanded] = useState(0);

  return (
    <SafeAreaView style={S.root}>
      <OfflineBanner />
      <LinearGradient colors={[C.green, C.greenLight]} style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={S.headerTitle}>{tr('govtSchemes', lang)}</Text>
          <Text style={S.headerSub}>{tr('govtSchemesSubtitle', lang)}</Text>
        </View>
        <LanguageSwitcher lang={lang} setLang={setLang} />
      </LinearGradient>

      <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
        <View style={S.banner}>
          <MaterialCommunityIcons name="bank-outline" size={36} color={C.green} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={S.bannerText}>{tr('govtSchemesBanner', lang)}</Text>
          </View>
        </View>

        {GOVT_SCHEMES.map((scheme, i) => (
          <SchemeCard
            key={scheme.key}
            scheme={scheme}
            lang={lang}
            expanded={expanded === i}
            onToggle={() => setExpanded(expanded === i ? -1 : i)}
          />
        ))}

        <View style={S.tipCard}>
          <Ionicons name="information-circle-outline" size={20} color={C.amber} />
          <Text style={S.tipText}>{tr('govtSchemesDisclaimer', lang)}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: 14, paddingHorizontal: 14 },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 1 },
  scroll: { padding: 14 },
  banner: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, elevation: 2 },
  bannerText: { fontSize: 13, color: C.text, lineHeight: 19 },
  card: { backgroundColor: C.card, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border, elevation: 2, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  cardIcon: { fontSize: 28 },
  cardName: { fontSize: 15, fontWeight: '700', color: C.green, marginBottom: 2 },
  cardFullName: { fontSize: 11, color: C.textMuted, fontStyle: 'italic', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: C.text, lineHeight: 18 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: C.border },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.text, marginTop: 14, marginBottom: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green, marginTop: 6 },
  bulletText: { fontSize: 13, color: C.text, flex: 1, lineHeight: 19 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  stepNum: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText: { fontSize: 11, color: '#fff', fontWeight: '700' },
  stepText: { fontSize: 13, color: C.text, flex: 1, lineHeight: 20 },
  applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.green, borderRadius: 12, paddingVertical: 12, marginTop: 16 },
  applyBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  tipCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: C.amberLight, borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: C.amber },
  tipText: { flex: 1, fontSize: 12, color: C.text, lineHeight: 19 },
});
