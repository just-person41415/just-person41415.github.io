// FIX: Add declarations for global variables and extend Window interface to avoid TypeScript errors.
declare var Chart: any;

declare global {
    interface Window {
        Chart: any;
        autosaveInterval?: number;
    }
}

// --- 전역 설정 ---
const WEATHER_DATA = {
    '맑음': { icon: '☀️', description: '현재 특별한 효과 없음.' },
    '비': { icon: '🌧️', description: '현재 특별한 효과 없음.' },
    '구름': { icon: '☁️', description: '현재 특별한 효과 없음.' },
    '산성비': { icon: '☣️', description: '현재 특별한 효과 없음.' },
    '천둥': { icon: '⛈️', description: '현재 특별한 효과 없음.' },
    '무지개': { icon: '🌈', description: '현재 특별한 효과 없음.' },
    '바람': { icon: '💨', description: '현재 특별한 효과 없음.' }
};

let gameLoopInterval: number | null = null;
let priceUpdateTimeout: number | null = null;
let gameTime: Date;
// FIX: Changed to `any` to allow dynamic property assignment and avoid type errors.
let dom: any = {};

// --- 3D 렌더링 관련 ---
let chartCube: any, chartLunar: any, chartEnergy: any, chartPrism: any;

// --- 게임 상태 관리 ---
// 모든 게임 데이터를 포함하는 단일 객체.
let gameState: any;

const getInitialGameState = () => ({
    userCash: 100000,
    userCubes: 0,
    userLunar: 0,
    userEnergy: 0,
    userPrisms: 0,
    currentPrice: 10000,
    lastPrice: 10000,
    currentLunarPrice: 20000,
    lastLunarPrice: 20000,
    currentEnergyPrice: 50000,
    lastEnergyPrice: 50000,
    currentPrismPrice: 100000,
    lastPrismPrice: 100000,
    fluctuation: { cube: '중', lunar: '중', energy: '중', prism: '중' },
    computerTier: 0,
    isCubePurchased: false,
    isLunarUpgraded: false,
    isEnergyUpgraded: false,
    isPrismUpgraded: false,
    weather: '맑음',
    weatherCounter: 0,
    experiencedWeathers: { '맑음': true },
    shopItems: { digitalClock: false, weatherAlmanac: false, bed: false },
    isInternetOutage: false,
    isInternetOutageCooldown: 0,
    nextWeatherIsCloudy: false,
    nextWeatherIsRainbow: false,
    gameTime: new Date(2025, 10, 22, 9, 0, 0).getTime(),
    isSleeping: false,
    usedCodes: [],
    lastOnlineTimestamp: Date.now(),
});

gameState = getInitialGameState();

// =======================================================
// 게임 로직
// =======================================================
function initCharts() {
    const commonOptions = { scales: { y: { ticks: { color: '#9ca3af' }, grid: { color: '#4b5563' } }, x: { ticks: { color: '#9ca3af' }, grid: { color: '#4b5563' } } }, plugins: { legend: { display: false } }, maintainAspectRatio: false };
    const createChart = (id: string, borderColor: string, label: string) => {
        const ctx = (document.getElementById(id) as HTMLCanvasElement)?.getContext('2d');
        if (!ctx) return null;
        return new Chart(ctx, { type: 'line', data: { labels: [], datasets: [{ label, data: [], borderColor, tension: 0.1, pointRadius: 0 }] }, options: commonOptions });
    };
    chartCube = createChart('price-chart-cube', '#60a5fa', 'CUBE');
    chartLunar = createChart('price-chart-lunar', '#a855f7', 'LUNAR');
    chartEnergy = createChart('price-chart-energy', '#facc15', 'ENERGY');
    chartPrism = createChart('price-chart-prism', '#f472b6', 'PRISM');
}

function updateChartData(chart: any, price: number, time: string) {
    if (!chart) return;
    const label = time;
    chart.data.labels.push(label);
    chart.data.datasets[0].data.push(price);
    if (chart.data.labels.length > 30) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }
    chart.update('none');
}

