
// FIX: Add declarations for global variables and extend Window interface to avoid TypeScript errors.
declare var Chart: any;
declare var THREE: any;

declare global {
    interface Window {
        Chart: any;
        THREE: any;
        countdownInterval?: number;
        autosaveInterval?: number;
    }
}

// --- 전역 설정 ---
const V0_4_0_RELEASE_DATE = new Date('2025-11-19T18:00:00');
const TROPHIES = { twilight: { name: 'Twilight Trophy', description: '밤하늘에서 반짝이는 별을 손에 넣은 자에게 주어지는 증표.', isUnlocked: () => gameState.shared.hasTwilightTrophy, effectText: '밤 시간 동안 모든 코인 가격 상승 확률 +2.5%', } };
const WEATHER_DATA = {
    '맑음': { icon: '☀️', description: '모든 코인: 상승 확률 +0.5%' },
    '비': { icon: '🌧️', description: 'CUBE: 상승 확률 +2.5%. 변동 주기 +5%.' },
    '구름': { icon: '☁️', description: '모든 코인: 변동 주기 -5%.' },
    '산성비': { icon: '☣️', description: '모든 코인: 상승 확률 -2.5%' },
    '천둥': { icon: '⛈️', description: '모든 코인: 상승 확률 -0.5%. 0.5% 확률로 인터넷 연결 끊김/초.' },
    '무지개': { icon: '🌈', description: '모든 코인: 상승 확률 +5%.' }
};


let currentVersion;
let v0_3_0_gameLoopTimeout = null, v0_3_0_priceUpdateTimeout = null, v1_0_0_gameLoopInterval = null, v1_0_0_priceUpdateTimeout = null;
let v0_3_0_zeroCooldownEndTime = 0, v0_3_0_starCatchingBuffEndTime = 0, v0_3_0_gameTime;
// FIX: Changed to `any` to allow dynamic property assignment and avoid type errors.
let v0_3_0_dom: any = {}, v1_0_0_dom: any = {}, shared_dom: any = {};

// --- 3D 렌더링 관련 ---
let scene, camera, renderer, cube, cubeMaterial, ambientLight, directionalLight;
let v0_3_0_priceChart, v0_3_0_prismPriceChart, v0_3_0_lunarPriceChart;
let v1_0_0_chartCube, v1_0_0_chartLunar, v1_0_0_chartEnergy, v1_0_0_chartPrism;

// --- 게임 상태 관리 ---
// 모든 게임 데이터를 포함하는 단일 객체. 초기화 오류 방지를 위해 기본 구조를 즉시 정의.
let gameState = {
    v0_3_0: {
        userCash: 100000, userCubes: 0, userPrisms: 0, userLunar: 0,
        currentPrice: 10000, lastPrice: 10000, currentPrismPrice: 50000, lastPrismPrice: 50000,
        currentLunarPrice: 20000, lastLunarPrice: 20000, transactions: [],
        isCubePurchased: false, isPrismUpgraded: false, isLunarBlessed: false,
        gameTime: new Date(2025, 10, 15, 9, 0, 0).getTime(), paperClicks: 0,
        jobTimers: { paper: 0, starcatching: 0 },
        isSleeping: false,
    },
    v1_0_0: {
        userEnergy: 0, userPrisms: 0,
        currentPrice: 10000, lastPrice: 10000,
        currentLunarPrice: 20000, lastLunarPrice: 20000,
        currentEnergyPrice: 50000, lastEnergyPrice: 50000,
        currentPrismPrice: 100000, lastPrismPrice: 100000,
        computerTier: 0,
        isCubePurchased: false, isLunarUpgraded: false, isEnergyUpgraded: false, isPrismUpgraded: false,
        weather: '맑음', weatherCounter: 0,
        experiencedWeathers: {},
        shopItems: { digitalClock: false, weatherAlmanac: false, bed: false },
        isInternetOutage: false,
        nextWeatherIsRainbow: false,
        lastWeather: '맑음',
    },
    shared: {
        hasTwilightTrophy: false,
        usedCodes: [],
        prismMigratedToEnergy: false,
        lastOnlineTimestamp: null,
        v0_4_0_preview_used: false,
        v0_4_0_preview_end_time: 0,
    }
};

