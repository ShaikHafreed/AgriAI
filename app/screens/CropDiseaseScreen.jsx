// screens/CropDiseaseScreen.jsx
// Day 5 FINAL v3 — Crop Disease Detection
// Fix: image resized to max 512px before base64 to prevent network timeout in Expo Go

import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  ScrollView, ActivityIndicator, Alert, Linking,
  Animated, Platform, StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { GROQ_DIAGNOSE_URL } from "../../utils/apiConfig";
import { safeGoBack } from "../../utils/navHelpers";

const WORKER_URL = GROQ_DIAGNOSE_URL;

// ─── THEME ───────────────────────────────────────────────────────────────────
const C = {
  green:      "#2D6A4F",
  greenLight: "#40916C",
  greenPale:  "#D8F3DC",
  amber:      "#F4A261",
  amberLight: "#FFE8D0",
  red:        "#E63946",
  redLight:   "#FFE5E7",
  sky:        "#48CAE4",
  skyLight:   "#E0F7FA",
  bg:         "#F6FBF4",
  card:       "#FFFFFF",
  text:       "#1B2E1F",
  textMuted:  "#6B7C6E",
  border:     "#D4E8D4",
};

export default function CropDiseaseScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState(null);
  const [imageB64, setImageB64] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const fadeAnim                = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  };

  // ── Compress image to small base64 ───────────────────────────────────────
  const compressImage = async (uri) => {
    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 512 } }],   // max 512px wide — keeps it small
      { compress: 0.4, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    return { uri: compressed.uri, base64: compressed.base64 };
  };

  // ── Image Picker ─────────────────────────────────────────────────────────
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow gallery access.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      base64: false,   // we compress separately below
    });
    if (!res.canceled) await handleImage(res.assets[0].uri);
  };

  const captureFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow camera access.");
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      quality: 1,
      base64: false,
    });
    if (!res.canceled) await handleImage(res.assets[0].uri);
  };

  const handleImage = async (uri) => {
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      const { uri: compUri, base64 } = await compressImage(uri);
      setImageUri(compUri);
      setImageB64(base64);
    } catch (e) {
      Alert.alert("Error", "Could not process the image. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetImage = () => {
    setImageUri(null);
    setImageB64(null);
    setResult(null);
    setError(null);
  };

  // ── Diagnose ──────────────────────────────────────────────────────────────
  const diagnose = async () => {
    if (!imageB64) {
      Alert.alert("No image", "Please capture or pick a crop photo first.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          image_base64: imageB64,
          prompt: `You are an expert agricultural plant pathologist.
Analyse this crop photo and respond ONLY with valid JSON — no markdown, no text outside JSON.
{
  "disease_name": "specific disease name or Healthy Crop",
  "confidence": number 0-100,
  "cause": "pathogen or cause in one sentence",
  "symptoms": "visible signs in 2 sentences",
  "treatment": "recommended treatment in 2 sentences",
  "remedy_steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "search_query": "agri shop near me for <disease_name> treatment"
}
If NOT a plant: {"disease_name":"Not a crop image","confidence":0,"cause":"N/A","symptoms":"N/A","treatment":"N/A","remedy_steps":[],"search_query":""}`,
        }),
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Worker ${response.status}: ${errText}`);
      }

      const data = await response.json();
      let raw = data.reply || data.content || "";
      raw = raw.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(raw);
      setResult(parsed);
      fadeIn();
    } catch (err) {
      console.error("Diagnose error:", err);
      if (err.name === "AbortError") {
        setError("Request timed out. Check your internet and try again.");
      } else {
        setError(
          "Could not analyse the image.\n\n" +
          "• Check your internet connection\n" +
          "• Make sure GROQ_API_KEY is set as Secret in Cloudflare Worker\n" +
          "• Try again — sometimes it takes a moment"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const findNearbyShop = () => {
    if (!result?.search_query) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.search_query)}`);
  };

  const confColor = (c) => {
    if (c >= 75) return C.red;
    if (c >= 45) return C.amber;
    return C.greenLight;
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.green} />

      <LinearGradient colors={[C.green, C.greenLight]} style={styles.header}>
        <TouchableOpacity onPress={() => safeGoBack(router)} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Crop Disease Detection</Text>
          <Text style={styles.headerSub}>Take or upload a photo of the affected crop</Text>
        </View>
        <MaterialCommunityIcons name="leaf-circle-outline" size={36} color="rgba(255,255,255,0.3)" />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Image Box */}
        <View style={styles.imageBox}>
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.cropImage} resizeMode="cover" />
              <TouchableOpacity style={styles.retakeBtn} onPress={resetImage}>
                <Ionicons name="refresh" size={13} color="#fff" />
                <Text style={styles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="image-search-outline" size={56} color={C.greenLight} />
              <Text style={styles.placeholderText}>No image selected</Text>
              <Text style={styles.placeholderSub}>
                Capture or pick a clear photo of the affected crop
              </Text>
            </View>
          )}
        </View>

        {/* Camera / Gallery */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={captureFromCamera}>
            <Ionicons name="camera-outline" size={20} color={C.green} />
            <Text style={styles.actionBtnText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={pickFromGallery}>
            <Ionicons name="images-outline" size={20} color={C.green} />
            <Text style={styles.actionBtnText}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Analyse Button */}
        <TouchableOpacity
          style={[styles.diagnoseBtn, (!imageUri || loading) && styles.diagnoseBtnDisabled]}
          onPress={diagnose}
          disabled={!imageUri || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MaterialCommunityIcons name="bacteria-outline" size={20} color="#fff" />
              <Text style={styles.diagnoseBtnText}>Analyse Crop</Text>
            </>
          )}
        </TouchableOpacity>

        {loading && (
          <Text style={styles.loadingHint}>🔬 Analysing with AI… please wait 10–15 seconds</Text>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={20} color={C.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Result Card */}
        {result && (
          <Animated.View style={[styles.resultCard, { opacity: fadeAnim }]}>

            <View style={styles.diseaseHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.diseaseLabel}>DETECTED DISEASE</Text>
                <Text style={styles.diseaseName}>{result.disease_name}</Text>
              </View>
              <View style={[styles.confidenceBadge, { backgroundColor: confColor(result.confidence) + "20" }]}>
                <Text style={[styles.confidenceValue, { color: confColor(result.confidence) }]}>
                  {result.confidence}%
                </Text>
                <Text style={[styles.confidenceLabel, { color: confColor(result.confidence) }]}>
                  confidence
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <ResultSection icon="flask-outline" label="Cause" color={C.amber} bg={C.amberLight}>
              <Text style={styles.sectionBody}>{result.cause}</Text>
            </ResultSection>

            <ResultSection icon="eye-outline" label="Symptoms" color={C.sky} bg={C.skyLight}>
              <Text style={styles.sectionBody}>{result.symptoms}</Text>
            </ResultSection>

            <ResultSection icon="medical-outline" label="Treatment" color={C.red} bg={C.redLight}>
              <Text style={styles.sectionBody}>{result.treatment}</Text>
            </ResultSection>

            {result.remedy_steps?.length > 0 && (
              <ResultSection icon="list-circle-outline" label="Remedy Steps" color={C.green} bg={C.greenPale}>
                {result.remedy_steps.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepDot}>
                      <Text style={styles.stepNum}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </ResultSection>
            )}

            {result.search_query !== "" && (
              <TouchableOpacity style={styles.shopBtn} onPress={findNearbyShop} activeOpacity={0.85}>
                <LinearGradient colors={[C.green, C.greenLight]} style={styles.shopBtnGradient}>
                  <Ionicons name="location-outline" size={20} color="#fff" />
                  <Text style={styles.shopBtnText}>Find Nearby Agri Shops</Text>
                  <Ionicons name="open-outline" size={16} color="rgba(255,255,255,0.7)" />
                </LinearGradient>
              </TouchableOpacity>
            )}

          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function ResultSection({ icon, label, color, bg, children }) {
  return (
    <View style={[styles.section, { backgroundColor: bg, borderLeftColor: color }]}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={[styles.sectionLabel, { color }]}>{label}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 8 : 4,
    paddingBottom: 16, paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2 },
  scroll: { padding: 16 },
  imageBox: {
    width: "100%", height: 220, borderRadius: 16, overflow: "hidden",
    backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border, marginBottom: 14,
  },
  cropImage: { width: "100%", height: "100%" },
  imagePlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 24 },
  placeholderText: { color: C.text, fontSize: 15, fontWeight: "600" },
  placeholderSub: { color: C.textMuted, fontSize: 12, textAlign: "center", lineHeight: 18 },
  retakeBtn: {
    position: "absolute", bottom: 10, right: 10,
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  retakeBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 12, borderRadius: 12, backgroundColor: C.card, borderWidth: 1.5, borderColor: C.border,
  },
  actionBtnText: { color: C.green, fontWeight: "600", fontSize: 14 },
  diagnoseBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    paddingVertical: 15, borderRadius: 14, backgroundColor: C.green, marginBottom: 8,
    elevation: 3, shadowColor: C.green, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  diagnoseBtnDisabled: { opacity: 0.45, elevation: 0 },
  diagnoseBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.3 },
  loadingHint: { textAlign: "center", color: C.textMuted, fontSize: 12, marginBottom: 12, lineHeight: 18 },
  errorCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: C.redLight, borderRadius: 12, padding: 14, marginBottom: 14,
    borderLeftWidth: 3, borderLeftColor: C.red,
  },
  errorText: { flex: 1, color: C.red, fontSize: 13, lineHeight: 20 },
  resultCard: {
    backgroundColor: C.card, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: C.border, marginTop: 8, gap: 14,
    elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6,
  },
  diseaseHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  diseaseLabel: { color: C.textMuted, fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  diseaseName: { color: C.text, fontSize: 20, fontWeight: "800", marginTop: 2 },
  confidenceBadge: { alignItems: "center", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, minWidth: 72 },
  confidenceValue: { fontSize: 22, fontWeight: "800" },
  confidenceLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: C.border },
  section: { borderRadius: 12, padding: 13, borderLeftWidth: 3, gap: 6 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionLabel: { fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.7 },
  sectionBody: { color: C.text, fontSize: 14, lineHeight: 21 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 6 },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.green, alignItems: "center", justifyContent: "center", marginTop: 1 },
  stepNum: { color: "#fff", fontSize: 11, fontWeight: "700" },
  stepText: { flex: 1, color: C.text, fontSize: 14, lineHeight: 21 },
  shopBtn: { borderRadius: 14, overflow: "hidden", marginTop: 4 },
  shopBtnGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, paddingHorizontal: 18 },
  shopBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", flex: 1, textAlign: "center" },
});