function initGame() {
    dom = {
        userCash: document.getElementById('user-cash'), userCubes: document.getElementById('user-cubes'), userLunar: document.getElementById('user-lunar'), userEnergy: document.getElementById('user-energy'), userPrisms: document.getElementById('user-prisms'),
        currentCubePrice: document.getElementById('current-cube-price'), cubePriceChange: document.getElementById('cube-price-change'),
        currentLunarPrice: document.getElementById('current-lunar-price'), lunarPriceChange: document.getElementById('lunar-price-change'),
        currentEnergyPrice: document.getElementById('current-energy-price'), energyPriceChange: document.getElementById('energy-price-change'),
        currentPrismPrice: document.getElementById('current-prism-price'), prismPriceChange: document.getElementById('prism-price-change'),
        notification: document.getElementById('notification'), internetOutage: document.getElementById('internet-outage'),
        buyCubeButton: document.getElementById('buy-cube-button'), cubePurchaseOverlay: document.getElementById('cube-purchase-overlay'), passiveIncomeDisplay: document.getElementById('passive-income-display'), incomePerSecond: document.getElementById('income-per-second'),
        computerInfo: document.getElementById('computer-info'), computerTierText: document.getElementById('computer-tier-text'), computerStatsText: document.getElementById('computer-stats-text'), computerUpgradeButton: document.getElementById('computer-upgrade-button'),
        tradeContainer: document.getElementById('trade-container'),
        chartTabCube: document.getElementById('chart-tab-cube'), chartTabLunar: document.getElementById('chart-tab-lunar'), chartTabEnergy: document.getElementById('chart-tab-energy'), chartTabPrism: document.getElementById('chart-tab-prism'),
        chartCubeContainer: document.getElementById('chart-cube-container'), chartLunarContainer: document.getElementById('chart-lunar-container'), chartEnergyContainer: document.getElementById('chart-energy-container'), chartPrismContainer: document.getElementById('chart-prism-container'),
        timeContainer: document.getElementById('time-container'), gameTime: document.getElementById('game-time'), weatherContainer: document.getElementById('weather-container'), weatherDisplay: document.getElementById('weather-display'),
        shopSection: document.getElementById('shop-section'), shopItems: document.getElementById('shop-items'),
        sleepSection: document.getElementById('sleep-section'), sleepButton: document.getElementById('sleep-button'),
        codeSubmitButton: document.getElementById('code-submit-button'), codeInput: document.getElementById('code-input'),
        upgradeLunarSection: document.getElementById('upgrade-lunar-section'), upgradeLunarButton: document.getElementById('upgrade-lunar-button'),
        upgradeEnergySection: document.getElementById('upgrade-energy-section'), upgradeEnergyButton: document.getElementById('upgrade-energy-button'),
        upgradePrismSection: document.getElementById('upgrade-prism-section'), upgradePrismButton: document.getElementById('upgrade-prism-button'),
        weatherAlmanacSection: document.getElementById('weather-almanac-section'), weatherAlmanacContent: document.getElementById('weather-almanac-content'),
        incomeSourceUpgrades: document.getElementById('income-source-upgrades'),
    };
    ['assets', 'income', 'computer', 'almanac', 'shop', 'trade', 'charts', 'code', 'sleep'].forEach(s => { const toggle = document.getElementById(`toggle-${s}`); if (toggle) { toggle.addEventListener('click', () => { document.getElementById(`content-${s}`)?.classList.toggle('hidden'); document.getElementById(`toggle-${s}-icon`)?.classList.toggle('rotate-180'); }); } });
    if (dom.buyCubeButton) dom.buyCubeButton.addEventListener('click', handleBuy3DCube);
    if (dom.computerUpgradeButton) dom.computerUpgradeButton.addEventListener('click', handleComputerUpgrade);
    if (dom.codeSubmitButton) dom.codeSubmitButton.addEventListener('click', handleCodeSubmit);
    if (dom.sleepButton) dom.sleepButton.addEventListener('click', handleSleep);
    if (dom.upgradeLunarButton) dom.upgradeLunarButton.addEventListener('click', handleUpgradeLunar);
    if (dom.upgradeEnergyButton) dom.upgradeEnergyButton.addEventListener('click', handleUpgradeEnergy);
    if (dom.upgradePrismButton) dom.upgradePrismButton.addEventListener('click', handleUpgradePrism);
    ['cube', 'lunar', 'energy', 'prism'].forEach(c => dom[`chartTab${c.charAt(0).toUpperCase() + c.slice(1)}`]?.addEventListener('click', () => switchChart(c)));
    populateTradeUI();
    populateShopItems();
    initCharts();
}

