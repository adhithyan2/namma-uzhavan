// ========================================
// Climate Risk Adaptive Crop Strategy Engine
// Main JavaScript
// ========================================

const API_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('token');
let currentPage = window.location.pathname.split('/').pop();
let tempChart = null;
let compareList = [];
let voiceRecognition = null;
let currentWeatherData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initVoiceRecognition();
    
    if (isGuestMode()) {
        showGuestBanner();
    }
    
    if (currentPage === 'dashboard.html') {
        loadWeatherData();
        loadForecast();
        loadCropSuggestion();
        initTempChart();
    } else if (currentPage === 'marketplace.html') {
        loadProducts();
    } else if (currentPage === 'waste.html') {
        loadDealers();
    }
});

function showGuestBanner() {
    const banner = document.getElementById('guestBanner');
    if (banner) {
        banner.classList.remove('d-none');
    }
}

function upgradeToFull() {
    window.location.href = 'index.html';
}

// ========================================
// AUTHENTICATION
// ========================================

function showForm(form) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');

    if (form === 'login') {
        loginForm.classList.remove('d-none');
        signupForm.classList.add('d-none');
        loginBtn.classList.add('active');
        signupBtn.classList.remove('active');
    } else {
        loginForm.classList.add('d-none');
        signupForm.classList.remove('d-none');
        loginBtn.classList.remove('active');
        signupBtn.classList.add('active');
    }
    hideMessage();
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function showMessage(message, type) {
    const msgEl = document.getElementById('authMessage') || document.getElementById('profileMessage');
    if (msgEl) {
        msgEl.className = `alert alert-${type} mt-3`;
        msgEl.textContent = message;
        msgEl.classList.remove('d-none');
    }
}

function hideMessage() {
    const msgEl = document.getElementById('authMessage');
    if (msgEl) {
        msgEl.classList.add('d-none');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const spinner = document.getElementById('signupSpinner');
    const btnText = document.getElementById('signupBtnText');
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'danger');
        return;
    }

    spinner.classList.remove('d-none');
    btnText.textContent = 'Creating...';

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, confirmPassword })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            authToken = data.token;
            window.location.href = 'profile-setup.html';
        } else {
            showMessage(data.error || 'Signup failed!', 'danger');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'danger');
    }

    spinner.classList.add('d-none');
    btnText.textContent = 'Create Account';
}

async function handleLogin(e) {
    e.preventDefault();
    const spinner = document.getElementById('loginSpinner');
    const btnText = document.getElementById('loginBtnText');

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    spinner.classList.remove('d-none');
    btnText.textContent = 'Logging...';

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            authToken = data.token;
            
            // Check if profile exists
            const profileRes = await fetch(`${API_URL}/farmer-profile`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (profileRes.ok) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'profile-setup.html';
            }
        } else {
            showMessage(data.error || 'Login failed!', 'danger');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'danger');
    }

    spinner.classList.add('d-none');
    btnText.textContent = 'Login';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('guestMode');
    authToken = null;
    window.location.href = 'index.html';
}

function enterGuestMode() {
    localStorage.setItem('guestMode', 'true');
    localStorage.setItem('user', JSON.stringify({ name: 'Guest User', isGuest: true }));
    window.location.href = 'dashboard.html';
}

function isGuestMode() {
    return localStorage.getItem('guestMode') === 'true';
}

function checkAuth() {
    if (!authToken && !isGuestMode() && currentPage !== 'index.html' && currentPage !== 'signup.html') {
        window.location.href = 'index.html';
    }
    
    if (authToken || isGuestMode()) {
        loadUserProfile();
    }
}

async function loadUserProfile() {
    try {
        // Handle guest mode
        if (isGuestMode()) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userNameEl = document.getElementById('userName');
            if (userNameEl) userNameEl.textContent = user.name || 'Guest';
            return;
        }

        const response = await fetch(`${API_URL}/farmer-profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const profile = await response.json();
            const userNameEl = document.getElementById('userName');
            const userLocationEl = document.getElementById('userLocation');
            const profileImg = document.getElementById('profileImg');
            
            if (userNameEl) {
                userNameEl.textContent = profile.farmerName || 'Farmer';
            }
            if (userLocationEl) {
                userLocationEl.textContent = profile.location || 'Location';
            }
            if (profileImg) {
                profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.farmerName || 'F')}&background=2E7D32&color=fff&size=40`;
            }
            
            // Update search to user's location
            if (profile.location) {
                const locationInput = document.getElementById('locationSearch');
                if (locationInput) locationInput.value = profile.location;
            }

            // Store profile for profile edit
            window.currentProfile = profile;
        }
    } catch (error) {
        console.log('Profile not found');
    }
}

// ========================================
// PROFILE SETUP & EDIT
// ========================================

let isEditMode = false;

// Check if editing existing profile
if (currentPage === 'profile-setup.html') {
    checkExistingProfile();
}

