// utils/govtSchemes.js
// Curated dataset of major Indian central government farming schemes.
// Same shape/pattern as utils/organicDataset.js — EN/TE/HI per field.
// officialLink points at the specific scheme site where confidently known,
// otherwise the official cross-scheme portal (myscheme.gov.in).

export const GOVT_SCHEMES = [
  {
    key: 'pmkisan',
    icon: '💵',
    name: { EN: 'PM-KISAN', TE: 'పీఎం-కిసాన్', HI: 'पीएम-किसान' },
    fullName: {
      EN: 'Pradhan Mantri Kisan Samman Nidhi',
      TE: 'ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి',
      HI: 'प्रधानमंत्री किसान सम्मान निधि',
    },
    description: {
      EN: 'Direct income support of ₹6,000 per year, paid in three ₹2,000 installments directly to bank accounts.',
      TE: 'ప్రతి సంవత్సరం ₹6,000 ప్రత్యక్ష ఆదాయ మద్దతు, మూడు ₹2,000 వాయిదాలలో బ్యాంకు ఖాతాలోకి నేరుగా జమ చేయబడుతుంది.',
      HI: '₹6,000 प्रति वर्ष की प्रत्यक्ष आय सहायता, तीन ₹2,000 की किस्तों में सीधे बैंक खाते में।',
    },
    eligibility: {
      EN: ['Small and marginal landholding farmer families', 'Valid land records in the farmer\'s name', 'Aadhaar-linked bank account'],
      TE: ['చిన్న మరియు సన్నకారు భూమి కలిగిన రైతు కుటుంబాలు', 'రైతు పేరు మీద చెల్లుబాటు అయ్యే భూమి రికార్డులు', 'ఆధార్-లింక్ చేసిన బ్యాంకు ఖాతా'],
      HI: ['छोटे और सीमांत भूमिधारक किसान परिवार', 'किसान के नाम वैध भूमि रिकॉर्ड', 'आधार-लिंक बैंक खाता'],
    },
    howToApply: {
      EN: ['Visit the PM-KISAN portal or nearest Common Service Centre (CSC)', 'Register with Aadhaar, bank, and land details', 'Get your status verified by the local revenue officer'],
      TE: ['PM-KISAN పోర్టల్ లేదా సమీప కామన్ సర్వీస్ సెంటర్ (CSC)ని సందర్శించండి', 'ఆధార్, బ్యాంకు మరియు భూమి వివరాలతో నమోదు చేసుకోండి', 'స్థానిక రెవెన్యూ అధికారి ద్వారా మీ స్థితిని ధృవీకరించుకోండి'],
      HI: ['PM-KISAN पोर्टल या नज़दीकी कॉमन सर्विस सेंटर (CSC) पर जाएं', 'आधार, बैंक और भूमि विवरण के साथ पंजीकरण करें', 'स्थानीय राजस्व अधिकारी से स्थिति सत्यापित कराएं'],
    },
    officialLink: 'https://pmkisan.gov.in',
  },
  {
    key: 'pmfby',
    icon: '🌾',
    name: { EN: 'PMFBY', TE: 'పీఎంఎఫ్‌బీవై', HI: 'पीएमएफबीवाई' },
    fullName: {
      EN: 'Pradhan Mantri Fasal Bima Yojana',
      TE: 'ప్రధాన మంత్రి ఫసల్ బీమా యోజన',
      HI: 'प्रधानमंत्री फसल बीमा योजना',
    },
    description: {
      EN: 'Crop insurance against yield loss from natural calamities, pests, and diseases — at very low farmer premiums.',
      TE: 'ప్రకృతి వైపరీత్యాలు, పురుగులు మరియు వ్యాధుల వల్ల కలిగే దిగుబడి నష్టానికి పంట బీమా — చాలా తక్కువ రైతు ప్రీమియంతో.',
      HI: 'प्राकृतिक आपदाओं, कीटों और बीमारियों से उपज हानि के विरुद्ध फसल बीमा — बहुत कम किसान प्रीमियम पर।',
    },
    eligibility: {
      EN: ['All farmers growing notified crops in notified areas', 'Both loanee and non-loanee farmers can apply', 'Premium: 2% (Kharif), 1.5% (Rabi), 5% (commercial/horticulture)'],
      TE: ['నోటిఫై చేసిన ప్రాంతాల్లో నోటిఫై చేసిన పంటలు పండించే రైతులందరూ', 'రుణం తీసుకున్న మరియు తీసుకోని రైతులు ఇద్దరూ దరఖాస్తు చేసుకోవచ్చు', 'ప్రీమియం: 2% (ఖరీఫ్), 1.5% (రబీ), 5% (వాణిజ్య/ఉద్యానవన)'],
      HI: ['अधिसूचित क्षेत्रों में अधिसूचित फसल उगाने वाले सभी किसान', 'ऋणी और गैर-ऋणी दोनों किसान आवेदन कर सकते हैं', 'प्रीमियम: 2% (खरीफ), 1.5% (रबी), 5% (वाणिज्यिक/बागवानी)'],
    },
    howToApply: {
      EN: ['Apply via the PMFBY portal, nearest bank, or CSC', 'Submit land records and sowing declaration before the cutoff date', 'Claims are settled automatically using yield/weather data'],
      TE: ['PMFBY పోర్టల్, సమీప బ్యాంకు లేదా CSC ద్వారా దరఖాస్తు చేసుకోండి', 'గడువు తేదీలోపు భూమి రికార్డులు మరియు విత్తన ప్రకటన సమర్పించండి', 'దిగుబడి/వాతావరణ డేటా ఉపయోగించి క్లెయిమ్‌లు స్వయంచాలకంగా పరిష్కరించబడతాయి'],
      HI: ['PMFBY पोर्टल, नज़दीकी बैंक या CSC के माध्यम से आवेदन करें', 'अंतिम तिथि से पहले भूमि रिकॉर्ड और बुवाई घोषणा जमा करें', 'दावों का निपटान उपज/मौसम डेटा से स्वचालित रूप से होता है'],
    },
    officialLink: 'https://pmfby.gov.in',
  },
  {
    key: 'kcc',
    icon: '💳',
    name: { EN: 'Kisan Credit Card', TE: 'కిసాన్ క్రెడిట్ కార్డ్', HI: 'किसान क्रेडिट कार्ड' },
    fullName: { EN: 'Kisan Credit Card (KCC)', TE: 'కిసాన్ క్రెడిట్ కార్డ్ (KCC)', HI: 'किसान क्रेडिट कार्ड (KCC)' },
    description: {
      EN: 'Short-term credit for crop production, at subsidized interest rates, through a simple card-based system.',
      TE: 'పంట ఉత్పత్తి కోసం రాయితీ వడ్డీ రేట్లతో స్వల్పకాలిక రుణం, సాధారణ కార్డు ఆధారిత విధానం ద్వారా.',
      HI: 'फसल उत्पादन के लिए रियायती ब्याज दरों पर अल्पकालिक ऋण, एक सरल कार्ड-आधारित प्रणाली के माध्यम से।',
    },
    eligibility: {
      EN: ['Farmers (owner-cultivators, tenant farmers, sharecroppers)', 'Members of Self-Help Groups (SHGs) or Joint Liability Groups', 'Fishery and animal husbandry farmers also covered'],
      TE: ['రైతులు (యజమాని-సాగుదారులు, కౌలు రైతులు, భాగస్వామ్య రైతులు)', 'స్వయం సహాయక బృందాలు (SHG) లేదా జాయింట్ లయబిలిటీ గ్రూప్ సభ్యులు', 'మత్స్య మరియు పశుపోషణ రైతులు కూడా చేర్చబడ్డారు'],
      HI: ['किसान (मालिक-कृषक, किरायेदार किसान, बटाईदार)', 'स्वयं सहायता समूह (SHG) या संयुक्त देयता समूह के सदस्य', 'मत्स्य पालन और पशुपालन करने वाले किसान भी शामिल'],
    },
    howToApply: {
      EN: ['Apply at any nearby bank branch (public, private, or cooperative)', 'Submit identity, address, and land ownership/tenancy proof', 'Card is typically issued within 2 weeks of a complete application'],
      TE: ['సమీపంలోని ఏదైనా బ్యాంకు శాఖలో దరఖాస్తు చేసుకోండి (ప్రభుత్వ, ప్రైవేట్, లేదా సహకార)', 'గుర్తింపు, చిరునామా మరియు భూమి యాజమాన్యం/కౌలు రుజువు సమర్పించండి', 'పూర్తి దరఖాస్తు అయిన 2 వారాలలో సాధారణంగా కార్డు జారీ చేయబడుతుంది'],
      HI: ['किसी भी नज़दीकी बैंक शाखा (सरकारी, निजी, या सहकारी) में आवेदन करें', 'पहचान, पता और भूमि स्वामित्व/किरायेदारी प्रमाण जमा करें', 'पूर्ण आवेदन के आमतौर पर 2 सप्ताह के भीतर कार्ड जारी होता है'],
    },
    officialLink: 'https://www.myscheme.gov.in',
  },
  {
    key: 'soilhealth',
    icon: '🧪',
    name: { EN: 'Soil Health Card', TE: 'నేల ఆరోగ్య కార్డు', HI: 'मृदा स्वास्थ्य कार्ड' },
    fullName: { EN: 'Soil Health Card Scheme', TE: 'నేల ఆరోగ్య కార్డు పథకం', HI: 'मृदा स्वास्थ्य कार्ड योजना' },
    description: {
      EN: 'Free soil testing every 2 years with a report on nutrient status and fertilizer/amendment recommendations for your specific field.',
      TE: 'ప్రతి 2 సంవత్సరాలకు ఉచిత నేల పరీక్ష — పోషక స్థితి మరియు మీ నిర్దిష్ట పొలానికి ఎరువుల సిఫార్సులతో కూడిన నివేదిక.',
      HI: 'हर 2 साल में मुफ्त मृदा परीक्षण — पोषक तत्व स्थिति और आपके विशिष्ट खेत के लिए उर्वरक सिफारिशों के साथ रिपोर्ट।',
    },
    eligibility: {
      EN: ['All farmers, regardless of landholding size', 'One card issued per land parcel/survey number'],
      TE: ['భూమి పరిమాణంతో సంబంధం లేకుండా రైతులందరూ', 'ప్రతి భూమి ముక్క/సర్వే నంబర్‌కు ఒక కార్డు జారీ చేయబడుతుంది'],
      HI: ['भूमि के आकार से बेखबर सभी किसान', 'प्रति भूमि खंड/सर्वे नंबर एक कार्ड जारी'],
    },
    howToApply: {
      EN: ['Contact your local Agriculture Department office or Krishi Vigyan Kendra', 'Soil samples are collected from your field by department staff', 'Card with results and crop-wise recommendations is delivered after lab testing'],
      TE: ['మీ స్థానిక వ్యవసాయ శాఖ కార్యాలయం లేదా కృషి విజ్ఞాన కేంద్రాన్ని సంప్రదించండి', 'శాఖ సిబ్బంది మీ పొలం నుండి నేల నమూనాలు సేకరిస్తారు', 'ల్యాబ్ పరీక్ష తర్వాత ఫలితాలు మరియు పంట వారీ సిఫార్సులతో కార్డు అందించబడుతుంది'],
      HI: ['अपने स्थानीय कृषि विभाग कार्यालय या कृषि विज्ञान केंद्र से संपर्क करें', 'विभाग के कर्मचारी आपके खेत से मिट्टी के नमूने एकत्र करते हैं', 'लैब जांच के बाद परिणाम और फसल-वार सिफारिशों वाला कार्ड दिया जाता है'],
    },
    officialLink: 'https://soilhealth.dac.gov.in',
  },
  {
    key: 'pmkusum',
    icon: '☀️',
    name: { EN: 'PM-KUSUM', TE: 'పీఎం-కుసుమ్', HI: 'पीएम-कुसुम' },
    fullName: {
      EN: 'PM Kisan Urja Suraksha evam Utthaan Mahabhiyan',
      TE: 'పీఎం కిసాన్ ఊర్జా సురక్ష ఏవం ఉత్థాన్ మహాభియాన్',
      HI: 'पीएम किसान ऊर्जा सुरक्षा एवं उत्थान महाभियान',
    },
    description: {
      EN: 'Subsidy (up to 60%) for installing solar-powered irrigation pumps, reducing diesel/electricity costs and providing an extra income stream from surplus solar power.',
      TE: 'సోలార్ ఆధారిత సాగునీటి పంపుల ఏర్పాటుకు రాయితీ (60% వరకు), డీజిల్/విద్యుత్ ఖర్చులు తగ్గించి, మిగులు సోలార్ విద్యుత్ నుండి అదనపు ఆదాయాన్ని అందిస్తుంది.',
      HI: 'सोलर सिंचाई पंप लगाने के लिए सब्सिडी (60% तक), डीजल/बिजली की लागत कम करना और अतिरिक्त सोलर बिजली से अतिरिक्त आय।',
    },
    eligibility: {
      EN: ['Individual farmers, cooperatives, and farmer producer organizations', 'Panchayats and water user associations (for community pumps)', 'Land should have grid connectivity or be suitable for standalone solar pumps'],
      TE: ['వ్యక్తిగత రైతులు, సహకార సంఘాలు మరియు రైతు ఉత్పత్తిదారుల సంస్థలు', 'పంచాయతీలు మరియు నీటి వినియోగదారుల సంఘాలు (సామాజిక పంపుల కోసం)', 'భూమికి గ్రిడ్ కనెక్టివిటీ ఉండాలి లేదా స్వతంత్ర సోలార్ పంపులకు అనుకూలంగా ఉండాలి'],
      HI: ['व्यक्तिगत किसान, सहकारी समितियां और किसान उत्पादक संगठन', 'पंचायतें और जल उपयोगकर्ता संघ (सामुदायिक पंपों के लिए)', 'भूमि में ग्रिड कनेक्टिविटी हो या स्टैंडअलोन सोलर पंप के लिए उपयुक्त हो'],
    },
    howToApply: {
      EN: ['Apply through your state renewable energy development agency portal', 'Submit land and electricity connection details', 'Subsidy is applied at installation; balance paid by the farmer/bank loan'],
      TE: ['మీ రాష్ట్ర పునరుత్పాదక ఇంధన అభివృద్ధి సంస్థ పోర్టల్ ద్వారా దరఖాస్తు చేసుకోండి', 'భూమి మరియు విద్యుత్ కనెక్షన్ వివరాలు సమర్పించండి', 'రాయితీ ఏర్పాటు సమయంలో వర్తింపజేయబడుతుంది; మిగిలిన మొత్తం రైతు/బ్యాంకు రుణం ద్వారా చెల్లించబడుతుంది'],
      HI: ['अपने राज्य की नवीकरणीय ऊर्जा विकास एजेंसी पोर्टल के माध्यम से आवेदन करें', 'भूमि और बिजली कनेक्शन विवरण जमा करें', 'सब्सिडी स्थापना पर लागू होती है; शेष राशि किसान/बैंक ऋण से चुकाई जाती है'],
    },
    officialLink: 'https://mnre.gov.in',
  },
  {
    key: 'enam',
    icon: '📱',
    name: { EN: 'e-NAM', TE: 'ఇ-నామ్', HI: 'ई-नाम' },
    fullName: {
      EN: 'National Agriculture Market',
      TE: 'జాతీయ వ్యవసాయ మార్కెట్',
      HI: 'राष्ट्रीय कृषि बाज़ार',
    },
    description: {
      EN: 'Online trading platform connecting existing mandis, letting farmers sell produce to buyers anywhere in the country for better, more transparent prices.',
      TE: 'ఇప్పటికే ఉన్న మండీలను కలిపే ఆన్‌లైన్ ట్రేడింగ్ ప్లాట్‌ఫారమ్, రైతులు దేశంలో ఎక్కడైనా కొనుగోలుదారులకు తమ ఉత్పత్తులను మెరుగైన, పారదర్శకమైన ధరలకు విక్రయించగలరు.',
      HI: 'मौजूदा मंडियों को जोड़ने वाला ऑनलाइन ट्रेडिंग प्लेटफॉर्म, जिससे किसान देश में कहीं भी खरीदारों को बेहतर, अधिक पारदर्शी कीमतों पर उपज बेच सकते हैं।',
    },
    eligibility: {
      EN: ['Farmers registered with a participating APMC mandi', 'Traders and buyers licensed under the respective state\'s APMC Act'],
      TE: ['పాల్గొంటున్న APMC మండీలో నమోదు చేసుకున్న రైతులు', 'సంబంధిత రాష్ట్ర APMC చట్టం కింద లైసెన్స్ పొందిన వ్యాపారులు మరియు కొనుగోలుదారులు'],
      HI: ['भाग लेने वाली APMC मंडी में पंजीकृत किसान', 'संबंधित राज्य के APMC अधिनियम के तहत लाइसेंस प्राप्त व्यापारी और खरीदार'],
    },
    howToApply: {
      EN: ['Register free at your nearest e-NAM-integrated mandi', 'Get your produce quality-tested and lot uploaded online', 'Receive payment directly to your bank account after the online auction'],
      TE: ['మీ సమీపంలోని e-NAM-ఇంటిగ్రేటెడ్ మండీలో ఉచితంగా నమోదు చేసుకోండి', 'మీ ఉత్పత్తి నాణ్యత పరీక్షించి, లాట్ ఆన్‌లైన్‌లో అప్‌లోడ్ చేయించుకోండి', 'ఆన్‌లైన్ వేలం తర్వాత మీ బ్యాంకు ఖాతాలోకి నేరుగా చెల్లింపు పొందండి'],
      HI: ['अपनी नज़दीकी e-NAM-एकीकृत मंडी में मुफ्त पंजीकरण करें', 'अपनी उपज की गुणवत्ता जांच कराएं और लॉट ऑनलाइन अपलोड कराएं', 'ऑनलाइन नीलामी के बाद सीधे अपने बैंक खाते में भुगतान प्राप्त करें'],
    },
    officialLink: 'https://enam.gov.in',
  },
  {
    key: 'pmkmy',
    icon: '👵',
    name: { EN: 'PM Kisan Maandhan', TE: 'పీఎం కిసాన్ మాన్‌ధన్', HI: 'पीएम किसान मानधन' },
    fullName: {
      EN: 'Pradhan Mantri Kisan Maandhan Yojana',
      TE: 'ప్రధాన మంత్రి కిసాన్ మాన్‌ధన్ యోజన',
      HI: 'प्रधानमंत्री किसान मानधन योजना',
    },
    description: {
      EN: 'Voluntary pension scheme for small and marginal farmers — ₹3,000/month after age 60, with the government matching the farmer\'s monthly contribution.',
      TE: 'చిన్న మరియు సన్నకారు రైతుల కోసం స్వచ్ఛంద పింఛను పథకం — 60 సంవత్సరాల తర్వాత నెలకు ₹3,000, ప్రభుత్వం రైతు నెలవారీ చెల్లింపుకు సమానంగా జమ చేస్తుంది.',
      HI: 'छोटे और सीमांत किसानों के लिए स्वैच्छिक पेंशन योजना — 60 वर्ष की आयु के बाद ₹3,000/माह, सरकार किसान के मासिक अंशदान के बराबर राशि जोड़ती है।',
    },
    eligibility: {
      EN: ['Small/marginal farmers aged 18-40 with up to 2 hectares of land', 'Not already covered under another statutory pension scheme', 'Monthly contribution ranges ₹55-₹200 depending on entry age'],
      TE: ['18-40 సంవత్సరాల వయస్సు, 2 హెక్టార్ల వరకు భూమి ఉన్న చిన్న/సన్నకారు రైతులు', 'ఇప్పటికే మరొక చట్టబద్ధమైన పింఛను పథకం కింద చేర్చబడకుండా ఉండాలి', 'ప్రవేశ వయస్సును బట్టి నెలవారీ చెల్లింపు ₹55-₹200 వరకు ఉంటుంది'],
      HI: ['18-40 वर्ष की आयु और 2 हेक्टेयर तक भूमि वाले छोटे/सीमांत किसान', 'किसी अन्य वैधानिक पेंशन योजना के अंतर्गत कवर न हों', 'प्रवेश आयु के अनुसार मासिक अंशदान ₹55-₹200 तक'],
    },
    howToApply: {
      EN: ['Enroll at the nearest Common Service Centre with Aadhaar and savings bank account', 'Choose monthly contribution based on your age at entry', 'Contribution can be auto-debited from your bank account'],
      TE: ['ఆధార్ మరియు పొదుపు బ్యాంకు ఖాతాతో సమీప కామన్ సర్వీస్ సెంటర్‌లో నమోదు చేసుకోండి', 'ప్రవేశ వయస్సు ఆధారంగా నెలవారీ చెల్లింపును ఎంచుకోండి', 'చెల్లింపు మీ బ్యాంకు ఖాతా నుండి ఆటో-డెబిట్ చేయవచ్చు'],
      HI: ['आधार और बचत बैंक खाते के साथ नज़दीकी कॉमन सर्विस सेंटर पर नामांकन करें', 'प्रवेश आयु के आधार पर मासिक अंशदान चुनें', 'अंशदान आपके बैंक खाते से ऑटो-डेबिट किया जा सकता है'],
    },
    officialLink: 'https://www.myscheme.gov.in',
  },
  {
    key: 'pkvy',
    icon: '🌿',
    name: { EN: 'PKVY (Organic Farming)', TE: 'పీకేవీవై (సేంద్రీయ వ్యవసాయం)', HI: 'पीकेवीवाई (जैविक खेती)' },
    fullName: {
      EN: 'Paramparagat Krishi Vikas Yojana',
      TE: 'పరంపరాగత్ కృషి వికాస్ యోజన',
      HI: 'परंपरागत कृषि विकास योजना',
    },
    description: {
      EN: 'Financial support (₹50,000/hectare over 3 years) for farmer groups adopting organic farming, covering certification, inputs, and marketing.',
      TE: 'సేంద్రీయ వ్యవసాయం అవలంబించే రైతు బృందాలకు ఆర్థిక మద్దతు (3 సంవత్సరాలలో హెక్టారుకు ₹50,000), ధృవీకరణ, ఇన్‌పుట్‌లు మరియు మార్కెటింగ్‌ను కవర్ చేస్తుంది.',
      HI: 'जैविक खेती अपनाने वाले किसान समूहों के लिए वित्तीय सहायता (3 वर्षों में ₹50,000/हेक्टेयर), प्रमाणन, इनपुट और विपणन को कवर करती है।',
    },
    eligibility: {
      EN: ['Farmers organized into clusters of 20 hectares or more', 'Willingness to adopt organic practices and get certified over 3 years'],
      TE: ['20 హెక్టార్లు లేదా అంతకంటే ఎక్కువ క్లస్టర్లుగా ఏర్పాటైన రైతులు', '3 సంవత్సరాలలో సేంద్రీయ పద్ధతులను అవలంబించి ధృవీకరణ పొందడానికి సుముఖత'],
      HI: ['20 हेक्टेयर या उससे अधिक के समूहों में संगठित किसान', '3 वर्षों में जैविक प्रथाओं को अपनाने और प्रमाणित होने की इच्छा'],
    },
    howToApply: {
      EN: ['Contact your Block/District Agriculture Officer to join or form a cluster', 'Cluster gets registered on the PGS-India portal for certification', 'Funds are released in phases directly to farmer groups'],
      TE: ['క్లస్టర్‌లో చేరడానికి లేదా ఏర్పాటు చేయడానికి మీ బ్లాక్/జిల్లా వ్యవసాయ అధికారిని సంప్రదించండి', 'ధృవీకరణ కోసం క్లస్టర్ PGS-India పోర్టల్‌లో నమోదు చేయబడుతుంది', 'నిధులు దశలవారీగా నేరుగా రైతు బృందాలకు విడుదల చేయబడతాయి'],
      HI: ['क्लस्टर में शामिल होने या बनाने के लिए अपने ब्लॉक/जिला कृषि अधिकारी से संपर्क करें', 'प्रमाणन के लिए क्लस्टर PGS-India पोर्टल पर पंजीकृत होता है', 'धनराशि चरणों में सीधे किसान समूहों को जारी की जाती है'],
    },
    officialLink: 'https://www.myscheme.gov.in',
  },
];