function startGame() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    if (priceUpdateTimeout) clearTimeout(priceUpdateTimeout);
    gameTime = new Date(gameState.gameTime);
    restoreUIState();
    gameLoopInterval = setInterval(gameLoop, 250);
    priceUpdateLoop();
}

function showNotification(message: string, isError = true) {
    if (!dom.notification) return;
    dom.notification.textContent = message;
    dom.notification.className = `fixed bottom-6 right-6 text-white p-4 rounded-lg shadow-xl z-50 ${isError ? 'bg-red-500' : 'bg-green-500'} opacity-100 translate-y-0 transition-all duration-300`;
    setTimeout(() => {
        dom.notification.classList.add('opacity-0', 'translate-y-10');
    }, 3000);
}

function updateUI() {
    const state = gameState;
    if (!dom.userCash) return;
    dom.userCash.textContent = Math.floor(state.userCash).toLocaleString('ko-KR');
    dom.userCubes.textContent = Math.floor(state.userCubes).toLocaleString('ko-KR');
    dom.userLunar.textContent = Math.floor(state.userLunar).toLocaleString('ko-KR');
    dom.userEnergy.textContent = Math.floor(state.userEnergy).toLocaleString('ko-KR');
    dom.userPrisms.textContent = Math.floor(state.userPrisms).toLocaleString('ko-KR');

    const updatePriceDisplay = (priceEl: HTMLElement, changeEl: HTMLElement, current: number, last: number) => {
        if (!priceEl || !changeEl) return;
        priceEl.textContent = `${current.toLocaleString('ko-KR')} KRW`;
        const change = current - last;
        const pct = last > 0 ? ((change / last) * 100).toFixed(2) : '0.00';
        if (change > 0) changeEl.innerHTML = `<span class="text-green-500">▲ +${pct}%</span>`;
        else if (change < 0) changeEl.innerHTML = `<span class="text-red-500">▼ ${pct}%</span>`;
        else changeEl.innerHTML = `0.00%`;
    };
    updatePriceDisplay(dom.currentCubePrice, dom.cubePriceChange, state.currentPrice, state.lastPrice);
    updatePriceDisplay(dom.currentLunarPrice, dom.lunarPriceChange, state.currentLunarPrice, state.lastLunarPrice);
    updatePriceDisplay(dom.currentEnergyPrice, dom.energyPriceChange, state.currentEnergyPrice, state.lastEnergyPrice);
    updatePriceDisplay(dom.currentPrismPrice, dom.prismPriceChange, state.currentPrismPrice, state.lastPrismPrice);

    if (dom.weatherDisplay) dom.weatherDisplay.textContent = `${state.weather} ${WEATHER_DATA[state.weather].icon}`;

    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    let baseProduction = 0;
    if (state.isCubePurchased) {
        baseProduction = 100;
        if (state.isPrismUpgraded) baseProduction = 400;
        else if (state.isEnergyUpgraded) baseProduction = 200;
    }
    const lunarBonus = (state.isLunarUpgraded && isNight) ? 100 : 0;
    const totalIncome = baseProduction + lunarBonus;

    if (dom.incomePerSecond) dom.incomePerSecond.textContent = `+${totalIncome.toLocaleString('ko-KR')} KRW / sec`;

    if (dom.gameTime) {
        const gameHours = gameTime.getHours();
        const gameMinutes = String(gameTime.getMinutes()).padStart(2, '0');
        dom.gameTime.textContent = `${String(gameHours).padStart(2, '0')}:${gameMinutes} (${isNight ? '🌙' : '☀️'})`;
    }
    if (dom.sleepButton) dom.sleepButton.classList.toggle('btn-disabled', gameTime.getHours() < 20 && gameTime.getHours() >= 8);

    updateComputerUI();
}
function updateComputerUI() {
    if (!dom.computerTierText || !dom.computerStatsText || !dom.computerUpgradeButton) return;
    const tier = gameState.computerTier;
    const tiers = [
        { name: '컴퓨터 없음', cost: 50000, next: 'Tier 1 구매' },
        { name: 'Tier 1 컴퓨터', cost: 250000, next: 'Tier 2 업그레이드' },
        { name: 'Tier 2 컴퓨터', cost: 500000, next: 'Tier 3 업그레이드' },
        { name: 'Tier 3 컴퓨터', cost: 1200000, next: 'Tier 4 업그레이드' },
        { name: 'Tier 4 컴퓨터', cost: 2000000, next: 'Tier 5 업그레이드' },
        { name: 'Tier 5 컴퓨터', cost: Infinity, next: '최고 티어' }
    ];
    const miningRates = tier > 0 ? `<br>채굴 확률 (분당):<br>CUBE: ${tier*4}%, LUNAR: ${tier*3}%<br>ENERGY: ${tier*2}%, PRISM: ${tier*1}%` : '';
    dom.computerTierText.textContent = tiers[tier].name;
    dom.computerStatsText.innerHTML = `자동 채굴 활성화${miningRates}`;
    if (tier < 5) {
        dom.computerUpgradeButton.textContent = `${tiers[tier].next} (${tiers[tier].cost.toLocaleString()} KRW)`;
        dom.computerUpgradeButton.classList.remove('hidden');
    } else {
        dom.computerUpgradeButton.classList.add('hidden');
    }
}
function populateTradeUI() {
    const container = dom.tradeContainer; if (!container) return; container.innerHTML = '';
    const coins = [
        { id: 'cube', name: 'CUBE', color: 'blue' },
        { id: 'lunar', name: 'LUNAR', color: 'purple' },
        { id: 'energy', name: 'ENERGY', color: 'yellow' },
        { id: 'prism', name: 'PRISM', color: 'pink' },
    ];
    coins.forEach(coin => {
        const el = document.createElement('div');
        el.id = `${coin.id}-trade-section`;
        el.className = 'bg-gray-600 p-4 rounded-lg';
        el.innerHTML = `
            <label class="text-lg font-semibold text-${coin.color}-300">${coin.name} 거래</label>
            <input type="number" id="amount-input-${coin.id}" value="1" min="1" class="w-full bg-gray-800 text-white p-2 rounded mt-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-${coin.color}-500" placeholder="${coin.name} 수량">
            <div class="grid grid-cols-2 gap-4 mt-4">
                <button id="buy-button-${coin.id}" class="w-full bg-green-600 hover:bg-green-700 font-bold p-3 rounded-lg">매수</button>
                <button id="sell-button-${coin.id}" class="w-full bg-red-600 hover:bg-red-700 font-bold p-3 rounded-lg">매도</button>
            </div>
        `;
        container.appendChild(el);
        document.getElementById(`buy-button-${coin.id}`)?.addEventListener('click', () => handleTrade('buy', coin.id));
        document.getElementById(`sell-button-${coin.id}`)?.addEventListener('click', () => handleTrade('sell', coin.id));
    });
}
function populateShopItems() {
    const container = dom.shopItems; if (!container) return; container.innerHTML = '';
    const items = [ 
        { id: 'digitalClock', name: '디지털 시계', desc: '게임 내 시간과 날씨를 화면에 표시합니다.', cost: 10000 },
        { id: 'weatherAlmanac', name: '날씨 도감', desc: '지금까지 경험한 날씨의 효과를 기록하고 확인할 수 있습니다.', cost: 25000 },
        { id: 'bed', name: '침대', desc: '수면을 취하여 다음 날 아침으로 즉시 이동할 수 있게 됩니다.', cost: 15000 },
    ];
    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'bg-gray-600 p-4 rounded-lg';
        el.innerHTML = `
            <h4 class="font-bold text-lg">${item.name}</h4>
            <p class="text-xs text-gray-400 mt-1 mb-3 h-10">${item.desc}</p>
            <button id="buy-${item.id}" class="w-full bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded-lg">
                ${gameState.shopItems[item.id] ? '보유중' : `${item.cost.toLocaleString()} KRW`}
            </button>
        `;
        container.appendChild(el);
        const button = document.getElementById(`buy-${item.id}`) as HTMLButtonElement;
        if (button) { if (gameState.shopItems[item.id]) { button.disabled = true; button.classList.add('btn-disabled'); } else { button.addEventListener('click', () => handleShopBuy(item.id, item.cost)); } }
    });
}
function handleShopBuy(itemId: string, cost: number) {
    const state = gameState;
    if (state.userCash >= cost) {
        state.userCash -= cost; state.shopItems[itemId] = true;
        showNotification(`${itemId} 구매 완료!`, false);
        populateShopItems(); restoreUIState(); saveGameState();
    } else { showNotification('현금이 부족합니다.', true); }
}
function updateWeatherAlmanacUI() {
    if (!dom.weatherAlmanacSection || !dom.weatherAlmanacContent) return;
    const state = gameState;
    dom.weatherAlmanacSection.classList.toggle('hidden', !state.shopItems.weatherAlmanac);
    if (!state.shopItems.weatherAlmanac) return;
    dom.weatherAlmanacContent.innerHTML = '';
    for (const weatherKey in WEATHER_DATA) {
        const weather = WEATHER_DATA[weatherKey as keyof typeof WEATHER_DATA];
        const isExperienced = state.experiencedWeathers[weatherKey];
        const el = document.createElement('div');
        el.className = `bg-gray-600 p-3 rounded-lg flex items-center gap-4 transition-opacity ${isExperienced ? '' : 'opacity-40'}`;
        if (isExperienced) {
            el.innerHTML = `
                <span class="text-3xl">${weather.icon}</span>
                <div>
                    <h4 class="font-bold text-white">${weatherKey}</h4>
                    <p class="text-xs text-gray-300">${weather.description}</p>
                </div>`;
        } else {
            el.innerHTML = `
                <span class="text-3xl">❓</span>
                <div>
                    <h4 class="font-bold text-gray-400">미발견</h4>
                    <p class="text-xs text-gray-500">아직 경험하지 못한 날씨입니다.</p>
                </div>`;
        }
        dom.weatherAlmanacContent.appendChild(el);
    }
}
function getNewPrice(currentPrice: number, coinId: string) {
    const riseProb = 0.5; // Weather effects removed
    
    let dir = Math.random() < riseProb ? 1 : -1;
    let mag = Math.random(), pct, magStr;
    if (mag < 0.25) { // S
        pct = (Math.random() * 0.02) + 0.001;
        magStr = '소';
    } else if (mag < 0.60) { // M
        pct = (Math.random() * 0.05) + 0.021;
        magStr = '중';
    } else { // L
        pct = (Math.random() * 0.12) + 0.051;
        magStr = '대';
    }
    
    const newPrice = currentPrice + (currentPrice * pct * dir);
    const limits: { [key: string]: { min: number, max: number } } = { cube: { min: 5000, max: 25000 }, lunar: { min: 10000, max: 50000 }, energy: { min: 20000, max: 100000 }, prism: { min: 40000, max: 200000 } };
    const finalPrice = Math.round(Math.max(limits[coinId].min, Math.min(limits[coinId].max, newPrice)));
    return { price: finalPrice, magnitude: magStr };
}

