// FIX: Add declarations for global variables and extend Window interface to avoid TypeScript errors.
declare var Chart: any;
declare var THREE: any;
declare var firebase: any;

declare global {
    interface Window {
        Chart: any;
        // FIX: Changed timer handle type to 'any' to support both browser (number) and Node.js (Timeout) return types from setInterval.
        autosaveInterval?: any;
    }
}

// --- Firebase 설정 ---
const firebaseConfig = {
  apiKey: "AIzaSyB5bYYQ7sIPOy1hjhKz0gqWIk28PK-ma9E",
  authDomain: "real-d1d0a.firebaseapp.com",
  databaseURL: "https://real-d1d0a-default-rtdb.firebaseio.com",
  projectId: "real-d1d0a",
  storageBucket: "real-d1d0a.appspot.com",
  messagingSenderId: "362480200866",
  appId: "1:362480200866:web:ae6e59d94a9e3fef51fbfb",
  measurementId: "G-Q-40RNTCZW5"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();


// --- 전역 설정 ---
const WEATHER_DATA = {
    '맑음': { icon: '☀️', short_desc: '상승 확률 소폭 증가', long_desc: '코인 증가 확률 +0.5%, 감소 확률 -0.5%' },
    '비': { icon: '🌧️', short_desc: 'CUBE 상승 확률 증가', long_desc: 'CUBE 코인 증가 확률 +1%, 감소 확률 -1%. 낮은 확률로 다른 날씨로 변함.' },
    '구름': { icon: '☁️', short_desc: '효과 없음', long_desc: '비가 온 뒤 나타나며, 특별한 효과는 없습니다.' },
    '산성비': { icon: '☣️', short_desc: '하락 확률 증가', long_desc: '코인 증가 확률 -2.5%, 코인 감소 확률 +2.5%.' },
    '천둥': { icon: '⛈️', short_desc: '인터넷 끊김 주의', long_desc: '5% 확률로 인터넷 연결이 끊겨 거래 등 일부 행동이 제한됩니다.' },
    '무지개': { icon: '🌈', short_desc: '상승 확률 대폭 증가', long_desc: '코인 증가 확률 +2.5%, 감소 확률 -2.5%.' },
    '바람': { icon: '💨', short_desc: '효과 없음', long_desc: '현재 특별한 효과 없음.' }
};

const TROPHY_DATA = {
    'weatherMaster': {
        name: '날씨의 지배자',
        icon: '🏆',
        desc: '모든 종류의 날씨를 경험했습니다.',
        reward: '좋은 효과를 가진 날씨가 2.5% 더 자주 나옵니다.',
        isUnlocked: (state: any) => state.hasWeatherTrophy
    }
};

const PICKAXE_DATA: { name: string; oreChanceMultiplier: number; cooldown: number; extraYieldChance: number; cost?: { [key: string]: number; }; }[] = [
    { name: '맨손', oreChanceMultiplier: 1.0, cooldown: 1500, extraYieldChance: 0.1 },
    { name: '나무 곡괭이', oreChanceMultiplier: 1.2, cooldown: 1250, extraYieldChance: 0.2, cost: { userCash: 50000 } },
    { name: '돌 곡괭이', oreChanceMultiplier: 1.5, cooldown: 1000, extraYieldChance: 0.3, cost: { stone: 20 } },
    { name: '구리 곡괭이', oreChanceMultiplier: 2.0, cooldown: 800, extraYieldChance: 0.4, cost: { copperIngot: 10 } },
    { name: '철 곡괭이', oreChanceMultiplier: 2.5, cooldown: 650, extraYieldChance: 0.5, cost: { ironIngot: 20 } },
    { name: '금 곡괭이', oreChanceMultiplier: 3.0, cooldown: 500, extraYieldChance: 0.6, cost: { goldIngot: 40 } },
    { name: '다이아몬드 곡괭이', oreChanceMultiplier: 4.0, cooldown: 400, extraYieldChance: 0.75, cost: { diamond: 40 } },
];

const ORE_DATA: {[key: string]: { name: string, icon: string, baseChance: number }} = {
    coal: { name: '석탄', icon: '⚫', baseChance: 0.40 },
    copperOre: { name: '구리 광석', icon: '🟤', baseChance: 0.10 },
    ironOre: { name: '철 광석', icon: '⚪', baseChance: 0.05 },
    goldOre: { name: '금 광석', icon: '🟡', baseChance: 0.01 },
    diamond: { name: '다이아몬드', icon: '💎', baseChance: 0.005 },
};

const INGOT_DATA: {[key: string]: { name: string, icon: string, smeltCost: { [key: string]: number } }} = {
    copperIngot: { name: '구리 주괴', icon: '🟠', smeltCost: { copperOre: 1, coal: 1 } },
    ironIngot: { name: '철 주괴', icon: '🔗', smeltCost: { ironOre: 1, coal: 1 } },
    goldIngot: { name: '금 주괴', icon: '👑', smeltCost: { goldOre: 1, coal: 1 } },
};


let gameLoopInterval: any = null;
let miningInterval: any = null;
// FIX: Changed timer handle types to 'any' to support both browser (number) and Node.js (Timeout) return types from setTimeout.
let priceUpdateTimeoutCube: any = null;
let priceUpdateTimeoutLunar: any = null;
let priceUpdateTimeoutEnergy: any = null;
let priceUpdateTimeoutPrism: any = null;
let gameTime: Date;
// FIX: Changed to `any` to allow dynamic property assignment and avoid type errors.
let dom: any = {};
let notificationTimeout: any = null;
let announcementTimeout: any = null;
let announcementInterval: any = null;
let userNickname: string | null = null;

// --- 3D 렌더링 관련 ---
let scene: any, camera: any, renderer: any, cube: any;
let chartCube: any, chartLunar: any, chartEnergy: any, chartPrism: any;

// --- 전역 상태 (관리자용) ---
let globalWeatherOverride: string | null = null;
let globalPriceOverrides: any = null;
let currentGameSpeed = 1;

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
    shopItems: { digitalClock: false, weatherAlmanac: false, bed: false, furnace: false },
    isInternetOutage: false,
    isInternetOutageCooldown: 0,
    nextWeatherIsCloudy: false,
    nextWeatherIsRainbow: false,
    gameTime: new Date(2025, 10, 22, 9, 0, 0).getTime(),
    isSleeping: false,
    usedCodes: [],
    lastOnlineTimestamp: Date.now(),
    hasWeatherTrophy: false,
    transactionHistory: [],
    exceptionalState: { isActive: false, expiresAt: 0 },
    // Mining state
    stone: 0,
    coal: 0,
    diamond: 0,
    copperOre: 0,
    ironOre: 0,
    goldOre: 0,
    copperIngot: 0,
    ironIngot: 0,
    goldIngot: 0,
    pickaxeTier: 0,
    lastMineTime: 0,
    smeltingQueue: [],
    miningGrid: [],
});

gameState = getInitialGameState();

// =======================================================
// 3D 렌더링
// =======================================================
function init3D() {
    const container = document.getElementById('cube-container');
    if (!container) return;
    // Clear previous renderer
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 3.5;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    updateCubeAppearance(); // Create initial cube

    window.addEventListener('resize', () => {
        if (!container.clientWidth || !container.clientHeight || !renderer) return;
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    }, false);
}

function updateCubeAppearance() {
    if (!scene) return;

    if(cube) scene.remove(cube); // Remove old cube if it exists

    let geometry;
    const materialProps: { [key: string]: any } = {
        metalness: 0.6,
        roughness: 0.4,
        emissive: 0x102040,
    };

    if (gameState.isPrismUpgraded) {
        geometry = new THREE.IcosahedronGeometry(1.5, 0);
        materialProps.color = 0xf472b6; // pink
    } else if (gameState.isEnergyUpgraded) {
        geometry = new THREE.BoxGeometry(2, 2, 2);
        materialProps.color = 0xfacc15; // yellow
    } else if (gameState.isLunarUpgraded) {
        geometry = new THREE.BoxGeometry(2, 2, 2);
        materialProps.color = 0xa855f7; // purple
    } else {
        geometry = new THREE.BoxGeometry(2, 2, 2);
        materialProps.color = 0x60a5fa; // blue
    }

    const material = new THREE.MeshStandardMaterial(materialProps);
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
}