async function checkExistingProfile() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_URL}/farmer-profile`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            const profile = await response.json();
            window.currentProfile = profile;
            loadProfileData(profile);
            document.getElementById('editModeBtn').style.display = 'block';
        }
    } catch (error) {
        console.log('No existing profile');
    }
}

function loadProfileData(profile) {
    document.getElementById('farmerName').value = profile.farmerName || '';
    document.getElementById('phoneNumber').value = profile.phoneNumber || '';
    document.getElementById('landArea').value = profile.landArea || '';
    document.getElementById('soilType').value = profile.soilType || '';
    document.getElementById('irrigationType').value = profile.irrigationType || '';
    document.getElementById('experience').value = profile.experience || '';
    document.getElementById('location').value = profile.location || 'Delhi';
    
    if (profile.farmingType && Array.isArray(profile.farmingType)) {
        profile.farmingType.forEach(type => {
            const checkbox = document.querySelector(`input[value="${type}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    
    const title = document.getElementById('profileTitle');
    const subtitle = document.getElementById('profileSubtitle');
    const submitBtn = document.getElementById('profileSubmitBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const editBtn = document.getElementById('editModeBtn');
    
    if (isEditMode) {
        title.textContent = 'Edit Farmer Profile';
        subtitle.textContent = 'Update your profile information';
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm d-none" id="profileSpinner"></span><span id="profileBtnText">Update Profile</span>';
        cancelBtn.style.display = 'block';
        editBtn.innerHTML = '<i class="fas fa-times"></i> Cancel';
    } else {
        cancelEdit();
    }
}

function cancelEdit() {
    isEditMode = false;
    const title = document.getElementById('profileTitle');
    const subtitle = document.getElementById('profileSubtitle');
    const submitBtn = document.getElementById('profileSubmitBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const editBtn = document.getElementById('editModeBtn');
    
    title.textContent = 'Farmer Profile';
    subtitle.textContent = 'Your profile information';
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm d-none" id="profileSpinner"></span><span id="profileBtnText">Save Changes</span>';
    cancelBtn.style.display = 'none';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    
    if (window.currentProfile) {
        loadProfileData(window.currentProfile);
    }
}

async function handleProfileSubmit(e) {
    e.preventDefault();
    
    const checkboxes = document.querySelectorAll('.farming-checkbox:checked');
    if (checkboxes.length === 0) {
        document.getElementById('farmingTypeError').classList.add('show');
        return;
    }
    document.getElementById('farmingTypeError').classList.remove('show');

    const spinner = document.getElementById('profileSpinner');
    const btnText = document.getElementById('profileBtnText');

    const farmingType = Array.from(checkboxes).map(cb => cb.value);

    const profileData = {
        farmerName: document.getElementById('farmerName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        landArea: parseFloat(document.getElementById('landArea').value),
        soilType: document.getElementById('soilType').value,
        farmingType,
        irrigationType: document.getElementById('irrigationType').value,
        experience: parseInt(document.getElementById('experience').value),
        location: document.getElementById('location').value || 'Delhi'
    };

    spinner.classList.remove('d-none');
    btnText.textContent = isEditMode ? 'Updating...' : 'Saving...';

    try {
        const method = isEditMode ? 'PUT' : 'POST';
        const response = await fetch(`${API_URL}/farmer-profile`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(isEditMode ? 'Profile updated successfully!' : 'Profile created successfully! Redirecting...', 'success');
            window.currentProfile = profileData;
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showMessage(data.error || 'Failed to save profile', 'danger');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'danger');
    }

    spinner.classList.add('d-none');
    btnText.textContent = isEditMode ? 'Update Profile' : 'Complete Profile';
}

// ========================================
// WEATHER & DASHBOARD
// ========================================

async function loadWeatherData(location = 'Delhi') {
    const weatherDisplay = document.getElementById('weatherDisplay');
    if (!weatherDisplay) return;

    try {
        const response = await fetch(`${API_URL}/weather?location=${encodeURIComponent(location)}`);
        const data = await response.json();

        if (response.ok) {
            currentWeatherData = data;
            weatherDisplay.innerHTML = `
                <div class="weather-card">
                    <i class="fas fa-thermometer-half"></i>
                    <div class="value">${data.temperature.toFixed(1)}°C</div>
                    <div class="label">Temperature</div>
                </div>
                <div class="weather-card">
                    <i class="fas fa-tint"></i>
                    <div class="value">${data.humidity}%</div>
                    <div class="label">Humidity</div>
                </div>
                <div class="weather-card">
                    <i class="fas fa-wind"></i>
                    <div class="value">${data.windSpeed} m/s</div>
                    <div class="label">Wind Speed</div>
                </div>
                <div class="weather-card">
                    <img src="${data.weatherIcon}" alt="${data.weatherCondition}" style="width:50px;height:50px;">
                    <div class="value" style="font-size:1rem;">${data.weatherCondition}</div>
                    <div class="label">${data.description}</div>
                </div>
            `;
            
            // Update Quick Stats
            const quickTemp = document.getElementById('quickTemp');
            const quickHumidity = document.getElementById('quickHumidity');
            if (quickTemp) quickTemp.textContent = data.temperature.toFixed(1) + '°C';
            if (quickHumidity) quickHumidity.textContent = data.humidity + '%';
            
            // Update chart
            updateTempChart(data.temperature);
            
            // Update crop suggestion
            loadCropSuggestion(data.temperature);
        } else {
            weatherDisplay.innerHTML = '<p class="text-danger">Failed to load weather data</p>';
        }
    } catch (error) {
        weatherDisplay.innerHTML = '<p class="text-danger">Network error</p>';
    }
}

function searchWeather() {
    const location = document.getElementById('locationSearch').value;
    if (location) {
        loadWeatherData(location);
        loadForecast(location);
    }
}

function handleLocationKeyPress(e) {
    if (e.key === 'Enter') {
        searchWeather();
    }
}

async function loadForecast(location = 'Delhi') {
    const forecastContainer = document.getElementById('forecastContainer');
    const climateAlerts = document.getElementById('climateAlerts');
    if (!forecastContainer) return;

    try {
        const response = await fetch(`${API_URL}/forecast?location=${encodeURIComponent(location)}`);
        const data = await response.json();

        if (response.ok) {
            forecastContainer.innerHTML = data.forecasts.map(day => `
                <div class="forecast-day">
                    <div class="date">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <img src="${day.weatherIcon}" alt="${day.weatherCondition}">
                    <div class="temp">${day.temperature.toFixed(1)}°C</div>
                </div>
            `).join('');

            // Climate alerts
            let alertsHtml = '';
            if (data.alerts.heatwave) {
                alertsHtml += '<span class="alert-badge heatwave"><i class="fas fa-exclamation-triangle me-1"></i>Heatwave Warning</span>';
            }
            if (data.alerts.drought) {
                alertsHtml += '<span class="alert-badge drought"><i class="fas fa-tint-slash me-1"></i>Drought Risk</span>';
            }
            
            if (climateAlerts) {
                climateAlerts.innerHTML = alertsHtml || '<span class="text-muted">No climate alerts</span>';
            }
        }
    } catch (error) {
        forecastContainer.innerHTML = '<p class="text-danger">Failed to load forecast</p>';
    }
}

// ========================================
// CHART
// ========================================

function initTempChart() {
    const ctx = document.getElementById('tempChart');
    if (!ctx) return;

    const hours = [];
    const temps = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 4 * 60 * 60 * 1000);
        hours.push(hour.getHours() + ':00');
        temps.push(Math.random() * 15 + 20); // Mock temperature data
    }

    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                borderColor: '#2E7D32',
                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: temps.map(t => t > 35 ? '#D32F2F' : '#2E7D32'),
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    suggestedMin: 15,
                    suggestedMax: 45,
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                }
            }
        }
    });
}