function priceUpdateLoop() {
    const state = gameState;
    if (state.isInternetOutage || state.isSleeping) { priceUpdateTimeout = setTimeout(priceUpdateLoop, 2000); return; }
    
    const update = (coinId: string, currentKey: string, lastKey: string, chart: any) => {
        state[lastKey] = state[currentKey];
        const result = getNewPrice(state[currentKey], coinId);
        state[currentKey] = result.price;
        state.fluctuation[coinId] = result.magnitude;
        updateChartData(chart, state[currentKey], new Date(gameTime).toLocaleTimeString('ko-KR'));
    };
    
    update('cube', 'currentPrice', 'lastPrice', chartCube);
    update('lunar', 'currentLunarPrice', 'lastLunarPrice', chartLunar);
    update('energy', 'currentEnergyPrice', 'lastEnergyPrice', chartEnergy);
    update('prism', 'currentPrismPrice', 'lastPrismPrice', chartPrism);
    
    priceUpdateTimeout = setTimeout(priceUpdateLoop, 2000);
}

function gameLoop() {
    const state = gameState;
    const now = Date.now();

    if(state.isSleeping) return;

    gameTime.setMinutes(gameTime.getMinutes() + 1);

    // Weather
    state.weatherCounter++;
    if (state.weatherCounter >= 120) { // 30초마다 날씨 변경 (250ms * 120)
        state.weatherCounter = 0;
        if (state.nextWeatherIsCloudy) { state.weather = '구름'; state.nextWeatherIsCloudy = false; state.nextWeatherIsRainbow = Math.random() < 0.1; }
        else if (state.nextWeatherIsRainbow) { state.weather = '무지개'; state.nextWeatherIsRainbow = false; }
        else {
            const rand = Math.random();
            if (rand < 0.6) state.weather = '맑음';
            else if (rand < 0.9) { state.weather = '비'; state.nextWeatherIsCloudy = true; if(Math.random() < 0.1) state.weather = '산성비'; }
            else state.weather = '천둥';
        }
        state.experiencedWeathers[state.weather] = true;
        updateWeatherAlmanacUI();
    }
    // Internet Outage (Effect Disabled)
    if (state.isInternetOutage && now > state.isInternetOutageCooldown) {
         state.isInternetOutage = false; 
         // showNotification('인터넷 연결이 복구되었습니다.', false); 
    }
    if (dom.internetOutage) dom.internetOutage.classList.add('hidden');
    
    // Income
    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    let baseProduction = 0;
    if(state.isCubePurchased) { baseProduction = 100; if(state.isPrismUpgraded) baseProduction = 400; else if(state.isEnergyUpgraded) baseProduction = 200; }
    const lunarBonus = (state.isLunarUpgraded && isNight) ? 100 : 0;
    state.userCash += (baseProduction + lunarBonus) / 4;

    // Mining (Probabilistic) - per minute, so check every 240 ticks (250ms * 240 = 60s)
    if(state.weatherCounter % 240 === 0) { // Check once per game minute
      const tier = state.computerTier;
      if (tier > 0) {
          if (Math.random() < tier * 0.04) state.userCubes++;
          if (Math.random() < tier * 0.03) state.userLunar++;
          if (Math.random() < tier * 0.02) state.userEnergy++;
          if (Math.random() < tier * 0.01) state.userPrisms++;
      }
    }

    updateUI();
}