function animate() {
    requestAnimationFrame(animate);
    if (cube) {
        cube.rotation.x += 0.003;
        cube.rotation.y += 0.003;
    }
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// =======================================================
// 게임 로직
// =======================================================
function initCharts() {
    if (chartCube) chartCube.destroy();
    if (chartLunar) chartLunar.destroy();
    if (chartEnergy) chartEnergy.destroy();
    if (chartPrism) chartPrism.destroy();

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
    // DOM queries that are part of the main game UI
    dom = {
        userCash: document.getElementById('user-cash'), userCubes: document.getElementById('user-cubes'), userLunar: document.getElementById('user-lunar'), userEnergy: document.getElementById('user-energy'), userPrisms: document.getElementById('user-prisms'),
        currentCubePrice: document.getElementById('current-cube-price'), cubePriceChange: document.getElementById('cube-price-change'),
        currentLunarPrice: document.getElementById('current-lunar-price'), lunarPriceChange: document.getElementById('lunar-price-change'),
        currentEnergyPrice: document.getElementById('current-energy-price'), energyPriceChange: document.getElementById('energy-price-change'),
        currentPrismPrice: document.getElementById('current-prism-price'), prismPriceChange: document.getElementById('prism-price-change'),
        notification: document.getElementById('notification'), internetOutage: document.getElementById('internet-outage'),
        buyCubeButton: document.getElementById('buy-cube-button'), cubePurchaseOverlay: document.getElementById('cube-purchase-overlay'), passiveIncomeDisplay: document.getElementById('passive-income-display'), incomePerSecond: document.getElementById('income-per-second'),
        exceptionalStatus: document.getElementById('exceptional-status'), exceptionalTimer: document.getElementById('exceptional-timer'),
        computerInfo: document.getElementById('computer-info'), computerTierText: document.getElementById('computer-tier-text'), computerStatsText: document.getElementById('computer-stats-text'), computerUpgradeButton: document.getElementById('computer-upgrade-button'),
        tradeContainer: document.getElementById('trade-container'),
        chartTabCube: document.getElementById('chart-tab-cube'), chartTabLunar: document.getElementById('chart-tab-lunar'), chartTabEnergy: document.getElementById('chart-tab-energy'), chartTabPrism: document.getElementById('chart-tab-prism'),
        chartCubeContainer: document.getElementById('chart-cube-container'), chartLunarContainer: document.getElementById('chart-lunar-container'), chartEnergyContainer: document.getElementById('chart-energy-container'), chartPrismContainer: document.getElementById('chart-prism-container'),
        timeContainer: document.getElementById('time-container'), gameTime: document.getElementById('game-time'), weatherContainer: document.getElementById('weather-container'), weatherDisplay: document.getElementById('weather-display'),
        shopSection: document.getElementById('shop-section'), shopItems: document.getElementById('shop-items'),
        codeSubmitButton: document.getElementById('code-submit-button'), codeInput: document.getElementById('code-input'),
        upgradeLunarSection: document.getElementById('upgrade-lunar-section'), upgradeLunarButton: document.getElementById('upgrade-lunar-button'),
        upgradeEnergySection: document.getElementById('upgrade-energy-section'), upgradeEnergyButton: document.getElementById('upgrade-energy-button'),
        upgradePrismSection: document.getElementById('upgrade-prism-section'), upgradePrismButton: document.getElementById('upgrade-prism-button'),
        weatherAlmanacSection: document.getElementById('weather-almanac-section'), weatherAlmanacContent: document.getElementById('weather-almanac-content'),
        incomeSourceUpgrades: document.getElementById('income-source-upgrades'),
        trophyList: document.getElementById('trophy-list'),
        transactionHistoryList: document.getElementById('transaction-history-list'),
        chatMessages: document.getElementById('chat-messages'),
        chatInput: document.getElementById('chat-input'),
        chatSendButton: document.getElementById('chat-send-button'),
        // Mining UI
        miningGridContainer: document.getElementById('mining-grid-container'),
        miningInventory: document.getElementById('mining-inventory'),
        smeltingOptions: document.getElementById('smelting-options'),
        smeltingQueueDisplay: document.getElementById('smelting-queue-display'),
        logoutButton: document.getElementById('logout-button')
    };
    
    if (dom.buyCubeButton) dom.buyCubeButton.addEventListener('click', handleBuy3DCube);
    if (dom.computerUpgradeButton) dom.computerUpgradeButton.addEventListener('click', handleComputerUpgrade);
    if (dom.codeSubmitButton) dom.codeSubmitButton.addEventListener('click', handleCodeSubmit);
    if (dom.upgradeLunarButton) dom.upgradeLunarButton.addEventListener('click', handleUpgradeLunar);
    if (dom.upgradeEnergyButton) dom.upgradeEnergyButton.addEventListener('click', handleUpgradeEnergy);
    if (dom.upgradePrismButton) dom.upgradePrismButton.addEventListener('click', handleUpgradePrism);
    if (dom.chatSendButton) dom.chatSendButton.addEventListener('click', handleSendMessage);
    if (dom.chatInput) dom.chatInput.addEventListener('keydown', (e: KeyboardEvent) => { if(e.key === 'Enter') handleSendMessage(); });
    if (dom.logoutButton) dom.logoutButton.addEventListener('click', handleLogout);

    ['cube', 'lunar', 'energy', 'prism'].forEach(c => dom[`chartTab${c.charAt(0).toUpperCase() + c.slice(1)}`]?.addEventListener('click', () => switchChart(c)));
    
    populateTradeUI();
    populateShopItems();
    initCharts();
    init3D();
    updateMiningUI();
}

function restartGameLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, 250 / currentGameSpeed);
}

function startGame() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    if (miningInterval) clearInterval(miningInterval);
    if (priceUpdateTimeoutCube) clearTimeout(priceUpdateTimeoutCube);
    if (priceUpdateTimeoutLunar) clearTimeout(priceUpdateTimeoutLunar);
    if (priceUpdateTimeoutEnergy) clearTimeout(priceUpdateTimeoutEnergy);
    if (priceUpdateTimeoutPrism) clearTimeout(priceUpdateTimeoutPrism);
    
    gameTime = new Date(gameState.gameTime);
    restoreUIState();
    updateTrophyUI();
    updateTransactionHistoryUI();
    restartGameLoop();
    miningInterval = setInterval(handleMining, 60000); // 1분마다 채굴
    startPriceUpdateLoops();
    animate();
}

function stopGame() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    if (miningInterval) clearInterval(miningInterval);
    if (priceUpdateTimeoutCube) clearTimeout(priceUpdateTimeoutCube);
    if (priceUpdateTimeoutLunar) clearTimeout(priceUpdateTimeoutLunar);
    if (priceUpdateTimeoutEnergy) clearTimeout(priceUpdateTimeoutEnergy);
    if (priceUpdateTimeoutPrism) clearTimeout(priceUpdateTimeoutPrism);
    if (window.autosaveInterval) clearInterval(window.autosaveInterval);
    gameLoopInterval = null;
    miningInterval = null;
    priceUpdateTimeoutCube = null;
    priceUpdateTimeoutLunar = null;
    priceUpdateTimeoutEnergy = null;
    priceUpdateTimeoutPrism = null;
    window.autosaveInterval = null;
}

