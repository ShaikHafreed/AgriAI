// AgriAI - AI Chat Screen
// Farmers can ask any farming question and get expert AI answers
// Powered by Claude (Anthropic) AI

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Your Claude API Key
const CLAUDE_KEY = '';

// System prompt - makes Claude act as an expert organic farming assistant
const SYSTEM_PROMPT = `You are AgriAI, an expert organic farming assistant for Indian farmers. IMPORTANT: Always respond in English by default. Only switch to Hindi, Telugu, Tamil, Kannada, Malayalam or Marathi if the user writes to you in that specific language first. Never mix languages in a single response.
You have deep knowledge about:
- Organic farming practices and techniques
- Indian crops: Rice, Wheat, Cotton, Sugarcane, Vegetables, Fruits
- Soil health, composting, vermicompost, Jeevamrutham, Panchagavya
- Organic pest control: Neem oil, garlic-chili spray, pheromone traps
- Crop rotation, intercropping, cover cropping
- Indian farming seasons: Kharif (June-Sep), Rabi (Oct-Jan), Summer (Feb-May)
- Government schemes for farmers
- Market prices and crop selection strategies
- Plant diseases and organic treatments
- Water management and irrigation

Always give practical, actionable advice. Keep answers clear and simple so farmers can understand easily.
When relevant, mention organic alternatives to chemical solutions.
If asked in Hindi or Telugu, respond in that language.
Keep responses concise but complete - aim for 3-5 sentences unless a detailed explanation is needed.`;

// Quick question suggestions shown at the start
const QUICK_QUESTIONS = [
  '🌱 Which crops to grow in Kharif season?',
  '🍃 Why are my leaves turning yellow?',
  '🪲 How to control pests organically?',
  '💧 How to prepare Jeevamrutham?',
  '🌾 Best organic fertilizers for rice?',
  '🔄 How to do crop rotation?',
];

export default function ChatScreen() {
  const router = useRouter();
  const flatListRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: 'Namaste! 🌱 I am AgriAI, your organic farming assistant. Ask me anything about farming, crops, soil, pests, or organic techniques. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Send message to Claude API
  const sendMessage = async (text) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    setInputText('');
    setShowQuickQuestions(false);
    setIsLoading(true);

    // Add user message to chat
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      // Build conversation history for Claude (exclude the initial greeting)
      const conversationHistory = updatedMessages
        .filter(msg => msg.id !== '1') // skip initial greeting
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      // Call Claude API
      const response = await fetch('https://agriai-proxy.shaikhafreeddth.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: conversationHistory,
        }),
      });

      const data = await response.json();

      if (data.content && data.content[0]) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.content[0].text,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else if (data.error) {
        throw new Error(data.error.message || 'API error');
      }
    } catch (error) {
      console.log('Claude API error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I could not connect right now. Please check your internet connection and try again. 🙏',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Render each chat bubble
  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🌱</Text>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
          item.isError && styles.errorBubble,
        ]}>
          <Text style={[
            styles.messageText,
            isUser ? styles.userText : styles.aiText,
          ]}>
            {item.content}
          </Text>
          <Text style={[styles.timeText, isUser && styles.timeTextUser]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Ask AgriAI 🌱</Text>
          <Text style={styles.headerSubtitle}>Organic Farming Expert</Text>
        </View>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            Alert.alert('Clear Chat', 'Start a new conversation?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Clear',
                onPress: () => {
                  setMessages([{
                    id: '1',
                    role: 'assistant',
                    content: 'Namaste! 🌱 I am AgriAI, your organic farming assistant. Ask me anything about farming, crops, soil, pests, or organic techniques. How can I help you today?',
                    timestamp: new Date(),
                  }]);
                  setShowQuickQuestions(true);
                },
              },
            ]);
          }}
        >
          <Text style={styles.clearText}>New</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <>
              {/* Loading indicator */}
              {isLoading && (
                <View style={styles.messageRow}>
                  <View style={styles.aiAvatar}>
                    <Text style={styles.aiAvatarText}>🌱</Text>
                  </View>
                  <View style={[styles.messageBubble, styles.aiBubble, styles.typingBubble]}>
                    <ActivityIndicator size="small" color="#1B5E20" />
                    <Text style={styles.typingText}>  AgriAI is thinking...</Text>
                  </View>
                </View>
              )}

              {/* Quick question chips - shown only at start */}
              {showQuickQuestions && !isLoading && (
                <View style={styles.quickQuestionsContainer}>
                  <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
                  <View style={styles.quickQuestionsGrid}>
                    {QUICK_QUESTIONS.map((question, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.quickChip}
                        onPress={() => sendMessage(question.substring(2))}
                      >
                        <Text style={styles.quickChipText}>{question}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </>
          }
        />

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask any farming question..."
            placeholderTextColor="#A5D6A7"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F1F8E9' },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { padding: 4, marginRight: 8 },
  backText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: '#A5D6A7' },
  clearButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  clearText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  // Messages
  messagesList: { padding: 16, paddingBottom: 8 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  messageRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C8E6C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiAvatarText: { fontSize: 16 },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 18,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  userBubble: {
    backgroundColor: '#1B5E20',
    borderBottomRightRadius: 4,
    marginLeft: 8,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  errorBubble: { backgroundColor: '#FFEBEE' },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  typingText: { color: '#558B2F', fontSize: 13 },
  messageText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#FFFFFF' },
  aiText: { color: '#212121' },
  timeText: { fontSize: 10, color: '#90A4AE', marginTop: 4, alignSelf: 'flex-end' },
  timeTextUser: { color: 'rgba(255,255,255,0.6)' },

  // Quick Questions
  quickQuestionsContainer: { marginTop: 8, marginBottom: 8 },
  quickQuestionsTitle: {
    fontSize: 13,
    color: '#558B2F',
    fontWeight: '600',
    marginBottom: 10,
    marginLeft: 4,
  },
  quickQuestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickChipText: { fontSize: 13, color: '#2E7D32', fontWeight: '500' },

  // Input Bar
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#FFFFFF',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  sendButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.2)' },
  sendButtonText: { fontSize: 18, color: '#FFFFFF' },
});