function updateTempChart(currentTemp) {
    if (!tempChart) return;
    
    const now = new Date();
    const hour = now.getHours() + ':00';
    
    // Add current temperature
    const labels = tempChart.data.labels;
    const data = tempChart.data.datasets[0].data;
    
    if (labels.length >= 8) {
        labels.shift();
        data.shift();
    }
    
    labels.push(hour);
    data.push(currentTemp);
    
    tempChart.data.labels = labels;
    tempChart.data.datasets[0].data = data;
    tempChart.data.datasets[0].pointBackgroundColor = data.map(t => t > 35 ? '#D32F2F' : '#2E7D32');
    tempChart.update();
}

// ========================================
// CROP SUGGESTION
// ========================================

let currentCropLanguage = 'en';

function changeCropLanguage() {
    const select = document.getElementById('cropLanguage');
    currentCropLanguage = select.value;
    loadCropSuggestion();
}

async function loadCropSuggestion(temperature) {
    const cropSuggestion = document.getElementById('cropSuggestion');
    if (!cropSuggestion) return;

    const temp = temperature || currentWeatherData?.temperature || 25;
    const rainfall = 50;
    const soilType = window.currentProfile?.soilType || '';
    const location = document.getElementById('locationSearch')?.value || window.currentProfile?.location || '';

    try {
        const response = await fetch(`${API_URL}/crop-suggestion?temperature=${temp}&rainfall=${rainfall}&language=${currentCropLanguage}&soilType=${encodeURIComponent(soilType)}&location=${encodeURIComponent(location)}`);
        const data = await response.json();

        if (response.ok) {
            const riskClass = data.riskLevel.toLowerCase();
            
            // Update Quick Stats
            const quickRisk = document.getElementById('quickRisk');
            const quickCrop = document.getElementById('quickCrop');
            if (quickRisk) quickRisk.textContent = data.riskLevel;
            if (quickCrop) quickCrop.textContent = data.suggestions[0]?.crop || '--';
            
            // Build ranked crop list with scores
            let cropRankingsHtml = '';
            if (data.suggestions && data.suggestions.length > 0) {
                cropRankingsHtml = data.suggestions.map((sug, index) => `
                    <div class="crop-rank-item ${index === 0 ? 'top-crop' : ''} p-3 mb-2 rounded">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <span class="rank-badge">#${index + 1}</span>
                                <strong class="ms-2">${sug.crop}</strong>
                                <span class="score-badge ms-2">Score: ${sug.score}%</span>
                            </div>
                            <div class="risk-pill risk-${sug.riskPercentage > 50 ? 'high' : sug.riskPercentage > 30 ? 'medium' : 'low'}">
                                ${sug.riskPercentage}% Risk
                            </div>
                        </div>
                        <div class="mt-2 small">
                            <div><strong>Water Need:</strong> ${sug.waterNeed}</div>
                            <div class="text-muted">${sug.reason}</div>
                        </div>
                    </div>
                `).join('');
            }
            
            // Build money saving tips
            let moneySavingHtml = '';
            if (data.suggestions && data.suggestions[0]?.moneySavingTip) {
                moneySavingHtml = `
                    <div class="money-saving-card mt-3 p-3 rounded">
                        <h6 class="text-success"><i class="fas fa-rupee-sign me-1"></i>Money Saving Tips:</h6>
                        <ul class="mb-0 small">
                            ${data.suggestions[0].moneySavingTip.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
            
            // Profit potential
            let profitHtml = '';
            if (data.suggestions && data.suggestions[0]?.profitPotential) {
                const profit = data.suggestions[0].profitPotential;
                profitHtml = `
                    <div class="profit-card mt-3 p-3 rounded" style="background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);">
                        <h6 class="text-success"><i class="fas fa-chart-line me-1"></i>Estimated Profit Potential:</h6>
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <div>
                                <strong style="font-size:1.5rem;">${profit.perAcre}</strong>
                                <small class="text-muted">per acre</small>
                            </div>
                            <div>
                                <span class="confidence-badge ${profit.confidenceLevel.toLowerCase()}">${profit.confidenceLevel} Confidence</span>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // Money saved summary
            let moneySavedHtml = '';
            if (data.moneySavingSummary) {
                moneySavedHtml = `
                    <div class="loss-avoided-card mt-3 p-3 rounded" style="background: #FFF3E0; border-left: 4px solid #FF9800;">
                        <h6 class="text-warning"><i class="fas fa-shield-alt me-1"></i>Estimated Loss Avoided:</h6>
                        <strong style="font-size:1.2rem;">${data.moneySavingSummary.estimatedLossAvoided}</strong>
                        <div class="small text-muted mt-1">${data.moneySavingSummary.recommendation}</div>
                    </div>
                `;
            }
            
            // Build farming tips
            let tipsHtml = '';
            if (data.farmingTips && data.farmingTips.length > 0) {
                tipsHtml = `
                    <div class="mt-3">
                        <h6 class="text-primary"><i class="fas fa-lightbulb me-1"></i>Farming Tips:</h6>
                        <ul class="small">
                            ${data.farmingTips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
            
            // Build government schemes
            let schemesHtml = '';
            if (data.governmentSchemes && data.governmentSchemes.length > 0) {
                schemesHtml = `
                    <div class="mt-3">
                        <h6 class="text-success"><i class="fas fa-hand-holding-usd me-1"></i>Government Schemes:</h6>
                        <ul class="small">
                            ${data.governmentSchemes.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
            
            cropSuggestion.innerHTML = `
                <div class="suggestion-card">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="crop-name">Top Recommended: ${data.suggestions[0]?.crop || 'N/A'}</span>
                        <span class="risk-badge ${riskClass}">${data.riskLevel} Risk</span>
                    </div>
                </div>
                
                ${cropRankingsHtml}
                ${moneySavingHtml}
                ${profitHtml}
                ${moneySavedHtml}
                
                <div class="action-list">
                    <h6 class="text-success"><i class="fas fa-check-circle me-1"></i>What To Do:</h6>
                    <ul class="do-list">
                        ${data.whatToDo.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="action-list">
                    <h6 class="text-danger"><i class="fas fa-times-circle me-1"></i>What Not To Do:</h6>
                    <ul class="dont-list">
                        ${data.whatNotToDo.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                ${tipsHtml}
                ${schemesHtml}
            `;
        }
    } catch (error) {
        cropSuggestion.innerHTML = '<p class="text-danger">Failed to load crop suggestions</p>';
    }
}

// ========================================
// MARKETPLACE
// ========================================

async function loadProducts(category = 'All') {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    productsGrid.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-success"></div>
            <p class="mt-2">Loading products...</p>
        </div>
    `;

    try {
        const url = category === 'All' ? `${API_URL}/products` : `${API_URL}/products?category=${encodeURIComponent(category)}`;
        const response = await fetch(url);
        const products = await response.json();

        if (response.ok) {
            renderProducts(products);
        } else {
            productsGrid.innerHTML = '<p class="text-danger">Failed to load products</p>';
        }
    } catch (error) {
        productsGrid.innerHTML = '<p class="text-danger">Network error</p>';
    }
}

function renderProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    
    // Product category to image mapping
    const productImages = {
        'Seeds': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=200&h=150&fit=crop',
        'Fertilizers': 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=200&h=150&fit=crop',
        'Pesticides': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=150&fit=crop',
        'Irrigation Equipment': 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=200&h=150&fit=crop'
    };

    productsGrid.innerHTML = products.map(product => {
    const directLink = generateDirectLink(product.name, product.dealerName);
    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="product-card">
                <div class="product-image">
                    <img src="${productImages[product.category] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=150&fit=crop'}" 
                         alt="${product.name}"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <i class="fas fa-box" style="display:none;"></i>
                </div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-brand">${product.brand}</div>
                    <div class="product-price">₹${product.price}</div>
                    <div class="rating">
                        ${generateStars(product.rating)}
                        <span class="text-muted">(${product.reviews} reviews)</span>
                    </div>
                    <div class="dealer">
                        <i class="fas fa-store me-1"></i>${product.dealerName}
                    </div>
                </div>
                <div class="product-actions p-2 border-top">
                    <a href="${directLink.url}" target="_blank" class="btn btn-success btn-sm w-100">
                        <i class="fas fa-shopping-cart me-1"></i>Buy Now
                    </a>
                </div>
                <div class="compare-check">
                    <input type="checkbox" class="form-check-input" id="compare-${product._id}" 
                        onchange="toggleCompare('${product._id}')" ${compareList.includes(product._id) ? 'checked' : ''}>
                    <label for="compare-${product._id}">Compare</label>
                </div>
            </div>
        </div>
    `;
}).join('');
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function filterProducts(category) {
    // Update button states
    document.querySelectorAll('.category-filters .btn').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.add('btn-outline-success');
    });
    event.target.classList.add('active');
    event.target.classList.remove('btn-outline-success');
    
    loadProducts(category);
}

function searchProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) return;
    
    // Get all product cards and filter
    const productCards = productsGrid.querySelectorAll('.col-md-6');
    productCards.forEach(card => {
        const productName = card.querySelector('.product-name')?.textContent.toLowerCase() || '';
        const productBrand = card.querySelector('.product-brand')?.textContent.toLowerCase() || '';
        
        if (productName.includes(searchTerm) || productBrand.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

function generateDirectLink(productName, dealerName) {
    // Generate search URLs for different platforms
    const searchQuery = encodeURIComponent(productName);
    const platforms = [
        { name: 'Amazon', url: `https://www.amazon.in/s?k=${searchQuery}&tag=agrishield-21` },
        { name: 'Flipkart', url: `https://www.flipkart.com/search?q=${searchQuery}` },
        { name: 'IndiaMART', url: `https://www.indiamart.com/search.html?searchQuery=${searchQuery}` }
    ];
    
    // Return the best matching platform
    return platforms[Math.floor(Math.random() * platforms.length)];
}

function toggleCompare(productId) {
    const index = compareList.indexOf(productId);
    if (index > -1) {
        compareList.splice(index, 1);
    } else {
        if (compareList.length >= 4) {
            alert('Maximum 4 products can be compared');
            document.getElementById(`compare-${productId}`).checked = false;
            return;
        }
        compareList.push(productId);
    }
    updateCompareCount();
}

function updateCompareCount() {
    const countEl = document.getElementById('compareCount');
    if (countEl) {
        countEl.textContent = compareList.length;
    }
}

async function showCompareModal() {
    if (compareList.length < 2) {
        alert('Please select at least 2 products to compare');
        return;
    }

    const modal = new bootstrap.Modal(document.getElementById('compareModal'));
    modal.show();

    const response = await fetch(`${API_URL}/products`);
    const products = await response.json();
    
    const selectedProducts = products.filter(p => compareList.includes(p._id));

    // Build comparison table
    const thead = document.querySelector('#compareTable thead tr');
    thead.innerHTML = '<th>Feature</th>' + selectedProducts.map(p => `<th>${p.name}</th>`).join('');

    const tbody = document.querySelector('#compareTable tbody');
    tbody.innerHTML = `
        <tr>
            <td><strong>Brand</strong></td>
            ${selectedProducts.map(p => `<td>${p.brand}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>Price</strong></td>
            ${selectedProducts.map(p => `<td>₹${p.price}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>Rating</strong></td>
            ${selectedProducts.map(p => `<td>${generateStars(p.rating)} ${p.rating}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>Reviews</strong></td>
            ${selectedProducts.map(p => `<td>${p.reviews}</td>`).join('')}
        </tr>
        <tr>
            <td><strong>Category</strong></td>
            ${selectedProducts.map(p => `<td>${p.category}</td>`).join('')}
        </tr>
    `;

    // Suggest best product
    const lowestPrice = [...selectedProducts].sort((a, b) => a.price - b.price)[0];
    const highestRating = [...selectedProducts].sort((a, b) => b.rating - a.rating)[0];

    const suggestionEl = document.getElementById('bestSuggestion');
    suggestionEl.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <strong>Best Price:</strong> ${lowestPrice.name} (₹${lowestPrice.price})
            </div>
            <div>
                <strong>Highest Rated:</strong> ${highestRating.name} (${highestRating.rating}★)
            </div>
        </div>
    `;
}

// ========================================
// WASTE CALCULATOR
// ========================================

async function calculateWaste(e) {
    e.preventDefault();

    const spinner = document.getElementById('wasteSpinner');
    const btnText = document.getElementById('wasteBtnText');

    const wasteType = document.getElementById('wasteType').value;
    const quantity = parseFloat(document.getElementById('wasteQuantity').value);

    if (!wasteType || !quantity) {
        alert('Please fill all fields');
        return;
    }

    spinner.classList.remove('d-none');
    btnText.textContent = 'Calculating...';

    try {
        const response = await fetch(`${API_URL}/waste-calc`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ wasteType, quantity })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('compostValue').textContent = `₹${data.compostIncome}`;
            document.getElementById('biogasValue').textContent = `₹${data.biogasIncome}`;
            document.getElementById('resaleValue').textContent = `₹${data.resaleIncome}`;
            document.getElementById('totalValue').textContent = `₹${data.totalIncome}`;
            document.getElementById('bestOption').textContent = `Best: ${data.bestOption}`;
            document.getElementById('wasteResult').classList.remove('d-none');

            // Update dealer table
            renderDealers(data.dealers);
        }
    } catch (error) {
        alert('Calculation failed');
    }

    spinner.classList.add('d-none');
    btnText.textContent = 'Calculate Value';
}

async function loadDealers() {
    const tbody = document.getElementById('dealerTableBody');
    if (!tbody) return;

    try {
        const response = await fetch(`${API_URL}/dealers`);
        const dealers = await response.json();
        
        if (response.ok) {
            renderDealers(dealers);
        }
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-danger">Failed to load dealers</td></tr>';
    }
}

function renderDealers(dealers) {
    const tbody = document.getElementById('dealerTableBody');
    if (!tbody) return;

    if (!dealers || dealers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No dealers found</td></tr>';
        return;
    }

    tbody.innerHTML = dealers.map(dealer => `
        <tr>
            <td><strong>${dealer.name}</strong></td>
            <td>${dealer.location}</td>
            <td>₹${dealer.pricePerKg}/kg</td>
            <td><a href="tel:${dealer.contact}" class="text-success">${dealer.contact}</a></td>
        </tr>
    `).join('');
}

// ========================================
// VOICE RECOGNITION
// ========================================

let selectedLanguage = 'en';

function initVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Speech recognition not supported');
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceRecognition = new SpeechRecognition();
    voiceRecognition.continuous = false;
    voiceRecognition.interimResults = false;

    voiceRecognition.lang = 'en-US';
    
    voiceRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        processVoiceCommand(transcript);
    };

    voiceRecognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        stopVoiceRecording();
    };

    voiceRecognition.onend = () => {
        stopVoiceRecording();
    };
}