function showNotification(message: string, isError = true) {
    if (!dom.notification) return;

    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }

    dom.notification.innerHTML = `
        <span>${message}</span>
        <button id="notification-close-btn" class="ml-4 font-bold text-xl leading-none transition-transform hover:scale-125">&times;</button>
    `;
    
    dom.notification.className = `fixed bottom-6 right-6 text-white p-4 rounded-lg shadow-xl z-50 transition-all duration-300 flex items-center justify-between ${isError ? 'bg-red-500' : 'bg-green-500'}`;
    dom.notification.classList.remove('opacity-0', 'translate-y-10');
    dom.notification.classList.add('opacity-100', 'translate-y-0');

    const hideNotification = () => {
        if (!dom.notification) return;
        dom.notification.classList.remove('opacity-100', 'translate-y-0');
        dom.notification.classList.add('opacity-0', 'translate-y-10');
        notificationTimeout = null;
    };

    document.getElementById('notification-close-btn')?.addEventListener('click', hideNotification, { once: true });

    notificationTimeout = setTimeout(hideNotification, 3000);
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

    let baseProduction = 0;
    if (state.isCubePurchased) {
        baseProduction = 100;
        if (state.isPrismUpgraded) baseProduction = 400;
        else if (state.isEnergyUpgraded) baseProduction = 200;
    }
    
    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    const lunarBonus = (state.isLunarUpgraded && isNight) ? 100 : 0;
    let totalIncome = baseProduction + lunarBonus;

    if (state.exceptionalState.isActive) {
        totalIncome *= 2;
        dom.exceptionalStatus.classList.remove('hidden');
        const timeLeft = Math.max(0, state.exceptionalState.expiresAt - Date.now());
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        dom.exceptionalTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} 남음`;
    } else {
        dom.exceptionalStatus.classList.add('hidden');
    }

    if (dom.incomePerSecond) dom.incomePerSecond.textContent = `+${totalIncome.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} KRW / sec`;

    if (dom.gameTime) {
        const gameHours = gameTime.getHours();
        const gameMinutes = String(gameTime.getMinutes()).padStart(2, '0');
        dom.gameTime.textContent = `${String(gameHours).padStart(2, '0')}:${gameMinutes} (${isNight ? '🌙' : '☀️'})`;
    }

    updateComputerUI();
}

function updateComputerUI() {
    if (!dom.computerTierText || !dom.computerStatsText || !dom.computerUpgradeButton) return;
    const tier = gameState.computerTier;
    const tiers = [
        { name: '컴퓨터 없음', cost: 100000, req: null, next: 'Tier 1 구매' },
        { name: 'Tier 1 컴퓨터', cost: 500000, req: null, next: 'Tier 2 업그레이드' },
        { name: 'Tier 2 컴퓨터', cost: 2500000, req: { copperIngot: 50 }, next: 'Tier 3 업그레이드' },
        { name: 'Tier 3 컴퓨터', cost: 5000000, req: { ironIngot: 50 }, next: 'Tier 4 업그레이드' },
        { name: 'Tier 4 컴퓨터', cost: 10000000, req: { goldIngot: 50 }, next: 'Tier 5 업그레이드' },
        { name: 'Tier 5 컴퓨터', cost: 0, req: null, next: '최고 티어' }
    ];

    const miningRates = tier > 0 ? `<br>채굴 확률 (분당):<br>CUBE: ${tier*2}%, LUNAR: ${tier*1.5}%<br>ENERGY: ${tier*1}%, PRISM: ${tier*0.5}%` : '';
    dom.computerTierText.textContent = tiers[tier].name;
    dom.computerStatsText.innerHTML = `자동 채굴 활성화${miningRates}`;

    if (tier < 5) {
        const currentTier = tiers[tier];
        let reqString = '';
        if (currentTier.req) {
            for (const mat in currentTier.req) {
                reqString += ` + ${INGOT_DATA[mat as keyof typeof INGOT_DATA]?.name || mat} ${currentTier.req[mat as keyof typeof currentTier.req]}`;
            }
        }
        dom.computerUpgradeButton.textContent = `${currentTier.next} (${currentTier.cost.toLocaleString()} KRW${reqString})`;
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
    const functionContainer = document.getElementById('shop-items-function');
    const miningContainer = document.getElementById('shop-items-mining');
    if (!functionContainer || !miningContainer) return;
    
    functionContainer.innerHTML = '';
    miningContainer.innerHTML = '';

    const functionItems = [ 
        { id: 'digitalClock', name: '디지털 시계', desc: '게임 내 시간과 날씨를 화면에 표시합니다.', cost: 10000 },
        { id: 'weatherAlmanac', name: '날씨 도감', desc: '지금까지 경험한 날씨의 효과를 기록하고 확인할 수 있습니다.', cost: 25000 },
        { id: 'bed', name: '침대', desc: '수면을 취하여 다음 날 아침으로 즉시 이동할 수 있게 됩니다.', cost: 15000 },
        { id: 'furnace', name: '용광로', desc: '주괴 제련에 걸리는 시간을 50% 단축시킵니다.', cost: 100000 },
    ];

    functionItems.forEach(item => {
        const el = document.createElement('div');
        el.className = 'bg-gray-600 p-2 rounded-lg flex flex-col justify-between';
        
        let buttonHtml: string;
        const isBedAndOwned = item.id === 'bed' && gameState.shopItems.bed;
        const isOtherAndOwned = item.id !== 'bed' && gameState.shopItems[item.id];

        if (isBedAndOwned) {
            buttonHtml = `<button id="sleep-button-shop" class="w-full bg-indigo-600 hover:bg-indigo-700 font-bold py-1 px-2 rounded-lg text-sm">수면</button>`;
        } else if (isOtherAndOwned) {
            buttonHtml = `<button class="w-full bg-gray-500 font-bold py-1 px-2 rounded-lg text-sm btn-disabled" disabled>보유중</button>`;
        } else {
            buttonHtml = `<button id="buy-${item.id}" class="w-full bg-blue-600 hover:bg-blue-700 font-bold py-1 px-2 rounded-lg text-sm">${item.cost.toLocaleString()} KRW</button>`;
        }

        el.innerHTML = `
            <div>
                <h4 class="font-bold text-base">${item.name}</h4>
                <p class="text-xs text-gray-400 mt-1 mb-2 h-8">${item.desc}</p>
            </div>
            ${buttonHtml}
        `;
        functionContainer.appendChild(el);

        if (isBedAndOwned) {
            document.getElementById('sleep-button-shop')?.addEventListener('click', handleSleep);
        } else if (!gameState.shopItems[item.id]) {
            document.getElementById(`buy-${item.id}`)?.addEventListener('click', () => handleShopBuy(item.id, item.cost));
        }
    });

    for (let i = 1; i < PICKAXE_DATA.length; i++) {
        const pickaxe = PICKAXE_DATA[i];
        if (gameState.pickaxeTier >= i) continue;

        const el = document.createElement('div');
        el.className = 'bg-gray-600 p-2 rounded-lg flex flex-col justify-between';
        
        let costString = '';
        let canAfford = true;
        const cost = pickaxe.cost;
        if (cost) {
            for (const mat in cost) {
                const required = cost[mat];
                const owned = gameState[mat] || 0;
                if (owned < required) canAfford = false;
                
                const nameMap: {[key:string]: string} = { userCash: 'KRW', stone: '돌', coal: '석탄', diamond: '다이아몬드', copperIngot: '구리 주괴', ironIngot: '철 주괴', goldIngot: '금 주괴'};
                costString += `${required.toLocaleString()} ${nameMap[mat] || mat}`;
            }
        }

        const buttonHtml = `<button data-tier="${i}" class="buy-pickaxe-btn w-full ${canAfford ? 'bg-green-600 hover:bg-green-700' : 'btn-disabled'} font-bold py-1 px-2 rounded-lg text-sm" ${!canAfford ? 'disabled' : ''}>${costString}</button>`;

        el.innerHTML = `
            <div>
                <h4 class="font-bold text-base">${pickaxe.name}</h4>
                <p class="text-xs text-gray-400 mt-1 mb-2 h-8">채굴 쿨타임: ${pickaxe.cooldown / 1000}초</p>
            </div>
            ${buttonHtml}
        `;
        miningContainer.appendChild(el);
        break; 
    }

    if (gameState.pickaxeTier >= PICKAXE_DATA.length - 1) {
        miningContainer.innerHTML = `<div class="col-span-3 bg-gray-600 p-3 rounded-lg text-center"><h5 class="font-bold text-green-400">최고 등급 곡괭이 보유 중</h5></div>`;
    }

    document.querySelectorAll('.buy-pickaxe-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const tier = Number((e.target as HTMLElement).dataset.tier);
        handleBuyPickaxe(tier);
    }));
    
    document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = (e.target as HTMLElement).dataset.tab;
            document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('tab-active'));
            (e.target as HTMLElement).classList.add('tab-active');

            document.getElementById('shop-tab-content-function')?.classList.toggle('hidden', tabName !== 'function');
            document.getElementById('shop-tab-content-mining')?.classList.toggle('hidden', tabName !== 'mining');
        });
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
function handleBuyPickaxe(tier: number) {
    const state = gameState;
    if (state.pickaxeTier !== tier - 1) return;

    const pickaxe = PICKAXE_DATA[tier];
    const cost = pickaxe.cost;
    if (!cost) return;

    let canAfford = true;
    for (const mat in cost) {
        if ((state[mat] || 0) < cost[mat]) {
            canAfford = false;
            break;
        }
    }

    if (canAfford) {
        for (const mat in cost) {
            state[mat] -= cost[mat];
        }
        state.pickaxeTier = tier;
        showNotification(`${pickaxe.name} 구매 완료!`, false);
        populateShopItems();
        updateMiningUI();
        saveGameState();
    } else {
        showNotification('재료 또는 현금이 부족합니다.', true);
    }
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
                    <p class="text-xs text-gray-300">${weather.long_desc}</p>
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
function updateTrophyUI() {
    if (!dom.trophyList) return;
    dom.trophyList.innerHTML = '';
    
    for (const trophyKey in TROPHY_DATA) {
        const trophy = TROPHY_DATA[trophyKey as keyof typeof TROPHY_DATA];
        const isUnlocked = trophy.isUnlocked(gameState);

        const el = document.createElement('div');
        el.className = `bg-gray-600 p-3 rounded-lg flex items-center gap-4 transition-opacity ${isUnlocked ? '' : 'opacity-40'}`;

        if (isUnlocked) {
            el.innerHTML = `
                <span class="text-3xl">${trophy.icon}</span>
                <div>
                    <h4 class="font-bold text-yellow-300">${trophy.name}</h4>
                    <p class="text-xs text-gray-300">${trophy.desc}</p>
                    <p class="text-xs text-green-400 mt-1">효과: ${trophy.reward}</p>
                </div>`;
        } else {
            el.innerHTML = `
                <span class="text-3xl">❓</span>
                <div>
                    <h4 class="font-bold text-gray-400">???</h4>
                    <p class="text-xs text-gray-500">잠금 해제 조건이 충족되지 않았습니다.</p>
                </div>`;
        }
        dom.trophyList.appendChild(el);
    }
}
function checkTrophies() {
    const state = gameState;
    // Weather Master Trophy
    if (!state.hasWeatherTrophy) {
        const totalWeatherTypes = Object.keys(WEATHER_DATA).length;
        const experiencedWeatherTypes = Object.keys(state.experiencedWeathers).length;

        if (experiencedWeatherTypes >= totalWeatherTypes) {
            state.hasWeatherTrophy = true;
            const trophyName = TROPHY_DATA.weatherMaster.name;
            showNotification(`트로피 획득: ${trophyName}!`, false);
            updateTrophyUI();
            saveGameState();
        }
    }
}

function getNewPrice(currentPrice: number, coinId: string) {
    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    
    let riseProb = 0.5;
    let magProbs = { s: 0.60, m: 0.35, l: 0.05 }; // Default (CUBE)

    // Coin-specific rules
    switch(coinId) {
        case 'cube':
            riseProb = 0.55;
            magProbs = { s: 0.60, m: 0.35, l: 0.05 };
            break;
        case 'lunar':
            if (isNight) {
                riseProb = 0.55;
                magProbs = { s: 0.30, m: 0.40, l: 0.30 };
            } else {
                riseProb = 0.48;
                magProbs = { s: 0.35, m: 0.55, l: 0.10 };
            }
            break;
        case 'energy':
            if (isNight) {
                riseProb = 0.50;
            } else {
                riseProb = 0.55;
            }
            magProbs = { s: 0.60, m: 0.39, l: 0.01 };
            break;
        case 'prism':
            riseProb = 0.51;
            magProbs = { s: 0.45, m: 0.50, l: 0.05 };
            break;
    }

    // Weather effects
    const weather = gameState.weather;
    switch(weather) {
        case '맑음': riseProb += 0.005; break;
        case '비': if (coinId === 'cube') riseProb += 0.01; break;
        case '산성비': riseProb -= 0.025; break;
        case '무지개': riseProb += 0.025; break;
    }
    
    const dir = Math.random() < riseProb ? 1 : -1;

    const magRand = Math.random();
    let pct: number;
    let magStr: string;
    
    if (magRand < magProbs.s) {
        pct = (Math.random() * 0.009) + 0.001; // 0.1% to 1%
        magStr = '소';
    } else if (magRand < magProbs.s + magProbs.m) {
        pct = (Math.random() * 0.02) + 0.01; // 1% to 3%
        magStr = '중';
    } else {
        pct = (Math.random() * 0.02) + 0.03; // 3% to 5%
        magStr = '대';
    }
    
    const newPrice = currentPrice + (currentPrice * pct * dir);

    const limits: { [key: string]: { min: number, max: number } } = {
        cube: { min: 5000, max: 25000 },
        lunar: { min: 10000, max: 50000 },
        energy: { min: 20000, max: 100000 },
        prism: { min: 40000, max: 200000 }
    };
    
    const finalPrice = Math.round(Math.max(limits[coinId].min, Math.min(limits[coinId].max, newPrice)));
    return { price: finalPrice, magnitude: magStr };
}

function startPriceUpdateLoops() {
    priceUpdateLoopCube();
    priceUpdateLoopLunar();
    priceUpdateLoopEnergy();
    priceUpdateLoopPrism();
}

function priceUpdateLoopCube() {
    if (gameState.isInternetOutage || gameState.isSleeping) {
        priceUpdateTimeoutCube = setTimeout(priceUpdateLoopCube, 2000);
        return;
    }
    const state = gameState;
    
    if (globalPriceOverrides && globalPriceOverrides.cube) {
        if (state.currentPrice !== globalPriceOverrides.cube) {
            state.lastPrice = state.currentPrice;
            state.currentPrice = globalPriceOverrides.cube;
            updateChartData(chartCube, state.currentPrice, new Date(gameTime).toLocaleTimeString('ko-KR'));
        }
    } else {
        state.lastPrice = state.currentPrice;
        const result = getNewPrice(state.currentPrice, 'cube');
        state.currentPrice = result.price;
        state.fluctuation['cube'] = result.magnitude;
        updateChartData(chartCube, state.currentPrice, new Date(gameTime).toLocaleTimeString('ko-KR'));
    }

    priceUpdateTimeoutCube = setTimeout(priceUpdateLoopCube, 2000);
}

function priceUpdateLoopLunar() {
    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    const interval = isNight ? 1500 : 4000;
    if (gameState.isInternetOutage || gameState.isSleeping) {
        priceUpdateTimeoutLunar = setTimeout(priceUpdateLoopLunar, interval);
        return;
    }
    const state = gameState;

    if (globalPriceOverrides && globalPriceOverrides.lunar) {
        if (state.currentLunarPrice !== globalPriceOverrides.lunar) {
            state.lastLunarPrice = state.currentLunarPrice;
            state.currentLunarPrice = globalPriceOverrides.lunar;
            updateChartData(chartLunar, state.currentLunarPrice, new Date(gameTime).toLocaleTimeString('ko-KR'));
        }
    } else {
        state.lastLunarPrice = state.currentLunarPrice;
        const result = getNewPrice(state.currentLunarPrice, 'lunar');
        state.currentLunarPrice = result.price;
        state.fluctuation['lunar'] = result.magnitude;
        updateChartData(chartLunar, state.currentLunarPrice, new Date(gameTime).toLocaleTimeString('ko-KR'));
    }
    
    priceUpdateTimeoutLunar = setTimeout(priceUpdateLoopLunar, interval);
}

function priceUpdateLoopEnergy() {
    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    const interval = isNight ? 3000 : 2000;
     if (gameState.isInternetOutage || gameState.isSleeping) {
        priceUpdateTimeoutEnergy = setTimeout(priceUpdateLoopEnergy, interval);
        return;
    }
    const state = gameState;

    if (globalPriceOverrides && globalPriceOverrides.energy) {
        if (state.currentEnergyPrice !== globalPriceOverrides.energy) {
            state.lastEnergyPrice = state.currentEnergyPrice;
            state.currentEnergyPrice = globalPriceOverrides.energy;
            updateChartData(chartEnergy, state.currentEnergyPrice, new Date(gameTime).toLocaleTimeString('ko-KR'));
        }
    } else {
        state.lastEnergyPrice = state.currentEnergyPrice;
        const result = getNewPrice(state.currentEnergyPrice, 'energy');
        state.currentEnergyPrice = result.price;
        state.fluctuation['energy'] = result.magnitude;
        updateChartData(chartEnergy, state.currentEnergyPrice, new Date(gameTime).toLocaleTimeString('ko-KR'));
    }

    priceUpdateTimeoutEnergy = setTimeout(priceUpdateLoopEnergy, interval);
}

function priceUpdateLoopPrism() {
    if (gameState.isInternetOutage || gameState.isSleeping) {
        priceUpdateTimeoutPrism = setTimeout(priceUpdateLoopPrism, 3000);
        return;
    }
    const state = gameState;

    if (globalPriceOverrides && globalPriceOverrides.prism) {
        if (state.currentPrismPrice !== globalPriceOverrides.prism) {
            state.lastPrismPrice = state.currentPrismPrice;
            state.currentPrismPrice = globalPriceOverrides.prism;
            updateChartData(chartPrism, state.currentPrismPrice, new Date(gameTime).toLocaleTimeString('ko-KR'));
        }
    } else {
        state.lastPrismPrice = state.currentPrismPrice;
        const result = getNewPrice(state.currentPrismPrice, 'prism');
        state.currentPrismPrice = result.price;
        state.fluctuation['prism'] = result.magnitude;
        updateChartData(chartPrism, state.currentPrismPrice, new Date(gameTime).toLocaleTimeString('ko-KR'));
    }

    priceUpdateTimeoutPrism = setTimeout(priceUpdateLoopPrism, 3000);
}

function gameLoop() {
    const state = gameState;
    const now = Date.now();

    if(state.isSleeping) return;

    gameTime.setMinutes(gameTime.getMinutes() + 1);
    
    processSmeltingQueue();

    // Check for mining grid cell respawns
    let needsUIRefresh = false;
    if (gameState.miningGrid && gameState.miningGrid.length === 9) {
        gameState.miningGrid.forEach((cell: any) => {
            if (cell.type === 'empty' && now >= cell.cooldownUntil) {
                const newContent = generateGridCellContent();
                cell.type = newContent.type;
                cell.icon = newContent.icon;
                cell.cooldownUntil = 0;
                needsUIRefresh = true;
            }
        });
    }
    if (needsUIRefresh) {
        updateMiningUI();
    }


    if (globalWeatherOverride) {
        if(state.weather !== globalWeatherOverride) {
            state.weather = globalWeatherOverride;
            showNotification(`관리자에 의해 날씨가 ${state.weather}(으)로 변경되었습니다!`, false);
            updateWeatherAlmanacUI();
        }
    } else {
        state.weatherCounter++;
        if (state.weatherCounter >= 120) { 
            state.weatherCounter = 0;
            let newWeather = '맑음';

            if (state.nextWeatherIsRainbow) {
                newWeather = '무지개';
                state.nextWeatherIsRainbow = false;
            } else if (state.nextWeatherIsCloudy) {
                newWeather = '구름';
                state.nextWeatherIsCloudy = false;
            } else {
                let baseProbSunny = 0.6;
                let baseProbRain = 0.3;

                if (state.hasWeatherTrophy) {
                     baseProbSunny += 0.015;
                     baseProbRain += 0.010;
                }
                const rand = Math.random();
                if (rand < baseProbSunny) {
                    newWeather = '맑음';
                } else if (rand < baseProbSunny + baseProbRain) {
                    newWeather = '비';
                    if (Math.random() < 0.1) { newWeather = '산성비'; }
                    state.nextWeatherIsCloudy = true;
                    if (newWeather === '비' && Math.random() < 0.1) { state.nextWeatherIsRainbow = true; }
                } else {
                    newWeather = '천둥';
                }
            }
            state.weather = newWeather;

            if (state.weather === '천둥' && Math.random() < 0.05) {
                state.isInternetOutage = true;
                state.isInternetOutageCooldown = Date.now() + 30000;
                showNotification('천둥 번개로 인해 인터넷 연결이 끊겼습니다!', true);
            }
            
            state.experiencedWeathers[state.weather] = true;
            checkTrophies();
            updateWeatherAlmanacUI();
        }
    }
    if (state.isInternetOutage && now > state.isInternetOutageCooldown) {
         state.isInternetOutage = false; 
         showNotification('인터넷 연결이 복구되었습니다.', false);
    }
    if (dom.internetOutage) dom.internetOutage.classList.toggle('hidden', !state.isInternetOutage);
    
    let baseProduction = 0;
    if(state.isCubePurchased) { baseProduction = 100; if(state.isPrismUpgraded) baseProduction = 400; else if(state.isEnergyUpgraded) baseProduction = 200; }

    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    const lunarBonus = (state.isLunarUpgraded && isNight) ? 100 : 0;
    let totalIncome = baseProduction + lunarBonus;
    
    if (state.exceptionalState.isActive) {
        if (Date.now() > state.exceptionalState.expiresAt) {
            state.exceptionalState.isActive = false;
        } else {
            totalIncome *= 2;
        }
    }
    state.userCash += totalIncome / (4 * (1 / currentGameSpeed));

    updateUI();
}

function handleMining() {
    const state = gameState;
    const tier = state.computerTier;
    if (tier > 0) {
        if (Math.random() < tier * 0.02) state.userCubes++;
        if (Math.random() < tier * 0.015) state.userLunar++;
        if (Math.random() < tier * 0.01) state.userEnergy++;
        if (Math.random() < tier * 0.005) state.userPrisms++;
    }
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

    const transaction = {
        timestamp: new Date(gameTime).toLocaleString('ko-KR', { hour12: false }),
        coin: coinUpper,
        type: type,
        amount: amount,
        price: prices[coinId]
    };
    state.transactionHistory.unshift(transaction);
    if (state.transactionHistory.length > 100) {
        state.transactionHistory.pop();
    }
    updateTransactionHistoryUI();

    updateUI(); 
    saveGameState();
}
function updateTransactionHistoryUI() {
    const list = dom.transactionHistoryList;
    if (!list) return;
    list.innerHTML = ''; 
    if (!gameState.transactionHistory || gameState.transactionHistory.length === 0) {
        list.innerHTML = `<p class="text-gray-400 text-center py-4">거래 기록이 없습니다.</p>`;
        return;
    }
    gameState.transactionHistory.forEach((tx: any) => {
        const el = document.createElement('div');
        const typeText = tx.type === 'buy' ? '매수' : '매도';
        const typeColor = tx.type === 'buy' ? 'text-green-400' : 'text-red-400';
        el.className = 'bg-gray-800 p-2 rounded-md grid grid-cols-6 text-sm items-center gap-2';
        el.innerHTML = `
            <span class="text-gray-400 col-span-2 text-xs">${tx.timestamp}</span>
            <span class="font-bold col-span-1">${tx.coin}</span>
            <span class="${typeColor} font-semibold col-span-1">${typeText}</span>
            <span class="text-right col-span-2">${tx.amount.toLocaleString()} @ ${tx.price.toLocaleString()}</span>
        `;
        list.appendChild(el);
    });
}
function handleBuy3DCube() { const state = gameState; if (state.userCash >= 1000000) { state.userCash -= 1000000; state.isCubePurchased = true; restoreUIState(); showNotification('패시브 수입원 활성화 완료!', false); updateUI(); saveGameState(); } else { showNotification('현금이 부족합니다.', true); } }
function handleComputerUpgrade() {
    const state = gameState;
    if (state.isInternetOutage) { showNotification('인터넷 연결이 끊겨 업그레이드할 수 없습니다.', true); return; }
    if (state.computerTier >= 5) return;

    const costs = [100000, 500000, 2500000, 5000000, 10000000];
    const requirements = [null, null, { copperIngot: 50 }, { ironIngot: 50 }, { goldIngot: 50 }];
    
    const cost = costs[state.computerTier];
    const requiredMats = requirements[state.computerTier];
    
    let hasMats = true;
    let missingMats = '';
    if (requiredMats) {
        for (const mat in requiredMats) {
            if (state[mat] < requiredMats[mat as keyof typeof requiredMats]) {
                hasMats = false;
                missingMats += `${INGOT_DATA[mat as keyof typeof INGOT_DATA]?.name || mat} `;
            }
        }
    }

    if (state.userCash >= cost && hasMats) {
        state.userCash -= cost;
        if(requiredMats) {
            for(const mat in requiredMats) {
                state[mat] -= requiredMats[mat as keyof typeof requiredMats];
            }
        }
        state.computerTier++;
        showNotification(`컴퓨터 업그레이드 완료! (Tier ${state.computerTier})`, false);
        updateComputerUI(); 
        updateMiningUI();
        saveGameState();
    } else { 
        if(state.userCash < cost) showNotification('현금이 부족합니다.', true);
        else showNotification(`재료가 부족합니다: ${missingMats}`, true);
    }
}
function handleUpgradeLunar() { const state = gameState; if (state.isInternetOutage) { showNotification('인터넷 연결이 끊겨 강화할 수 없습니다.', true); return; } if (state.userLunar >= 200) { state.userLunar -= 200; state.isLunarUpgraded = true; restoreUIState(); showNotification('LUNAR 강화 완료!', false); saveGameState(); } else { showNotification('LUNAR가 부족합니다.', true); } }
function handleUpgradeEnergy() { const state = gameState; if (state.isInternetOutage) { showNotification('인터넷 연결이 끊겨 강화할 수 없습니다.', true); return; } if (state.userEnergy >= 100) { state.userEnergy -= 100; state.isEnergyUpgraded = true; restoreUIState(); showNotification('ENERGY 강화 완료!', false); saveGameState(); } else { showNotification('ENERGY가 부족합니다.', true); } }
function handleUpgradePrism() { const state = gameState; if (state.isInternetOutage) { showNotification('인터넷 연결이 끊겨 강화할 수 없습니다.', true); return; } if (state.userPrisms >= 100) { state.userPrisms -= 100; state.isPrismUpgraded = true; restoreUIState(); showNotification('PRISM 강화 완료!', false); saveGameState(); } else { showNotification('PRISM이 부족합니다.', true); } }
function handleSleep() {
    const state = gameState;
    if (!state.shopItems.bed) { showNotification('침대가 없어서 잘 수 없습니다. 상점에서 구매하세요.', true); return; }
    const currentHour = gameTime.getHours();
    if (state.isSleeping || (currentHour < 20 && currentHour >= 8)) { showNotification('수면은 20시 이후에만 가능합니다.', true); return; }
    state.isSleeping = true;
    showNotification('수면을 시작합니다...', false);
    const sleepButton = document.getElementById('sleep-button-shop') as HTMLButtonElement;
    if (sleepButton) { sleepButton.textContent = '수면 중...'; sleepButton.disabled = true; sleepButton.classList.add('btn-disabled'); }
    
    setTimeout(() => {
        const hoursToSleep = (32 - gameTime.getHours()) % 24;
        const minutesToSleep = hoursToSleep * 60;
        const secondsSlept = minutesToSleep * 4; 
        
        let baseProduction = 0;
        if(state.isCubePurchased) { baseProduction = 100; if(state.isPrismUpgraded) baseProduction = 400; else if(state.isEnergyUpgraded) baseProduction = 200; }
        const lunarBonus = (state.isLunarUpgraded) ? 100 : 0;
        let totalIncomePerSecond = (baseProduction + lunarBonus) / 4;

        const vpnMultiplier = 0.01;
        state.userCash += totalIncomePerSecond * secondsSlept * vpnMultiplier;
        
        if (state.computerTier > 0) {
            const tier = state.computerTier;
            const sleepRealMinutes = (3000 / 1000) / 60;
            state.userCubes += Math.floor(sleepRealMinutes * tier * 0.02);
            state.userLunar += Math.floor(sleepRealMinutes * tier * 0.015);
            state.userEnergy += Math.floor(sleepRealMinutes * tier * 0.01);
            state.userPrisms += Math.floor(sleepRealMinutes * tier * 0.005);
        }

        state.isSleeping = false;
        gameTime.setHours(8, 0, 0, 0);
        showNotification('좋은 아침입니다!', false);
        if (sleepButton) { sleepButton.textContent = '수면'; sleepButton.disabled = false; sleepButton.classList.remove('btn-disabled'); }
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

    updateCubeAppearance();
    updateWeatherAlmanacUI();
    updateMiningUI();
    updateUI();
}

// =======================================================
// 채굴 관련 로직
// =======================================================
function generateGridCellContent() {
    const pickaxe = PICKAXE_DATA[gameState.pickaxeTier];
    const oreRoll = Math.random();
    let cumulativeChance = 0;

    for (const oreId in ORE_DATA) {
        const ore = ORE_DATA[oreId];
        cumulativeChance += ore.baseChance * pickaxe.oreChanceMultiplier;
        if (oreRoll < cumulativeChance) {
            return { type: oreId, icon: ore.icon };
        }
    }
    return { type: 'stone', icon: '🪨' }; // Default to stone
}

function initMiningGrid() {
    if (!gameState.miningGrid || gameState.miningGrid.length !== 9) {
        gameState.miningGrid = [];
        for (let i = 0; i < 9; i++) {
            const content = generateGridCellContent();
            gameState.miningGrid.push({
                type: content.type,
                icon: content.icon,
                cooldownUntil: 0 // Ready immediately
            });
        }
    }
}

function updateMiningUI() {
    if (!dom.miningInventory || !dom.smeltingOptions) return;

    // Mining Grid Update
    const gridContainer = dom.miningGridContainer;
    if (gridContainer) {
        gridContainer.innerHTML = '';
        if (gameState.miningGrid && gameState.miningGrid.length === 9) {
            gameState.miningGrid.forEach((cell: any, index: number) => {
                const cellEl = document.createElement('button');
                const now = Date.now();
                const isOnCooldown = now < cell.cooldownUntil;
                
                cellEl.className = `w-full h-20 flex flex-col items-center justify-center rounded-lg text-3xl transition-all duration-200`;
                
                if (isOnCooldown) {
                    cellEl.innerHTML = `<span class="text-2xl animate-spin">⏳</span>`;
                    cellEl.className += ' bg-gray-900 cursor-not-allowed';
                    cellEl.disabled = true;
                } else {
                    cellEl.innerHTML = `<span>${cell.icon}</span>`;
                    cellEl.className += ' bg-stone-600 hover:bg-stone-500 transform hover:scale-105';
                    cellEl.disabled = false;
                    cellEl.addEventListener('click', () => handleMineCell(index));
                }
                gridContainer.appendChild(cellEl);
            });
        }
    }

    // 인벤토리 업데이트
    const inventoryContainer = dom.miningInventory;
    inventoryContainer.innerHTML = '';
    const itemsToShow: {[key: string]: {name: string, icon: string}} = {
        stone: { name: '돌', icon: '🪨' },
        ...ORE_DATA,
        ...INGOT_DATA
    };
    for (const key in itemsToShow) {
        if (gameState[key] > 0) {
            const item = itemsToShow[key];
            const el = document.createElement('div');
            el.className = 'bg-gray-800 p-2 rounded-lg flex items-center justify-between';
            el.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-2xl">${item.icon}</span>
                    <p class="font-semibold text-sm">${item.name}</p>
                </div>
                <span class="font-bold text-lg">${gameState[key].toLocaleString()}</span>
            `;
            inventoryContainer.appendChild(el);
        }
    }
    if (inventoryContainer.innerHTML === '') {
        inventoryContainer.innerHTML = `<p class="text-gray-400 text-sm text-center p-4">채굴된 재료가 없습니다.</p>`;
    }
    
    // 제련 옵션 업데이트
    const smeltingContainer = dom.smeltingOptions;
    smeltingContainer.innerHTML = '';
    for (const ingotId in INGOT_DATA) {
        const ingot = INGOT_DATA[ingotId];
        const costs = ingot.smeltCost;
        let canSmelt = true;
        let costString = '';
        for (const oreId in costs) {
            const cost = costs[oreId];
            if (gameState[oreId] < cost) canSmelt = false;
            costString += `${itemsToShow[oreId].name} ${cost} `;
        }
        
        const el = document.createElement('div');
        el.className = 'bg-gray-600 p-3 rounded-lg';
        el.innerHTML = `
            <h5 class="font-bold">${ingot.name} 제련</h5>
            <p class="text-xs text-gray-300 mb-2">필요: ${costString}</p>
            <button id="smelt-${ingotId}" class="w-full text-sm font-bold py-1 px-3 rounded ${canSmelt ? 'bg-yellow-600 hover:bg-yellow-700' : 'btn-disabled'}" ${!canSmelt ? 'disabled' : ''}>제련</button>
        `;
        smeltingContainer.appendChild(el);
        if (canSmelt) {
            document.getElementById(`smelt-${ingotId}`)?.addEventListener('click', () => handleSmelt(ingotId));
        }
    }
}

