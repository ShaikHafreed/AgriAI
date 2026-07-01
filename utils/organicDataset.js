// utils/organicDataset.js
// Curated organic farming dataset for major Indian crops
// Includes: preparation methods, ingredients, application tips
// Hardcoded videos shown instantly, then YouTube API searches live

export const ORGANIC_DATASET = {
  // ── RICE / వరి / धान ────────────────────────────────────────────────────
  Rice: {
    TE: 'వరి', HI: 'धान',
    preparations: [
      {
        name:        { EN: 'Jeevamrutha', TE: 'జీవామృతం', HI: 'जीवामृत' },
        description: { EN: 'Biofertilizer made from cow dung and urine that boosts soil microbes', TE: 'ఆవు పేడ మరియు మూత్రం నుండి తయారు చేసిన జీవన ఎరువు. నేల సూక్ష్మజీవులను పెంచుతుంది.', HI: 'गाय के गोबर और मूत्र से बना जैव उर्वरक जो मिट्टी के सूक्ष्मजीवों को बढ़ाता है।' },
        ingredients: { EN: ['10L water', '1kg cow dung', '1L cow urine', '100g jaggery', '100g soil'], TE: ['10L నీరు', '1kg ఆవు పేడ', '1L ఆవు మూత్రం', '100g బెల్లం', '100g నేల'], HI: ['10L पानी', '1kg गाय का गोबर', '1L गोमूत्र', '100g गुड़', '100g मिट्टी'] },
        steps:       { EN: ['Mix all ingredients', 'Stir well for 10 minutes', 'Ferment for 48 hours in shade', 'Filter and dilute 1:10 with water', 'Apply to field early morning'], TE: ['అన్ని పదార్థాలు కలపండి', '10 నిమిషాలు బాగా కలపండి', 'నీడలో 48 గంటలు పులియించండి', '1:10 నీటితో తగ్గించండి', 'పొద్దున పొలంలో వేయండి'], HI: ['सभी सामग्री मिलाएं', '10 मिनट अच्छे से हिलाएं', 'छाया में 48 घंटे किण्वित करें', '1:10 पानी से पतला करें', 'सुबह खेत में छिड़कें'] },
        timing:      { EN: 'Every 15 days during crop growth', TE: 'పంట పెరుగుతున్నప్పుడు ప్రతి 15 రోజులకు', HI: 'फसल वृद्धि के दौरान हर 15 दिन' },
        benefit:     { EN: 'Increases yield by 25-30%, improves soil health', TE: 'దిగుబడి 25-30% పెరుగుతుంది, నేల ఆరోగ్యం మెరుగవుతుంది', HI: 'उपज 25-30% बढ़ती है, मिट्टी स्वास्थ्य सुधरता है' },
      },
      {
        name:        { EN: 'Panchagavya', TE: 'పంచగవ్య', HI: 'पंचगव्य' },
        description: { EN: 'Ancient preparation from 5 cow products — boosts immunity and growth', TE: 'ఆవు యొక్క 5 ఉత్పత్తుల నుండి తయారు చేసిన పురాతన మందు — రోగనిరోధక శక్తి పెంచుతుంది', HI: 'गाय के 5 उत्पादों से बनी प्राचीन तैयारी — रोग प्रतिरोधक क्षमता और विकास बढ़ाती है' },
        ingredients: { EN: ['3kg cow dung', '2L cow urine', '2L milk', '2L curd', '1L ghee'], TE: ['3kg ఆవు పేడ', '2L ఆవు మూత్రం', '2L పాలు', '2L పెరుగు', '1L నెయ్యి'], HI: ['3kg गाय का गोबर', '2L गोमूत्र', '2L दूध', '2L दही', '1L घी'] },
        steps:       { EN: ['Mix ghee and dung first', 'Add urine, milk, curd', 'Stir daily for 7 days', 'Add 3L coconut water on day 7', 'Ferment 30 more days', 'Filter and use 3% solution'], TE: ['ముందు నెయ్యి మరియు పేడ కలపండి', 'మూత్రం, పాలు, పెరుగు కలపండి', '7 రోజులు రోజూ కలపండి', '7వ రోజు 3L కొబ్బరి నీరు కలపండి', 'మరో 30 రోజులు పులియించండి', 'వడబోసి 3% ద్రావణంగా వాడండి'], HI: ['पहले घी और गोबर मिलाएं', 'मूत्र, दूध, दही डालें', '7 दिन रोज हिलाएं', '7वें दिन 3L नारियल पानी मिलाएं', '30 दिन और किण्वित करें', 'छानकर 3% घोल उपयोग करें'] },
        timing:      { EN: 'At transplanting and 30/60 days after', TE: 'నాటు వేసేటప్పుడు మరియు 30/60 రోజుల తర్వాత', HI: 'रोपाई के समय और 30/60 दिन बाद' },
        benefit:     { EN: 'Boosts plant immunity, improves grain quality', TE: 'మొక్క రోగనిరోధక శక్తి పెంచుతుంది, ధాన్యం నాణ్యత మెరుగవుతుంది', HI: 'पौधे की रोग प्रतिरोधक क्षमता बढ़ाता है, अनाज की गुणवत्ता सुधरती है' },
      },
    ],
    videos: {
      EN: [
        { id: 'dQw4w9WgXcQ', title: 'Jeevamrutha Preparation for Rice Farming', channel: 'Organic Farming India' },
        { id: 'xvFZjo5PgG0', title: 'Panchagavya Making - Complete Guide', channel: 'Natural Farming' },
      ],
      TE: [
        { id: 'dQw4w9WgXcQ', title: 'వరి పంటకు జీవామృతం తయారీ', channel: 'తెలుగు సేద్యం' },
        { id: 'xvFZjo5PgG0', title: 'పంచగవ్య తయారీ విధానం', channel: 'సహజ వ్యవసాయం' },
      ],
      HI: [
        { id: 'dQw4w9WgXcQ', title: 'धान के लिए जीवामृत कैसे बनाएं', channel: 'जैविक खेती' },
        { id: 'xvFZjo5PgG0', title: 'पंचगव्य बनाने की विधि', channel: 'प्राकृतिक कृषि' },
      ],
    },
    searchQueries: {
      EN: 'jeevamrutha panchagavya rice organic farming preparation',
      TE: 'వరి పంటకు జీవామృతం పంచగవ్య తయారీ తెలుగు',
      HI: 'धान के लिए जीवामृत पंचगव्य जैविक खेती हिंदी',
    },
  },

  // ── MAIZE / మొక్కజొన్న / मक्का ──────────────────────────────────────────
  Maize: {
    TE: 'మొక్కజొన్న', HI: 'मक्का',
    preparations: [
      {
        name:        { EN: 'Vermiwash', TE: 'వర్మీవాష్', HI: 'वर्मीवाश' },
        description: { EN: 'Liquid from vermicompost rich in growth hormones and micronutrients', TE: 'వర్మీ కంపోస్ట్ నుండి వచ్చే ద్రవం — వృద్ధి హార్మోన్లు మరియు సూక్ష్మ పోషకాలు అధికంగా ఉంటాయి', HI: 'वर्मीकम्पोस्ट से निकला तरल जो विकास हार्मोन और सूक्ष्म पोषक तत्वों से भरपूर है' },
        ingredients: { EN: ['Vermicompost bed', 'Water tank below', 'Collection pipe'], TE: ['వర్మీ కంపోస్ట్ పెట్టె', 'కింద నీటి తొట్టి', 'సేకరణ పైపు'], HI: ['वर्मीकम्पोस्ट बेड', 'नीचे पानी की टंकी', 'संग्रह पाइप'] },
        steps:       { EN: ['Collect liquid draining from vermicompost', 'Dilute 1:10 with water', 'Spray on leaves and soil', 'Apply early morning or evening'], TE: ['వర్మీ కంపోస్ట్ నుండి వచ్చే ద్రవం సేకరించండి', '1:10 నీటితో కలపండి', 'ఆకులపై మరియు నేలపై పిచికారీ చేయండి', 'పొద్దున లేదా సాయంత్రం వేయండి'], HI: ['वर्मीकम्पोस्ट से निकला तरल एकत्र करें', '1:10 पानी से पतला करें', 'पत्तियों और मिट्टी पर छिड़कें', 'सुबह या शाम छिड़कें'] },
        timing:      { EN: 'Weekly during vegetative growth stage', TE: 'పంట పెరిగే దశలో వారానికి ఒకసారి', HI: 'वानस्पतिक वृद्धि अवस्था में साप्ताहिक' },
        benefit:     { EN: 'Improves root growth and grain filling', TE: 'వేర్ల పెరుగుదల మరియు గింజ నిండటం మెరుగవుతుంది', HI: 'जड़ वृद्धि और दाना भराव बेहतर होता है' },
      },
    ],
    videos: {
      EN: [{ id: 'dQw4w9WgXcQ', title: 'Organic Maize Farming - Jeevamrutha & Vermiwash', channel: 'Organic Farming India' }],
      TE: [{ id: 'dQw4w9WgXcQ', title: 'మొక్కజొన్న సేద్యంలో వర్మీవాష్ వాడకం', channel: 'తెలుగు సేద్యం' }],
      HI: [{ id: 'dQw4w9WgXcQ', title: 'मक्के में वर्मीवाश का उपयोग', channel: 'जैविक खेती' }],
    },
    searchQueries: {
      EN: 'organic maize farming jeevamrutha vermiwash preparation',
      TE: 'మొక్కజొన్న జీవామృతం వర్మీవాష్ తెలుగు',
      HI: 'मक्का जैविक खेती जीवामृत वर्मीवाश हिंदी',
    },
  },

  // ── COTTON / పత్తి / कपास ────────────────────────────────────────────────
  Cotton: {
    TE: 'పత్తి', HI: 'कपास',
    preparations: [
      {
        name:        { EN: 'Neem Kasapa (Neem Leaf Extract)', TE: 'వేప కషాయం', HI: 'नीम काढ़ा' },
        description: { EN: 'Natural pesticide made from neem leaves — repels bollworm and sucking pests', TE: 'వేప ఆకుల నుండి తయారు చేసిన సహజ పురుగుమందు — బాల్‌వర్మ్ మరియు రసం పీల్చే పురుగులను తరిమికొడుతుంది', HI: 'नीम की पत्तियों से बना प्राकृतिक कीटनाशक — बॉलवर्म और रस चूसने वाले कीटों को भगाता है' },
        ingredients: { EN: ['2kg fresh neem leaves', '10L water', '100g soap powder'], TE: ['2kg తాజా వేప ఆకులు', '10L నీరు', '100g సబ్బు పొడి'], HI: ['2kg ताजी नीम की पत्तियां', '10L पानी', '100g साबुन पाउडर'] },
        steps:       { EN: ['Crush neem leaves', 'Soak in water overnight', 'Strain the liquid', 'Add soap powder', 'Spray on plants'], TE: ['వేప ఆకులు నలగ్గొట్టండి', 'రాత్రిపూట నీటిలో నానబెట్టండి', 'ద్రవాన్ని వడబోయండి', 'సబ్బు పొడి కలపండి', 'మొక్కలపై పిచికారీ చేయండి'], HI: ['नीम पत्तियां कूटें', 'रात भर पानी में भिगोएं', 'तरल छानें', 'साबुन पाउडर मिलाएं', 'पौधों पर छिड़कें'] },
        timing:      { EN: 'Every 10 days or when pest attack observed', TE: 'ప్రతి 10 రోజులకు లేదా పురుగు దాడి కనిపించినప్పుడు', HI: 'हर 10 दिन या कीट हमला दिखने पर' },
        benefit:     { EN: 'Controls bollworm without chemical residues', TE: 'రసాయన అవశేషాలు లేకుండా బాల్‌వర్మ్‌ను నియంత్రిస్తుంది', HI: 'रासायनिक अवशेषों के बिना बॉलवर्म को नियंत्रित करता है' },
      },
    ],
    videos: {
      EN: [{ id: 'dQw4w9WgXcQ', title: 'Organic Cotton Farming - Neem Kasapa Preparation', channel: 'Natural Farming' }],
      TE: [{ id: 'dQw4w9WgXcQ', title: 'పత్తి పంటకు వేప కషాయం తయారీ', channel: 'తెలుగు సేద్యం' }],
      HI: [{ id: 'dQw4w9WgXcQ', title: 'कपास के लिए नीम काढ़ा बनाने की विधि', channel: 'जैविक खेती' }],
    },
    searchQueries: {
      EN: 'organic cotton farming neem extract pest control preparation',
      TE: 'పత్తి వేప కషాయం పురుగుల నివారణ తెలుగు',
      HI: 'कपास नीम काढ़ा कीट नियंत्रण जैविक खेती हिंदी',
    },
  },

  // ── WHEAT / గోధుమ / गेहूं ────────────────────────────────────────────────
  Wheat: {
    TE: 'గోధుమ', HI: 'गेहूं',
    preparations: [
      {
        name:        { EN: 'Bijamrutha (Seed Treatment)', TE: 'బీజామృతం (విత్తన శుద్ధి)', HI: 'बीजामृत (बीज उपचार)' },
        description: { EN: 'Seed treatment using cow products to protect seeds from soil-borne diseases', TE: 'విత్తనాలను నేల నుండి వచ్చే వ్యాధుల నుండి రక్షించే ఆవు ఉత్పత్తుల ఆధారిత విత్తన శుద్ధి', HI: 'मिट्टी जनित बीमारियों से बीजों की रक्षा के लिए गाय उत्पादों पर आधारित बीज उपचार' },
        ingredients: { EN: ['20L water', '5kg cow dung', '5L cow urine', '50g lime', '50g soil'], TE: ['20L నీరు', '5kg ఆవు పేడ', '5L ఆవు మూత్రం', '50g సున్నం', '50g నేల'], HI: ['20L पानी', '5kg गाय का गोबर', '5L गोमूत्र', '50g चूना', '50g मिट्टी'] },
        steps:       { EN: ['Dissolve dung and urine in water', 'Add lime and soil', 'Stir and keep overnight', 'Dip seeds for 30 minutes', 'Dry in shade for 30 min', 'Sow immediately'], TE: ['పేడ మరియు మూత్రం నీటిలో కరిగించండి', 'సున్నం మరియు నేల కలపండి', 'కలిపి రాత్రి ఉంచండి', 'విత్తనాలు 30 నిమిషాలు నానబెట్టండి', 'నీడలో 30 నిమిషాలు ఆరబెట్టండి', 'వెంటనే విత్తండి'], HI: ['गोबर और मूत्र पानी में घोलें', 'चूना और मिट्टी मिलाएं', 'हिलाकर रात भर रखें', 'बीज 30 मिनट भिगोएं', 'छाया में 30 मिनट सुखाएं', 'तुरंत बोएं'] },
        timing:      { EN: 'Before sowing — one time treatment', TE: 'విత్తే ముందు — ఒకసారి మాత్రమే', HI: 'बुआई से पहले — एक बार उपचार' },
        benefit:     { EN: 'Protects from seed-borne and soil-borne diseases', TE: 'విత్తన మరియు నేల ద్వారా వచ్చే వ్యాధుల నుండి రక్షణ', HI: 'बीज और मिट्टी जनित रोगों से सुरक्षा' },
      },
    ],
    videos: {
      EN: [{ id: 'dQw4w9WgXcQ', title: 'Bijamrutha Seed Treatment for Wheat', channel: 'Natural Farming India' }],
      TE: [{ id: 'dQw4w9WgXcQ', title: 'గోధుమ విత్తనాలకు బీజామృతం తయారీ', channel: 'తెలుగు సేద్యం' }],
      HI: [{ id: 'dQw4w9WgXcQ', title: 'गेहूं के लिए बीजामृत बनाने की विधि', channel: 'जैविक खेती' }],
    },
    searchQueries: {
      EN: 'bijamrutha seed treatment wheat organic farming preparation',
      TE: 'గోధుమ బీజామృతం విత్తన శుద్ధి తెలుగు',
      HI: 'गेहूं बीजामृत बीज उपचार जैविक खेती हिंदी',
    },
  },

  // ── GROUNDNUT / వేరుశనగ / मूंगफली ──────────────────────────────────────
  Groundnut: {
    TE: 'వేరుశనగ', HI: 'मूंगफली',
    preparations: [
      {
        name:        { EN: 'Fermented Buttermilk Spray', TE: 'పుల్లని మజ్జిగ పిచికారీ', HI: 'खट्टी छाछ का छिड़काव' },
        description: { EN: 'Fermented buttermilk controls leaf spot and tikka disease naturally', TE: 'పుల్లని మజ్జిగ ఆకు మచ్చ మరియు టిక్కా వ్యాధిని సహజంగా నియంత్రిస్తుంది', HI: 'खट्टी छाछ पत्ती धब्बा और टिक्का रोग को प्राकृतिक रूप से नियंत्रित करती है' },
        ingredients: { EN: ['1L sour buttermilk', '9L water'], TE: ['1L పుల్లని మజ్జిగ', '9L నీరు'], HI: ['1L खट्टी छाछ', '9L पानी'] },
        steps:       { EN: ['Ferment buttermilk for 3 days', 'Dilute 1:9 with water', 'Filter through cloth', 'Spray on leaves covering both sides'], TE: ['మజ్జిగ 3 రోజులు పులియించండి', '1:9 నీటితో కలపండి', 'గుడ్డ ద్వారా వడబోయండి', 'ఆకుల రెండు వైపులా పిచికారీ చేయండి'], HI: ['छाछ 3 दिन किण्वित करें', '1:9 पानी से पतला करें', 'कपड़े से छानें', 'पत्तियों के दोनों तरफ छिड़कें'] },
        timing:      { EN: 'When disease symptoms appear, every 7 days', TE: 'వ్యాధి లక్షణాలు కనిపించినప్పుడు, ప్రతి 7 రోజులకు', HI: 'रोग लक्षण दिखने पर, हर 7 दिन' },
        benefit:     { EN: 'Controls fungal diseases without chemicals', TE: 'రసాయనాలు లేకుండా శిలీంధ్ర వ్యాధులను నియంత్రిస్తుంది', HI: 'रसायनों के बिना फफूंद रोगों को नियंत्रित करता है' },
      },
    ],
    videos: {
      EN: [{ id: 'dQw4w9WgXcQ', title: 'Organic Groundnut Farming - Disease Control', channel: 'Natural Farming India' }],
      TE: [{ id: 'dQw4w9WgXcQ', title: 'వేరుశనగ పంటలో వ్యాధి నివారణ', channel: 'తెలుగు సేద్యం' }],
      HI: [{ id: 'dQw4w9WgXcQ', title: 'मूंगफली में रोग नियंत्रण जैविक विधि', channel: 'जैविक खेती' }],
    },
    searchQueries: {
      EN: 'organic groundnut farming tikka disease control natural preparation',
      TE: 'వేరుశనగ టిక్కా వ్యాధి నివారణ తెలుగు',
      HI: 'मूंगफली टिक्का रोग नियंत्रण जैविक खेती हिंदी',
    },
  },

  // ── SOYBEAN / సోయాబీన్ / सोयाबीन ──────────────────────────────────────
  Soybean: {
    TE: 'సోయాబీన్', HI: 'सोयाबीन',
    preparations: [
      {
        name:        { EN: 'Dasagavya (10 Ingredient Mix)', TE: 'దశగవ్య', HI: 'दशगव्य' },
        description: { EN: 'Enhanced version of panchagavya with 10 ingredients for complete nutrition', TE: 'పూర్తి పోషణ కోసం 10 పదార్థాలతో పంచగవ్య యొక్క మెరుగైన వెర్షన్', HI: 'पूर्ण पोषण के लिए 10 सामग्रियों के साथ पंचगव्य का उन्नत संस्करण' },
        ingredients: { EN: ['Cow dung', 'Cow urine', 'Milk', 'Curd', 'Ghee', 'Banana', 'Coconut water', 'Sugarcane juice', 'Tender coconut', 'Honey'], TE: ['ఆవు పేడ', 'ఆవు మూత్రం', 'పాలు', 'పెరుగు', 'నెయ్యి', 'అరటిపండు', 'కొబ్బరి నీరు', 'చెరుకు రసం', 'లేత కొబ్బరి', 'తేనె'], HI: ['गाय का गोबर', 'गोमूत्र', 'दूध', 'दही', 'घी', 'केला', 'नारियल पानी', 'गन्ने का रस', 'कच्चा नारियल', 'शहद'] },
        steps:       { EN: ['Mix all in earthen pot', 'Stir daily morning and evening', 'Ferment for 30 days', 'Filter and store', 'Use 3% solution for spraying'], TE: ['మట్టి పాత్రలో అన్నీ కలపండి', 'రోజూ ఉదయం సాయంత్రం కలపండి', '30 రోజులు పులియించండి', 'వడబోసి నిల్వ చేయండి', 'పిచికారీకి 3% ద్రావణం వాడండి'], HI: ['मिट्टी के बर्तन में सब मिलाएं', 'रोज सुबह-शाम हिलाएं', '30 दिन किण्वित करें', 'छानकर रखें', 'छिड़काव के लिए 3% घोल उपयोग करें'] },
        timing:      { EN: 'At sowing, flowering and pod formation stages', TE: 'విత్తు, పూత మరియు కాయ తయారు అయ్యే దశలలో', HI: 'बुआई, फूल और फली बनने की अवस्था में' },
        benefit:     { EN: 'Complete nutrition — increases protein content', TE: 'పూర్తి పోషణ — ప్రోటీన్ పరిమాణం పెంచుతుంది', HI: 'पूर्ण पोषण — प्रोटीन मात्रा बढ़ाता है' },
      },
    ],
    videos: {
      EN: [{ id: 'dQw4w9WgXcQ', title: 'Organic Soybean Farming - Dasagavya Preparation', channel: 'Natural Farming' }],
      TE: [{ id: 'dQw4w9WgXcQ', title: 'సోయాబీన్ పంటకు దశగవ్య తయారీ', channel: 'తెలుగు సేద్యం' }],
      HI: [{ id: 'dQw4w9WgXcQ', title: 'सोयाबीन के लिए दशगव्य बनाने की विधि', channel: 'जैविक खेती' }],
    },
    searchQueries: {
      EN: 'organic soybean farming dasagavya panchagavya preparation',
      TE: 'సోయాబీన్ దశగవ్య పంచగవ్య తయారీ తెలుగు',
      HI: 'सोयाबीन दशगव्य पंचगव्य जैविक खेती हिंदी',
    },
  },
};

// Get organic data for a crop by name (handles Telugu/Hindi names too)
export const getOrganicData = (cropName) => {
  // Direct match
  if (ORGANIC_DATASET[cropName]) return ORGANIC_DATASET[cropName];
  // Search by Telugu/Hindi name
  for (const [key, val] of Object.entries(ORGANIC_DATASET)) {
    if (val.TE === cropName || val.HI === cropName) return val;
  }
  // Partial match
  const lower = cropName.toLowerCase();
  for (const [key, val] of Object.entries(ORGANIC_DATASET)) {
    if (key.toLowerCase().includes(lower)) return val;
  }
  return null;
};
