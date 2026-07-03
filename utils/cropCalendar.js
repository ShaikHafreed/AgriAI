// utils/cropCalendar.js — Day 11
// Seasonal crop dataset (kharif/rabi/summer) used to auto-suggest sow/harvest tasks.
// Mirrors the crop set in CropRecommendationScreen.jsx but with numeric months so due dates are computable.

export const SEASONS = {
  kharif: {
    label: { EN: 'Kharif (Jun-Sep)', TE: 'ఖరీఫ్', HI: 'खरीफ' },
    crops: [
      { key: 'rice',   emoji: '🌾', sowMonth: 6,  harvestMonth: 9,  names: { EN: 'Rice',   TE: 'వరి',   HI: 'चावल' } },
      { key: 'maize',  emoji: '🌽', sowMonth: 5,  harvestMonth: 8,  names: { EN: 'Maize',  TE: 'మొక్కజొన్న', HI: 'मक्का' } },
      { key: 'cotton', emoji: '🌸', sowMonth: 5,  harvestMonth: 11, names: { EN: 'Cotton', TE: 'పత్తి', HI: 'कपास' } },
    ],
  },
  rabi: {
    label: { EN: 'Rabi (Oct-Jan)', TE: 'రబీ', HI: 'रबी' },
    crops: [
      { key: 'wheat',    emoji: '🌾', sowMonth: 10, harvestMonth: 2,  names: { EN: 'Wheat',    TE: 'గోధుమ', HI: 'गेहूं' } },
      { key: 'mustard',  emoji: '🌿', sowMonth: 9,  harvestMonth: 1,  names: { EN: 'Mustard',  TE: 'ఆవాలు', HI: 'सरसों' } },
      { key: 'chickpea', emoji: '🫘', sowMonth: 9,  harvestMonth: 1,  names: { EN: 'Chickpea', TE: 'శనగ',   HI: 'चना' } },
    ],
  },
  summer: {
    label: { EN: 'Summer (Feb-May)', TE: 'వేసవి', HI: 'ग्रीष्म' },
    crops: [
      { key: 'watermelon', emoji: '🍉', sowMonth: 1, harvestMonth: 4, names: { EN: 'Watermelon', TE: 'పుచ్చకాయ', HI: 'तरबूज' } },
      { key: 'cucumber',   emoji: '🥒', sowMonth: 1, harvestMonth: 3, names: { EN: 'Cucumber',   TE: 'దోసకాయ', HI: 'खीरा' } },
      { key: 'sunflower',  emoji: '🌻', sowMonth: 0, harvestMonth: 4, names: { EN: 'Sunflower',  TE: 'పొద్దుతిరుగుడు', HI: 'सूरजमुखी' } },
    ],
  },
};

const MONTH_NAMES = {
  EN: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  TE: ['జనవరి','ఫిబ్రవరి','మార్చి','ఏప్రిల్','మే','జూన్','జూలై','ఆగస్టు','సెప్టెంబర్','అక్టోబర్','నవంబర్','డిసెంబర్'],
  HI: ['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'],
};
export const monthName = (monthIndex, lang = 'EN') => (MONTH_NAMES[lang] || MONTH_NAMES.EN)[monthIndex];

// Rough growing duration in whole months between sow and harvest month.
export const durationMonths = (sowMonth, harvestMonth) => (((harvestMonth - sowMonth) % 12) + 12) % 12 || 12;

export const getCurrentSeason = () => {
  const m = new Date().getMonth() + 1;
  if (m >= 6 && m <= 9) return 'kharif';
  if (m >= 10 || m <= 1) return 'rabi';
  return 'summer';
};

// Next occurrence of `month` (0-11): this year if not yet passed, else next year.
const nextDateForMonth = (month) => {
  const now = new Date();
  const year = now.getMonth() <= month ? now.getFullYear() : now.getFullYear() + 1;
  return new Date(year, month, 1, 9, 0, 0);
};

const taskTitle = (type, cropName, lang) => {
  if (type === 'sow') {
    return lang === 'TE' ? `${cropName} విత్తండి` : lang === 'HI' ? `${cropName} बोएं` : `Sow ${cropName}`;
  }
  return lang === 'TE' ? `${cropName} కోయండి` : lang === 'HI' ? `${cropName} की कटाई करें` : `Harvest ${cropName}`;
};

// Returns draft task objects { title, type, cropEmoji, dueDate } for every crop in a season.
export const suggestSeasonalTasks = (season, lang = 'EN') => {
  const crops = SEASONS[season]?.crops || [];
  const tasks = [];
  crops.forEach((crop) => {
    const name = crop.names[lang] || crop.names.EN;
    tasks.push({ title: taskTitle('sow', name, lang), type: 'sow', cropEmoji: crop.emoji, dueDate: nextDateForMonth(crop.sowMonth) });
    tasks.push({ title: taskTitle('harvest', name, lang), type: 'harvest', cropEmoji: crop.emoji, dueDate: nextDateForMonth(crop.harvestMonth) });
  });
  return tasks;
};
