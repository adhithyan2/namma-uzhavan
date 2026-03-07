// Language Switcher Component
function createLanguageSwitcher() {
    return `
    <div class="language-switcher dropdown">
        <button class="btn btn-outline-light dropdown-toggle" type="button" id="langDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fas fa-globe me-1"></i> <span id="currentLang">EN</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="langDropdown">
            <li><a class="dropdown-item" href="#" onclick="changeLanguage('en')">English</a></li>
            <li><a class="dropdown-item" href="#" onclick="changeLanguage('ta')">தமிழ் (Tamil)</a></li>
            <li><a class="dropdown-item" href="#" onclick="changeLanguage('hi')">हिंदी (Hindi)</a></li>
            <li><a class="dropdown-item" href="#" onclick="changeLanguage('ml')">മലയാളം (Malayalam)</a></li>
            <li><a class="dropdown-item" href="#" onclick="changeLanguage('kn')">ಕನ್ನಡ (Kannada)</a></li>
        </ul>
    </div>
    `;
}

// Change language function
function changeLanguage(lang) {
    // Store in localStorage
    localStorage.setItem('selectedLanguage', lang);
    
    // Update button text
    const langNames = { en: 'EN', ta: 'TA', hi: 'HI', ml: 'ML', kn: 'KN' };
    document.getElementById('currentLang').textContent = langNames[lang] || 'EN';
    
    // Apply Google Translate
    const select = document.querySelector('.goog-te-combo');
    if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
    }
    
    // Save to cookie for persistence
    setCookie('googtrans', '/en/' + lang, 30);
    setCookie('googtrans', '/en/' + lang, 30);
}

// Initialize language on page load
function initLanguage() {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    const langNames = { en: 'EN', ta: 'TA', hi: 'HI', ml: 'ML', kn: 'KN' };
    
    if (document.getElementById('currentLang')) {
        document.getElementById('currentLang').textContent = langNames[savedLang] || 'EN';
    }
    
    // Apply saved language after page loads
    setTimeout(() => {
        const select = document.querySelector('.goog-te-combo');
        if (select) {
            select.value = savedLang;
            select.dispatchEvent(new Event('change'));
        }
    }, 2000);
}

// Cookie helper
function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

// Add to window
window.changeLanguage = changeLanguage;
window.initLanguage = initLanguage;
