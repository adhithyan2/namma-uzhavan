// Language Switcher for Namma Uzhavan
// Supports: English, Tamil, Hindi, Malayalam, Kannada

let currentTranslations = {};
const supportedLanguages = ['en', 'ta', 'hi', 'ml', 'kn'];
const langNames = { en: 'EN', ta: 'TA', hi: 'HI', ml: 'ML', kn: 'KN' };

// Load translations from JSON file
async function loadTranslations(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) throw new Error('Failed to load translations');
        currentTranslations = await response.json();
        return true;
    } catch (error) {
        console.error('Error loading translations:', error);
        return false;
    }
}

// Get translation for a key
function t(key) {
    return currentTranslations[key] || key;
}

// Apply translations to all elements with data-i18n attribute
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        if (translation !== key) {
            element.textContent = translation;
        }
    });
    
    // Also handle placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = t(key);
        if (translation !== key) {
            element.placeholder = translation;
        }
    });
}

// Main language change function
async function changeLanguage(lang) {
    if (!supportedLanguages.includes(lang)) {
        console.error('Unsupported language:', lang);
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('selectedLanguage', lang);
    
    // Update button text if exists
    const langBtn = document.getElementById('currentLang') || document.getElementById('smartCurrentLang');
    if (langBtn) {
        langBtn.textContent = langNames[lang] || 'EN';
    }
    
    // Load and apply translations
    const success = await loadTranslations(lang);
    if (success) {
        applyTranslations();
    }
}

// Initialize language on page load
async function initLanguage() {
    // Check localStorage first, then default to English
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    
    if (supportedLanguages.includes(savedLang)) {
        await changeLanguage(savedLang);
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initLanguage);

// Export functions globally
window.changeLanguage = changeLanguage;
window.t = t;
window.initLanguage = initLanguage;
