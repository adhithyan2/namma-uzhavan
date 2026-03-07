// Language Switcher for Namma Uzhavan
// Supports: English, Tamil, Hindi, Malayalam, Kannada

let currentTranslations = {};
let defaultTranslations = {};
const supportedLanguages = ['en', 'ta', 'hi', 'ml', 'kn'];
const langNames = { en: 'EN', ta: 'TA', hi: 'HI', ml: 'ML', kn: 'KN' };

// Store original English text
const originalTexts = new Map();

// Store original texts from HTML
function storeOriginalTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (!originalTexts.has(key)) {
            originalTexts.set(key, el.textContent.trim());
        }
    });
}

// Load translations from JSON file
async function loadTranslations(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) throw new Error('Failed to load translations');
        currentTranslations = await response.json();
        
        // If loading English, also store as default
        if (lang === 'en') {
            defaultTranslations = { ...currentTranslations };
        }
        return true;
    } catch (error) {
        console.error('Error loading translations:', error);
        // If English fails, try to use stored defaults
        if (lang !== 'en' && Object.keys(defaultTranslations).length > 0) {
            currentTranslations = defaultTranslations;
            return true;
        }
        return false;
    }
}

// Get translation for a key
function t(key) {
    // For English, return original text
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    if (savedLang === 'en') {
        return originalTexts.get(key) || key;
    }
    return currentTranslations[key] || originalTexts.get(key) || key;
}

// Apply translations to all elements with data-i18n attribute
function applyTranslations() {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        let translation;
        
        if (savedLang === 'en') {
            // For English, use original text
            translation = originalTexts.get(key) || key;
        } else {
            // For other languages, use translation
            translation = currentTranslations[key] || originalTexts.get(key) || key;
        }
        
        element.textContent = translation;
    });
    
    // Also handle placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (savedLang === 'en') {
            element.placeholder = originalTexts.get(key) || key;
        } else {
            element.placeholder = currentTranslations[key] || originalTexts.get(key) || key;
        }
    });
}

// Main language change function
async function changeLanguage(lang) {
    if (!supportedLanguages.includes(lang)) {
        console.error('Unsupported language:', lang);
        return;
    }
    
    // Store original texts first if not stored
    if (originalTexts.size === 0) {
        storeOriginalTexts();
    }
    
    // Save to localStorage
    localStorage.setItem('selectedLanguage', lang);
    
    // Update button text if exists
    const langBtn = document.getElementById('currentLang') || document.getElementById('smartCurrentLang');
    if (langBtn) {
        langBtn.textContent = langNames[lang] || 'EN';
    }
    
    // Load and apply translations
    await loadTranslations(lang);
    applyTranslations();
}

// Initialize language on page load
async function initLanguage() {
    // Store original texts first
    storeOriginalTexts();
    
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
