class AIFarmingAdvisor {
  constructor() {
    this.adviceRules = [];
    this.initializeRules();
  }

  initializeRules() {
    this.adviceRules = [
      // Soil Moisture Rules
      {
        condition: (data) => data.soilMoisture < 0.25,
        priority: 'High',
        category: 'Irrigation',
        message: {
          en: '🌾 Soil moisture is critically low! Immediate irrigation recommended.',
          ta: '🌾 மண் ஈரப்பதம் மிகக் குறைவு! உடனடி நீர்ப்பாசனம் பரிந்துரைக்கப்படுகிறது.',
          hi: '🌾 मिट्टी की नमी बहुत कम है! तुरंत सिंचाई की सिफारिश की जाती है।',
          ml: 'മണ്ണിലെ ഈറാത്തം വളരെ കുറവാണ്! ഉടനടി ജലസേചനം ശുപാര്‍ശ ചെയ്യുന്നു.',
          kn: 'ಮಣ್ಣಿನ ತೇವಾಂಶವು ತುಂಬಾ ಕಡಿಮೆ! ತಕ್ಷಣದ ನೀರಾವರಿ ಶಿಫಾರಸು ಮಾಡಲಾಗುತ್ತದೆ.'
        }
      },
      {
        condition: (data) => data.soilMoisture >= 0.25 && data.soilMoisture < 0.35,
        priority: 'Medium',
        category: 'Irrigation',
        message: {
          en: '💧 Soil moisture is below optimal. Consider irrigation within 2 days.',
          ta: '💧 மண் ஈரப்பதம் உகந்ததை விட குறைவு. 2 நாட்களுக்குள் நீர்ப்பாசனத்தை கருத்துக்கொள்ளுங்கள்.',
          hi: '💧 मिट्टी की नमी अनुकूल से कम है। 2 दिनों के भीतर सिंचाई पर विचार करें।',
          ml: 'മണ്ണിലെ ഈറാത്തം ഒപ്റ്റിമലിനേക്കാള്‍ കുറവാണ്. 2 ദിവസത്തിനുള്ളില്‍ ജലസേചനം പരിഗണിക്കുക.',
          kn: '💧 ಮಣ್ಣಿನ ತೇವಾಂಶವು ಸೂಕ್ಷ್ಮವಾಗಿದೆ. 2 ದಿನಗಳ ಒಳಗೆ ನೀರಾವರಿ ಪರಿಗಣಿಸಿ.'
        }
      },
      {
        condition: (data) => data.soilMoisture >= 0.35 && data.soilMoisture <= 0.60,
        priority: 'Low',
        category: 'Irrigation',
        message: {
          en: '✅ Soil moisture is optimal. No irrigation needed now.',
          ta: '✅ மண் ஈரப்பதம் உகந்ததாக உள்ளது. இப்போது நீர்ப்பாசனம் தேவை இல்லை.',
          hi: '✅ मिट्टी की नमी अनुकूल है। अभी सिंचाई की आवश्यकता नहीं।',
          ml: 'മണ്ണിലെ ഈറാത്തം ഒപ്റ്റിമലാണ്. ഇപ്പോള്‍ ജലസേചനം ആവശ്യമില്ല.',
          kn: '✅ ಮಣ್ಣಿನ ತೇವಾಂಶವು ಸೂಕ್ಷ್ಮವಾಗಿದೆ. ಈಗ ನೀರಾವರಿ ಅಗತ್ಯವಿಲ್ಲ.'
        }
      },
      {
        condition: (data) => data.soilMoisture > 0.60,
        priority: 'Medium',
        category: 'Drainage',
        message: {
          en: '⚠️ Soil is waterlogged. Ensure proper drainage to prevent root rot.',
          ta: '⚠️ மண் நீர்ப்படுத்தப்பட்டுள்ளது. வேர்ப்பசையை தடுக்க சரியான வடிகட்டுதலை உறுதிப்படுத்துங்கள்.',
          hi: '⚠️ मिट्टी में पानी भरा हुआ है। जड़ सड़न को रोकने के लिए उचित जल निकासी सुनिश्चित करें।',
          ml: 'മണ്ണില്‍ വെള്ളം നിറഞ്ഞിരിക്കുന്നു. വേര് ചീഞ്ഞുപോകാതിരിക്കാന്‍ ശരിയായ ഡ്രെയിനേജ് ഉറപ്പാക്കുക.',
          kn: '⚠️ ಮಣ್ಣಿನಲ್ಲಿ ನೀರು ತುಂಬಿದೆ. ಬೇರು ಕೊಳೆಯುವುದನ್ನು ತಡೆಯಲು ಸರಿಯಾದ ಒಳಚರಂತಿರುವ ವ್ಯವಸ್ಥೆ ಮಾಡಿ.'
        }
      },

      // Temperature Rules
      {
        condition: (data) => data.temperature > 40,
        priority: 'High',
        category: 'Weather',
        message: {
          en: '🔥 Extreme heat! Provide shade for crops and increase irrigation frequency.',
          ta: '🔥 மிக அதிக வெப்பம்! பயிர்களுக்கு நிழல் வழங்கவும் நீர்ப்பாசனத்தை அதிகரிக்கவும்.',
          hi: '🔥 अत्यधिक गर्मी! फसलों के लिए छाया प्रदान करें और सिंचाई की आवृत्ति बढ़ाएं।',
          ml: 'അതിശയമായ ചൂട്! വിളകള്‍ക്ക് തണല്‍ നല്‍കി ജലസേചനത്തിന്റെ ആവൃത്തി വര്‍ധിപ്പിക്കുക.',
          kn: 'ತೀವ್ರ ಬಿಸಿ! ಬೆಳೆಗಳಿಗೆ ನೆರಳು ಒದಗಿಸಿ ನೀರಾವರಿ ಆವರ್ತನವನ್ನು ಹೆಚ್ಚಿಸಿ.'
        }
      },
      {
        condition: (data) => data.temperature < 10,
        priority: 'Medium',
        category: 'Weather',
        message: {
          en: '❄️ Cold weather! Protect frost-sensitive crops with covers.',
          ta: '❄️ குளிர் வானம்! பனி-உணர்திறன் பயிர்களை மூடிகளால் பாதுகாக்கவும்.',
          hi: '❄️ ठंडा मौसम! पाले से संवेदनशील फसलों को ढक्कन से बचाएं।',
          ml: 'ശൈത്യകാലം! മഞ്ഞിനെ പേടിക്കുന്ന വിളകള്‍ മൂടികൊണ്ട് സംരക്ഷിക്കുക.',
          kn: '❄️ ಚಳಿಗಾಲ! ಚಳಿ-ಸಂವೇದನಾಶೀಲ ಬೆಳೆಗಳನ್ನು ಆವರಣದಿಂದ ರಕ್ಷಿಸಿ.'
        }
      },

      // Rainfall Rules
      {
        condition: (data) => data.rainfall > 150 && data.rainProbability > 70,
        priority: 'High',
        category: 'Weather',
        message: {
          en: '🌧️ Heavy rainfall expected! Avoid irrigation and ensure field drainage.',
          ta: '🌧️ கடுமையான மழை காத்திருக்கிறது! நீர்ப்பாசனத்தை தவிர்க்கவம் ம.field வடிகட்டுதலை உறுதிப்படுத்தவும்.',
          hi: '🌧️ भारी वर्षा की उम्मीद है! सिंचाई से बचें और क्षेत्र की जल निकासी सुनिश्चित करें।',
          ml: 'കനത്ത മഴ പ്രതീക്ഷിക്കുന്നു! ജലസേചനം ഒഴിവാക്കി ഫീല്‍ഡ് ഡ്രെയിനേജ് ഉറപ്പാക്കുക.',
          kn: 'ಭಾರೀ ಮಳೆ ನಿರೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ! ನೀರಾವರಿಯನ್ನು ತಪ್ಪಿಸಿ ಹೊಲದ ಒಳಚರಂತಿರುವ ವ್ಯವಸ್ಥೆ ಮಾಡಿ.'
        }
      },

      // pH Rules
      {
        condition: (data) => data.ph < 5.5,
        priority: 'Medium',
        category: 'Soil',
        message: {
          en: '📊 Soil pH is too acidic. Apply lime to balance the soil.',
          ta: '📊 மண் pH மிக அமிலமானது. மண்ணை சம均衡ப்படுத்த சுண்ணாம்பை பயன்படுத்துங்கள்.',
          hi: '📊 मिट्टी का pH बहुत अम्लीय है। मिट्टी को संतुलित करने के लिए चूना लगाएं।',
          ml: 'മണ്ണിന്റെ pH വളരെ ആസിഡിക്കാണ്. മണ്ണ് സന്തുലിതമാക്കാന്‍ ചുണ്ണാമ്പ് പ്രയോഗിക്കുക.',
          kn: '📊 ಮಣ್ಣಿನ pH ತುಂಬಾ ಆಮ್ಲೀಯವಾಗಿದೆ. ಮಣ್ಣನ್ನು ಸಮತೋಲನಗೊಳಿಸಲು ಸುಣ್ಣ ಹಾಕಿ.'
        }
      },
      {
        condition: (data) => data.ph > 8.5,
        priority: 'Medium',
        category: 'Soil',
        message: {
          en: '📊 Soil pH is too alkaline. Apply gypsum to balance the soil.',
          ta: '📊 மண் pH மிக காரமானது. மண்ணை சம均衡ப்படுத்த சுண்ணாம்பை பயன்படுத்துங்கள்.',
          hi: '📊 मिट्टी का pH बहुत क्षारीय है। मिट्टी को संतुलित करने के लिए जिप्सम लगाएं।',
          ml: 'മണ്ണിന്റെ pH വളരെ ആല്‍ക്കലിനാണ്. മണ്ണ് സന്തുലിതമാക്കാന്‍ ജിപ്സം പ്രയോഗിക്കുക.',
          kn: '📊 ಮಣ್ಣಿನ pH ತುಂಬಾ ಕ್ಷಾರೀಯವಾಗಿದೆ. ಮಣ್ಣನ್ನು ಸಮತೋಲನಗೊಳಿಸಲು ಜಿಪ್ಸಮ್ ಹಾಕಿ.'
        }
      },

      // Crop-specific Rules
      {
        condition: (data) => data.crop && data.crop.toLowerCase() === 'rice' && data.soilMoisture < 0.3,
        priority: 'High',
        category: 'Crop',
        message: {
          en: '🌾 Rice requires standing water! Maintain 5-10cm water level in the field.',
          ta: '🌾 நெல் நிற்கும் தண்ணீரை தேவைப்படுகிறது! fieldல் 5-10cm ನೀರಿನ ಮಟ್ಟವನ್ನು ಕಾಪಾಡಿ.',
          hi: '🌾 धान को खड़े पानी की आवश्यकता है! खेत में 5-10 सेमी जल स्तर बनाए रखें।',
          ml: 'നെല്ലിന് നിലനില്‍ക്കുന്ന വെള്ളം ആവശ്യമാണ്! ഫീല്‍ഡില്‍ 5-10 സെ.മീ ജല നിലനിര്‍ത്തുക.',
          kn: 'ಬಿದಿರಿಗೆ ನಿಂತ ನೀರು ಬೇಕು! ಹೊಲದಲ್ಲಿ 5-10cm ನೀರಿನ ಮಟ್ಟವನ್ನು ಕಾಪಾಡಿ.'
        }
      },
      {
        condition: (data) => data.crop && ['cotton', 'groundnut', 'sunflower'].includes(data.crop.toLowerCase()) && data.rainfall < 50,
        priority: 'Medium',
        category: 'Crop',
        message: {
          en: '☀️ Dry conditions! These crops need irrigation during pod development.',
          ta: '☀️ வரண்ட நிலைமைகள்! இந்த பயிர்களுக்கு காய் வளர்ச்சியின் போது நீர்ப்பாசனம் தேவை.',
          hi: '☀️ शुष्क स्थिति! इन फसलों को फली विकास के दौरान सिंचाई की आवश्यकता है।',
          ml: '☀️ വരണ്ട അവസ്ഥ! ഈ വിളകള്‍ക്ക് കായ വികസന സമയത്ത് ജലസേചനം ആവശ്യമാണ്.',
          kn: '☀️ ಒಣ ಸ್ಥಿತಿ! ಈ ಬೆಳೆಗಳಿಗೆ ಕಾಯಿ ಬೆಳವಣಿಗೆಯ ಸಮಯದಲ್ಲಿ ನೀರಾವರಿ ಅಗತ್ಯವಿದೆ.'
        }
      }
    ];
  }

