// utils/speechUtils.js — v3 FINAL
// ONLY converts °C and % to Telugu/Hindi words
// Keeps ₹ amounts as numbers (TTS reads them fine)
// Does NOT touch profit display text

import * as Speech from 'expo-speech';

export const prepareForSpeech = (text, lang) => {
  if (!text) return '';
  let t = text;

  if (lang === 'TE') {
    // ONLY convert temperature and humidity units
    t = t.replace(/(\d+)\s*°\s*C/gi, (_, n) => `${n} డిగ్రీల సెల్సియస్`);
    t = t.replace(/(\d+)\s*%/g, (_, n) => `${n} శాతం`);
    // Remove stray symbols
    t = t.replace(/[°#*_`~]/g, ' ').replace(/\s+/g, ' ').trim();

  } else if (lang === 'HI') {
    t = t.replace(/(\d+)\s*°\s*C/gi, (_, n) => `${n} डिग्री सेल्सियस`);
    t = t.replace(/(\d+)\s*%/g, (_, n) => `${n} प्रतिशत`);
    t = t.replace(/[°#*_`~]/g, ' ').replace(/\s+/g, ' ').trim();

  } else {
    t = t.replace(/(\d+)\s*°\s*C/gi, '$1 degrees Celsius');
    t = t.replace(/(\d+)\s*%/g, '$1 percent');
    t = t.replace(/[°#*_`~]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  return t;
};

export const speakInLanguage = (text, lang, onDone) => {
  try {
    Speech.stop();
    const prepared = prepareForSpeech(text, lang);
    if (!prepared) { if (onDone) onDone(); return; }
    const langCode = lang === 'TE' ? 'te-IN' : lang === 'HI' ? 'hi-IN' : 'en-IN';
    Speech.speak(prepared, {
      language:  langCode,
      pitch:     1.0,
      rate:      lang === 'EN' ? 0.85 : 0.78,
      onDone:    onDone || (() => {}),
      onError:   onDone || (() => {}),
      onStopped: onDone || (() => {}),
    });
  } catch (e) { if (onDone) onDone(); }
};

export const stopSpeech = () => { try { Speech.stop(); } catch (e) {} };