// =======================================================
// V0.3.0 게임 로직
// =======================================================
function initV0_3_0_Charts() { const commonOptions = { scales: { y: { ticks: { color: '#9ca3af' }, grid: { color: '#4b5563' } }, x: { ticks: { color: '#9ca3af' }, grid: { color: '#4b5563' } } }, plugins: { legend: { display: false } }, maintainAspectRatio: false }; if (document.getElementById('v0.3.0-price-chart')) { const ctxCube = (document.getElementById('v0.3.0-price-chart') as HTMLCanvasElement).getContext('2d'); v0_3_0_priceChart = new Chart(ctxCube, { type: 'line', data: { labels: [], datasets: [{ label: 'CUBE Price', data: [], borderColor: '#60a5fa', tension: 0.1, pointRadius: 0 }] }, options: commonOptions }); } if (document.getElementById('v0.3.0-prism-price-chart')) { const ctxPrism = (document.getElementById('v0.3.0-prism-price-chart') as HTMLCanvasElement).getContext('2d'); v0_3_0_prismPriceChart = new Chart(ctxPrism, { type: 'line', data: { labels: [], datasets: [{ label: 'PRISM Price', data: [], borderColor: '#f472b6', tension: 0.1, pointRadius: 0 }] }, options: commonOptions }); } if (document.getElementById('v0.3.0-lunar-price-chart')) { const ctxLunar = (document.getElementById('v0.3.0-lunar-price-chart') as HTMLCanvasElement).getContext('2d'); v0_3_0_lunarPriceChart = new Chart(ctxLunar, { type: 'line', data: { labels: [], datasets: [{ label: 'LUNAR Price', data: [], borderColor: '#a855f7', tension: 0.1, pointRadius: 0 }] }, options: commonOptions }); } }
function v0_3_0_updateChartData(chart, price) { if (!chart) return; const now = new Date(v0_3_0_gameTime); const label = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`; chart.data.labels.push(label); chart.data.datasets[0].data.push(price); const maxDataPoints = 30; if (chart.data.labels.length > maxDataPoints) { chart.data.labels.shift(); chart.data.datasets[0].data.shift(); } chart.update('none'); }

function initV0_3_0_Game() {
    const prefix = 'v0.3.0-';
    v0_3_0_dom = {
        canvasContainer: document.getElementById(prefix+'canvas-container'), cashDisplay: document.getElementById(prefix+'user-cash'), cubesDisplay: document.getElementById(prefix+'user-cubes'), prismsDisplay: document.getElementById(prefix+'user-prisms'), priceDisplay: document.getElementById(prefix+'current-price'), priceChangeDisplay: document.getElementById(prefix+'price-change'), prismPriceDisplay: document.getElementById(prefix+'current-prism-price'), prismPriceChangeDisplay: document.getElementById(prefix+'prism-price-change'), buyButtonCube: document.getElementById(prefix+'buy-button-cube'), sellButtonCube: document.getElementById(prefix+'sell-button-cube'), buyButtonPrism: document.getElementById(prefix+'buy-button-prism'), sellButtonPrism: document.getElementById(prefix+'sell-button-prism'), notification: document.getElementById(prefix+'notification'), buyCubeButton: document.getElementById(prefix+'buy-cube-button'), cubeOverlay: document.getElementById(prefix+'cube-purchase-overlay'), upgradePrismSection: document.getElementById(prefix+'upgrade-prism-section'), upgradePrismButton: document.getElementById(prefix+'upgrade-prism-button'), jobPaper: document.getElementById(prefix+'job-paper'), jobPaperTimer: document.getElementById(prefix+'job-paper-timer'), jobPaperText: document.getElementById(prefix+'job-paper-text'), codeSubmitButton: document.getElementById(prefix+'code-submit-button'), passiveIncomeDisplay: document.getElementById(prefix+'passive-income-display'), incomePerSecond: document.getElementById(prefix+'income-per-second'), chartTabCube: document.getElementById(prefix+'chart-tab-cube'), chartTabPrism: document.getElementById(prefix+'chart-tab-prism'), chartCubeContainer: document.getElementById(prefix+'chart-cube-container'), chartPrismContainer: document.getElementById(prefix+'chart-prism-container'), transactionHistory: document.getElementById(prefix+'transaction-history'), newsFeed: document.getElementById(prefix+'news-feed'), codeInput: document.getElementById(prefix+'code-input'), amountInputCube: document.getElementById(prefix+'amount-input-cube'), amountInputPrism: document.getElementById(prefix+'amount-input-prism'),
        userLunar: document.getElementById(prefix+'user-lunar'), currentLunarPrice: document.getElementById(prefix+'current-lunar-price'), lunarPriceChange: document.getElementById(prefix+'lunar-price-change'), lunarPriceDisplay: document.getElementById(prefix+'lunar-price-display'), lunarAssetDisplay: document.getElementById(prefix+'lunar-asset-display'), buyButtonLunar: document.getElementById(prefix+'buy-button-lunar'), sellButtonLunar: document.getElementById(prefix+'sell-button-lunar'), amountInputLunar: document.getElementById(prefix+'amount-input-lunar'), gameTime: document.getElementById(prefix+'game-time'), timeContainer: document.getElementById(prefix+'time-container'), jobStarcatching: document.getElementById(prefix+'job-starcatching'), jobStarcatchingTimer: document.getElementById(prefix+'job-starcatching-timer'), sleepButton: document.getElementById(prefix+'sleep-button'), sleepSection: document.getElementById(prefix+'sleep-section'), upgradeLunarSection: document.getElementById(prefix+'upgrade-lunar-section'), upgradeLunarBlessingButton: document.getElementById(prefix+'upgrade-lunar-blessing-button'), chartTabLunar: document.getElementById(prefix+'chart-tab-lunar'), chartLunarContainer: document.getElementById(prefix+'chart-lunar-container'), lunarTradeSection: document.getElementById(prefix+'lunar-trade-section'), gameTitle: document.getElementById(prefix+'game-title'), versionDisplay: document.getElementById(prefix+'version-display'), updateList: document.getElementById(prefix+'update-list'),
        trophyList: document.getElementById(prefix+'trophy-list'), trophyEffects: document.getElementById(prefix+'trophy-effects')
    };
    if (v0_3_0_dom.buyButtonCube) v0_3_0_dom.buyButtonCube.addEventListener('click', () => v0_3_0_handleTrade('buy', 'cube')); 
    if (v0_3_0_dom.sellButtonCube) v0_3_0_dom.sellButtonCube.addEventListener('click', () => v0_3_0_handleTrade('sell', 'cube')); 
    if (v0_3_0_dom.buyButtonPrism) v0_3_0_dom.buyButtonPrism.addEventListener('click', () => v0_3_0_handleTrade('buy', 'prism')); 
    if (v0_3_0_dom.sellButtonPrism) v0_3_0_dom.sellButtonPrism.addEventListener('click', () => v0_3_0_handleTrade('sell', 'prism')); 
    if (v0_3_0_dom.buyCubeButton) v0_3_0_dom.buyCubeButton.addEventListener('click', v0_3_0_handleBuy3DCube); 
    if (v0_3_0_dom.upgradePrismButton) v0_3_0_dom.upgradePrismButton.addEventListener('click', v0_3_0_handleUpgradePrism); 
    if (v0_3_0_dom.jobPaper) v0_3_0_dom.jobPaper.addEventListener('click', v0_3_0_handleJobClick); 
    if (v0_3_0_dom.codeSubmitButton) v0_3_0_dom.codeSubmitButton.addEventListener('click', handleCodeSubmit); 
    if (v0_3_0_dom.chartTabCube) v0_3_0_dom.chartTabCube.addEventListener('click', () => v0_3_0_switchChart('cube')); 
    if (v0_3_0_dom.chartTabPrism) v0_3_0_dom.chartTabPrism.addEventListener('click', () => v0_3_0_switchChart('prism')); 
    ['assets', 'trade', 'charts', 'history', 'news', 'jobs', 'trophies', 'code', 'updates', 'sleep'].forEach(s => document.getElementById(`${prefix}toggle-${s}`)?.addEventListener('click', () => { document.getElementById(`${prefix}content-${s}`).classList.toggle('hidden'); document.getElementById(`${prefix}toggle-${s}-icon`).classList.toggle('rotate-180'); })); 
    
    if (v0_3_0_dom.gameTitle) v0_3_0_dom.gameTitle.textContent = '큐브 코인 시뮬레이터';
    if (v0_3_0_dom.versionDisplay) v0_3_0_dom.versionDisplay.textContent = '(v.0.3.0)';
    if (v0_3_0_dom.updateList) v0_3_0_dom.updateList.innerHTML = '<li>v.0.3.0 달빛 업데이트 적용</li><li>낮과 밤 시스템 추가</li><li>신규 코인 $LUNAR 및 달빛 이벤트 추가</li><li>수면 시스템 추가</li><li>\'폐지 줍기\' 로직 안정화</li>';
    
    if (v0_3_0_dom.buyButtonLunar) v0_3_0_dom.buyButtonLunar.addEventListener('click', () => v0_3_0_handleTrade('buy', 'lunar')); 
    if (v0_3_0_dom.sellButtonLunar) v0_3_0_dom.sellButtonLunar.addEventListener('click', () => v0_3_0_handleTrade('sell', 'lunar'));
    if (v0_3_0_dom.jobStarcatching) v0_3_0_dom.jobStarcatching.addEventListener('click', v0_3_0_handleJobClick);
    if (v0_3_0_dom.chartTabLunar) v0_3_0_dom.chartTabLunar.addEventListener('click', () => v0_3_0_switchChart('lunar'));
    if (v0_3_0_dom.upgradeLunarBlessingButton) v0_3_0_dom.upgradeLunarBlessingButton.addEventListener('click', v0_3_0_handleUpgradeLunarBlessing);
    if (v0_3_0_dom.sleepButton) v0_3_0_dom.sleepButton.addEventListener('click', v0_3_0_handleSleep);
    
    initV0_3_0_Charts();
}
function v0_3_0_startGame() {
    if (v0_3_0_gameLoopTimeout) clearTimeout(v0_3_0_gameLoopTimeout);
    if (v0_3_0_priceUpdateTimeout) clearTimeout(v0_3_0_priceUpdateTimeout);
    v0_3_0_gameTime = new Date(gameState.v0_3_0.gameTime);
    v0_3_0_restoreUIState();
    v0_3_0_gameLoop();
    v0_3_0_priceUpdateLoop();
}

function v0_3_0_showNotification(message, isError = true) { if(!v0_3_0_dom.notification) return; v0_3_0_dom.notification.textContent = message; v0_3_0_dom.notification.className = `fixed bottom-6 right-6 text-white p-4 rounded-lg shadow-xl z-50 ${isError ? 'bg-red-500' : 'bg-green-500'} opacity-100 translate-y-0 transition-all duration-300`; setTimeout(() => { v0_3_0_dom.notification.classList.add('opacity-0', 'translate-y-10'); }, 3000); }

function v0_3_0_updateTrophyDisplay() {
    if (!v0_3_0_dom.trophyList || !v0_3_0_dom.trophyEffects) return;
    v0_3_0_dom.trophyList.innerHTML = '';
    let totalEffectsHTML = ''; let hasEffects = false;
    for (const key in TROPHIES) {
        const trophy = TROPHIES[key]; const isUnlocked = trophy.isUnlocked();
        const trophyEl = document.createElement('div');
        trophyEl.className = `bg-gray-600 p-3 rounded-lg flex items-center gap-4 transition-opacity ${isUnlocked ? '' : 'opacity-50'}`;
        trophyEl.innerHTML = `<div><span class="font-bold text-lg ${isUnlocked ? 'text-yellow-400' : 'text-gray-400'}">${isUnlocked ? '🏆' : '🔒'} ${trophy.name}</span><p class="text-xs text-gray-400 mt-1">${trophy.description}</p></div>`;
        v0_3_0_dom.trophyList.appendChild(trophyEl);
        if (isUnlocked) { totalEffectsHTML += `<p>• ${trophy.effectText}</p>`; hasEffects = true; }
    }
    if (hasEffects) { v0_3_0_dom.trophyEffects.innerHTML = totalEffectsHTML; } else { v0_3_0_dom.trophyEffects.innerHTML = '<p class="text-gray-500">활성화된 효과가 없습니다.</p>'; }
}

function v0_3_0_updateUI() {
    if (!v0_3_0_dom.cashDisplay) return;
    const state = gameState.v0_3_0;
    v0_3_0_dom.cashDisplay.textContent = Math.floor(state.userCash).toLocaleString('ko-KR');
    v0_3_0_dom.cubesDisplay.textContent = state.userCubes.toLocaleString('ko-KR', { maximumFractionDigits: 4 });
    v0_3_0_dom.prismsDisplay.textContent = state.userPrisms.toLocaleString('ko-KR');
    
    const updatePriceDisplay = (display, changeDisplay, current, last) => {
        if (!display || !changeDisplay) return;
        display.textContent = `${current.toLocaleString('ko-KR')} KRW`;
        const change = current - last; const pct = last > 0 ? ((change / last) * 100).toFixed(2) : 0;
        if (change > 0) changeDisplay.innerHTML = `<span class="text-green-500">▲ ${change.toLocaleString('ko-KR')} (+${pct}%)</span>`;
        else if (change < 0) changeDisplay.innerHTML = `<span class="text-red-500">▼ ${Math.abs(change).toLocaleString('ko-KR')} (${pct}%)</span>`;
        else changeDisplay.innerHTML = `0 (0.00%)`;
    };
    updatePriceDisplay(v0_3_0_dom.priceDisplay, v0_3_0_dom.priceChangeDisplay, state.currentPrice, state.lastPrice);
    updatePriceDisplay(v0_3_0_dom.prismPriceDisplay, v0_3_0_dom.prismPriceChangeDisplay, state.currentPrismPrice, state.lastPrismPrice);
    
    const isDay = v0_3_0_gameTime.getHours() >= 9 && v0_3_0_gameTime.getHours() < 19;
    let lunarIncome = (state.isLunarBlessed && !isDay) ? 100 : 0;
    if (v0_3_0_dom.userLunar) v0_3_0_dom.userLunar.textContent = state.userLunar.toLocaleString('ko-KR');
    updatePriceDisplay(v0_3_0_dom.currentLunarPrice, v0_3_0_dom.lunarPriceChange, state.currentLunarPrice, state.lastLunarPrice);
    const gameHours = v0_3_0_gameTime.getHours(), gameMinutes = String(v0_3_0_gameTime.getMinutes()).padStart(2, '0');
    if (v0_3_0_dom.gameTime) v0_3_0_dom.gameTime.textContent = `${String(gameHours).padStart(2, '0')}:${gameMinutes} (${isDay ? '☀️' : '🌙'})`;
    
    const totalIncome = (state.isCubePurchased ? 100 : 0) + (state.isPrismUpgraded ? 900 : 0) + lunarIncome;
    if (v0_3_0_dom.incomePerSecond) v0_3_0_dom.incomePerSecond.textContent = `+${totalIncome.toLocaleString('ko-KR')} KRW / sec`;
    
    v0_3_0_updateTransactionHistory();
    v0_3_0_updateTrophyDisplay();
}

function v0_3_0_updateTransactionHistory() { if (!v0_3_0_dom.transactionHistory) return; const transactions = gameState.v0_3_0.transactions; if (transactions.length === 0) { v0_3_0_dom.transactionHistory.innerHTML = '<div class="text-gray-400 text-sm text-center p-4">...</div>'; return; } v0_3_0_dom.transactionHistory.innerHTML = ''; transactions.slice(-100).forEach(tx => { const el = document.createElement('div'); el.className = 'border-b border-gray-600 p-2 text-sm'; const typeClass = tx.type === '매수' ? 'text-green-400' : 'text-red-400'; el.innerHTML = `<div><span class="${typeClass} font-bold">[${tx.type}]</span> ${tx.amount.toLocaleString('ko-KR')} ${tx.coin}</div><div class="text-xs text-gray-400">@ ${tx.price.toLocaleString('ko-KR')} KRW</div>`; v0_3_0_dom.transactionHistory.prepend(el); }); }
function v0_3_0_getNewPrice(currentPrice, config) {
    const isDay = v0_3_0_gameTime.getHours() >= 9 && v0_3_0_gameTime.getHours() < 19;
    let trophyBonus = !isDay && gameState.shared.hasTwilightTrophy ? 0.025 : 0;
    let dir = Math.random() < (config.riseProb + trophyBonus) ? 1 : -1;
    let mag = Math.random(), pct;
    if (mag < config.mags[0]) pct = (Math.random() * 0.02) + 0.001;
    else if (mag < config.mags[0] + config.mags[1]) pct = (Math.random() * 0.05) + 0.021;
    else pct = (Math.random() * 0.12) + 0.051;
    const newPrice = currentPrice + (currentPrice * pct * dir);
    return Math.round(Math.max(config.min, Math.min(config.max, newPrice)));
}

function v0_3_0_priceUpdateLoop() {
    if (gameState.v0_3_0.isSleeping) {
        v0_3_0_priceUpdateTimeout = setTimeout(v0_3_0_priceUpdateLoop, 2000);
        return;
    }
    const state = gameState.v0_3_0;
    const isDay = v0_3_0_gameTime.getHours() >= 9 && v0_3_0_gameTime.getHours() < 19;
    const getFullConfig = (coinConfig, mode) => ({ min: coinConfig.min, max: coinConfig.max, ...coinConfig[mode] });
    const configs = { 
        cube: { min: 5000, max: 25000, day: { riseProb: 0.51, mags: [0.5, 0.45, 0.05] }, night: { riseProb: 0.51, mags: [0.6, 0.4, 0] } }, 
        prism: { min: 40000, max: 200000, day: { riseProb: 0.53, mags: [0.5, 0.45, 0.05] }, night: { riseProb: 0.53, mags: [0.6, 0.4, 0] } }, 
        lunar: { min: 10000, max: 50000, day: { riseProb: 0.45, mags: [0.5, 0.45, 0.05] }, night: { riseProb: 0.55, mags: [0.4, 0.5, 0.1] } } 
    };
    const updatePrices = (mode) => {
        state.lastPrice = state.currentPrice; state.currentPrice = v0_3_0_getNewPrice(state.currentPrice, getFullConfig(configs.cube, mode)); v0_3_0_updateChartData(v0_3_0_priceChart, state.currentPrice);
        state.lastPrismPrice = state.currentPrismPrice; state.currentPrismPrice = v0_3_0_getNewPrice(state.currentPrismPrice, getFullConfig(configs.prism, mode)); v0_3_0_updateChartData(v0_3_0_prismPriceChart, state.currentPrismPrice);
        state.lastLunarPrice = state.currentLunarPrice; state.currentLunarPrice = v0_3_0_getNewPrice(state.currentLunarPrice, getFullConfig(configs.lunar, mode)); v0_3_0_updateChartData(v0_3_0_lunarPriceChart, state.currentLunarPrice);
    };
    updatePrices(isDay ? 'day' : 'night');
    const interval = isDay ? 2000 : 4000; 
    v0_3_0_priceUpdateTimeout = setTimeout(v0_3_0_priceUpdateLoop, interval);
}

function v0_3_0_gameLoop() {
    const now = Date.now();
    const state = gameState.v0_3_0;
    const isZeroCooldown = v0_3_0_zeroCooldownEndTime > now;

    if (!state.isSleeping) {
        v0_3_0_gameTime.setMinutes(v0_3_0_gameTime.getMinutes() + 1);
        const lunarIncome = (state.isLunarBlessed && !(v0_3_0_gameTime.getHours() >= 9 && v0_3_0_gameTime.getHours() < 19)) ? 100 : 0;
        state.userCash += ((state.isCubePurchased ? 100 : 0) + (state.isPrismUpgraded ? 900 : 0) + lunarIncome) / 4;
    }
    
    const currentHour = v0_3_0_gameTime.getHours();
    const isDay = currentHour >= 9 && currentHour < 19;
    if (v0_3_0_dom.canvasContainer && (v0_3_0_dom.canvasContainer.style.backgroundColor === 'rgb(5, 5, 34)') !== !isDay) { // Day/Night transition
        const color = isDay ? 0x222222 : 0x050522;
        if(renderer) renderer.setClearColor(color);
        if(ambientLight) ambientLight.intensity = isDay ? 0.7 : 0.5;
        if(directionalLight) directionalLight.intensity = isDay ? 1.0 : 0.6;
    }
    
    if (v0_3_0_dom.jobStarcatching) v0_3_0_dom.jobStarcatching.classList.toggle('hidden', isDay || gameState.shared.hasTwilightTrophy);
    if (v0_3_0_dom.sleepButton) v0_3_0_dom.sleepButton.classList.toggle('btn-disabled', !(currentHour >= 20 || currentHour < 8));
    if (v0_3_0_dom.jobPaperText) { v0_3_0_dom.jobPaperText.textContent = (gameState.shared.hasTwilightTrophy && !isDay) ? '달빛 아래 폐지 줍기 (+1500)' : '폐지 줍기 (+500)'; }
    
    Object.keys(state.jobTimers).forEach(job => {
        const timerEl = v0_3_0_dom[`job${job}Timer`], jobEl = v0_3_0_dom[`job${job}`];
        if (isZeroCooldown) { if (jobEl) jobEl.classList.remove('btn-disabled'); if (timerEl) timerEl.textContent = '(0초)'; } 
        else { if (state.jobTimers[job] > now) { const timeLeft = Math.ceil((state.jobTimers[job] - now) / 1000); if (timerEl) timerEl.textContent = `(${timeLeft}초)`; if(jobEl) jobEl.classList.add('btn-disabled'); } else if(jobEl) { jobEl.classList.remove('btn-disabled'); if (timerEl) timerEl.textContent = ''; } }
    });
    v0_3_0_updateUI();
    v0_3_0_gameLoopTimeout = setTimeout(v0_3_0_gameLoop, 250);
}
function v0_3_0_handleTrade(type, coin) {
    const state = gameState.v0_3_0;
    const amountInput = v0_3_0_dom[`amountInput${coin.charAt(0).toUpperCase() + coin.slice(1)}`] as HTMLInputElement;
    if (!amountInput) return; const amount = parseInt(amountInput.value); if (!(amount > 0)) return;
    const prices = { cube: state.currentPrice, prism: state.currentPrismPrice, lunar: state.currentLunarPrice };
    const cost = prices[coin] * amount, coinUpper = coin.toUpperCase();

    if (type === 'buy') {
        if (state.userCash >= cost) { state.userCash -= cost; if(coin === 'cube') state.userCubes += amount; else if (coin === 'prism') state.userPrisms += amount; else state.userLunar += amount; state.transactions.push({ type: '매수', coin: coinUpper, amount, price: prices[coin] }); v0_3_0_showNotification(`${amount} ${coinUpper} 매수!`, false); } 
        else { v0_3_0_showNotification('현금 부족', true); return; }
    } else { if ((coin === 'cube' && state.userCubes >= amount) || (coin === 'prism' && state.userPrisms >= amount) || (coin === 'lunar' && state.userLunar >= amount)) { state.userCash += cost; if(coin === 'cube') state.userCubes -= amount; else if (coin === 'prism') state.userPrisms -= amount; else state.userLunar -= amount; state.transactions.push({ type: '매도', coin: coinUpper, amount, price: prices[coin] }); v0_3_0_showNotification(`${amount} ${coinUpper} 매도!`, false); } 
        else { v0_3_0_showNotification(`${coinUpper} 부족`, true); return; }
    }
    v0_3_0_updateUI(); saveGameState().catch(e => console.error("Save failed:", e));
}
function v0_3_0_handleJobClick(e) {
    const id = e.currentTarget.id.split('-')[2], now = Date.now(), state = gameState.v0_3_0;
    const isZeroCooldown = v0_3_0_zeroCooldownEndTime > now;
    if (!isZeroCooldown && state.jobTimers[id] > now) { v0_3_0_showNotification('아직 쿨타임입니다.', true); return; }
    const isDay = v0_3_0_gameTime.getHours() >= 9 && v0_3_0_gameTime.getHours() < 19;

    if (id === 'paper') { 
        const isEnhanced = gameState.shared.hasTwilightTrophy && !isDay;
        const reward = isEnhanced ? 1500 : 500, message = isEnhanced ? '달빛을 받으며 폐지 줍기 완료! (+1500 KRW)' : '폐지 줍기 완료! (+500 KRW)';
        state.userCash += reward; state.paperClicks++; v0_3_0_showNotification(message, false); if (!isZeroCooldown) state.jobTimers.paper = now + 5000; 
    }
    if (id === 'starcatching') {
        if (gameState.shared.hasTwilightTrophy) { v0_3_0_showNotification('이미 밤하늘의 별을 손에 넣었습니다.', true); return; }
        const isBuffActive = v0_3_0_starCatchingBuffEndTime > now; const probability = isBuffActive ? 0.10 : 0.01;
        if(Math.random() < probability) { gameState.shared.hasTwilightTrophy = true; v0_3_0_showNotification(`별을 땄습니다! [Twilight Trophy] 획득! (성공 확률: ${probability * 100}%)`, false); if(v0_3_0_dom.jobStarcatching) v0_3_0_dom.jobStarcatching.classList.add('hidden'); } 
        else { v0_3_0_showNotification('별을 놓쳤습니다...', true); }
        if (!isZeroCooldown) state.jobTimers.starcatching = now + 5000;
    }
    v0_3_0_updateUI(); saveGameState().catch(e => console.error("Save failed:", e));
}
function v0_3_0_handleBuy3DCube() { const state = gameState.v0_3_0; if (state.userCash >= 1000000) { state.userCash -= 1000000; state.isCubePurchased = true; v0_3_0_restoreUIState(); v0_3_0_showNotification('3D 큐브 활성화! 패시브 수입 시작!', false); saveGameState().catch(e => console.error("Save failed:", e)); } else v0_3_0_showNotification('1백만 KRW 필요', true); }
function v0_3_0_handleUpgradePrism() { const state = gameState.v0_3_0; if (!state.isPrismUpgraded && state.userPrisms >= 100) { state.userPrisms -= 100; state.isPrismUpgraded = true; v0_3_0_restoreUIState(); v0_3_0_showNotification('프리즘 업그레이드 완료!', false); saveGameState().catch(e => console.error("Save failed:", e)); } else v0_3_0_showNotification('100 PRISM 필요', true); }
function v0_3_0_handleUpgradeLunarBlessing() { const state = gameState.v0_3_0; if (state.isLunarBlessed) { v0_3_0_showNotification('이미 적용된 강화입니다.', true); return; } if (state.userLunar >= 200) { state.userLunar -= 200; state.isLunarBlessed = true; v0_3_0_restoreUIState(); v0_3_0_showNotification('Lunar Blessing 완료!', false); saveGameState().catch(e => console.error("Save failed:", e)); } else { v0_3_0_showNotification('200 LUNAR 필요', true); } }
function v0_3_0_handleSleep() {
    const state = gameState.v0_3_0;
    const currentHour = v0_3_0_gameTime.getHours();
    if (currentHour >= 8 && currentHour < 20) { v0_3_0_showNotification('밤에만 잘 수 있습니다.', true); return; }
    
    state.isSleeping = true; // Start sleeping
    let hoursToSleep = (currentHour < 8) ? (8 - currentHour) : (24 - currentHour + 8);
    
    const targetTime = new Date(v0_3_0_gameTime);
    targetTime.setHours(8, 0, 0);
    if(currentHour >= 20) targetTime.setDate(targetTime.getDate() + 1);

    v0_3_0_gameTime = targetTime;
    state.isSleeping = false; // End sleeping
    
    v0_3_0_showNotification(`${hoursToSleep}시간 동안 수면했습니다.`, false);
    v0_3_0_updateUI(); saveGameState().catch(e => console.error("Save failed:", e));
}
function v0_3_0_switchChart(chartType) { ['cube', 'lunar', 'prism'].forEach(type => { const tab = document.getElementById(`v0.3.0-chart-tab-${type}`); const container = document.getElementById(`v0.3.0-chart-${type}-container`); if(tab) tab.classList.toggle('tab-active', type === chartType); if(container) container.classList.toggle('hidden', type !== chartType); }); }
function v0_3_0_restoreUIState() {
    const state = gameState.v0_3_0;
    if (v0_3_0_dom.cubeOverlay) v0_3_0_dom.cubeOverlay.style.display = state.isCubePurchased ? 'none' : 'flex';
    if (v0_3_0_dom.passiveIncomeDisplay) v0_3_0_dom.passiveIncomeDisplay.classList.toggle('hidden', !state.isCubePurchased);
    if (v0_3_0_dom.upgradePrismSection) v0_3_0_dom.upgradePrismSection.classList.toggle('hidden', !state.isCubePurchased || state.isPrismUpgraded);
    if (v0_3_0_dom.upgradeLunarSection) v0_3_0_dom.upgradeLunarSection.classList.toggle('hidden', !state.isCubePurchased);
    if(cubeMaterial) {
        if(state.isPrismUpgraded) { cubeMaterial.color.set(0xf472b6); cubeMaterial.emissive.set(0xf472b6); cubeMaterial.emissiveIntensity = 0.3; }
        else { cubeMaterial.color.set(0x60a5fa); cubeMaterial.emissive.set(0x000000); cubeMaterial.emissiveIntensity = 0; }
    }
    if (v0_3_0_dom.upgradeLunarBlessingButton) v0_3_0_dom.upgradeLunarBlessingButton.classList.toggle('btn-disabled', state.isLunarBlessed);
    v0_3_0_updateUI();
}

// =======================================================
// V1.0.0 (v.0.4.0) 게임 로직
// =======================================================
const V1_COMPUTER_COSTS = [50000, 250000, 750000, 1200000, 2000000];

function initV1_0_0_Game() {
    const prefix = 'v1.0.0-';
    v1_0_0_dom = {
        notification: document.getElementById(prefix + 'notification'),
        cashDisplay: document.getElementById(prefix + 'user-cash'),
        cubesDisplay: document.getElementById(prefix + 'user-cubes'),
        lunarDisplay: document.getElementById(prefix + 'user-lunar'),
        prismsDisplay: document.getElementById(prefix + 'user-prisms'),
        energyDisplay: document.getElementById(prefix + 'user-energy'),
        cubePriceDisplay: document.getElementById(prefix + 'current-cube-price'),
        cubePriceChangeDisplay: document.getElementById(prefix + 'cube-price-change'),
        lunarPriceDisplay: document.getElementById(prefix + 'current-lunar-price'),
        lunarPriceChangeDisplay: document.getElementById(prefix + 'lunar-price-change'),
        energyPriceDisplay: document.getElementById(prefix + 'current-energy-price'),
        energyPriceChangeDisplay: document.getElementById(prefix + 'energy-price-change'),
        prismPriceDisplay: document.getElementById(prefix + 'current-prism-price'),
        prismPriceChangeDisplay: document.getElementById(prefix + 'prism-price-change'),
        computerTierText: document.getElementById(prefix + 'computer-tier-text'),
        computerStatsText: document.getElementById(prefix + 'computer-stats-text'),
        computerUpgradeButton: document.getElementById(prefix + 'computer-upgrade-button'),
        tradeContainer: document.getElementById(prefix + 'trade-container'),
        chartCubeContainer: document.getElementById(prefix + 'chart-cube-container'),
        chartLunarContainer: document.getElementById(prefix + 'chart-lunar-container'),
        chartEnergyContainer: document.getElementById(prefix+'chart-energy-container'),
        chartPrismContainer: document.getElementById(prefix + 'chart-prism-container'),
        codeInput: document.getElementById(prefix + 'code-input'),
        codeSubmitButton: document.getElementById(prefix + 'code-submit-button'),
        gameTime: document.getElementById(prefix + 'game-time'),
        weatherDisplay: document.getElementById(prefix + 'weather-display'),
        cubePurchaseOverlay: document.getElementById(prefix + 'cube-purchase-overlay'),
        buyCubeButton: document.getElementById(prefix + 'buy-cube-button'),
        upgradeContainer: document.getElementById(prefix + 'upgrade-container'),
        passiveIncomeDisplay: document.getElementById(prefix+'passive-income-display'),
        incomePerSecond: document.getElementById(prefix+'income-per-second'),
        shopItemsContainer: document.getElementById(prefix + 'shop-items'),
        almanacSection: document.getElementById(prefix + 'almanac-section'),
        almanacContent: document.getElementById(prefix + 'almanac-content'),
        internetOutage: document.getElementById(prefix + 'internet-outage'),
        timeContainer: document.getElementById(prefix + 'time-container'),
        weatherContainer: document.getElementById(prefix + 'weather-container'),
        sleepSection: document.getElementById(prefix + 'sleep-section'),
        sleepButton: document.getElementById(prefix + 'sleep-button'),
    };

    ['assets', 'computer', 'shop', 'sleep', 'almanac', 'trade', 'charts', 'code'].forEach(s => {
        const toggle = document.getElementById(`${prefix}toggle-${s}`);
        if(toggle) toggle.addEventListener('click', () => { 
            document.getElementById(`${prefix}content-${s}`)?.classList.toggle('hidden'); 
            document.getElementById(`${prefix}toggle-${s}-icon`)?.classList.toggle('rotate-180'); 
        });
    });
    if (v1_0_0_dom.computerUpgradeButton) v1_0_0_dom.computerUpgradeButton.addEventListener('click', v1_0_0_handleComputerUpgrade);
    if (v1_0_0_dom.codeSubmitButton) v1_0_0_dom.codeSubmitButton.addEventListener('click', handleCodeSubmit);
    if (v1_0_0_dom.buyCubeButton) v1_0_0_dom.buyCubeButton.addEventListener('click', () => v1_0_0_handleCubeUpgrade('buy'));
    if (v1_0_0_dom.sleepButton) v1_0_0_dom.sleepButton.addEventListener('click', v1_0_0_handleSleep);
    
    const chartTabCube = document.getElementById(prefix+'chart-tab-cube');
    if(chartTabCube) chartTabCube.addEventListener('click', () => v1_0_0_switchChart('cube'));
    const chartTabLunar = document.getElementById(prefix+'chart-tab-lunar');
    if(chartTabLunar) chartTabLunar.addEventListener('click', () => v1_0_0_switchChart('lunar'));
    const chartTabEnergy = document.getElementById(prefix+'chart-tab-energy');
    if(chartTabEnergy) chartTabEnergy.addEventListener('click', () => v1_0_0_switchChart('energy'));
    const chartTabPrism = document.getElementById(prefix+'chart-tab-prism');
    if(chartTabPrism) chartTabPrism.addEventListener('click', () => v1_0_0_switchChart('prism'));
    
    v1_0_0_createShopItems();
    initV1_0_0_Charts();
    v1_0_0_createTradeUI();
}

function v1_0_0_startGame() {
    if (v1_0_0_gameLoopInterval) clearInterval(v1_0_0_gameLoopInterval);
    if (v1_0_0_priceUpdateTimeout) clearTimeout(v1_0_0_priceUpdateTimeout);

    if (!gameState.v1_0_0.experiencedWeathers[gameState.v1_0_0.weather]) {
        gameState.v1_0_0.experiencedWeathers[gameState.v1_0_0.weather] = true;
    }
    
    // Prism to Energy Migration
    if (!gameState.shared.prismMigratedToEnergy && gameState.v0_3_0.userPrisms > 0) {
        const migratedAmount = gameState.v0_3_0.userPrisms;
        gameState.v1_0_0.userEnergy = (gameState.v1_0_0.userEnergy || 0) + migratedAmount;
        gameState.v0_3_0.userPrisms = 0;
        gameState.shared.prismMigratedToEnergy = true;
        v1_0_0_showNotification(`PRISM ${migratedAmount.toLocaleString()}개가 ENERGY로 변환되었습니다!`, false);
        saveGameState();
    }
    
    v1_0_0_gameLoopInterval = setInterval(v1_0_0_gameLoop, 250);
    v1_0_0_priceUpdateLoop();
    v1_0_0_updateUI();
}

function v1_0_0_showNotification(message, isError = true) { if(!v1_0_0_dom.notification) return; v1_0_0_dom.notification.textContent = message; v1_0_0_dom.notification.className = `fixed bottom-6 right-6 text-white p-4 rounded-lg shadow-xl z-50 ${isError ? 'bg-red-500' : 'bg-green-500'} opacity-100 translate-y-0 transition-all duration-300`; setTimeout(() => { v1_0_0_dom.notification.classList.add('opacity-0', 'translate-y-10'); }, 3000); }

function v1_0_0_switchChart(chartType) {
    ['cube', 'lunar', 'energy', 'prism'].forEach(type => {
        const tab = document.getElementById(`v1.0.0-chart-tab-${type}`);
        const container = document.getElementById(`v1.0.0-chart-${type}-container`);
        if(tab) tab.classList.toggle('tab-active', type === chartType);
        if(container) container.classList.toggle('hidden', type !== chartType);
    });
}

function initV1_0_0_Charts() { const commonOptions = { scales: { y: { ticks: { color: '#9ca3af' }, grid: { color: '#4b5563' } }, x: { ticks: { color: '#9ca3af' }, grid: { color: '#4b5563' } } }, plugins: { legend: { display: false } }, maintainAspectRatio: false }; const createChart = (id, color) => { const el = document.getElementById(id); if (el) return new Chart((el as HTMLCanvasElement).getContext('2d'), { type: 'line', data: { labels: [], datasets: [{ data: [], borderColor: color, tension: 0.1, pointRadius: 0 }] }, options: commonOptions }); return null; }; v1_0_0_chartCube = createChart('v1.0.0-price-chart-cube', '#60a5fa'); v1_0_0_chartLunar = createChart('v1.0.0-price-chart-lunar', '#a855f7'); v1_0_0_chartEnergy = createChart('v1.0.0-price-chart-energy', '#facc15'); v1_0_0_chartPrism = createChart('v1.0.0-price-chart-prism', '#f472b6');}
function v1_0_0_updateChartData(chart, price) { if (!chart) return; const gameTime = new Date(gameState.v0_3_0.gameTime); const label = `${String(gameTime.getHours()).padStart(2, '0')}:${String(gameTime.getMinutes()).padStart(2, '0')}`; chart.data.labels.push(label); chart.data.datasets[0].data.push(price); if (chart.data.labels.length > 30) { chart.data.labels.shift(); chart.data.datasets[0].data.shift(); } chart.update('none'); }

function v1_0_0_gameLoop() {
    if (gameState.shared.v0_4_0_preview_end_time > 0 && Date.now() > gameState.shared.v0_4_0_preview_end_time) {
        gameState.shared.v0_4_0_preview_end_time = 0;
        v1_0_0_showNotification('v.0.4.0 프리뷰가 종료되었습니다.', false);
        switchVersion('v0.3.0');
        return;
    }
    
    const time = new Date(gameState.v0_3_0.gameTime);
    time.setMinutes(time.getMinutes() + 1);
    gameState.v0_3_0.gameTime = time.getTime();
    
    const currentHour = time.getHours();
    const isDay = currentHour >= 9 && currentHour < 19;
    if (v1_0_0_dom.gameTime) v1_0_0_dom.gameTime.textContent = `${String(currentHour).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')} (${isDay ? '☀️' : '🌙'})`;

    const canvasContainer = document.getElementById('v1.0.0-canvas-container');
    if (canvasContainer && (canvasContainer.style.backgroundColor === 'rgb(5, 5, 34)') !== !isDay) { // Day/Night transition
        const color = isDay ? 0x222222 : 0x050522;
        if(renderer) renderer.setClearColor(color);
        if(ambientLight) ambientLight.intensity = isDay ? 0.7 : 0.5;
        if(directionalLight) directionalLight.intensity = isDay ? 1.0 : 0.6;
    }
    
    let income = 0;
    if (gameState.v1_0_0.isCubePurchased) {
        let baseIncome = 100;
        if (gameState.v1_0_0.isPrismUpgraded) baseIncome = 400;
        else if (gameState.v1_0_0.isEnergyUpgraded) baseIncome = 200;
        income += baseIncome;

        if (gameState.v1_0_0.isLunarUpgraded && !isDay) {
            income += 100;
        }
    }
    gameState.v0_3_0.userCash += income / 4;
    
    // Weather logic
    gameState.v1_0_0.weatherCounter = (gameState.v1_0_0.weatherCounter || 0) + 1;
    if (gameState.v1_0_0.weatherCounter > 160) { // change weather every 40 seconds (160 ticks)
        gameState.v1_0_0.weatherCounter = 0;
        const state = gameState.v1_0_0;
        state.lastWeather = state.weather;
        let newWeather = '';

        if (state.lastWeather === '비') {
            newWeather = '구름';
            if (Math.random() < 0.10) {
                state.nextWeatherIsRainbow = true;
            }
        } else if (state.lastWeather === '구름') {
            if (state.nextWeatherIsRainbow) {
                newWeather = '무지개';
                state.nextWeatherIsRainbow = false;
            } else {
                newWeather = '맑음';
            }
        } else { // From 맑음, 산성비, 천둥, 무지개
            if (Math.random() < 0.5) { // 50% chance to enter rainy state
                const rainTypeRoll = Math.random();
                if (rainTypeRoll < 0.2) newWeather = '산성비';
                else if (rainTypeRoll < 0.4) newWeather = '천둥';
                else newWeather = '비';
            } else {
                newWeather = '맑음';
            }
        }
        state.weather = newWeather;
        if (!state.experiencedWeathers[newWeather]) {
            state.experiencedWeathers[newWeather] = true;
        }
    }

    // Internet outage logic for Thunder
    if (gameState.v1_0_0.weather === '천둥' && !gameState.v1_0_0.isInternetOutage && Math.random() < (0.02 / 4)) {
        gameState.v1_0_0.isInternetOutage = true;
        setTimeout(() => {
            gameState.v1_0_0.isInternetOutage = false;
        }, 3000); // 3 seconds outage
    }
    if (v1_0_0_dom.internetOutage) {
        v1_0_0_dom.internetOutage.classList.toggle('hidden', !gameState.v1_0_0.isInternetOutage);
    }

    // Computer Mining
    const tier = gameState.v1_0_0.computerTier;
    if (tier > 0) {
        const mine = (chancePerMin, coin) => {
            if (Math.random() < (chancePerMin / 240.0)) { // 240 ticks per minute
                if (coin === 'cube') gameState.v0_3_0.userCubes += 1;
                else if (coin === 'lunar') gameState.v0_3_0.userLunar += 1;
                else if (coin === 'energy') gameState.v1_0_0.userEnergy += 1;
                else if (coin === 'prism') gameState.v1_0_0.userPrisms += 1;
            }
        };
        mine(tier * 0.04, 'cube');
        mine(tier * 0.03, 'lunar');
        mine(tier * 0.02, 'energy');
        mine(tier * 0.01, 'prism');
    }
    v1_0_0_updateUI();
}

function v1_0_0_priceUpdateLoop() {
    if (gameState.v1_0_0.isInternetOutage) {
        v1_0_0_priceUpdateTimeout = setTimeout(v1_0_0_priceUpdateLoop, 3000);
        return;
    }
    const state_v1 = gameState.v1_0_0;
    
    const getNewPrice = (currentPrice, config) => {
        let dir = Math.random() < config.riseProb ? 1 : -1;
        let mag = Math.random(), pct;
        if (mag < config.mags[0]) pct = (Math.random() * 0.02) + 0.001;
        else if (mag < config.mags[0] + config.mags[1]) pct = (Math.random() * 0.05) + 0.021;
        else pct = (Math.random() * 0.12) + 0.051;
        const newPrice = currentPrice + (currentPrice * pct * dir);
        return Math.round(Math.max(config.min, Math.min(config.max, newPrice)));
    }

    const configs = {
        cube: { min: 5000, max: 25000, riseProb: 0.51, mags: [0.5, 0.45, 0.05] },
        lunar: { min: 10000, max: 50000, riseProb: 0.5, mags: [0.5, 0.45, 0.05] },
        energy: { min: 20000, max: 100000, riseProb: 0.5, mags: [0.3, 0.3, 0.4] },
        prism: { min: 80000, max: 250000, riseProb: 0.52, mags: [0.4, 0.4, 0.2] }
    };
    
    const weather = state_v1.weather;
    const applyToAll = (delta) => { Object.keys(configs).forEach(c => configs[c].riseProb += delta); };
    if (weather === '맑음') applyToAll(0.005);
    else if (weather === '비') configs.cube.riseProb += 0.025;
    else if (weather === '산성비') applyToAll(-0.025);
    else if (weather === '천둥') applyToAll(-0.005);
    else if (weather === '무지개') applyToAll(0.05);

    state_v1.lastPrice = state_v1.currentPrice;
    state_v1.currentPrice = getNewPrice(state_v1.currentPrice, configs.cube);
    v1_0_0_updateChartData(v1_0_0_chartCube, state_v1.currentPrice);

    state_v1.lastLunarPrice = state_v1.currentLunarPrice;
    state_v1.currentLunarPrice = getNewPrice(state_v1.currentLunarPrice, configs.lunar);
    v1_0_0_updateChartData(v1_0_0_chartLunar, state_v1.currentLunarPrice);
    
    state_v1.lastEnergyPrice = state_v1.currentEnergyPrice;
    state_v1.currentEnergyPrice = getNewPrice(state_v1.currentEnergyPrice, configs.energy);
    v1_0_0_updateChartData(v1_0_0_chartEnergy, state_v1.currentEnergyPrice);

    state_v1.lastPrismPrice = state_v1.currentPrismPrice;
    state_v1.currentPrismPrice = getNewPrice(state_v1.currentPrismPrice, configs.prism);
    v1_0_0_updateChartData(v1_0_0_chartPrism, state_v1.currentPrismPrice);

    let interval = 3000;
    if (weather === '비') interval *= 1.05;
    if (weather === '구름') interval *= 0.95;
    v1_0_0_priceUpdateTimeout = setTimeout(v1_0_0_priceUpdateLoop, interval);
}

function v1_0_0_updateUI() {
    if (!v1_0_0_dom.cashDisplay) return;
    const state_v0 = gameState.v0_3_0;
    const state_v1 = gameState.v1_0_0;

    v1_0_0_dom.cashDisplay.textContent = Math.floor(state_v0.userCash).toLocaleString('ko-KR');
    v1_0_0_dom.cubesDisplay.textContent = state_v0.userCubes.toLocaleString('ko-KR', { maximumFractionDigits: 4 });
    v1_0_0_dom.lunarDisplay.textContent = state_v0.userLunar.toLocaleString('ko-KR', { maximumFractionDigits: 4 });
    v1_0_0_dom.energyDisplay.textContent = state_v1.userEnergy.toLocaleString('ko-KR', { maximumFractionDigits: 4 });
    v1_0_0_dom.prismsDisplay.textContent = state_v1.userPrisms.toLocaleString('ko-KR', { maximumFractionDigits: 4 });

    const weatherInfo = WEATHER_DATA[state_v1.weather] || { icon: '❔' };
    if (v1_0_0_dom.weatherDisplay) v1_0_0_dom.weatherDisplay.textContent = `${state_v1.weather} ${weatherInfo.icon}`;

    const updatePriceDisplay = (display, changeDisplay, current, last) => {
        if (!display || !changeDisplay) return;
        display.textContent = `${current.toLocaleString('ko-KR')} KRW`;
        const change = current - last; const pct = last > 0 ? ((change / last) * 100).toFixed(2) : 0;
        if (change > 0) changeDisplay.innerHTML = `<span class="text-green-500">▲ ${change.toLocaleString('ko-KR')} (+${pct}%)</span>`;
        else if (change < 0) changeDisplay.innerHTML = `<span class="text-red-500">▼ ${Math.abs(change).toLocaleString('ko-KR')} (${pct}%)</span>`;
        else changeDisplay.innerHTML = `0 (0.00%)`;
    };
    updatePriceDisplay(v1_0_0_dom.cubePriceDisplay, v1_0_0_dom.cubePriceChangeDisplay, state_v1.currentPrice, state_v1.lastPrice);
    updatePriceDisplay(v1_0_0_dom.lunarPriceDisplay, v1_0_0_dom.lunarPriceChangeDisplay, state_v1.currentLunarPrice, state_v1.lastLunarPrice);
    updatePriceDisplay(v1_0_0_dom.energyPriceDisplay, v1_0_0_dom.energyPriceChangeDisplay, state_v1.currentEnergyPrice, state_v1.lastEnergyPrice);
    updatePriceDisplay(v1_0_0_dom.prismPriceDisplay, v1_0_0_dom.prismPriceChangeDisplay, state_v1.currentPrismPrice, state_v1.lastPrismPrice);

    const tier = state_v1.computerTier;
    if (v1_0_0_dom.computerTierText) v1_0_0_dom.computerTierText.textContent = tier > 0 ? `채굴 컴퓨터 (Tier ${tier})` : '컴퓨터 없음';
    if (v1_0_0_dom.computerStatsText) v1_0_0_dom.computerStatsText.innerHTML = `CUBE: ${tier*4}%/분<br>LUNAR: ${tier*3}%/분<br>ENERGY: ${tier*2}%/분<br>PRISM: ${tier*1}%/분`;
    if (v1_0_0_dom.computerUpgradeButton) {
        if (tier < 5) {
            const cost = V1_COMPUTER_COSTS[tier];
            v1_0_0_dom.computerUpgradeButton.textContent = tier === 0 ? `구매 (${(cost/10000).toLocaleString()}만 KRW)` : `업그레이드 (${(cost/10000).toLocaleString()}만 KRW)`;
            v1_0_0_dom.computerUpgradeButton.classList.remove('hidden', 'btn-disabled');
            v1_0_0_dom.computerUpgradeButton.classList.toggle('btn-disabled', state_v0.userCash < cost);
        } else {
            v1_0_0_dom.computerUpgradeButton.textContent = '최고 등급';
            v1_0_0_dom.computerUpgradeButton.classList.add('btn-disabled');
        }
    }

    v1_0_0_updateCubeUpgradeUI();
    
    const time = new Date(gameState.v0_3_0.gameTime);
    const isDay = time.getHours() >= 9 && time.getHours() < 19;
    let income = 0;
    if (gameState.v1_0_0.isCubePurchased) {
        let baseIncome = 100;
        if (gameState.v1_0_0.isPrismUpgraded) baseIncome = 400;
        else if (gameState.v1_0_0.isEnergyUpgraded) baseIncome = 200;
        income += baseIncome;

        if (gameState.v1_0_0.isLunarUpgraded && !isDay) {
            income += 100;
        }
    }
    if (v1_0_0_dom.incomePerSecond) v1_0_0_dom.incomePerSecond.textContent = `+${income.toLocaleString('ko-KR')} KRW / sec`;
    if (v1_0_0_dom.passiveIncomeDisplay) v1_0_0_dom.passiveIncomeDisplay.classList.toggle('hidden', !gameState.v1_0_0.isCubePurchased);
    
    // Digital Clock and Time/Weather display
    const hasClock = state_v1.shopItems.digitalClock;
    if (v1_0_0_dom.timeContainer) v1_0_0_dom.timeContainer.classList.toggle('hidden', !hasClock);
    if (v1_0_0_dom.weatherContainer) v1_0_0_dom.weatherContainer.classList.toggle('hidden', !hasClock);
    
    // Sleep section
    if (v1_0_0_dom.sleepSection) v1_0_0_dom.sleepSection.classList.toggle('hidden', !state_v1.shopItems.bed);
    if (v1_0_0_dom.sleepButton) {
        const currentHour = time.getHours();
        v1_0_0_dom.sleepButton.classList.toggle('btn-disabled', !(currentHour >= 20 || currentHour < 8));
    }
    
    v1_0_0_updateShopUI();
    v1_0_0_updateAlmanacUI();
}

function v1_0_0_updateCubeUpgradeUI() {
    const state = gameState.v1_0_0;
    if (v1_0_0_dom.cubePurchaseOverlay) v1_0_0_dom.cubePurchaseOverlay.style.display = state.isCubePurchased ? 'none' : 'flex';
    const container = v1_0_0_dom.upgradeContainer;
    if (!container) return;
    
    const ensureButton = (id, title, text, buttonText, condition, bgColor, upgradeType, isPurchased) => {
        let section = document.getElementById('v1.0.0-upgrade-' + id + '-section');
        if (!section) {
            section = document.createElement('div');
            section.id = 'v1.0.0-upgrade-' + id + '-section';
            section.className = 'bg-black/50 backdrop-blur-sm p-4 rounded-lg shadow-xl text-center';
            section.innerHTML = `<h3 class="text-lg font-bold mb-2 text-${bgColor}-300">${title}</h3><p class="text-gray-300 text-sm mb-3">${text}</p><button id="v1.0.0-upgrade-${id}-button" class="w-full bg-${bgColor}-600 hover:bg-${bgColor}-700 text-white font-bold py-2 px-4 rounded-lg">${buttonText}</button>`;
            container.appendChild(section);
            document.getElementById(`v1.0.0-upgrade-${id}-button`)?.addEventListener('click', () => v1_0_0_handleCubeUpgrade(upgradeType));
        }
        const button = document.getElementById(`v1.0.0-upgrade-${id}-button`);
        if (button) button.classList.toggle('btn-disabled', !condition);
        section.classList.toggle('hidden', isPurchased);
        return section;
    };

    const hideSection = (id) => {
        const section = document.getElementById('v1.0.0-upgrade-' + id + '-section');
        if (section) section.classList.add('hidden');
    };

    if (!state.isCubePurchased) { hideSection('lunar'); hideSection('energy'); hideSection('prism'); return; };
    
    ensureButton('lunar', 'LUNAR 강화', '밤에 생산량 +100 KRW/초', '200 LUNAR', gameState.v0_3_0.userLunar >= 200, 'purple', 'lunar', state.isLunarUpgraded);
    
    if (!state.isEnergyUpgraded) {
        ensureButton('energy', 'ENERGY 강화', '생산량 200 KRW/초로 변경', '100 ENERGY', gameState.v1_0_0.userEnergy >= 100, 'yellow', 'energy', false);
        hideSection('prism');
    } else if (!state.isPrismUpgraded) {
        ensureButton('prism', 'PRISM 강화', '생산량 400 KRW/초로 변경', '100 PRISM', gameState.v1_0_0.userPrisms >= 100, 'pink', 'prism', false);
        hideSection('energy');
    } else {
         hideSection('energy');
         hideSection('prism');
    }
}


function v1_0_0_handleCubeUpgrade(type) {
    const state_v0 = gameState.v0_3_0;
    const state_v1 = gameState.v1_0_0;
    
    const upgrades = {
        buy: { cost: 1000000, balance: () => state_v0.userCash, flag: 'isCubePurchased', currency: 'KRW' },
        lunar: { cost: 200, balance: () => state_v0.userLunar, flag: 'isLunarUpgraded', currency: 'LUNAR' },
        energy: { cost: 100, balance: () => state_v1.userEnergy, flag: 'isEnergyUpgraded', currency: 'ENERGY' },
        prism: { cost: 100, balance: () => state_v1.userPrisms, flag: 'isPrismUpgraded', currency: 'PRISM' },
    };

    const u = upgrades[type];
    if (u.flag && state_v1[u.flag]) return;

    if (u.balance() >= u.cost) {
        if (type === 'buy') state_v0.userCash -= u.cost;
        else if (type === 'lunar') state_v0.userLunar -= u.cost;
        else if (type === 'energy') state_v1.userEnergy -= u.cost;
        else if (type === 'prism') state_v1.userPrisms -= u.cost;
        
        if (u.flag) state_v1[u.flag] = true;
        if (cubeMaterial) {
            if (type === 'buy') { cubeMaterial.color.set(0x60a5fa); }
            else if (type === 'energy') { cubeMaterial.color.set(0xfacc15); }
            else if (type === 'prism') { cubeMaterial.color.set(0xf472b6); cubeMaterial.emissive.set(0xf472b6); cubeMaterial.emissiveIntensity = 0.3; }
        }
        
        v1_0_0_showNotification(`${type.toUpperCase()} 강화 완료!`, false);
        v1_0_0_updateUI();
        saveGameState();
    } else {
        v1_0_0_showNotification(`${u.cost.toLocaleString()} ${u.currency} 필요`, true);
    }
}

function v1_0_0_createTradeUI() {
    if (!v1_0_0_dom.tradeContainer) return;
    const coins = [
        { name: 'CUBE', color: 'blue', price: () => gameState.v1_0_0.currentPrice },
        { name: 'LUNAR', color: 'purple', price: () => gameState.v1_0_0.currentLunarPrice },
        { name: 'ENERGY', color: 'yellow', price: () => gameState.v1_0_0.currentEnergyPrice },
        { name: 'PRISM', color: 'pink', price: () => gameState.v1_0_0.currentPrismPrice },
    ];
    v1_0_0_dom.tradeContainer.innerHTML = '';
    coins.forEach(coin => {
        const el = document.createElement('div');
        el.className = 'bg-gray-600 p-4 rounded-lg';
        el.innerHTML = `
            <label class="text-lg font-semibold text-${coin.color}-300">${coin.name} 거래</label>
            <input type="number" id="v1.0.0-amount-input-${coin.name.toLowerCase()}" value="1" min="1" class="w-full bg-gray-800 text-white p-2 rounded mt-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-${coin.color}-500" placeholder="${coin.name} 수량">
            <div class="grid grid-cols-2 gap-4 mt-4">
                <button id="v1.0.0-buy-button-${coin.name.toLowerCase()}" class="w-full bg-green-600 hover:bg-green-700 font-bold p-3 rounded-lg">매수</button>
                <button id="v1.0.0-sell-button-${coin.name.toLowerCase()}" class="w-full bg-red-600 hover:bg-red-700 font-bold p-3 rounded-lg">매도</button>
            </div>`;
        v1_0_0_dom.tradeContainer.appendChild(el);
        document.getElementById(`v1.0.0-buy-button-${coin.name.toLowerCase()}`)?.addEventListener('click', () => v1_0_0_handleTrade('buy', coin.name.toLowerCase()));
        document.getElementById(`v1.0.0-sell-button-${coin.name.toLowerCase()}`)?.addEventListener('click', () => v1_0_0_handleTrade('sell', coin.name.toLowerCase()));
    });
}

function v1_0_0_handleTrade(type, coin) {
    if (gameState.v1_0_0.isInternetOutage) { v1_0_0_showNotification("인터넷 연결이 불안정하여 거래할 수 없습니다.", true); return; }
    const amountInput = document.getElementById(`v1.0.0-amount-input-${coin}`) as HTMLInputElement;
    if (!amountInput) return; const amount = parseFloat(amountInput.value); if (!(amount > 0)) return;
    const prices = { cube: gameState.v1_0_0.currentPrice, lunar: gameState.v1_0_0.currentLunarPrice, energy: gameState.v1_0_0.currentEnergyPrice, prism: gameState.v1_0_0.currentPrismPrice };
    const cost = prices[coin] * amount; const coinUpper = coin.toUpperCase();

    const state_v0 = gameState.v0_3_0;
    const state_v1 = gameState.v1_0_0;
    const balances = { cube: 'userCubes', lunar: 'userLunar', energy: 'userEnergy', prism: 'userPrisms' };
    const stateForCoin = (coin === 'energy' || coin === 'prism') ? state_v1 : state_v0;

    if (type === 'buy') {
        if (state_v0.userCash >= cost) { 
            state_v0.userCash -= cost; 
            stateForCoin[balances[coin]] += amount;
            state_v0.transactions.push({ type: '매수', coin: coinUpper, amount, price: prices[coin] });
            v1_0_0_showNotification(`${amount.toLocaleString()} ${coinUpper} 매수!`, false);
        } else { v1_0_0_showNotification('현금 부족', true); return; }
    } else { 
        if (stateForCoin[balances[coin]] >= amount) {
            state_v0.userCash += cost; 
            stateForCoin[balances[coin]] -= amount;
            state_v0.transactions.push({ type: '매도', coin: coinUpper, amount, price: prices[coin] });
            v1_0_0_showNotification(`${amount.toLocaleString()} ${coinUpper} 매도!`, false);
        } else { v1_0_0_showNotification(`${coinUpper} 부족`, true); return; }
    }
    v1_0_0_updateUI(); saveGameState().catch(e => console.error("Save failed:", e));
}

function v1_0_0_handleComputerUpgrade() {
    if (gameState.v1_0_0.isInternetOutage) { v1_0_0_showNotification("인터넷 연결이 불안정합니다.", true); return; }
    const tier = gameState.v1_0_0.computerTier;
    if (tier >= 5) return;
    const cost = V1_COMPUTER_COSTS[tier];
    if (gameState.v0_3_0.userCash >= cost) {
        gameState.v0_3_0.userCash -= cost;
        gameState.v1_0_0.computerTier++;
        v1_0_0_showNotification(`컴퓨터 업그레이드 완료! (Tier ${gameState.v1_0_0.computerTier})`, false);
        v1_0_0_updateUI();
        saveGameState();
    } else {
        v1_0_0_showNotification('현금이 부족합니다.', true);
    }
}
function v1_0_0_handleSleep() {
    const state = gameState.v1_0_0;
    const time = new Date(gameState.v0_3_0.gameTime);
    const currentHour = time.getHours();
    if (currentHour >= 8 && currentHour < 20) { v1_0_0_showNotification('밤에만 잘 수 있습니다.', true); return; }
    
    let hoursToSleep = (currentHour < 8) ? (8 - currentHour) : (24 - currentHour + 8);
    
    const targetTime = new Date(time);
    targetTime.setHours(8, 0, 0);
    if(currentHour >= 20) targetTime.setDate(targetTime.getDate() + 1);

    gameState.v0_3_0.gameTime = targetTime.getTime();
    
    v1_0_0_showNotification(`${hoursToSleep}시간 동안 수면했습니다.`, false);
    v1_0_0_updateUI(); saveGameState().catch(e => console.error("Save failed:", e));
}
function v1_0_0_createShopItems() {
    if (!v1_0_0_dom.shopItemsContainer) return;
    const items = [
        { id: 'digitalClock', name: '디지털 시계', cost: 10000, description: '게임 시간과 날씨를 표시합니다.' },
        { id: 'weatherAlmanac', name: '날씨 도감', cost: 20000, description: '날씨 도감 탭을 잠금 해제합니다.' },
        { id: 'bed', name: '침대', cost: 50000, description: '밤에 잠을 자서 시간을 보낼 수 있습니다.' },
    ];
    v1_0_0_dom.shopItemsContainer.innerHTML = '';
    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'bg-gray-600 p-4 rounded-lg';
        el.innerHTML = `
            <h4 class="text-lg font-semibold text-yellow-300">${item.name}</h4>
            <p class="text-sm text-gray-400 my-2">${item.description}</p>
            <button id="v1.0.0-buy-${item.id}" class="w-full bg-green-600 hover:bg-green-700 font-bold p-2 rounded-lg">
                 구매 (${item.cost.toLocaleString()} KRW)
            </button>
        `;
        v1_0_0_dom.shopItemsContainer.appendChild(el);
        document.getElementById(`v1.0.0-buy-${item.id}`)?.addEventListener('click', () => v1_0_0_handleBuyItem(item.id, item.cost));
    });
}
function v1_0_0_handleBuyItem(itemId, cost) {
    if (gameState.v1_0_0.isInternetOutage) { v1_0_0_showNotification("인터넷 연결이 불안정합니다.", true); return; }
    if (gameState.v1_0_0.shopItems[itemId]) { v1_0_0_showNotification('이미 구매한 아이템입니다.', true); return; }
    if (gameState.v0_3_0.userCash >= cost) {
        gameState.v0_3_0.userCash -= cost;
        gameState.v1_0_0.shopItems[itemId] = true;
        v1_0_0_showNotification('구매 완료!', false);
        v1_0_0_updateUI();
        saveGameState();
    } else {
        v1_0_0_showNotification('현금이 부족합니다.', true);
    }
}
function v1_0_0_updateShopUI() {
    Object.keys(gameState.v1_0_0.shopItems).forEach(itemId => {
        const button = document.getElementById(`v1.0.0-buy-${itemId}`);
        if (button && gameState.v1_0_0.shopItems[itemId]) {
            button.textContent = '구매 완료';
            button.classList.add('btn-disabled');
        }
    });
}
function v1_0_0_updateAlmanacUI() {
    const almanacSection = v1_0_0_dom.almanacSection;
    const almanacContent = v1_0_0_dom.almanacContent;
    if (!almanacSection || !almanacContent) return;
    if (gameState.v1_0_0.shopItems.weatherAlmanac) {
        almanacSection.classList.remove('hidden');
        almanacContent.innerHTML = '';
        Object.keys(WEATHER_DATA).forEach(weatherName => {
            const hasExperienced = gameState.v1_0_0.experiencedWeathers[weatherName];
            const weatherInfo = WEATHER_DATA[weatherName];
            const el = document.createElement('div');
            el.className = `bg-gray-600 p-3 rounded-lg transition-opacity ${hasExperienced ? '' : 'opacity-40'}`;
            el.innerHTML = `
                <div class="font-bold text-lg">${weatherInfo.icon} ${hasExperienced ? weatherName : '???'}</div>
                <p class="text-sm text-gray-300 mt-1">${hasExperienced ? weatherInfo.description : '아직 경험하지 못한 날씨입니다.'}</p>
            `;
            almanacContent.appendChild(el);
        });
    } else {
        almanacSection.classList.add('hidden');
    }
}
// =======================================================
// 공통 및 버전 관리 로직
// =======================================================
function initThree(container) { 
    if (!container) return;
    if (renderer) {
        if(renderer.domElement.parentElement !== container) container.prepend(renderer.domElement);
        return;
    }
    scene = new THREE.Scene(); 
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000); 
    camera.position.z = 5; 
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); 
    renderer.setSize(container.clientWidth, container.clientHeight); 
    container.prepend(renderer.domElement); 
    const geometry = new THREE.BoxGeometry(2.5, 2.5, 2.5); 
    cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x60a5fa, metalness: 0.5, roughness: 0.1, transparent: true, opacity: 0.9 }); 
    cube = new THREE.Mesh(geometry, cubeMaterial); 
    scene.add(cube); 
    ambientLight = new THREE.AmbientLight(0xffffff, 0.7); 
    scene.add(ambientLight); 
    directionalLight = new THREE.DirectionalLight(0xffffff, 1); 
    directionalLight.position.set(5, 5, 5); 
    scene.add(directionalLight); 
    animate(); 
}
function animate() { requestAnimationFrame(animate); if (cube && (gameState.v0_3_0.isCubePurchased || gameState.v1_0_0.isCubePurchased)) { cube.rotation.x += 0.005; cube.rotation.y += 0.005; } if (renderer) renderer.render(scene, camera); }