function handleMineCell(index: number) {
    const state = gameState;
    const cell = state.miningGrid[index];
    if (!cell) return;

    const pickaxe = PICKAXE_DATA[state.pickaxeTier];
    const now = Date.now();

    if (now - state.lastMineTime < pickaxe.cooldown) {
        const timeLeft = (pickaxe.cooldown - (now - state.lastMineTime)) / 1000;
        showNotification(`곡괭이 쿨타임: ${timeLeft.toFixed(1)}초`, true);
        return;
    }
    
    if (now < cell.cooldownUntil) {
        return; 
    }

    state.lastMineTime = now;
    
    const resourceType = cell.type;
    state[resourceType] = (state[resourceType] || 0) + 1;
    showNotification(`${ORE_DATA[resourceType]?.name || '돌'} 1개 획득!`, false);
    
    const CELL_RESPAWN_TIME = 5000; // 5 seconds
    cell.type = 'empty';
    cell.icon = '';
    cell.cooldownUntil = now + CELL_RESPAWN_TIME;
    
    updateMiningUI();
    updateUI();
}

function handleSmelt(ingotId: string) {
    const state = gameState;
    const ingot = INGOT_DATA[ingotId];
    const costs = ingot.smeltCost;

    let canSmelt = true;
    for (const oreId in costs) {
        if (state[oreId] < costs[oreId]) {
            canSmelt = false;
            break;
        }
    }

    if (canSmelt) {
        for (const oreId in costs) {
            state[oreId] -= costs[oreId];
        }
        state.smeltingQueue.push({ ingotId, startTime: Date.now() });
        showNotification(`${ingot.name} 제련을 시작합니다.`, false);
        updateMiningUI();
        saveGameState();
    } else {
        showNotification('재료가 부족합니다.', true);
    }
}