  getAdvice(data) {
    const { soilMoisture, temperature, rainfall, ph, crop, humidity, language = 'en' } = data;

    const relevantAdvice = this.adviceRules
      .filter(rule => rule.condition(data))
      .sort((a, b) => {
        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .map(rule => ({
        priority: rule.priority,
        category: rule.category,
        message: rule.message[language] || rule.message.en
      }));

    // Add general advice based on conditions
    const generalAdvice = this.getGeneralAdvice(data, language);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      conditions: {
        soilMoisture: soilMoisture ? `${(soilMoisture * 100).toFixed(0)}%` : 'N/A',
        temperature: temperature ? `${temperature}°C` : 'N/A',
        humidity: humidity ? `${humidity}%` : 'N/A',
        rainfall: rainfall ? `${rainfall}mm` : 'N/A',
        ph: ph || 'N/A',
        crop: crop || 'Not specified'
      },
      recommendations: relevantAdvice,
      generalAdvice
    };
  }

  getGeneralAdvice(data, language) {
    const { soilMoisture, temperature, crop } = data;
    const advice = [];

    // Weather-based general advice
    if (temperature > 30) {
      advice.push({
        category: 'Weather',
        message: this.getMessage('heat', language)
      });
    }

    // Soil-based general advice
    if (soilMoisture && soilMoisture > 0.3 && soilMoisture < 0.6) {
      advice.push({
        category: 'Soil',
        message: this.getMessage('optimal', language)
      });
    }

    // Crop rotation advice
    if (crop) {
      advice.push({
        category: 'Crop',
        message: this.getMessage('crop', language)
      });
    }

    return advice;
  }

  getMessage(type, lang) {
    const messages = {
      heat: {
        en: '💦 High temperature increases water evaporation. Water crops early morning or late evening.',
        ta: '💦 அதிக வெப்பம் ஆவியாகும் தண்ணீரை அதிகரிக்கிறது. பயிர்களை அதிகாலையில் அல்லது மாலையில் நீர்ப்பாசனம் செய்யுங்கள்.',
        hi: '💦 उच्च तापमान वाष्पीकरण को बढ़ाता है। फसलों को सुबह या शाम को पानी दें।',
        ml: 'ഉയർന്ന താപനില വെള്ളത്തിന്റെ ബാഷ്പീകരണം വർധിപ്പിക്കുന്നു. രാവിലെയോ വൈകിയോ വിളകള്‍ക്ക് വെള്ളം കിട്ടിക്കാന്‍ ശ്രമിക്കുക.',
        kn: '💦 ಹೆಚ್ಚಿನ ತಾಪಮಾನವು ನೀರಿನ ಆವಿಯಾಗುವಿಕೆಯನ್ನು ಹೆಚ್ಚಿಸುತ್ತದೆ. ಬೆಳೆಗಳಿಗೆ ಬೆಳಿಗ್ರೆ ಅಥವಾ ಸಂಜೆ ನೀರು ಹಾಕಿ.'
      },
      optimal: {
        en: '🌱 Good soil conditions! This is ideal for most crop growth.',
        ta: '🌱 நல்ல மண் நிலைமைகள்! பெரும்பாலான பயிர் வளர்ச்சிக்கு இது சிறந்தது.',
        hi: '🌱 अच्छी मिट्टी की स्थिति! अधिकांश फसल वृद्धि के लिए यह आदर्श है।',
        ml: 'മണ്ണിന്റെ നല്ല അവസ്ഥ! ഭൂരിഭാഗം വിളകളുടെ വളര്‍ച്ചയ്ക്ക് ഇത് അനുയോജ്യമാണ്.',
        kn: '🌱 ಒಳ್ಳೆಯ ಮಣ್ಣಿನ ಸ್ಥಿತಿ! ಹೆಚ್ಚಿನ ಬೆಳೆ ಬೆಳವಣಿಗೆಗೆ ಇದು ಸೂಕ್ತವಾಗಿದೆ.'
      },
      crop: {
        en: '🌾 Monitor your crops regularly for signs of pest infestation.',
        ta: '🌾 பூச்சி தாக்குதலின் அறತೆகளுக்காக உங்கள் பயிர்களை தவறாமல் கவனியுங்கள்.',
        hi: '🌾 कीट संक्रमण के संकेतों के लिए अपनी फसलों की नियमित रूप से निगरानी करें।',
        ml: 'കീടബാധയുടെ ലക്ഷണങ്ങള്‍ക്കായി നിങ്ങളുടെ വിളകള്‍ പതിവായി നിരീക്ഷിക്കുക.',
        kn: '🌾 ಕೀಟ ಸೋಂಕಿನ ಚಿಹ್ನೆಗಳಿಗಾಗಿ ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ನಿಯಮಿತವಾಗಿ ಮೇಲ್ವಿಚಾರಿಸಿ.'
      }
    };

    return messages[type]?.[lang] || messages[type]?.en || '';
  }
}

module.exports = new AIFarmingAdvisor();
