// AgriAI - Login Screen with Mock OTP
// This simulates real OTP flow without needing Firebase Blaze billing
// The OTP is generated locally and shown on screen for testing
// We can swap this for real Firebase SMS later once billing is sorted

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithGoogle } from '../../utils/googleAuth';
import { saveGuestProfile } from '../../utils/guestProfile';

export default function LoginScreen() {
  const router = useRouter();

  const [farmerName, setFarmerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const generatedOtp = useRef('');

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      if (user) router.replace('/screens/HomeScreen');
    } catch (e) {
      Alert.alert('Sign-in failed', e.message || 'Could not sign in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const validateDetails = () => {
    if (!farmerName.trim()) {
      Alert.alert('Missing Info', 'Please enter your name.');
      return false;
    }
    if (!mobileNumber.trim() || mobileNumber.length !== 10) {
      Alert.alert('Missing Info', 'Please enter a valid 10-digit mobile number.');
      return false;
    }
    return true;
  };

  // Generates a random 6-digit code and "sends" it (shows it on screen for now)
  const sendOtp = () => {
    if (!validateDetails()) return;
    setIsLoading(true);

    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      generatedOtp.current = code;
      setIsLoading(false);
      setStep('otp');

      // DEV MODE: showing the OTP directly since real SMS isn't connected yet
      Alert.alert(
        'OTP Sent (Test Mode)',
        `Your verification code is: ${code}\n\nIn the live app, this will arrive via real SMS.`
      );
    }, 800);
  };

  const verifyOtp = () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code.');
      return;
    }
    setIsLoading(true);

    setTimeout(async () => {
      setIsLoading(false);
      if (otp === generatedOtp.current) {
        await saveGuestProfile({ name: farmerName.trim(), mobile: mobileNumber });
        router.replace('/screens/HomeScreen');
      } else {
        Alert.alert('Incorrect Code', 'The code you entered is incorrect. Please try again.');
      }
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🌱</Text>
            <Text style={styles.headerTitle}>Welcome to AgriAI</Text>
            <Text style={styles.headerSubtitle}>
              Your smart organic farming companion
            </Text>
          </View>

          <View style={styles.formCard}>
            {step === 'details' && (
              <>
                <TouchableOpacity
                  style={[styles.googleButton, googleLoading && styles.actionButtonDisabled]}
                  onPress={handleGoogleSignIn}
                  disabled={googleLoading}
                >
                  <AntDesign name="google" size={20} color="#DB4437" />
                  <Text style={styles.googleButtonText}>
                    {googleLoading ? 'Signing in...' : 'Continue with Google'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>
              </>
            )}
            {step === 'details' ? (
              <>
                <Text style={styles.formTitle}>Create Your Profile</Text>
                <Text style={styles.formSubtitle}>
                  Tell us a little about yourself to get started
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Your Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor="#BDBDBD"
                    value={farmerName}
                    onChangeText={setFarmerName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mobile Number</Text>
                  <View style={styles.phoneRow}>
                    <Text style={styles.countryCode}>+91</Text>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="10-digit mobile number"
                      placeholderTextColor="#BDBDBD"
                      value={mobileNumber}
                      onChangeText={(text) => setMobileNumber(text.replace(/[^0-9]/g, ''))}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>

                <Text style={styles.termsText}>
                  🧪 Test Mode: the verification code will be shown on screen instead of sent via SMS.
                </Text>

                <TouchableOpacity
                  style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
                  onPress={sendOtp}
                  disabled={isLoading}
                >
                  <Text style={styles.actionButtonText}>
                    {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.formTitle}>Enter Verification Code</Text>
                <Text style={styles.formSubtitle}>
                  Test code shown in the popup — enter it below
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>OTP Code</Text>
                  <TextInput
                    style={[styles.textInput, styles.otpInput]}
                    placeholder="••••••"
                    placeholderTextColor="#BDBDBD"
                    value={otp}
                    onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
                  onPress={verifyOtp}
                  disabled={isLoading}
                >
                  <Text style={styles.actionButtonText}>
                    {isLoading ? 'Verifying...' : 'Verify & Continue'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={() => setStep('details')}
                >
                  <Text style={styles.resendText}>← Change number</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1B5E20' },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  headerEmoji: { fontSize: 64, marginBottom: 16 },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#C8E6C9',
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 40,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 30,
    paddingVertical: 15,
    marginBottom: 20,
  },
  googleButtonText: { fontSize: 16, fontWeight: '600', color: '#3C4043' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  dividerText: { marginHorizontal: 12, fontSize: 12, color: '#9E9E9E', fontWeight: '600' },
  formTitle: { fontSize: 24, fontWeight: 'bold', color: '#212121', marginBottom: 6 },
  formSubtitle: { fontSize: 14, color: '#757575', marginBottom: 30, lineHeight: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#212121', marginBottom: 8 },
  textInput: {
    backgroundColor: '#F9FBF9',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FBF9',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
  },
  termsText: {
    fontSize: 12,
    color: '#F57C00',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 10,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#1B5E20',
    paddingVertical: 17,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
  },
  actionButtonDisabled: { backgroundColor: '#4CAF50' },
  actionButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  resendButton: { alignItems: 'center', paddingVertical: 10 },
  resendText: { color: '#1B5E20', fontSize: 14, fontWeight: '600' },
});