function processSmeltingQueue() {
    const state = gameState;
    const now = Date.now();
    const smeltingTime = state.shopItems.furnace ? 2500 : 5000;

    const finishedSmelts: any[] = [];
    state.smeltingQueue = state.smeltingQueue.filter((item: any) => {
        if (now - item.startTime >= smeltingTime) {
            finishedSmelts.push(item);
            return false;
        }
        return true;
    });

    if (finishedSmelts.length > 0) {
        finishedSmelts.forEach(item => {
            state[item.ingotId]++;
            showNotification(`${INGOT_DATA[item.ingotId].name} 제련 완료!`, false);
        });
        updateMiningUI();
    }
    
    // Update queue display
    const queueContainer = dom.smeltingQueueDisplay;
    if (!queueContainer) return;
    queueContainer.innerHTML = '';
    if (state.smeltingQueue.length === 0) {
         queueContainer.innerHTML = `<p class="text-gray-400 text-sm text-center p-2">대기 중인 제련 작업이 없습니다.</p>`;
    } else {
        state.smeltingQueue.forEach((item: any) => {
            const el = document.createElement('div');
            const ingot = INGOT_DATA[item.ingotId];
            const progress = Math.min(100, ((now - item.startTime) / smeltingTime) * 100);
            el.className = 'bg-gray-800 p-2 rounded-lg';
            el.innerHTML = `
                <div class="flex justify-between items-center text-sm mb-1">
                    <p>${ingot.icon} ${ingot.name}</p>
                    <p>${Math.floor(progress)}%</p>
                </div>
                <div class="w-full bg-gray-600 rounded-full h-1.5"><div class="bg-yellow-500 h-1.5 rounded-full" style="width: ${progress}%"></div></div>
            `;
            queueContainer.appendChild(el);
        });
    }
}