function handleTrade(type: 'buy' | 'sell', coinId: string) {
    const state = gameState;
    if (state.isInternetOutage) { showNotification('인터넷 연결이 끊겨 거래할 수 없습니다.', true); return; }
    const amountInput = document.getElementById(`amount-input-${coinId}`) as HTMLInputElement;
    if (!amountInput) return; const amount = parseInt(amountInput.value); if (!(amount > 0)) return;
    
    const prices: { [key: string]: number } = { cube: state.currentPrice, lunar: state.currentLunarPrice, energy: state.currentEnergyPrice, prism: state.currentPrismPrice };
    const coinData: { [key: string]: { balance: string } } = { cube: { balance: 'userCubes' }, lunar: { balance: 'userLunar' }, energy: { balance: 'userEnergy' }, prism: { balance: 'userPrisms' } };
    const cost = prices[coinId] * amount;
    const coinUpper = coinId.toUpperCase();
    const balanceKey = coinData[coinId].balance;

    if (type === 'buy') {
        if (state.userCash >= cost) { state.userCash -= cost; state[balanceKey] += amount; showNotification(`${amount} ${coinUpper} 매수!`, false); } 
        else { showNotification('현금 부족', true); return; }
    } else {
        if (state[balanceKey] >= amount) { state.userCash += cost; state[balanceKey] -= amount; showNotification(`${amount} ${coinUpper} 매도!`, false); } 
        else { showNotification(`${coinUpper} 부족`, true); return; }
    }
    updateUI(); saveGameState();
}
function handleBuy3DCube() { const state = gameState; if (state.userCash >= 1000000) { state.userCash -= 1000000; state.isCubePurchased = true; restoreUIState(); showNotification('패시브 수입원 활성화 완료!', false); updateUI(); saveGameState(); } else { showNotification('현금이 부족합니다.', true); } }
function handleComputerUpgrade() {
    const state = gameState;
    const costs = [50000, 250000, 500000, 1200000, 2000000];
    if (state.computerTier >= 5) return;
    const cost = costs[state.computerTier];
    if (state.userCash >= cost) {
        state.userCash -= cost; state.computerTier++;
        showNotification(`컴퓨터 업그레이드 완료! (Tier ${state.computerTier})`, false);
        updateComputerUI(); saveGameState();
    } else { showNotification('현금이 부족합니다.', true); }
}
function handleUpgradeLunar() { const state = gameState; if (state.userLunar >= 200) { state.userLunar -= 200; state.isLunarUpgraded = true; restoreUIState(); showNotification('LUNAR 강화 완료!', false); saveGameState(); } else { showNotification('LUNAR가 부족합니다.', true); } }
function handleUpgradeEnergy() { const state = gameState; if (state.userEnergy >= 100) { state.userEnergy -= 100; state.isEnergyUpgraded = true; restoreUIState(); showNotification('ENERGY 강화 완료!', false); saveGameState(); } else { showNotification('ENERGY가 부족합니다.', true); } }
function handleUpgradePrism() { const state = gameState; if (state.userPrisms >= 100) { state.userPrisms -= 100; state.isPrismUpgraded = true; restoreUIState(); showNotification('PRISM 강화 완료!', false); saveGameState(); } else { showNotification('PRISM이 부족합니다.', true); } }
function handleSleep() {
    const state = gameState;
    if (!state.shopItems.bed) {
        showNotification('침대가 없어서 잘 수 없습니다. 상점에서 구매하세요.', true);
        return;
    }
    const currentHour = gameTime.getHours();
    if (state.isSleeping || (currentHour < 20 && currentHour >= 8)) {
        showNotification('수면은 20시 이후에만 가능합니다.', true);
        return;
    }
    state.isSleeping = true;
    showNotification('수면을 시작합니다...', false);
    if (dom.sleepButton) {
        dom.sleepButton.textContent = '수면 중...';
        dom.sleepButton.classList.add('btn-disabled');
    }
    
    setTimeout(() => {
        const hoursToSleep = (32 - gameTime.getHours()) % 24;
        const minutesToSleep = hoursToSleep * 60;
        const secondsSlept = minutesToSleep * (250/1000); // 1 game minute = 250ms
        
        let baseProduction = 0;
        if(state.isCubePurchased) { baseProduction = 100; if(state.isPrismUpgraded) baseProduction = 400; else if(state.isEnergyUpgraded) baseProduction = 200; }
        const lunarBonus = (state.isLunarUpgraded) ? 100 : 0; // Sleep is always at night
        const totalIncomePerSecond = baseProduction + lunarBonus;
        state.userCash += totalIncomePerSecond * secondsSlept;
        
        const tier = state.computerTier;
        if (tier > 0) {
            state.userCubes += Math.floor(minutesToSleep * tier * 0.04);
            state.userLunar += Math.floor(minutesToSleep * tier * 0.03);
            state.userEnergy += Math.floor(minutesToSleep * tier * 0.02);
            state.userPrisms += Math.floor(minutesToSleep * tier * 0.01);
        }

        state.isSleeping = false;
        gameTime.setHours(8, 0, 0, 0);
        showNotification('좋은 아침입니다!', false);
        if (dom.sleepButton) {
            dom.sleepButton.textContent = '수면';
            dom.sleepButton.classList.remove('btn-disabled');
        }
        updateUI();
        saveGameState().catch(e => console.error("Save failed after sleep:", e));
    }, 3000);
}
function switchChart(chartName: string) { const charts = ['cube', 'lunar', 'energy', 'prism']; charts.forEach(c => { dom[`chart${c.charAt(0).toUpperCase() + c.slice(1)}Container`].classList.toggle('hidden', c !== chartName); dom[`chartTab${c.charAt(0).toUpperCase() + c.slice(1)}`].classList.toggle('tab-active', c === chartName); }); }
function restoreUIState() {
    const state = gameState;
    if (!dom.cubePurchaseOverlay) return;
    dom.cubePurchaseOverlay.classList.toggle('hidden', state.isCubePurchased);
    dom.incomeSourceUpgrades.classList.toggle('hidden', !state.isCubePurchased);
    
    dom.timeContainer.classList.toggle('hidden', !state.shopItems.digitalClock);
    dom.weatherContainer.classList.toggle('hidden', !state.shopItems.digitalClock);

    if (dom.upgradeLunarSection) dom.upgradeLunarSection.classList.toggle('hidden', !state.isCubePurchased || state.isLunarUpgraded);
    if (dom.upgradeEnergySection) dom.upgradeEnergySection.classList.toggle('hidden', !state.isCubePurchased || state.isEnergyUpgraded);
    if (dom.upgradePrismSection) dom.upgradePrismSection.classList.toggle('hidden', !state.isEnergyUpgraded || state.isPrismUpgraded);

    if (dom.sleepSection) dom.sleepSection.classList.toggle('hidden', !state.shopItems.bed);
    
    updateWeatherAlmanacUI();
    updateUI();
}

