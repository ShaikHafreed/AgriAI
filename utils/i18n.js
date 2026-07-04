// utils/i18n.js
// AgriAI — Multi-language support (English + Telugu + Hindi)
// Day 6 — used across ALL screens

export const LANGUAGES = {
  EN: 'EN',
  TE: 'TE',
  HI: 'HI',
};

export const LANG_LABELS = {
  EN: 'English',
  TE: 'తెలుగు',
  HI: 'हिन्दी',
};

export const t = {

  // ── Common ──────────────────────────────────────────────────────────────
  appName: {
    EN: 'AgriAI',
    TE: 'అగ్రిఏఐ',
    HI: 'एग्रीAI',
  },
  loading: {
    EN: 'Loading...',
    TE: 'లోడ్ అవుతోంది...',
    HI: 'लोड हो रहा है...',
  },
  retry: {
    EN: 'Retry',
    TE: 'మళ్ళీ ప్రయత్నించు',
    HI: 'पुनः प्रयास करें',
  },
  error: {
    EN: 'Something went wrong. Please try again.',
    TE: 'ఏదో తప్పు జరిగింది. మళ్ళీ ప్రయత్నించండి.',
    HI: 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।',
  },
  back: {
    EN: 'Back',
    TE: 'వెనక్కి',
    HI: 'वापस',
  },
  search: {
    EN: 'Search',
    TE: 'వెతకండి',
    HI: 'खोजें',
  },

  // ── Home Screen ──────────────────────────────────────────────────────────
  goodMorning: {
    EN: 'Good Morning',
    TE: 'శుభోదయం',
    HI: 'शुभ प्रभात',
  },
  goodAfternoon: {
    EN: 'Good Afternoon',
    TE: 'శుభ మధ్యాహ్నం',
    HI: 'शुभ दोपहर',
  },
  goodEvening: {
    EN: 'Good Evening',
    TE: 'శుభ సాయంత్రం',
    HI: 'शुभ संध्या',
  },
  welcomeFarmer: {
    EN: 'Welcome, Farmer!',
    TE: 'స్వాగతం, రైతు!',
    HI: 'स्वागत है, किसान!',
  },
  detectingLocation: {
    EN: 'Detecting location...',
    TE: 'స్థానం గుర్తిస్తోంది...',
    HI: 'स्थान पहचाना जा रहा है...',
  },
  quickActions: {
    EN: 'Quick Actions',
    TE: 'త్వరిత చర్యలు',
    HI: 'त्वरित कार्य',
  },
  farmOverview: {
    EN: 'Your Farm Overview',
    TE: 'మీ పొలం వివరాలు',
    HI: 'आपका खेत अवलोकन',
  },
  pullRefresh: {
    EN: '↓ Pull down to refresh weather',
    TE: '↓ వాతావరణం రిఫ్రెష్ చేయడానికి క్రిందికి లాగండి',
    HI: '↓ मौसम अपडेट करने के लिए नीचे खींचें',
  },
  cropRecs: {
    EN: 'Crop\nRecommendations',
    TE: 'పంట\nసిఫారసులు',
    HI: 'फसल\nसुझाव',
  },
  askAgriAI: {
    EN: 'Ask\nAgriAI',
    TE: 'అగ్రిఏఐ\nను అడగండి',
    HI: 'एग्रीAI\nसे पूछें',
  },
  diseaseDetection: {
    EN: 'Disease\nDetection',
    TE: 'వ్యాధి\nగుర్తింపు',
    HI: 'रोग\nपहचान',
  },
  marketPrices: {
    EN: 'Market\nPrices',
    TE: 'మార్కెట్\nధరలు',
    HI: 'बाज़ार\nभाव',
  },
  location: {
    EN: 'Location',
    TE: 'స్థానం',
    HI: 'स्थान',
  },
  currentSeason: {
    EN: 'Current Season',
    TE: 'ప్రస్తుత సీజన్',
    HI: 'वर्तमान मौसम',
  },
  bestCrops: {
    EN: 'Best Crops Now',
    TE: 'ఇప్పుడు అత్యుత్తమ పంటలు',
    HI: 'अभी सबसे अच्छी फसलें',
  },
  weatherStatus: {
    EN: 'Weather Status',
    TE: 'వాతావరణ స్థితి',
    HI: 'मौसम की स्थिति',
  },

  // ── Weather ──────────────────────────────────────────────────────────────
  humidity: {
    EN: 'Humidity',
    TE: 'తేమ',
    HI: 'नमी',
  },
  feelsLike: {
    EN: 'Feels like',
    TE: 'అనిపిస్తుంది',
    HI: 'महसूस होता है',
  },
  wind: {
    EN: 'Wind',
    TE: 'గాలి',
    HI: 'हवा',
  },
  cloud: {
    EN: 'Cloud',
    TE: 'మేఘం',
    HI: 'बादल',
  },

  // ── Disease Detection ────────────────────────────────────────────────────
  cropDiseaseTitle: {
    EN: 'Crop Disease Detection',
    TE: 'పంట వ్యాధి గుర్తింపు',
    HI: 'फसल रोग पहचान',
  },
  cropDiseaseSubtitle: {
    EN: 'Take or upload a photo of the affected crop',
    TE: 'ప్రభావిత పంట ఫోటో తీయండి లేదా అప్లోడ్ చేయండి',
    HI: 'प्रभावित फसल की फोटो लें या अपलोड करें',
  },
  camera: {
    EN: 'Camera',
    TE: 'కెమెరా',
    HI: 'कैमरा',
  },
  gallery: {
    EN: 'Gallery',
    TE: 'గ్యాలరీ',
    HI: 'गैलरी',
  },
  analyseCrop: {
    EN: 'Analyse Crop',
    TE: 'పంటను విశ్లేషించు',
    HI: 'फसल विश्लेषण करें',
  },
  analysing: {
    EN: '🔬 AI is analysing your crop… please wait',
    TE: '🔬 AI మీ పంటను విశ్లేషిస్తోంది… దయచేసి వేచి ఉండండి',
    HI: '🔬 AI आपकी फसल का विश्लेषण कर रहा है… कृपया प्रतीक्षा करें',
  },
  detectedDisease: {
    EN: 'DETECTED DISEASE',
    TE: 'గుర్తించిన వ్యాధి',
    HI: 'पहचाना गया रोग',
  },
  confidence: {
    EN: 'confidence',
    TE: 'నమ్మకం',
    HI: 'विश्वास',
  },
  cause: {
    EN: 'Cause',
    TE: 'కారణం',
    HI: 'कारण',
  },
  symptoms: {
    EN: 'Symptoms',
    TE: 'లక్షణాలు',
    HI: 'लक्षण',
  },
  treatment: {
    EN: 'Treatment',
    TE: 'చికిత్స',
    HI: 'उपचार',
  },
  remedySteps: {
    EN: 'Remedy Steps',
    TE: 'నివారణ చర్యలు',
    HI: 'उपाय के चरण',
  },
  findNearbyShops: {
    EN: 'Find Nearby Agri Shops',
    TE: 'దగ్గర్లో వ్యవసాయ దుకాణాలు వెతకండి',
    HI: 'पास के कृषि दुकानें खोजें',
  },
  retake: {
    EN: 'Retake',
    TE: 'మళ్ళీ తీయి',
    HI: 'फिर से लें',
  },
  noImageSelected: {
    EN: 'No image selected',
    TE: 'చిత్రం ఎంచుకోబడలేదు',
    HI: 'कोई छवि नहीं चुनी गई',
  },
  noImageSubtitle: {
    EN: 'Capture or pick a clear photo of the affected crop',
    TE: 'ప్రభావిత పంట యొక్క స్పష్టమైన ఫోటో తీయండి లేదా ఎంచుకోండి',
    HI: 'प्रभावित फसल की स्पष्ट फोटो लें या चुनें',
  },

  // ── Market Prices ────────────────────────────────────────────────────────
  marketPricesTitle: {
    EN: 'Market Prices',
    TE: 'మార్కెట్ ధరలు',
    HI: 'बाज़ार भाव',
  },
  marketPricesSubtitle: {
    EN: 'Live mandi prices from data.gov.in',
    TE: 'data.gov.in నుండి లైవ్ మండి ధరలు',
    HI: 'data.gov.in से लाइव मंडी भाव',
  },
  searchCrop: {
    EN: 'Search crop or market...',
    TE: 'పంట లేదా మార్కెట్ వెతకండి...',
    HI: 'फसल या बाज़ार खोजें...',
  },
  commodity: {
    EN: 'Commodity',
    TE: 'వస్తువు',
    HI: 'वस्तु',
  },
  market: {
    EN: 'Market',
    TE: 'మార్కెట్',
    HI: 'बाज़ार',
  },
  minPrice: {
    EN: 'Min',
    TE: 'కనీస',
    HI: 'न्यूनतम',
  },
  maxPrice: {
    EN: 'Max',
    TE: 'గరిష్ట',
    HI: 'अधिकतम',
  },
  modalPrice: {
    EN: 'Modal',
    TE: 'మోడల్',
    HI: 'मॉडल',
  },
  perQuintal: {
    EN: '₹/Quintal',
    TE: '₹/క్వింటాల్',
    HI: '₹/क्विंटल',
  },
  state: {
    EN: 'State',
    TE: 'రాష్ట్రం',
    HI: 'राज्य',
  },
  lastUpdated: {
    EN: 'Last updated',
    TE: 'చివరిగా నవీకరించబడింది',
    HI: 'अंतिम अपडेट',
  },
  noResults: {
    EN: 'No results found',
    TE: 'ఫలితాలు కనుగొనబడలేదు',
    HI: 'कोई परिणाम नहीं मिला',
  },
  allStates: {
    EN: 'All States',
    TE: 'అన్ని రాష్ట్రాలు',
    HI: 'सभी राज्य',
  },
  fetchingPrices: {
    EN: 'Fetching live mandi prices...',
    TE: 'లైవ్ మండి ధరలు తీసుకుంటోంది...',
    HI: 'लाइव मंडी भाव लोड हो रहे हैं...',
  },

  // ── Farm Ledger (Day 12) ──
  farmLedger: {
    EN: 'Farm Ledger',
    TE: 'వ్యవసాయ ఖాతా పుస్తకం',
    HI: 'खेती खाता बही',
  },

  // ── Task Manager ──
  taskManager: {
    EN: 'Task Manager',
    TE: 'పని నిర్వాహకుడు',
    HI: 'कार्य प्रबंधक',
  },
  taskManagerSubtitle: {
    EN: 'Track your daily farm tasks',
    TE: 'మీ రోజువారీ వ్యవసాయ పనులను ట్రాక్ చేయండి',
    HI: 'अपने दैनिक खेती के काम ट्रैक करें',
  },
  tabTasks: {
    EN: 'My Tasks',
    TE: 'నా పనులు',
    HI: 'मेरे कार्य',
  },
  tabCropCalendar: {
    EN: 'Crop Calendar',
    TE: 'పంట క్యాలెండర్',
    HI: 'फसल कैलेंडर',
  },
  sectionToday: {
    EN: 'Today',
    TE: 'ఈరోజు',
    HI: 'आज',
  },
  sectionUpcoming: {
    EN: 'Upcoming',
    TE: 'రాబోయే',
    HI: 'आगामी',
  },
  sectionOverdue: {
    EN: 'Overdue',
    TE: 'మీరిన గడువు',
    HI: 'समय सीमा पार',
  },
  sectionCompleted: {
    EN: 'Completed',
    TE: 'పూర్తయింది',
    HI: 'पूर्ण',
  },
  noTasksYet: {
    EN: 'No tasks yet. Tap + to add one.',
    TE: 'ఇంకా పనులు లేవు. జోడించడానికి + నొక్కండి.',
    HI: 'अभी कोई कार्य नहीं। जोड़ने के लिए + दबाएं।',
  },
  addTask: {
    EN: 'Add Task',
    TE: 'పని జోడించండి',
    HI: 'कार्य जोड़ें',
  },
  taskTitle: {
    EN: 'Task title',
    TE: 'పని శీర్షిక',
    HI: 'कार्य शीर्षक',
  },
  dueDate: {
    EN: 'Due date',
    TE: 'గడువు తేదీ',
    HI: 'नियत तारीख',
  },
  setReminder: {
    EN: 'Set reminder',
    TE: 'రిమైండర్ సెట్ చేయండి',
    HI: 'रिमाइंडर सेट करें',
  },
  save: {
    EN: 'Save',
    TE: 'సేవ్ చేయండి',
    HI: 'सहेजें',
  },
  cancel: {
    EN: 'Cancel',
    TE: 'రద్దు చేయండి',
    HI: 'रद्द करें',
  },
  delete: {
    EN: 'Delete',
    TE: 'తొలగించండి',
    HI: 'हटाएं',
  },
  addReminderTasks: {
    EN: 'Add reminder tasks',
    TE: 'రిమైండర్ పనులు జోడించండి',
    HI: 'रिमाइंडर कार्य जोड़ें',
  },
  seasonalTasksAdded: {
    EN: 'Seasonal tasks added to your list',
    TE: 'కాలానుగుణ పనులు మీ జాబితాకు జోడించబడ్డాయి',
    HI: 'मौसमी कार्य आपकी सूची में जोड़े गए',
  },
  sow: {
    EN: 'Sow',
    TE: 'విత్తడం',
    HI: 'बुवाई',
  },
  duration: {
    EN: 'Duration',
    TE: 'వ్యవధి',
    HI: 'अवधि',
  },
  harvest: {
    EN: 'Harvest',
    TE: 'కోత',
    HI: 'कटाई',
  },

  // ── Profile ──
  myProfile: {
    EN: 'My Profile',
    TE: 'నా ప్రొఫైల్',
    HI: 'मेरी प्रोफ़ाइल',
  },
  guestBadge: {
    EN: 'Guest',
    TE: 'అతిథి',
    HI: 'अतिथि',
  },
  totalTasksStat: {
    EN: 'Total Tasks',
    TE: 'మొత్తం పనులు',
    HI: 'कुल कार्य',
  },
  completedStat: {
    EN: 'Completed',
    TE: 'పూర్తయింది',
    HI: 'पूर्ण',
  },
  upcomingStat: {
    EN: 'Upcoming',
    TE: 'రాబోయేవి',
    HI: 'आगामी',
  },
  accountSection: {
    EN: 'Account',
    TE: 'ఖాతా',
    HI: 'खाता',
  },
  linkGoogleAccount: {
    EN: 'Sign in with Google',
    TE: 'Google తో సైన్ ఇన్ చేయండి',
    HI: 'Google से साइन इन करें',
  },
  linkGoogleHint: {
    EN: 'Sync your tasks across devices',
    TE: 'మీ పరికరాల్లో పనులను సమకాలీకరించండి',
    HI: 'अपने कार्यों को सभी डिवाइस पर सिंक करें',
  },
  signOut: {
    EN: 'Sign Out',
    TE: 'సైన్ అవుట్',
    HI: 'साइन आउट',
  },
  signOutConfirmTitle: {
    EN: 'Sign out?',
    TE: 'సైన్ అవుట్ చేయాలా?',
    HI: 'साइन आउट करें?',
  },
  preferencesSection: {
    EN: 'Preferences',
    TE: 'ప్రాధాన్యతలు',
    HI: 'प्राथमिकताएं',
  },
  languageLabel: {
    EN: 'Language',
    TE: 'భాష',
    HI: 'भाषा',
  },
  syncStatus: {
    EN: 'Sync Status',
    TE: 'సమకాలీకరణ స్థితి',
    HI: 'सिंक स्थिति',
  },
  onlineStatus: {
    EN: 'Online',
    TE: 'ఆన్‌లైన్',
    HI: 'ऑनलाइन',
  },
  offlineStatus: {
    EN: 'Offline',
    TE: 'ఆఫ్‌లైన్',
    HI: 'ऑफ़लाइन',
  },
};

// Helper function — tr(key, lang)
export const tr = (key, lang = 'EN') => {
  if (t[key] && t[key][lang]) return t[key][lang];
  if (t[key] && t[key]['EN']) return t[key]['EN'];
  return key;
};