// =======================================================
// 공용 로직
// =======================================================
async function resetUserData() {
    if (auth.currentUser) {
        try {
            await db.ref('users/' + auth.currentUser.uid).remove();
            stopGame();
            showNotification('데이터가 초기화되었습니다. 페이지를 새로고침합니다.', false);
            setTimeout(() => window.location.reload(), 2000);
        } catch(error) {
            console.error("Data reset failed:", error);
            showNotification('데이터 초기화에 실패했습니다.', true);
        }
    }
}

async function handleCodeSubmit() {
    const input = document.getElementById('code-input') as HTMLInputElement;
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    if (code === 'RESET') {
        if (confirm('정말로 모든 게임 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            if (confirm('경고: 두 번째 확인입니다. 모든 진행 상황이 영구적으로 삭제됩니다. 계속하시겠습니까?')) {
                resetUserData();
            }
        }
        input.value = '';
        return;
    }
    
    if (code === 'DEV.MOD') {
        document.getElementById('dev-panel')?.classList.remove('hidden');
        input.value = '';
        return;
    }

    if (gameState.usedCodes.includes(code)) {
        showNotification('이미 사용된 코드입니다.', true);
        return;
    }

    try {
        const snapshot = await db.ref('promoCodes/' + code).get();
        if (snapshot.exists()) {
            const reward = snapshot.val();
            const rewardType = reward.type;
            const rewardAmount = Number(reward.amount);

            if (gameState.hasOwnProperty(rewardType) && !isNaN(rewardAmount)) {
                gameState[rewardType] += rewardAmount;
                gameState.usedCodes.push(code);

                const rewardNameMap: { [key: string]: string } = {
                    userCash: 'KRW', userCubes: 'CUBE',
                    userLunar: 'LUNAR', userEnergy: 'ENERGY', userPrisms: 'PRISM'
                };
                const rewardName = rewardNameMap[rewardType] || '아이템';
                showNotification(`코드 보상: ${rewardAmount.toLocaleString()} ${rewardName}을(를) 획득했습니다!`, false);
                
                input.value = '';
                updateUI();
                saveGameState();
            } else {
                showNotification('코드 보상 정보가 잘못되었습니다.', true);
            }
        } else {
            showNotification('유효하지 않은 코드입니다.', true);
        }
    } catch (error) {
        console.error("Error redeeming code:", error);
        showNotification('코드 확인 중 오류가 발생했습니다.', true);
    }
}