// =======================================================
// 공용 로직
// =======================================================
function handleCodeSubmit() {
    const input = document.getElementById('code-input') as HTMLInputElement;
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    if (gameState.usedCodes.includes(code)) {
        showNotification('이미 사용된 코드입니다.', true);
        return;
    }

    let rewardGiven = false;
    if (code === 'MONEYBAGS') {
        gameState.userCash += 1000000;
        showNotification('치트 코드: 1,000,000 KRW가 추가되었습니다!', false);
        rewardGiven = true;
    } else if (code === 'UPGRADE') {
         gameState.isEnergyUpgraded = true;
         gameState.isPrismUpgraded = true;
         populateShopItems();
         restoreUIState();
         showNotification('치트 코드: 모든 코인 업그레이드 잠금 해제!', false);
         rewardGiven = true;
    } else {
        showNotification('유효하지 않은 코드입니다.', true);
    }
    
    if (rewardGiven) {
        gameState.usedCodes.push(code);
        input.value = '';
        updateUI();
        saveGameState();
    }
}

async function saveGameState() {
    try {
        gameState.lastOnlineTimestamp = Date.now();
        localStorage.setItem('cubeCoinSimGameState', JSON.stringify(gameState));
    } catch (error) {
        console.error("localStorage에 게임 상태 저장 실패:", error);
    }
}