function toggleVoice() {
    const btn = document.getElementById('voiceBtn');
    const output = document.getElementById('voiceOutput');
    
    if (!voiceRecognition) {
        alert('Voice recognition not supported in this browser');
        return;
    }

    if (btn.classList.contains('recording')) {
        voiceRecognition.stop();
    } else {
        btn.classList.add('recording');
        output.classList.add('show');
        output.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <select class="form-select form-select-sm" style="width:auto;" id="voiceLang" onchange="changeVoiceLanguage()">
                    <option value="en">English</option>
                    <option value="ta">Tamil</option>
                    <option value="hi">Hindi</option>
                    <option value="te">Telugu</option>
                    <option value="kn">Kannada</option>
                </select>
                <div>
                    <input type="checkbox" id="autoSpeak" checked> <label for="autoSpeak">Speak</label>
                </div>
            </div>
            <div class="listening-text">Listening...</div>
        `;
        voiceRecognition.lang = selectedLanguage === 'ta' ? 'ta-IN' : selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'te' ? 'te-IN' : selectedLanguage === 'kn' ? 'kn-IN' : 'en-US';
        voiceRecognition.start();
    }
}

function changeVoiceLanguage() {
    const select = document.getElementById('voiceLang');
    selectedLanguage = select.value;
    if (voiceRecognition) {
        voiceRecognition.lang = selectedLanguage === 'ta' ? 'ta-IN' : selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'te' ? 'te-IN' : selectedLanguage === 'kn' ? 'kn-IN' : 'en-US';
    }
}

function stopVoiceRecording() {
    const btn = document.getElementById('voiceBtn');
    btn.classList.remove('recording');
}

function speakText(text, lang = 'en') {
    if (!('speechSynthesis' in window)) {
        console.log('Speech synthesis not supported');
        return;
    }
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Map language codes
    const langMap = {
        'ta': 'ta-IN',
        'hi': 'hi-IN',
        'te': 'te-IN',
        'kn': 'kn-IN',
        'en': 'en-US'
    };
    
    utterance.lang = langMap[lang] || 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to find a matching voice
    const voices = speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(lang));
    if (matchingVoice) {
        utterance.voice = matchingVoice;
    }
    
    utterance.onerror = (event) => {
        console.log('Speech error:', event.error);
    };
    
    speechSynthesis.speak(utterance);
}

function processVoiceCommand(transcript) {
    const output = document.getElementById('voiceOutput');
    const autoSpeak = document.getElementById('autoSpeak')?.checked ?? true;
    output.innerHTML += `<div class="user-voice">You: "${transcript}"</div>`;

    let response = '';
    let responseKey = '';
    
    // Check for keywords based on language
    const keywords = {
        en: {
            'rain': 'Current humidity is ' + (currentWeatherData?.humidity || 'N/A') + ' percent.',
            'temperature': 'Current temperature is ' + (currentWeatherData?.temperature || 'N/A') + ' degrees Celsius.',
            'crop': 'Based on current conditions, we recommend checking the Crop Suggestion Engine on your dashboard.',
            'market': 'Visit the Marketplace to browse agricultural products and compare prices.',
            'marketplace': 'Visit the Marketplace to browse agricultural products and compare prices.',
            'weather': 'Current weather: ' + (currentWeatherData?.weatherCondition || 'N/A') + ', Temperature: ' + (currentWeatherData?.temperature || 'N/A') + ' degrees.',
            'forecast': 'Check the 7-day forecast on your dashboard for upcoming weather predictions.',
            'drought': 'We will analyze the forecast for drought conditions and provide recommendations.',
            'heatwave': 'Warning: Heatwave conditions detected. Take necessary precautions for your crops.',
            'cheapest': 'Visit the Marketplace and use the search to find the cheapest products. Compare prices with our comparison tool.',
            'fertilizer': 'Browse our Marketplace for fertilizers. We have Urea, DAP, NPK and organic options.',
            'seeds': 'Check the Marketplace for quality seeds. We have Wheat, Rice, Cotton, and Vegetable seeds.',
            'pesticide': 'We offer various pesticides in the Marketplace. Browse and compare before buying.',
            'loss': 'To prevent crop loss, check the Climate Dashboard for risk alerts and follow crop suggestions.',
            'save money': 'Follow our crop suggestions to optimize yield. Use the Waste to Value calculator for additional income.',
            'profit': 'Our smart crop scoring system helps maximize your profit potential based on climate conditions.',
            'help': 'I can help with weather, crops, marketplace, waste management, and more. What do you need?',
            'profile': 'Visit your profile to update your farming details for better crop recommendations.',
            'language': 'Change language using the dropdown in the header. We support English, Tamil, Hindi, and Telugu.'
        },
        ta: {
            'மழை': 'தற்போதைய ஈரப்பதம் ' + (currentWeatherData?.humidity || 'N/A') + ' சதவீதம்.',
            'வெப்பநிலை': 'தற்போதைய வெப்பநிலை ' + (currentWeatherData?.temperature || 'N/A') + ' டிகிரி செல்சியஸ்.',
            'பயிர்': 'தற்போதைய நிலைகளின் அடிப்படையில், உங்கள் பயிர் பரிந்துரை பக்கத்தை பரிசீலிக்கவும்.',
            'சந்தை': 'விவசாய தயாரிப்புகளை உலாவவும் மற்றும் விலைகளை ஒப்பிடவும்.',
            'வான்வழி': 'தற்போதைய வான்வழி: ' + (currentWeatherData?.weatherCondition || 'N/A'),
            'முன்னறிவிப்பு': 'வரும் காலநிலை முன்னறிவிப்புகளுக்கு டாஷ்போர்டை சரிபார்க்கவும்.',
            'வறட்சி': 'வறட்சி நிலைமைகளை நாங்கள் பகுப்பாய்வு செய்து பரிந்துரைகளை வழங்குவோம்.',
            'வெப்ப அலை': 'எச்சரிக்கை: வெப்ப அலை நிலைமைகள் கண்டறியப்பட்டுள்ளன.'
        },
        hi: {
            'बारिश': 'वर्तमान आर्द्रता ' + (currentWeatherData?.humidity || 'N/A') + ' प्रतिशत है।',
            'तापमान': 'वर्तमान तापमान ' + (currentWeatherData?.temperature || 'N/A') + ' डिग्री सेल्सियस है।',
            'फसल': 'वर्तमान स्थिति के आधार पर, हम फसल सुझाव पृष्ठ की जांच की सिफारिश करते हैं।',
            'बाजार': 'कृषि उत्पादों के लिए बाजार पर जाएं।',
            'मौसम': 'वर्तमान मौसम: ' + (currentWeatherData?.weatherCondition || 'N/A'),
            'खाद': 'हमारे बाजार में यूरिया, डीएपी, एनपीके और जैविक खाद उपलब्ध हैं।',
            'बीज': 'बाजार में गुणवत्तापूर्ण बीज खरीदें।',
            'नुकसान': 'फसल हानि से बचने के लिए जलवायु डैशबोर्ड देखें।'
        },
        te: {
            'చిట్ట': 'প্রস্তুত তেম ' + (currentWeatherData?.humidity || 'N/A') + ' శాతం.',
            'ఉష్ణోগ్రత': 'প্রস্তুত ఉష్ణోগ్రత ' + (currentWeatherData?.temperature || 'N/A') + ' డిగ్రీ.',
            'పంట': 'ద్వారా crop suggestions page nutunche recommend chestunnam.',
            'మార్కెట్': 'Marketplace lo products chusi prices compare cheyandi.',
            ' వాతావరణ': 'Current weather: ' + (currentWeatherData?.weatherCondition || 'N/A')
        },
        kn: {
            'ಮಳೆ': 'ಪ್ರಸ್ತುತ ಆರ್ದ್ರತೆ ' + (currentWeatherData?.humidity || 'N/A') + ' ಪ್ರತಿಶತ.',
            'ತಾಪಮಾನ': 'ಪ್ರಸ್ತುತ ತಾಪಮಾನ ' + (currentWeatherData?.temperature || 'N/A') + ' ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್.',
            'ಬೆಳೆ': 'ಪ್ರಸ್ತುತ ಸ್ಥಿತಿಯ ಆಧಾರದ ಮೇಲೆ, ನಾವು ಬೆಳೆ ಸಲಹೆ ಪುಟವನ್ನು ಪರಿಶೀಲಿಸಲು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ.'
        }
    };

    const langKeywords = keywords[selectedLanguage] || keywords.en;
    
    for (const [key, value] of Object.entries(langKeywords)) {
        if (transcript.includes(key)) {
            response = value;
            responseKey = key;
            break;
        }
    }

    // Fallback to English
    if (!response) {
        for (const [key, value] of Object.entries(keywords.en)) {
            if (transcript.includes(key)) {
                response = value;
                responseKey = key;
                break;
            }
        }
    }

    if (!response) {
        response = selectedLanguage === 'ta' 
            ? 'ನಾನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲಿಲ್ಲ. ಮಳೆ, ತಾಪಮಾನ, ಬೆಳೆ, ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಎಂದು ಹೇಳಿ.'
            : selectedLanguage === 'hi'
            ? 'मुझे समझ नहीं आया। बारिश, तापमान, फसल, या मार्केट कहें।'
            : selectedLanguage === 'te'
            ? 'నాకు వర్కుకు లేదు. Rain, Temperature, Crop, or Market అని చెప్పు.'
            : selectedLanguage === 'kn'
            ? 'ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ಮಳೆ, ತಾಪಮಾನ, ಬೆಳೆ, ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಎಂದು ಹೇಳಿ.'
            : 'I didn\'t understand. Try saying: rain, temperature, crop, market, weather, or forecast.';
    }

    setTimeout(() => {
        output.innerHTML += `<div class="bot-voice">🤖 ${response}</div>`;
        if (autoSpeak) {
            speakText(response, selectedLanguage);
        }
    }, 500);
}

// ========================================
// HELP & SUPPORT
// ========================================

function submitContact(e) {
    e.preventDefault();
    
    const resultEl = document.getElementById('contactMessageResult');
    resultEl.className = 'alert alert-success mt-3';
    resultEl.textContent = 'Thank you for your message! We will get back to you soon.';
    resultEl.classList.remove('d-none');
    
    document.getElementById('contactForm').reset();
    
    setTimeout(() => {
        resultEl.classList.add('d-none');
    }, 5000);
}

function handleChatKeyPress(e) {
    if (e.key === 'Enter') {
        sendChat();
    }
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;

    const chatMessages = document.getElementById('chatMessages');
    
    // Add user message
    chatMessages.innerHTML += `
        <div class="chat-message user">
            <div class="message-content">${message}</div>
        </div>
    `;

    // Simulate bot response
    setTimeout(() => {
        const responses = getBotResponse(message);
        chatMessages.innerHTML += `
            <div class="chat-message bot">
                <div class="message-content">${responses}</div>
            </div>
        `;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);

    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(message) {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('weather')) {
        return 'You can check the current weather and 7-day forecast on your Dashboard. Would you like me to help you with something else?';
    } else if (lowerMsg.includes('crop')) {
        return 'Our Crop Suggestion Engine analyzes temperature, humidity, and rainfall to recommend the best crops for your region.';
    } else if (lowerMsg.includes('market') || lowerMsg.includes('buy')) {
        return 'Visit our Marketplace to browse seeds, fertilizers, pesticides, and irrigation equipment. You can also compare products!';
    } else if (lowerMsg.includes('waste')) {
        return 'Use our Waste to Value calculator to estimate income from your agricultural waste. We also provide dealer contacts.';
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        return 'Hello! How can I help you today? You can ask about weather, crops, marketplace, or waste management.';
    } else {
        return 'I understand you need help with "' + message + '". Please visit the Help page for more information or call our toll-free number.';
    }
}