function migrateAndMergeState(loadedData: any): any {
    const initialState = getInitialGameState();
    const migratedState: any = {};

    for (const key in initialState) {
        if (Object.prototype.hasOwnProperty.call(initialState, key)) {
            const initialValue = initialState[key as keyof typeof initialState];
            const loadedValue = loadedData[key];

            if (loadedValue !== undefined) {
                if (
                    typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue) &&
                    typeof loadedValue === 'object' && loadedValue !== null && !Array.isArray(loadedValue)
                ) {
                    migratedState[key] = { ...initialValue, ...loadedValue };
                } else {
                    migratedState[key] = loadedValue;
                }
            } else {
                migratedState[key] = initialValue;
            }
        }
    }
    
    return migratedState;
}

async function saveGameState() {
    if (auth.currentUser) {
        try {
            gameState.lastOnlineTimestamp = Date.now();
            await db.ref('users/' + auth.currentUser.uid).set(gameState);
        } catch (error) {
            console.error("Firebase에 게임 상태 저장 실패:", error);
            showNotification("게임 저장에 실패했습니다. 인터넷 연결을 확인하세요.", true);
        }
    }
}

async function loadGameState() {
    if (!auth.currentUser) return false;

    try {
        const snapshot = await db.ref('users/' + auth.currentUser.uid).get();

        if (snapshot.exists()) {
            const loadedData = snapshot.val();
            
            gameState = migrateAndMergeState(loadedData);
            
            const now = Date.now();
            if (gameState.lastOnlineTimestamp) {
                const offlineMillis = now - gameState.lastOnlineTimestamp;
                const offlineSeconds = offlineMillis / 1000;
                if (offlineSeconds > 5) {
                    let offlineCash = 0;
                    if(gameState.isCubePurchased) {
                        let avgBaseProd = 100;
                        if (gameState.isPrismUpgraded) avgBaseProd = 400;
                        else if (gameState.isEnergyUpgraded) avgBaseProd = 200;

                        const avgLunarBonus = gameState.isLunarUpgraded ? (100 * (14 / 24)) : 0;
                        const vpnMultiplier = 0.01;
                        offlineCash = (offlineSeconds / 4) * (avgBaseProd + avgLunarBonus) * vpnMultiplier;
                    }
                    
                    gameState.userCash += offlineCash;
                    
                    if(offlineCash > 0) {
                        setTimeout(() => showNotification(`${Math.floor(offlineSeconds / 60)}분간의 오프라인 보상으로 ${Math.floor(offlineCash).toLocaleString()} KRW을(를) 획득했습니다!`, false), 1000);
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
        console.error("Firebase에서 게임 상태 불러오기 실패:", error);
        gameState = getInitialGameState();
        return false;
    }
}

// =======================================================
// 채팅 로직
// =======================================================
function handleSendMessage() {
    if (!dom.chatInput || !userNickname) return;
    const text = dom.chatInput.value.trim();
    if (text === '') return;

    const message = {
        nickname: userNickname,
        text: text,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    db.ref('chatMessages').push(message);
    dom.chatInput.value = '';
}

function appendChatMessage(message: { nickname: string, text: string }) {
    if (!dom.chatMessages) return;

    const messageEl = document.createElement('div');
    const sanitizedText = message.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    messageEl.innerHTML = `<p><strong class="font-semibold ${message.nickname === userNickname ? 'text-yellow-300' : 'text-blue-300'}">${message.nickname}</strong>: ${sanitizedText}</p>`;
    
    dom.chatMessages.appendChild(messageEl);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}


// =======================================================
// 인증 로직
// =======================================================
async function handleLogin(e: Event) {
    e.preventDefault();
    const email = (document.getElementById('login-email-input') as HTMLInputElement).value;
    const password = (document.getElementById('login-password-input') as HTMLInputElement).value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
        // onAuthStateChanged will handle the rest
    } catch (error: any) {
        let message = '로그인에 실패했습니다.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = '이메일 또는 비밀번호가 올바르지 않습니다.';
        } else if (error.code === 'auth/invalid-email') {
            message = '유효하지 않은 이메일 형식입니다.';
        } else if (error.code === 'auth/too-many-requests') {
            message = '너무 많은 로그인 시도를 했습니다. 잠시 후 다시 시도해주세요.';
        }
        showNotification(message, true);
        console.error("Login failed:", error);
    }
}

async function handleRegister(e: Event) {
    e.preventDefault();
    const email = (document.getElementById('register-email-input') as HTMLInputElement).value;
    const password = (document.getElementById('register-password-input') as HTMLInputElement).value;
    
    if (password.length < 6) {
        showNotification('비밀번호는 6자 이상이어야 합니다.', true);
        return;
    }

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        // onAuthStateChanged will handle the rest
    } catch (error: any) {
        let message = '회원가입에 실패했습니다.';
        if (error.code === 'auth/email-already-in-use') {
            message = '이미 사용 중인 이메일입니다.';
        } else if (error.code === 'auth/weak-password') {
            message = '비밀번호는 6자 이상이어야 합니다.';
        } else if (error.code === 'auth/invalid-email') {
            message = '유효하지 않은 이메일 형식입니다.';
        }
        showNotification(message, true);
        console.error("Registration failed:", error);
    }
}

function handleLogout() {
    auth.signOut();
}

async function onLoginSuccess(user: any) {
    await loadGameState();
    
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.classList.remove('hidden');
    
    if (user && user.email) {
        userNickname = user.email.split('@')[0];
    }
    
    initMiningGrid();
    initGame();
    startGame();

    db.ref('globalState/announcement').on('value', (snapshot) => {
        const announcement = snapshot.val();
        const banner = document.getElementById('global-announcement');
        const bannerText = document.getElementById('announcement-text');
        const bannerTimer = document.getElementById('announcement-timer');
        const closeBtn = document.getElementById('close-announcement');

        if (announcementTimeout) clearTimeout(announcementTimeout);
        if (announcementInterval) clearInterval(announcementInterval);

        if (banner && bannerText && bannerTimer && closeBtn && announcement && announcement.text) {
            const duration = announcement.duration || 15;
            let timeLeft = duration;

            bannerText.textContent = `[공지] ${announcement.text}`;
            banner.classList.remove('hidden');

            const hideBanner = () => {
                banner.classList.add('hidden');
                if (announcementInterval) clearInterval(announcementInterval);
                if (announcementTimeout) clearTimeout(announcementTimeout);
            };
            
            closeBtn.addEventListener('click', hideBanner, { once: true });

            bannerTimer.textContent = `(${timeLeft}초 후 사라짐)`;
            announcementInterval = setInterval(() => {
                timeLeft--;
                if(bannerTimer) bannerTimer.textContent = `(${timeLeft}초 후 사라짐)`;
                if (timeLeft <= 0) {
                    if (announcementInterval) clearInterval(announcementInterval);
                }
            }, 1000);

            announcementTimeout = setTimeout(hideBanner, duration * 1000);

        } else if (banner) {
            banner.classList.add('hidden');
        }
    });

    db.ref('globalState/weather').on('value', (snapshot) => {
        globalWeatherOverride = snapshot.val();
    });

    db.ref('globalState/priceOverrides').on('value', (snapshot) => {
        globalPriceOverrides = snapshot.val();
    });
    
    db.ref('globalState/gameSpeed').on('value', (snapshot) => {
        const speed = snapshot.val() || 1;
        currentGameSpeed = Math.max(1, Math.min(10, speed));
        if(gameLoopInterval) {
            restartGameLoop();
        }
    });
    
    if(dom.chatMessages) dom.chatMessages.innerHTML = '';
    db.ref('chatMessages').limitToLast(50).on('child_added', (snapshot) => {
        const message = snapshot.val();
        appendChatMessage(message);
    });

    db.ref('globalState/chatCleared').on('value', (snapshot) => {
        if(snapshot.exists() && dom.chatMessages) {
             dom.chatMessages.innerHTML = '';
        }
    });

    if (window.autosaveInterval) clearInterval(window.autosaveInterval);
    window.autosaveInterval = setInterval(saveGameState, 30000);
}


// =======================================================
// 앱 초기화
// =======================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Auth UI elements
    const authContainer = document.getElementById('auth-container');
    const mainContent = document.getElementById('main-content');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');

    loginForm?.addEventListener('submit', handleLogin);
    registerForm?.addEventListener('submit', handleRegister);

    showRegisterLink?.addEventListener('click', (e) => {
        e.preventDefault();
        loginView?.classList.add('hidden');
        registerView?.classList.remove('hidden');
    });

    showLoginLink?.addEventListener('click', (e) => {
        e.preventDefault();
        registerView?.classList.add('hidden');
        loginView?.classList.remove('hidden');
    });

    const updateBanner = document.getElementById('update-banner');
    const countdownTimer = document.getElementById('countdown-timer');

    const v2UpdateTime = new Date('2025-08-01T00:00:00+09:00').getTime();
    const countdownDuration = 5 * 60 * 60 * 1000;

    const updateCountdown = () => {
        const now = new Date().getTime();
        const timeLeft = v2UpdateTime - now;

        if (timeLeft > 0 && timeLeft <= countdownDuration) {
            if(updateBanner) updateBanner.classList.remove('hidden');
            
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            if(countdownTimer) countdownTimer.innerHTML = `${hours}시간 ${minutes}분 ${seconds}초`;
        } else {
             if(updateBanner) updateBanner.classList.add('hidden');
        }
    };
    
    setInterval(updateCountdown, 1000);
    updateCountdown();

    ['assets', 'trade', 'charts', 'history', 'computer', 'trophy', 'almanac', 'shop', 'mining', 'code'].forEach(s => {
        const toggle = document.getElementById(`toggle-${s}`);
        if (toggle) {
            toggle.addEventListener('click', () => {
                document.getElementById(`content-${s}`)?.classList.toggle('hidden');
                document.getElementById(`toggle-${s}-icon`)?.classList.toggle('rotate-180');
            });
        }
    });

    const devPanel = document.getElementById('dev-panel');
    const weatherSelect = document.getElementById('dev-weather-select') as HTMLSelectElement;
    if (weatherSelect) {
        for (const weatherKey in WEATHER_DATA) {
            const option = document.createElement('option');
            option.value = weatherKey;
            option.textContent = `${WEATHER_DATA[weatherKey as keyof typeof WEATHER_DATA].icon} ${weatherKey}`;
            weatherSelect.appendChild(option);
        }
    }
    
    document.getElementById('close-dev-panel')?.addEventListener('click', () => devPanel?.classList.add('hidden'));
    document.getElementById('dev-post-announcement-btn')?.addEventListener('click', () => {
        const text = (document.getElementById('dev-announcement-text') as HTMLInputElement).value;
        const duration = Number((document.getElementById('dev-announcement-duration') as HTMLInputElement).value);
        db.ref('globalState/announcement').set({ text, duration, timestamp: Date.now() });
    });
    document.getElementById('dev-clear-announcement-btn')?.addEventListener('click', () => { db.ref('globalState/announcement').set(null) });
    document.getElementById('dev-set-weather-btn')?.addEventListener('click', () => {
        const weather = (document.getElementById('dev-weather-select') as HTMLSelectElement).value;
        db.ref('globalState/weather').set(weather);
    });
    document.getElementById('dev-clear-weather-btn')?.addEventListener('click', () => { db.ref('globalState/weather').set(null) });
    document.getElementById('dev-set-prices-btn')?.addEventListener('click', () => {
        const prices:any = {};
        const cubePrice = Number((document.getElementById('dev-price-cube') as HTMLInputElement).value);
        const lunarPrice = Number((document.getElementById('dev-price-lunar') as HTMLInputElement).value);
        const energyPrice = Number((document.getElementById('dev-price-energy') as HTMLInputElement).value);
        const prismPrice = Number((document.getElementById('dev-price-prism') as HTMLInputElement).value);
        if(cubePrice > 0) prices.cube = cubePrice;
        if(lunarPrice > 0) prices.lunar = lunarPrice;
        if(energyPrice > 0) prices.energy = energyPrice;
        if(prismPrice > 0) prices.prism = prismPrice;
        db.ref('globalState/priceOverrides').set(prices);
    });
    document.getElementById('dev-clear-prices-btn')?.addEventListener('click', () => { db.ref('globalState/priceOverrides').set(null) });
    document.getElementById('dev-set-speed-btn')?.addEventListener('click', () => {
        const speed = Number((document.getElementById('dev-speed-input') as HTMLInputElement).value);
        db.ref('globalState/gameSpeed').set(speed);
    });
    document.getElementById('dev-clear-chat-btn')?.addEventListener('click', () => {
        if(confirm('정말로 모든 채팅 기록을 삭제하시겠습니까?')) {
            db.ref('chatMessages').remove();
            db.ref('globalState/chatCleared').set(firebase.database.ServerValue.TIMESTAMP);
        }
    });
    document.getElementById('dev-create-code-btn')?.addEventListener('click', () => {
        const code = (document.getElementById('dev-code-id') as HTMLInputElement).value.trim().toUpperCase();
        const type = (document.getElementById('dev-code-reward-type') as HTMLSelectElement).value;
        const amount = Number((document.getElementById('dev-code-reward-amount') as HTMLInputElement).value);
        if(code && type && amount > 0) {
            db.ref('promoCodes/' + code).set({ type, amount });
            alert(`코드 "${code}"가 생성되었습니다.`);
        } else {
            alert('모든 필드를 올바르게 입력해주세요.');
        }
    });
    document.getElementById('dev-reset-user-btn')?.addEventListener('click', () => {
        const uid = (document.getElementById('dev-reset-uid') as HTMLInputElement).value.trim();
        if(uid && confirm(`정말로 UID: ${uid} 유저의 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            db.ref('users/' + uid).remove()
            .then(() => alert(`${uid} 유저의 데이터가 삭제되었습니다.`))
            .catch((e) => alert(`삭제 실패: ${e.message}`));
        }
    });

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            if (authContainer) authContainer.classList.add('hidden');
            if (mainContent) mainContent.classList.remove('hidden');
            await onLoginSuccess(user);
        } else {
            if (authContainer) authContainer.classList.remove('hidden');
            if (mainContent) mainContent.classList.add('hidden');
            stopGame();
            gameState = getInitialGameState();
        }
    });
});

export {};