function handleCodeSubmit() {
    const codeInput = document.getElementById(`${currentVersion}-code-input`) as HTMLInputElement;
    if (!codeInput) return;
    const code = codeInput.value.trim();
    const showNotif = currentVersion === 'v0.3.0' ? v0_3_0_showNotification : v1_0_0_showNotification;
    if (gameState.v1_0_0.isInternetOutage && currentVersion === 'v1.0.0') { showNotif("인터넷 연결이 불안정합니다.", true); return; }
    const updateUI = currentVersion === 'v0.3.0' ? v0_3_0_updateUI : v1_0_0_updateUI;

    if (code === '') return;
    if (code.toLowerCase() === 'reset') {
        if(confirm('정말로 모든 진행 상황을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            localStorage.removeItem("cubeCoinSimulator_gameState_v2");
            window.location.reload();
        }
        return;
    }

    if (code.toLowerCase() === 'v.1.0.0') { switchVersion('v1.0.0'); codeInput.value = ''; return; }
    if (code.toLowerCase() === 'v.0.4.0') { switchVersion('v1.0.0'); codeInput.value = ''; return; }
    if (code.toLowerCase() === 'v.0.3.0') { switchVersion('v0.3.0'); codeInput.value = ''; return; }

    if (code.toLowerCase() === 'v.0.4.0.preview') {
        if (gameState.shared.v0_4_0_preview_used) {
            showNotif('프리뷰 코드는 한 번만 사용할 수 있습니다.', true);
        } else {
            gameState.shared.v0_4_0_preview_used = true;
            gameState.shared.v0_4_0_preview_end_time = Date.now() + 5 * 60 * 1000;
            showNotif('5분간 v.0.4.0 프리뷰를 시작합니다!', false);
            switchVersion('v1.0.0');
        }
        codeInput.value = '';
        return;
    }

    if (code === 'ice_cube101') { v0_3_0_zeroCooldownEndTime = Date.now() + 60 * 1000; showNotif('개발자 코드: 1분간 작업 쿨타임이 제거됩니다!', false); codeInput.value = ''; updateUI(); return; }
    if (code === 'ice_cube102') { gameState.v0_3_0.userCash += 1000000000000; showNotif('개발자 코드: 1조 KRW!', false); codeInput.value = ''; saveGameState(); updateUI(); return; }
    if (code === 'ice_cube103') { v0_3_0_starCatchingBuffEndTime = Date.now() + 60 * 1000; showNotif('개발자 코드: 1분간 밤하늘의 별 따기 확률이 10%로 증가합니다!', false); codeInput.value = ''; return; }
    if (code === 'ice_day') { gameState.v0_3_0.gameTime = new Date(gameState.v0_3_0.gameTime).setHours(9, 0, 0); showNotif('개발자 코드: 시간을 낮으로 변경합니다.', false); codeInput.value = ''; updateUI(); return; }
    if (code === 'ice_night') { gameState.v0_3_0.gameTime = new Date(gameState.v0_3_0.gameTime).setHours(20, 0, 0); showNotif('개발자 코드: 시간을 밤으로 변경합니다.', false); codeInput.value = ''; updateUI(); return; }
    
    if (gameState.shared.usedCodes.includes(code)) { showNotif('이미 사용된 코드', true); return; }

    let notificationText = '';
    if (code === 'LUNAR') { gameState.v0_3_0.userCash += 50000; gameState.v0_3_0.userLunar += 1; notificationText = '업데이트 기념 보상! (+50,000 KRW, +1 LUNAR)'; } 
    else if (code === 'v.0.3.0') { gameState.v0_3_0.userLunar += 10; notificationText = 'v.0.3.0 업데이트 보상: 10 LUNAR!'; } 
    else if (code === 'PRISM') { gameState.v0_3_0.userCash += 200000; notificationText = "v.0.4.0 업데이트 보상: 200,000 KRW!"; }
    else if (code.toUpperCase() === 'WEATHER') {
        if (currentVersion !== 'v1.0.0') {
            showNotif('v.0.4.0 버전에서만 입력할 수 있는 코드입니다.', true);
            return;
        }
        gameState.v1_0_0.userEnergy += 1;
        notificationText = '날씨 업데이트 기념 보상! (+1 ENERGY)';
    }
    else if (code === 'mining:1' && currentVersion === 'v1.0.0') { gameState.v1_0_0.userEnergy += 1; notificationText = '채굴 지원! (+1 ENERGY)'; }
    else { showNotif('유효하지 않은 코드', true); return; }
    
    gameState.shared.usedCodes.push(code);
    showNotif(notificationText, false);
    codeInput.value = '';
    updateUI();
    saveGameState().catch(e => console.error("Save failed:", e));
}

async function switchVersion(targetVersion) {
    if (currentVersion === targetVersion) return;
    
    if (currentVersion === 'v0.3.0') { clearTimeout(v0_3_0_gameLoopTimeout); clearTimeout(v0_3_0_priceUpdateTimeout); } 
    else if (currentVersion === 'v1.0.0') { 
        clearInterval(v1_0_0_gameLoopInterval); 
        clearTimeout(v1_0_0_priceUpdateTimeout);
    }

    document.getElementById(`${currentVersion}-container`)?.classList.add('hidden');
    currentVersion = targetVersion;
    document.getElementById(`${currentVersion}-container`)?.classList.remove('hidden');

    if (currentVersion === 'v0.3.0') {
        initThree(v0_3_0_dom.canvasContainer);
        v0_3_0_startGame();
    } else if (currentVersion === 'v1.0.0') {
        initThree(document.getElementById('v1.0.0-canvas-container'));
        v1_0_0_startGame();
    }
}

function saveGameState() {
    if (typeof(Storage) === "undefined") {
        console.error("LocalStorage is not supported.");
        return Promise.resolve();
    }
    gameState.shared.lastOnlineTimestamp = Date.now();
    localStorage.setItem("cubeCoinSimulator_gameState_v2", JSON.stringify(gameState));
    return Promise.resolve();
}

async function loadGameState() {
    const savedDataJSON = localStorage.getItem("cubeCoinSimulator_gameState_v2");

    if (savedDataJSON) {
        const data = JSON.parse(savedDataJSON);
        if (data.userCash !== undefined && data.v0_3_0 === undefined) { // Legacy save migration
            console.log("Migrating old save data to new format...");
            gameState.v0_3_0 = { ...gameState.v0_3_0, userCash: data.userCash, userCubes: data.userCubes, userPrisms: data.userPrisms, transactions: data.transactions, isCubePurchased: data.isCubePurchased, isPrismUpgraded: data.isPrismUpgraded, paperClicks: data.paperClicks, userLunar: data.userLunar, isLunarBlessed: data.isLunarBlessed, gameTime: data.gameTime ? new Date(data.gameTime).getTime() : new Date(2025, 10, 15, 9, 0, 0).getTime() };
            gameState.shared = { ...gameState.shared, hasTwilightTrophy: data.hasTwilightTrophy, usedCodes: data.usedCodes, lastOnlineTimestamp: data.lastOnlineTimestamp };
            saveGameState();
        } else {
            gameState.v0_3_0 = { ...gameState.v0_3_0, ...(data.v0_3_0 || {}) };
            gameState.v1_0_0 = { ...gameState.v1_0_0, ...(data.v1_0_0 || {}) };
            gameState.shared = { ...gameState.shared, ...(data.shared || {}) };
        }
        
        if (gameState.shared.lastOnlineTimestamp) {
            const offlineSeconds = (Date.now() - gameState.shared.lastOnlineTimestamp) / 1000;
            if (offlineSeconds > 60) {
                let afkMessages = [];
                // Passive Income
                let baseIncome = 0;
                if (gameState.v1_0_0.isCubePurchased) {
                    baseIncome = 100;
                    if (gameState.v1_0_0.isPrismUpgraded) baseIncome = 400;
                    else if (gameState.v1_0_0.isEnergyUpgraded) baseIncome = 200;
                }
                const averageRate = baseIncome + (gameState.v1_0_0.isLunarUpgraded ? 100 * (14 / 24) : 0);
                const afkEarnings = Math.floor(offlineSeconds * averageRate * 0.1); // 10% offline rate
                if (afkEarnings > 0) {
                    gameState.v0_3_0.userCash += afkEarnings;
                    afkMessages.push(`${afkEarnings.toLocaleString()} KRW`);
                }

                // Offline Mining
                const offlineMinutes = Math.floor(offlineSeconds / 60);
                const tier = gameState.v1_0_0.computerTier;
                if (tier > 0 && offlineMinutes > 0) {
                    const minedCoins = { cube: 0, lunar: 0, energy: 0, prism: 0 };
                    const rates = { cube: 0.04, lunar: 0.03, energy: 0.02, prism: 0.01 };
                    for (let i = 0; i < offlineMinutes; i++) {
                        Object.keys(rates).forEach(coin => {
                            if (Math.random() < (tier * rates[coin] * 0.1)) { // 1/10th offline rate
                                minedCoins[coin]++;
                            }
                        });
                    }
                    if (minedCoins.cube > 0) { gameState.v0_3_0.userCubes += minedCoins.cube; afkMessages.push(`${minedCoins.cube.toLocaleString()} CUBE`); }
                    if (minedCoins.lunar > 0) { gameState.v0_3_0.userLunar += minedCoins.lunar; afkMessages.push(`${minedCoins.lunar.toLocaleString()} LUNAR`); }
                    if (minedCoins.energy > 0) { gameState.v1_0_0.userEnergy += minedCoins.energy; afkMessages.push(`${minedCoins.energy.toLocaleString()} ENERGY`); }
                    if (minedCoins.prism > 0) { gameState.v1_0_0.userPrisms += minedCoins.prism; afkMessages.push(`${minedCoins.prism.toLocaleString()} PRISM`); }
                }

                if (afkMessages.length > 0) {
                     setTimeout(() => {
                        const showNotif = currentVersion === 'v1.0.0' ? v1_0_0_showNotification : v0_3_0_showNotification;
                        showNotif(`AFK (${Math.floor(offlineSeconds / 60)}분): ${afkMessages.join(', ')} 획득!`, false);
                    }, 1000);
                }
            }
        }

    } else {
        console.log("No saved data found, initializing new game state.");
        saveGameState().catch(e => console.error("Error saving initial game state:", e));
    }
    
    // Reset prices on load to prevent stale data issues
    gameState.v0_3_0.currentPrice = 10000; gameState.v0_3_0.lastPrice = 10000;
    gameState.v0_3_0.currentPrismPrice = 50000; gameState.v0_3_0.lastPrismPrice = 50000;
    gameState.v0_3_0.currentLunarPrice = 20000; gameState.v0_3_0.lastLunarPrice = 20000;
    gameState.v1_0_0.currentPrice = 10000; gameState.v1_0_0.lastPrice = 10000;
    gameState.v1_0_0.currentLunarPrice = 20000; gameState.v1_0_0.lastLunarPrice = 20000;
    gameState.v1_0_0.currentEnergyPrice = 50000; gameState.v1_0_0.lastEnergyPrice = 50000;
    gameState.v1_0_0.currentPrismPrice = 100000; gameState.v1_0_0.lastPrismPrice = 100000;

    currentVersion = new Date() >= V0_4_0_RELEASE_DATE ? 'v1.0.0' : 'v0.3.0';
    document.getElementById('v0.3.0-container')?.classList.toggle('hidden', currentVersion !== 'v0.3.0');
    document.getElementById('v1.0.0-container')?.classList.toggle('hidden', currentVersion !== 'v1.0.0');

    if (currentVersion === 'v0.3.0') {
        initThree(v0_3_0_dom.canvasContainer);
        v0_3_0_startGame();
    } else {
        initThree(document.getElementById('v1.0.0-canvas-container'));
        v1_0_0_startGame();
    }
}


window.onload = () => {
    const countdownBanner = document.getElementById('countdown-banner');
    const countdownTimer = document.getElementById('countdown-timer');
    const codeAnnouncement = document.getElementById('code-announcement');
    const countdownText = countdownTimer?.parentElement;

    const now = new Date();
    const timeLeft = V0_4_0_RELEASE_DATE.getTime() - now.getTime();
    const fiveHours = 5 * 60 * 60 * 1000;
    const oneHour = 1 * 60 * 60 * 1000;

    if (countdownBanner && countdownTimer && codeAnnouncement && countdownText && timeLeft < fiveHours && timeLeft > -oneHour) { // Active T-5h to T+1h
        countdownBanner.classList.remove('hidden');
        codeAnnouncement.textContent = '업데이트 기념 코드: WEATHER (v.0.4.0에서 입력)';
        codeAnnouncement.classList.remove('hidden');

        const updateCountdown = () => {
            const now_inner = new Date();
            const timeLeft_inner = V0_4_0_RELEASE_DATE.getTime() - now_inner.getTime();
            if (timeLeft_inner < -oneHour) { // Window has passed
                countdownBanner.classList.add('hidden');
                if(window.countdownInterval) clearInterval(window.countdownInterval);
                return;
            }

            if (timeLeft_inner > 0) {
                const hours = Math.floor(timeLeft_inner / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft_inner % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft_inner % (1000 * 60)) / 1000);
                countdownTimer.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            } else {
                countdownText.textContent = 'v.0.4.0 업데이트가 완료되었습니다!';
                codeAnnouncement.textContent = '기념 코드: WEATHER';
            }
        };
        updateCountdown();
        window.countdownInterval = window.setInterval(updateCountdown, 1000);
    }

    initV0_3_0_Game();
    initV1_0_0_Game();
    loadGameState();

    if (window.autosaveInterval) clearInterval(window.autosaveInterval);
    window.autosaveInterval = window.setInterval(() => {
        saveGameState().catch(e => console.error("Autosave failed:", e));
    }, 30000);
};

// Expose Chart and THREE to global scope for the libraries to work
window.Chart = Chart;
window.THREE = THREE;

// FIX: Make this file a module to allow global scope augmentation, which fixes all errors.
export {};
