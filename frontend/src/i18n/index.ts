import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: 'SchemeSense',
      tagline: 'Know the schemes you actually qualify for',
      subtitle: 'Explainable semantic eligibility reasoning powered by Multilingual AI & Graph RAG',
      nav: {
        browse: 'Browse Schemes',
        ruleLab: 'Rule Lab',
        compare: 'Compare',
        matches: 'My Matches',
        evaluation: 'Evaluation',
        submit: 'Submit Notification',
        checkEligibility: 'Check Eligibility',
      },
      hero: {
        eyebrow: 'EXPLAINABLE ELIGIBILITY FOR GOVERNMENT SCHEMES',
        titlePart1: 'Know the welfare schemes you ',
        titleGradient: 'actually qualify',
        titlePart2: ' for.',
        searchPlaceholder: 'Search schemes by keyword, caste, or state...',
        searchBtn: 'Search',
      },
      verdicts: {
        ELIGIBLE: 'Eligible',
        INELIGIBLE: 'Ineligible',
        NEEDS_MORE_INFO: 'Needs More Info',
        PASSED: 'Passed',
        FAILED: 'Failed',
        UNKNOWN: 'Unknown (Missing Fact)',
      },
    },
  },
  hi: {
    translation: {
      appName: 'स्कीम-सेंस (SchemeSense)',
      tagline: 'जानिए आप किन सरकारी योजनाओं के पात्र हैं',
      subtitle: 'बहुभाषी एआई और ग्राफ आरएजी द्वारा संचालित व्याख्यात्मक पात्रता तर्क प्रणाली',
      nav: {
        browse: 'योजनाएं खोजें',
        ruleLab: 'नियम प्रयोगशाला',
        compare: 'तुलना करें',
        matches: 'मेरी योजनाएं',
        evaluation: 'मूल्यांकन रिपोर्ट',
        submit: 'अधिसूचना जमा करें',
        checkEligibility: 'पात्रता जांचें',
      },
      hero: {
        eyebrow: 'सरकारी कल्याणकारी योजनाओं की पारदर्शी पात्रता',
        titlePart1: 'जानिए आप वास्तव में किन योजनाओं के ',
        titleGradient: 'योग्य',
        titlePart2: ' हैं।',
        searchPlaceholder: 'कीवर्ड, जाति या राज्य द्वारा योजनाएं खोजें...',
        searchBtn: 'खोजें',
      },
      verdicts: {
        ELIGIBLE: 'पात्र हैं (Eligible)',
        INELIGIBLE: 'अपात्र हैं (Ineligible)',
        NEEDS_MORE_INFO: 'अधिक जानकारी आवश्यक',
        PASSED: 'सफल',
        FAILED: 'विफल',
        UNKNOWN: 'अज्ञात (तथ्य अनुपलब्ध)',
      },
    },
  },
  ta: {
    translation: {
      appName: 'ஸ்கீம்சென்ஸ் (SchemeSense)',
      tagline: 'நீங்கள் தகுதிபெறும் அரசு திட்டங்களை உடனே தெரிந்துகொள்ளுங்கள்',
      subtitle: 'பன்மொழி AI மற்றும் வரைபட RAG அடிப்படையிலான வெளிப்படையான தகுதி நிர்ணய அமைப்பு',
      nav: {
        browse: 'திட்டங்களை உலாவுக',
        ruleLab: 'விதி ஆய்வகம்',
        compare: 'ஒப்பிடுக',
        matches: 'என் தகுதிகள்',
        evaluation: 'மதிப்பீடு',
        submit: 'அறிவிப்பை சமர்ப்பி',
        checkEligibility: 'தகுதியை சரிபார்',
      },
      hero: {
        eyebrow: 'அரசு நலத்திட்டங்களுக்கான தெளிவான தகுதி நிர்ணயம்',
        titlePart1: 'நீங்கள் உண்மையாக தகுதிபெறும் ',
        titleGradient: 'திட்டங்களை',
        titlePart2: ' கண்டறியவும்.',
        searchPlaceholder: 'சாதி, மாநிலம் அல்லது வார்த்தை மூலம் தேடவும்...',
        searchBtn: 'தேடு',
      },
      verdicts: {
        ELIGIBLE: 'தகுதியானவர் (Eligible)',
        INELIGIBLE: 'தகுதியற்றவர் (Ineligible)',
        NEEDS_MORE_INFO: 'கூடுதல் தகவல் தேவை',
        PASSED: 'வெற்றி',
        FAILED: 'தோல்வி',
        UNKNOWN: 'தெரியவில்லை',
      },
    },
  },
  te: {
    translation: {
      appName: 'స్కీమ్‌సెన్స్ (SchemeSense)',
      tagline: 'మీరు అర్హత కలిగిన ప్రభుత్వ పథకాలను తెలుసుకోండి',
      subtitle: 'బహుభాషా AI మరియు గ్రాఫ్ RAG ద్వారా నడిచే పారదర్శక అర్హత నిర్ణయ వ్యవస్థ',
      nav: {
        browse: 'పథకాలు వెతకండి',
        ruleLab: 'రూల్ ల్యాబ్',
        compare: 'పోల్చండి',
        matches: 'నా అర్హతలు',
        evaluation: 'మూల్యాంకనం',
        submit: 'సమర్పించండి',
        checkEligibility: 'అర్హత చూడండి',
      },
      hero: {
        eyebrow: 'ప్రభుత్వ పథకాలకు స్పష్టమైన అర్హత నిరూపణ',
        titlePart1: 'మీరు ఖచ్చితంగా అర్హులైన ',
        titleGradient: 'పథకాలను',
        titlePart2: ' తెలుసుకోండి.',
        searchPlaceholder: 'కులము, రాష్ట్రము లేదా కీవర్డ్ ద్వారా వెతకండి...',
        searchBtn: 'వెతుకు',
      },
      verdicts: {
        ELIGIBLE: 'అర్హులు (Eligible)',
        INELIGIBLE: 'అనర్హులు (Ineligible)',
        NEEDS_MORE_INFO: 'మరిన్ని వివరాలు కావాలి',
        PASSED: 'విజయం',
        FAILED: 'విఫలం',
        UNKNOWN: 'తెలియదు',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