async function loadGameState() {
    try {
        const savedStateJSON = localStorage.getItem('cubeCoinSimGameState');

        if (savedStateJSON) {
            const loadedData = JSON.parse(savedStateJSON);
            const initialState = getInitialGameState();
            // Merge saved data with initial state to prevent issues with new properties
            gameState = { ...initialState, ...loadedData };
            
            // AFK Progress
            const now = Date.now();
            if (gameState.lastOnlineTimestamp) {
                const offlineSeconds = (now - gameState.lastOnlineTimestamp) / 1000;
                if (offlineSeconds > 5) { // 5초 이상 오프라인이었을 경우만 계산
                    let offlineCash = 0;
                    if(gameState.isCubePurchased) {
                        let avgBaseProd = 100;
                        if (gameState.isPrismUpgraded) avgBaseProd = 400;
                        else if (gameState.isEnergyUpgraded) avgBaseProd = 200;
                        // Night is 14/24 hours of the day
                        const avgLunarBonus = gameState.isLunarUpgraded ? (100 * (14 / 24)) : 0;
                        offlineCash = offlineSeconds * (avgBaseProd + avgLunarBonus);
                    }
                    gameState.userCash += offlineCash;
                    
                    if (gameState.computerTier > 0) {
                        const tier = gameState.computerTier;
                        const offlineRealMinutes = offlineSeconds / 60;
                        gameState.userCubes += Math.floor(offlineRealMinutes * tier * 0.04);
                        gameState.userLunar += Math.floor(offlineRealMinutes * tier * 0.03);
                        gameState.userEnergy += Math.floor(offlineRealMinutes * tier * 0.02);
                        gameState.userPrisms += Math.floor(offlineRealMinutes * tier * 0.01);
                    }

                    if(offlineCash > 0) {
                        setTimeout(() => showNotification(`${Math.floor(offlineSeconds / 60)}분간의 오프라인 보상으로 ${Math.floor(offlineCash).toLocaleString()} KRW와 채굴된 코인을 획득했습니다!`, false), 1000);
                    }
                }
            }
            return true;
        } else {
            gameState = getInitialGameState();
            await saveGameState();
            return false;
        }
    } catch (error) {
        console.error("localStorage에서 게임 상태 불러오기 실패:", error);
        gameState = getInitialGameState();
        return false;
    }
}

// =======================================================
// 앱 초기화
// =======================================================
document.addEventListener('DOMContentLoaded', async () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.classList.remove('hidden');
    }

    await loadGameState();
    initGame();
    startGame();

    if (window.autosaveInterval) clearInterval(window.autosaveInterval);
    window.autosaveInterval = setInterval(saveGameState, 30000);
});
// FIX: Add empty export to treat this file as a module, enabling global declarations.
export {};
