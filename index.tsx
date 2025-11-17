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
  measurementId: "G-Q40RNTCZW5"
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

const CROP_DATA: { [key: string]: { name: string, krName: string, icon: string, cost: number, sellPrice: number, growthTime: number } } = {
    rice: { name: 'Rice Seed', krName: '벼', icon: '🌾', cost: 400, sellPrice: 1, growthTime: 10 * 1000 },
    carrot: { name: 'Carrot Seed', krName: '당근', icon: '🥕', cost: 1000, sellPrice: 3, growthTime: 20 * 1000 },
    tomato: { name: 'Tomato Seed', krName: '토마토', icon: '🍅', cost: 2000, sellPrice: 6, growthTime: 30 * 1000 },
    pumpkin: { name: 'Pumpkin Seed', krName: '호박', icon: '🎃', cost: 4000, sellPrice: 15, growthTime: 60 * 1000 },
    watermelon: { name: 'Watermelon Seed', krName: '수박', icon: '🍉', cost: 10000, sellPrice: 40, growthTime: 120 * 1000 },
    grape: { name: 'Grape Seed', krName: '포도', icon: '🍇', cost: 20000, sellPrice: 100, growthTime: 180 * 1000 },
    strawberry: { name: 'Strawberry Seed', krName: '딸기', icon: '🍓', cost: 30000, sellPrice: 150, growthTime: 360 * 1000 },
    banana: { name: 'Banana Seed', krName: '바나나', icon: '🍌', cost: 40000, sellPrice: 200, growthTime: 480 * 1000 },
    apple: { name: 'Apple Seed', krName: '사과', icon: '🍎', cost: 60000, sellPrice: 300, growthTime: 720 * 1000 },
    lemon: { name: 'Lemon Seed', krName: '레몬', icon: '🍋', cost: 80000, sellPrice: 500, growthTime: 1200 * 1000 },
};

// FIX: Add an explicit type for FARM_ITEM_DATA to make the 'requires' property optional, resolving TypeScript errors.
const FARM_ITEM_DATA: { [key: string]: { name: string; krName: string; icon: string; desc: string; cost: number; quantity: number; requires?: string; } } = {
    wateringCan: { name: '물뿌리개', krName: '물뿌리개', icon: '💧', desc: '6시간(게임) 동안 모든 작물 성장 속도 1.5배 증가', cost: 10000, quantity: 5 },
    artificialFertilizer: { name: '인공 비료', krName: '인공 비료', icon: '🧪', desc: '12시간(게임) 동안 성장 속도 2배, 판매가 1.5배 감소', cost: 20000, quantity: 3 },
    sprinkler: { name: '스프링클러', krName: '스프링클러', icon: '🚿', desc: '농장 전체 작물의 성장 속도를 영구적으로 1.5배 증가시킵니다.', cost: 100000, quantity: 1 },
    acidFertilizer: { name: '산성 비료', krName: '산성 비료', icon: '☢️', desc: '산성비일 때만 사용 가능. 6시간(게임) 동안 성장 속도 5배, 먹이 사용 불가, 판매가 2 감소.', cost: 20000, quantity: 1, requires: '산성비' },
};

const VPN_MULTIPLIERS = [0.01, 0.012, 0.014, 0.016, 0.018, 0.02];
const getVpnMultiplier = (level: number) => VPN_MULTIPLIERS[level] || VPN_MULTIPLIERS[0];

const SKILL_DATA: { [key: string]: { name: string, maxTier: number, costs: number[], description: (level: number) => string, category: 'cube' | 'farm' } } = {
    cube_efficiency: { name: '효율성 증가', maxTier: 5, costs: [20, 100, 400, 1200, 2400], description: level => `3D 큐브 생산량 +${(level + 1) * 10}%`, category: 'cube' },
    cube_exceptional: { name: '특출남 확률 증가', maxTier: 5, costs: [20, 80, 240, 720, 2160], description: level => `'특출남' 상태 발동 확률 계산 시 배고픔 나누기 수치 +${level + 1}`, category: 'cube' },
    cube_vpn: { name: 'VPN', maxTier: 5, costs: [100, 1000, 5000, 15000, 30000], description: level => `오프라인(AFK) 수익 배율을 ${(getVpnMultiplier(level) * 100).toFixed(1)}%로 적용`, category: 'cube' },
    farm_fertilizer: { name: '친환경 비료', maxTier: 5, costs: [10, 30, 90, 270, 810], description: level => `작물 성장 시간 -${(level + 1) * 5}%`, category: 'farm' },
    farm_lucky_harvest: { name: '행운 수확', maxTier: 5, costs: [5, 25, 125, 625, 3125], description: level => `수확 시 +${(level + 1) * 5}% 확률로 작물 2개 획득`, category: 'farm' },
    farm_expand: { name: '토지 늘리기', maxTier: 2, costs: [1000, 5000], description: level => `농장 크기를 ${3 + level + 1}x${3 + level + 1}으로 확장`, category: 'farm' },
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
let selectedSeed: string | null = null;

// --- 3D 렌더링 관련 ---
let scene: any, camera: any, renderer: any, cube: any;
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
    farmCoin: 0,
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
    hasWeatherTrophy: false,
    transactionHistory: [],
    farmPlots: Array(9).fill(null),
    inventory: {
        wateringCan: 0,
        artificialFertilizer: 0,
        acidFertilizer: 0,
    },
    farmBuffs: {},
    hasSprinkler: false,
    seedInventory: {},
    skills: {
        cube_efficiency: 0, cube_exceptional: 0, cube_vpn: 0,
        farm_fertilizer: 0, farm_lucky_harvest: 0, farm_expand: 0,
    },
    exceptionalState: { isActive: false, expiresAt: 0 },
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

    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
        color: 0x60a5fa,
        metalness: 0.6,
        roughness: 0.4,
        emissive: 0x102040,
    });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    window.addEventListener('resize', () => {
        if (!container.clientWidth || !container.clientHeight || !renderer) return;
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    }, false);
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
        userCash: document.getElementById('user-cash'), userCubes: document.getElementById('user-cubes'), userLunar: document.getElementById('user-lunar'), userEnergy: document.getElementById('user-energy'), userPrisms: document.getElementById('user-prisms'), userFarmCoin: document.getElementById('user-farm-coin'),
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
        shopSection: document.getElementById('shop-section'), shopItems: document.getElementById('shop-items'), farmShopItems: document.getElementById('farm-shop-items'),
        codeSubmitButton: document.getElementById('code-submit-button'), codeInput: document.getElementById('code-input'),
        upgradeLunarSection: document.getElementById('upgrade-lunar-section'), upgradeLunarButton: document.getElementById('upgrade-lunar-button'),
        upgradeEnergySection: document.getElementById('upgrade-energy-section'), upgradeEnergyButton: document.getElementById('upgrade-energy-button'),
        upgradePrismSection: document.getElementById('upgrade-prism-section'), upgradePrismButton: document.getElementById('upgrade-prism-button'),
        weatherAlmanacSection: document.getElementById('weather-almanac-section'), weatherAlmanacContent: document.getElementById('weather-almanac-content'),
        incomeSourceUpgrades: document.getElementById('income-source-upgrades'),
        trophyList: document.getElementById('trophy-list'),
        transactionHistoryList: document.getElementById('transaction-history-list'),
        farmPlotSection: document.getElementById('farm-plot-section'), seedShopContainer: document.getElementById('seed-shop-container'), inventoryContainer: document.getElementById('inventory-container'),
        skillsCubeContainer: document.getElementById('skills-cube-container'), skillsFarmContainer: document.getElementById('skills-farm-container'),
    };
    
    if (dom.buyCubeButton) dom.buyCubeButton.addEventListener('click', handleBuy3DCube);
    if (dom.computerUpgradeButton) dom.computerUpgradeButton.addEventListener('click', handleComputerUpgrade);
    if (dom.codeSubmitButton) dom.codeSubmitButton.addEventListener('click', handleCodeSubmit);
    if (dom.upgradeLunarButton) dom.upgradeLunarButton.addEventListener('click', handleUpgradeLunar);
    if (dom.upgradeEnergyButton) dom.upgradeEnergyButton.addEventListener('click', handleUpgradeEnergy);
    if (dom.upgradePrismButton) dom.upgradePrismButton.addEventListener('click', handleUpgradePrism);
    ['cube', 'lunar', 'energy', 'prism'].forEach(c => dom[`chartTab${c.charAt(0).toUpperCase() + c.slice(1)}`]?.addEventListener('click', () => switchChart(c)));
    
    populateTradeUI();
    populateShopItems();
    populateFarmShop();
    initCharts();
    init3D();
    updateFarmUI();
    updateSkillsUI();
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
    gameLoopInterval = setInterval(gameLoop, 250);
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
    dom.userFarmCoin.textContent = Math.floor(state.farmCoin).toLocaleString('ko-KR');
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
    // 스킬 효과 적용
    baseProduction *= (1 + state.skills.cube_efficiency * 0.1);
    
    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    const lunarBonus = (state.isLunarUpgraded && isNight) ? 100 : 0;
    let totalIncome = baseProduction + lunarBonus;

    // 특출남 상태 효과 적용
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
        { name: '컴퓨터 없음', cost: 250000, next: 'Tier 1 구매' },
        { name: 'Tier 1 컴퓨터', cost: 1000000, next: 'Tier 2 업그레이드' },
        { name: 'Tier 2 컴퓨터', cost: 2500000, next: 'Tier 3 업그레이드' },
        { name: 'Tier 3 컴퓨터', cost: 5000000, next: 'Tier 4 업그레이드' },
        { name: 'Tier 4 컴퓨터', cost: 10000000, next: 'Tier 5 업그레이드' },
        { name: 'Tier 5 컴퓨터', cost: 0, next: '최고 티어' }
    ];
    const miningRates = tier > 0 ? `<br>채굴 확률 (분당):<br>CUBE: ${tier*2}%, LUNAR: ${tier*1.5}%<br>ENERGY: ${tier*1}%, PRISM: ${tier*0.5}%` : '';
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
        el.className = 'bg-gray-600 p-4 rounded-lg flex flex-col justify-between';
        
        let buttonHtml: string;
        const isBedAndOwned = item.id === 'bed' && gameState.shopItems.bed;
        const isOtherAndOwned = item.id !== 'bed' && gameState.shopItems[item.id];

        if (isBedAndOwned) {
            buttonHtml = `<button id="sleep-button-shop" class="w-full bg-indigo-600 hover:bg-indigo-700 font-bold py-2 px-4 rounded-lg">수면</button>`;
        } else if (isOtherAndOwned) {
            buttonHtml = `<button class="w-full bg-gray-500 font-bold py-2 px-4 rounded-lg btn-disabled" disabled>보유중</button>`;
        } else {
            buttonHtml = `<button id="buy-${item.id}" class="w-full bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded-lg">${item.cost.toLocaleString()} KRW</button>`;
        }

        el.innerHTML = `
            <div>
                <h4 class="font-bold text-lg">${item.name}</h4>
                <p class="text-xs text-gray-400 mt-1 mb-3 h-10">${item.desc}</p>
            </div>
            ${buttonHtml}
        `;
        container.appendChild(el);

        if (isBedAndOwned) {
            document.getElementById('sleep-button-shop')?.addEventListener('click', handleSleep);
        } else if (!gameState.shopItems[item.id]) {
            document.getElementById(`buy-${item.id}`)?.addEventListener('click', () => handleShopBuy(item.id, item.cost));
        }
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

    // Magnitude and Percentage
    const magRand = Math.random();
    let pct: number;
    let magStr: string;
    
    // 소 0.1~1% / 중 1~3% / 대 3~5%
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

    // Min/Max limits
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
    state.lastPrice = state.currentPrice;
    const result = getNewPrice(state.currentPrice, 'cube');
    state.currentPrice = result.price;
    state.fluctuation['cube'] = result.magnitude;
    updateChartData(chartCube, state.currentPrice, new Date(gameTime).toLocaleTimeString('ko-KR'));

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
    state.lastLunarPrice = state.currentLunarPrice;
    const result = getNewPrice(state.currentLunarPrice, 'lunar');
    state.currentLunarPrice = result.price;
    state.fluctuation['lunar'] = result.magnitude;
    updateChartData(chartLunar, state.currentLunarPrice, new Date(gameTime).toLocaleTimeString('ko-KR'));
    
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
    state.lastEnergyPrice = state.currentEnergyPrice;
    const result = getNewPrice(state.currentEnergyPrice, 'energy');
    state.currentEnergyPrice = result.price;
    state.fluctuation['energy'] = result.magnitude;
    updateChartData(chartEnergy, state.currentEnergyPrice, new Date(gameTime).toLocaleTimeString('ko-KR'));

    priceUpdateTimeoutEnergy = setTimeout(priceUpdateLoopEnergy, interval);
}

function priceUpdateLoopPrism() {
    if (gameState.isInternetOutage || gameState.isSleeping) {
        priceUpdateTimeoutPrism = setTimeout(priceUpdateLoopPrism, 3000);
        return;
    }
    const state = gameState;
    state.lastPrismPrice = state.currentPrismPrice;
    const result = getNewPrice(state.currentPrismPrice, 'prism');
    state.currentPrismPrice = result.price;
    state.fluctuation['prism'] = result.magnitude;
    updateChartData(chartPrism, state.currentPrismPrice, new Date(gameTime).toLocaleTimeString('ko-KR'));

    priceUpdateTimeoutPrism = setTimeout(priceUpdateLoopPrism, 3000);
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
        let newWeather = '맑음';

        if (state.nextWeatherIsRainbow) {
            newWeather = '무지개';
            state.nextWeatherIsRainbow = false;
        } else if (state.nextWeatherIsCloudy) {
            newWeather = '구름';
            state.nextWeatherIsCloudy = false;
        } else {
            let baseProbSunny = 0.6;
            let baseProbRain = 0.3; // total 0.9 for sunny+rain

            if (state.hasWeatherTrophy) {
                // 좋은 날씨 (맑음, 비, 무지개) 확률 2.5% 증가
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
        populateFarmShop(); // 날씨가 바뀌면 상점 다시 그림 (산성비료)

        if (state.weather === '천둥' && Math.random() < 0.05) {
            state.isInternetOutage = true;
            state.isInternetOutageCooldown = Date.now() + 30000; // 30 seconds
            showNotification('천둥 번개로 인해 인터넷 연결이 끊겼습니다!', true);
        }
        
        state.experiencedWeathers[state.weather] = true;
        checkTrophies();
        updateWeatherAlmanacUI();
    }
    // Internet Outage
    if (state.isInternetOutage && now > state.isInternetOutageCooldown) {
         state.isInternetOutage = false; 
         showNotification('인터넷 연결이 복구되었습니다.', false);
    }
    if (dom.internetOutage) dom.internetOutage.classList.toggle('hidden', !state.isInternetOutage);
    
    // Income
    let baseProduction = 0;
    if(state.isCubePurchased) { baseProduction = 100; if(state.isPrismUpgraded) baseProduction = 400; else if(state.isEnergyUpgraded) baseProduction = 200; }
    baseProduction *= (1 + state.skills.cube_efficiency * 0.1);

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
    state.userCash += totalIncome / 4;

    // Farm Buffs Expiration
    for (const buff in state.farmBuffs) {
        if (gameTime.getTime() > state.farmBuffs[buff].expiresAt) {
            delete state.farmBuffs[buff];
            updateInventory(); // Buff has expired, update UI
        }
    }

    // Farming
    let farmNeedsRedraw = false;
    state.farmPlots.forEach((plot: any, i: number) => {
        if (plot && !plot.isGrown) {
            let growthMultiplier = state.weather === '비' ? 1.5 : 1;
            if (state.hasSprinkler) growthMultiplier *= 1.5;
            if (state.farmBuffs.wateringCan) growthMultiplier *= 1.5;
            if (state.farmBuffs.artificialFertilizer) growthMultiplier *= 2;
            if (state.farmBuffs.acidFertilizer) growthMultiplier *= 5;
            
            plot.currentGrowth += 250 * growthMultiplier;

            if (plot.currentGrowth >= plot.totalGrowthTime) {
                plot.isGrown = true;
                plot.currentGrowth = plot.totalGrowthTime;
                farmNeedsRedraw = true;
            }
            
            // 실시간 게이지 바 업데이트
            const progressBar = document.getElementById(`progress-bar-${i}`);
            if(progressBar) {
                const progress = Math.min(100, (plot.currentGrowth / plot.totalGrowthTime) * 100);
                progressBar.style.width = `${progress}%`;
            }
        }
    });
    if (farmNeedsRedraw) {
        updateFarmUI();
    }


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

    // Add to transaction history
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
    list.innerHTML = ''; // Clear previous entries
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
    const costs = [250000, 1000000, 2500000, 5000000, 10000000];
    if (state.computerTier >= 5) return;
    const cost = costs[state.computerTier];
    if (state.userCash >= cost) {
        state.userCash -= cost; state.computerTier++;
        showNotification(`컴퓨터 업그레이드 완료! (Tier ${state.computerTier})`, false);
        updateComputerUI(); saveGameState();
    } else { showNotification('현금이 부족합니다.', true); }
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
        const secondsSlept = minutesToSleep * 4; // 1 game minute = 0.25 real second -> 1 game hour = 15 real seconds
        
        let baseProduction = 0;
        if(state.isCubePurchased) { baseProduction = 100; if(state.isPrismUpgraded) baseProduction = 400; else if(state.isEnergyUpgraded) baseProduction = 200; }
        const lunarBonus = (state.isLunarUpgraded) ? 100 : 0; // Avg over day/night
        let totalIncomePerSecond = (baseProduction + lunarBonus) / 4;

        const vpnMultiplier = getVpnMultiplier(state.skills.cube_vpn);
        state.userCash += totalIncomePerSecond * secondsSlept * vpnMultiplier;
        
        // Mining during sleep
        if (state.computerTier > 0) {
            const tier = state.computerTier;
            const sleepRealMinutes = (3000 / 1000) / 60; // 3 second sleep animation
            const minedCubes = Math.floor(sleepRealMinutes * tier * 0.02);
            const minedLunar = Math.floor(sleepRealMinutes * tier * 0.015);
            const minedEnergy = Math.floor(sleepRealMinutes * tier * 0.01);
            const minedPrism = Math.floor(sleepRealMinutes * tier * 0.005);
            state.userCubes += minedCubes;
            state.userLunar += minedLunar;
            state.userEnergy += minedEnergy;
            state.userPrisms += minedPrism;
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

    updateWeatherAlmanacUI();
    updateFarmUI();
    updateSkillsUI();
    updateUI();
}

// =======================================================
// 농사 관련 로직
// =======================================================
function updateFarmUI() {
    updateFarmPlots();
    updateSeedShop();
    updateInventory();
}
function updateFarmPlots() {
    const container = dom.farmPlotSection;
    if (!container) return;
    container.innerHTML = `<h3 class="text-lg font-semibold text-white mb-2">내 농장</h3>`;

    const farmSize = 3 + gameState.skills.farm_expand;
    const grid = document.createElement('div');
    grid.className = `grid gap-2`;
    grid.style.gridTemplateColumns = `repeat(${farmSize}, minmax(0, 1fr))`;
    
    for (let i = 0; i < gameState.farmPlots.length; i++) {
        const plotData = gameState.farmPlots[i];
        const plotEl = document.createElement('div');
        plotEl.className = 'farm-plot rounded-md cursor-pointer relative flex items-center justify-center';
        
        if (!plotData) {
            plotEl.innerHTML = `<span class="text-3xl text-green-800 opacity-50">+</span>`;
            plotEl.onclick = () => handlePlant(i);
        } else {
            const crop = CROP_DATA[plotData.seedId];
            const progress = Math.min(100, (plotData.currentGrowth / plotData.totalGrowthTime) * 100);

            let content = `<div class="text-center">
                <span class="text-4xl">${crop.icon}</span>
                <div class="absolute bottom-1 left-1 right-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div id="progress-bar-${i}" class="bg-green-500 h-full" style="width: ${progress}%"></div>
                </div>
            </div>`;

            if (plotData.isGrown) {
                content += `<div class="absolute inset-0 bg-black/50 flex items-center justify-center font-bold text-yellow-300">수확!</div>`;
                plotEl.onclick = () => handleHarvest(i);
            } else {
                plotEl.onclick = () => handleRemoveCrop(i);
            }
             plotEl.innerHTML = content;
        }
        grid.appendChild(plotEl);
    }
    container.appendChild(grid);
}
function updateSeedShop() {
    const container = dom.seedShopContainer;
    if (!container) return;
    container.innerHTML = `<h3 class="text-lg font-semibold text-white mb-2">씨앗 상점</h3><div class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2"></div>`;
    const list = container.querySelector('div');

    for (const seedId in CROP_DATA) {
        const seed = CROP_DATA[seedId];
        const el = document.createElement('div');
        el.className = 'bg-gray-600 p-2 rounded-lg flex items-center justify-between';
        el.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-2xl">${seed.icon}</span>
                <div>
                    <p class="font-semibold text-sm">${seed.krName} 씨앗</p>
                    <p class="text-xs text-gray-400">${seed.cost.toLocaleString()} KRW</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <input type="number" id="buy-amount-${seedId}" value="1" min="1" class="w-16 bg-gray-800 text-white p-1 rounded border border-gray-500 text-sm text-center">
                <button id="buy-seed-${seedId}" class="bg-blue-600 hover:bg-blue-700 text-xs font-bold py-1 px-3 rounded">구매</button>
            </div>
        `;
        list?.appendChild(el);
        document.getElementById(`buy-seed-${seedId}`)?.addEventListener('click', () => handleBuySeed(seedId));
    }
}
function updateInventory() {
    const container = dom.inventoryContainer;
    if (!container) return;
    container.innerHTML = `<h3 class="text-lg font-semibold text-white mb-2">인벤토리</h3><div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2"></div>`;
    const list = container.querySelector('div');

    const hasSeeds = Object.values(gameState.seedInventory).some(count => (count as number) > 0);
    let hasCrops = false;
    let hasItems = false;
    
    // 작물 및 아이템 확인
    for (const key in gameState.inventory) {
        if (CROP_DATA[key.split('_')[0]] && gameState.inventory[key] > 0) hasCrops = true;
        if (FARM_ITEM_DATA[key as keyof typeof FARM_ITEM_DATA] && gameState.inventory[key] > 0) hasItems = true;
    }

    if (!hasSeeds && !hasCrops && !hasItems) {
        list.innerHTML = `<p class="text-gray-400 text-sm text-center p-4">보유한 아이템이 없습니다.</p>`;
        return;
    }

    // 씨앗 렌더링
    for (const seedId in gameState.seedInventory) {
        const count = gameState.seedInventory[seedId];
        if (count > 0) {
            const seed = CROP_DATA[seedId];
            const el = document.createElement('div');
            const isSelected = selectedSeed === seedId;
            el.className = `bg-gray-600 p-2 rounded-lg flex items-center justify-between cursor-pointer transition-all ${isSelected ? 'ring-2 ring-yellow-400' : ''}`;
            el.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-2xl">${seed.icon}</span>
                    <p class="font-semibold text-sm">${seed.krName} 씨앗 x${count.toLocaleString()}</p>
                </div>
                <button class="bg-yellow-600 hover:bg-yellow-700 text-xs font-bold py-1 px-2 rounded">선택</button>
            `;
            el.onclick = () => {
                selectedSeed = isSelected ? null : seedId;
                updateInventory();
            };
            list?.appendChild(el);
        }
    }
    
    // 농사 아이템 렌더링
    for (const itemId in FARM_ITEM_DATA) {
        if (itemId === 'sprinkler') continue; // Sprinkler is an upgrade, not an inventory item.
        const count = gameState.inventory[itemId];
        if (count > 0) {
            const item = FARM_ITEM_DATA[itemId as keyof typeof FARM_ITEM_DATA];
            const el = document.createElement('div');
            const isBuffActive = !!gameState.farmBuffs[itemId];
            el.className = `bg-gray-800 p-2 rounded-lg flex items-center justify-between transition-all`;
            
            let buttonHtml = `<button id="use-item-${itemId}" class="bg-blue-600 hover:bg-blue-700 text-xs font-bold py-1 px-2 rounded">사용</button>`;
            if (isBuffActive) {
                 buttonHtml = `<button class="bg-gray-500 text-xs font-bold py-1 px-2 rounded btn-disabled" disabled>사용중</button>`;
            }
            
            el.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-2xl">${item.icon}</span>
                    <p class="font-semibold text-sm">${item.krName} x${count.toLocaleString()}</p>
                </div>
                ${buttonHtml}
            `;
            list?.appendChild(el);

            if (!isBuffActive) {
                document.getElementById(`use-item-${itemId}`)?.addEventListener('click', () => handleUseItem(itemId));
            }
        }
    }


    // 작물 렌더링 (품종별)
    const cropGroups: { [key: string]: { [variant: string]: number } } = {};
    for (const key in gameState.inventory) {
        const [cropId, variant = 'normal'] = key.split('_');
        if (CROP_DATA[cropId] && gameState.inventory[key] > 0) {
            if (!cropGroups[cropId]) cropGroups[cropId] = {};
            cropGroups[cropId][variant] = gameState.inventory[key];
        }
    }

    for (const cropId in cropGroups) {
        const crop = CROP_DATA[cropId];
        const variants = cropGroups[cropId];
        for (const variant in variants) {
            const count = variants[variant];
            const el = document.createElement('div');
            el.className = 'bg-gray-800 p-2 rounded-lg flex items-center justify-between';
            
            let name = crop.krName;
            let sellPrice = crop.sellPrice;
            let canFeed = true;
            if (variant === 'artificial') { name += ' (비료)'; sellPrice /= 1.5; }
            if (variant === 'acid') { name += ' (산성)'; sellPrice -= 2; canFeed = false; }
            sellPrice = Math.max(0, Math.floor(sellPrice));

            el.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="text-2xl">${crop.icon}</span>
                    <p class="font-semibold text-sm">${name} x${count.toLocaleString()}</p>
                </div>
                <div class="flex gap-2">
                    <button id="sell-${cropId}-${variant}" class="bg-green-600 hover:bg-green-700 text-xs font-bold py-1 px-2 rounded">판매 (${sellPrice} TK)</button>
                    <button id="feed-${cropId}-${variant}" class="bg-blue-600 hover:bg-blue-700 text-xs font-bold py-1 px-2 rounded ${!canFeed ? 'btn-disabled' : ''}" ${!canFeed ? 'disabled' : ''}>먹이</button>
                </div>
            `;
            list?.appendChild(el);
            document.getElementById(`sell-${cropId}-${variant}`)?.addEventListener('click', () => handleSellCrop(cropId, variant));
            if(canFeed) document.getElementById(`feed-${cropId}-${variant}`)?.addEventListener('click', () => handleFeedCube(cropId, variant));
        }
    }
}
function handleBuySeed(seedId: string) {
    const amountInput = document.getElementById(`buy-amount-${seedId}`) as HTMLInputElement;
    const amount = parseInt(amountInput.value);
    if (!amount || amount <= 0) {
        showNotification('유효한 수량을 입력하세요.', true);
        return;
    }

    const seedData = CROP_DATA[seedId];
    const totalCost = seedData.cost * amount;

    if (gameState.userCash < totalCost) {
        showNotification('씨앗을 살 현금이 부족합니다.', true);
        return;
    }

    gameState.userCash -= totalCost;
    gameState.seedInventory[seedId] = (gameState.seedInventory[seedId] || 0) + amount;
    
    showNotification(`${seedData.krName} 씨앗 ${amount}개를 구매했습니다.`, false);
    updateInventory();
    updateUI();
    saveGameState();
}
function handlePlant(plotIndex: number) {
    const plot = gameState.farmPlots[plotIndex];
    if (plot?.seedId) { showNotification('이미 작물이 심겨져 있습니다.', true); return; }
    if (!selectedSeed) { showNotification('먼저 인벤토리에서 심을 씨앗을 선택하세요.', true); return; }
    if (!gameState.seedInventory[selectedSeed] || gameState.seedInventory[selectedSeed] <= 0) {
        showNotification('선택한 씨앗이 부족합니다.', true);
        return;
    }
    
    gameState.seedInventory[selectedSeed]--;

    const seedId = selectedSeed;
    const seedData = CROP_DATA[seedId];
    const fertilizerDiscount = 1 - (gameState.skills.farm_fertilizer * 0.05);
    
    let fertilizerType = null;
    if (gameState.farmBuffs.artificialFertilizer) fertilizerType = 'artificial';
    if (gameState.farmBuffs.acidFertilizer) fertilizerType = 'acid';

    const newPlot = {
        seedId: seedId,
        plantedAt: gameTime.getTime(),
        currentGrowth: 0,
        totalGrowthTime: seedData.growthTime * fertilizerDiscount,
        isGrown: false,
        fertilizerType: fertilizerType,
    };

    gameState.farmPlots[plotIndex] = newPlot;
    
    updateFarmUI();
    saveGameState();
}
function handleHarvest(plotIndex: number) {
    const plot = gameState.farmPlots[plotIndex];
    if (!plot || !plot.isGrown) return;

    let harvestCount = 1;
    const luckyHarvestChance = gameState.skills.farm_lucky_harvest * 0.05;
    if (Math.random() < luckyHarvestChance) {
        harvestCount = 2;
        showNotification('행운의 수확! 작물을 2개 획득했습니다!', false);
    }
    
    const variant = plot.fertilizerType || 'normal';
    const inventoryKey = `${plot.seedId}_${variant}`;
    gameState.inventory[inventoryKey] = (gameState.inventory[inventoryKey] || 0) + harvestCount;
    
    gameState.farmPlots[plotIndex] = null;
    
    updateFarmUI();
    saveGameState();
}
function handleRemoveCrop(plotIndex: number) {
    if (confirm('이 작물을 제거하시겠습니까?')) {
        gameState.farmPlots[plotIndex] = null;
        updateFarmUI();
        saveGameState();
    }
}
function handleSellCrop(cropId: string, variant: string) {
    const inventoryKey = `${cropId}_${variant}`;
    if (gameState.inventory[inventoryKey] > 0) {
        gameState.inventory[inventoryKey]--;

        let sellPrice = CROP_DATA[cropId].sellPrice;
        if (variant === 'artificial') sellPrice /= 1.5;
        if (variant === 'acid') sellPrice -= 2;
        
        gameState.farmCoin += Math.max(0, Math.floor(sellPrice));
        updateInventory();
        updateUI();
        saveGameState();
    }
}
function handleFeedCube(cropId: string, variant: string) {
    const inventoryKey = `${cropId}_${variant}`;
    if (gameState.inventory[inventoryKey] > 0) {
        gameState.inventory[inventoryKey]--;
        const crop = CROP_DATA[cropId];
        const hg = crop.sellPrice / 10;
        const chanceDivisor = 10 - gameState.skills.cube_exceptional;
        const activationChance = (hg / chanceDivisor) / 100;
        
        if (Math.random() < activationChance) {
            gameState.exceptionalState = {
                isActive: true,
                expiresAt: Date.now() + 3600 * 1000, // 1 hour
            };
            showNotification('특출남 상태 발동! 1시간 동안 생산량이 2배가 됩니다!', false);
        } else {
            showNotification(`${crop.krName}을 먹었지만 아무 일도 일어나지 않았습니다.`, false);
        }
        
        updateInventory();
        updateUI();
        saveGameState();
    }
}

// =======================================================
// 스킬 트리 관련 로직
// =======================================================
function updateSkillsUI() {
    const cubeContainer = dom.skillsCubeContainer;
    const farmContainer = dom.skillsFarmContainer;
    if (!cubeContainer || !farmContainer) return;
    
    cubeContainer.innerHTML = `<h3 class="text-lg font-semibold text-white mb-2">3D 큐브 스킬</h3><div class="space-y-3"></div>`;
    farmContainer.innerHTML = `<h3 class="text-lg font-semibold text-white mb-2">농사 스킬</h3><div class="space-y-3"></div>`;
    
    const cubeList = cubeContainer.querySelector('div');
    const farmList = farmContainer.querySelector('div');

    for (const skillId in SKILL_DATA) {
        const skill = SKILL_DATA[skillId as keyof typeof SKILL_DATA];
        const currentLevel = gameState.skills[skillId];
        
        const el = document.createElement('div');
        el.className = 'bg-gray-600 p-3 rounded-lg';

        let buttonHtml: string;
        if (currentLevel >= skill.maxTier) {
            buttonHtml = `<button class="w-full bg-gray-500 font-bold py-2 px-4 rounded-lg text-sm btn-disabled" disabled>마스터</button>`;
        } else {
            const cost = skill.costs[currentLevel];
            buttonHtml = `<button id="buy-skill-${skillId}" class="w-full bg-purple-600 hover:bg-purple-700 font-bold py-2 px-4 rounded-lg text-sm">${cost.toLocaleString()} TK</button>`;
        }
        
        const currentDesc = skillId === 'farm_expand' ? `현재 크기: ${3 + currentLevel}x${3 + currentLevel}` : `현재: ${skill.description(currentLevel)}`;
        const nextDesc = currentLevel < skill.maxTier ? `다음: ${skill.description(currentLevel + 1)}` : '최대 레벨';

        el.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <h4 class="font-bold text-base">${skill.name}</h4>
                <p class="text-sm text-gray-300">Lv. ${currentLevel} / ${skill.maxTier}</p>
            </div>
            <p class="text-xs text-gray-400 mb-3 h-8">${currentDesc}<br>${nextDesc}</p>
            ${buttonHtml}
        `;

        if (skill.category === 'cube') {
            cubeList?.appendChild(el);
        } else {
            farmList?.appendChild(el);
        }

        if (currentLevel < skill.maxTier) {
            document.getElementById(`buy-skill-${skillId}`)?.addEventListener('click', () => handleBuySkill(skillId));
        }
    }
}
function handleBuySkill(skillId: string) {
    const skill = SKILL_DATA[skillId as keyof typeof SKILL_DATA];
    const currentLevel = gameState.skills[skillId];
    if (currentLevel >= skill.maxTier) return;

    const cost = skill.costs[currentLevel];
    if (gameState.farmCoin < cost) {
        showNotification('농장 코인이 부족합니다.', true);
        return;
    }

    gameState.farmCoin -= cost;
    gameState.skills[skillId]++;
    
    if (skillId === 'farm_expand') {
        const oldSize = (3 + currentLevel) * (3 + currentLevel);
        const newSize = (3 + gameState.skills.farm_expand) * (3 + gameState.skills.farm_expand);
        const newPlots = Array(newSize).fill(null);
        // 기존 작물 데이터 보존
        for(let i=0; i<oldSize; i++) {
            newPlots[i] = gameState.farmPlots[i];
        }
        gameState.farmPlots = newPlots;
        updateFarmUI();
    }
    
    showNotification(`${skill.name} 스킬 레벨 업!`, false);
    updateSkillsUI();
    updateUI();
    saveGameState();
}


// =======================================================
// 공용 로직
// =======================================================
function populateFarmShop() {
    const container = dom.farmShopItems;
    if (!container) return;
    container.innerHTML = '';

    for (const itemId in FARM_ITEM_DATA) {
        const item = FARM_ITEM_DATA[itemId as keyof typeof FARM_ITEM_DATA];
        
        if (item.requires && item.requires !== gameState.weather) {
            continue; // 조건 불충족 시 표시 안함
        }

        const el = document.createElement('div');
        el.className = 'bg-gray-600 p-4 rounded-lg flex flex-col justify-between text-center';

        let buttonHtml: string;
        const isSprinklerAndOwned = itemId === 'sprinkler' && gameState.hasSprinkler;

        if (isSprinklerAndOwned) {
            buttonHtml = `<button class="w-full bg-gray-500 font-bold py-2 px-4 rounded-lg text-sm mt-2 btn-disabled" disabled>구매 완료</button>`;
        } else {
            buttonHtml = `<button id="buy-farm-item-${itemId}" class="w-full bg-green-600 hover:bg-green-700 font-bold py-2 px-4 rounded-lg text-sm mt-2">${item.cost.toLocaleString()} KRW</button>`;
        }

        el.innerHTML = `
             <div>
                <div class="text-4xl mb-2">${item.icon}</div>
                <h4 class="font-bold text-md">${item.krName} (x${item.quantity})</h4>
                <p class="text-xs text-gray-400 mt-1 mb-3 h-12">${item.desc}</p>
            </div>
            ${buttonHtml}
        `;
        container.appendChild(el);

        if (!isSprinklerAndOwned) {
            document.getElementById(`buy-farm-item-${itemId}`)?.addEventListener('click', () => handleBuyFarmItem(itemId));
        }
    }
}

function handleBuyFarmItem(itemId: string) {
    const itemData = FARM_ITEM_DATA[itemId as keyof typeof FARM_ITEM_DATA];
    if (gameState.userCash < itemData.cost) {
        showNotification('현금이 부족합니다.', true);
        return;
    }

    if (itemId === 'sprinkler') {
        if (gameState.hasSprinkler) {
            showNotification('스프링클러는 이미 보유하고 있습니다.', true);
            return;
        }
        gameState.userCash -= itemData.cost;
        gameState.hasSprinkler = true;
        showNotification('스프링클러를 구매했습니다! 이제 모든 작물이 더 빨리 자랍니다.', false);
        populateFarmShop();
        saveGameState();
        return;
    }

    gameState.userCash -= itemData.cost;
    gameState.inventory[itemId] = (gameState.inventory[itemId] || 0) + itemData.quantity;
    showNotification(`${itemData.krName} ${itemData.quantity}개를 구매했습니다.`, false);
    updateInventory();
    saveGameState();
}

function handleUseItem(itemId: string) {
    if (gameState.inventory[itemId] <= 0) return;

    gameState.inventory[itemId]--;
    let duration = 0;
    if(itemId === 'wateringCan' || itemId === 'acidFertilizer') duration = 6 * 60 * 60 * 1000; // 6 game hours
    if(itemId === 'artificialFertilizer') duration = 12 * 60 * 60 * 1000; // 12 game hours
    
    gameState.farmBuffs[itemId] = {
        expiresAt: gameTime.getTime() + duration / (60 * 4), // 1 game minute = 0.25 real seconds -> duration is in game time milliseconds.
    };
    showNotification(`${FARM_ITEM_DATA[itemId as keyof typeof FARM_ITEM_DATA].krName} 효과가 시작되었습니다!`, false);
    updateInventory();
    saveGameState();
}


async function resetUserData() {
    if (auth.currentUser) {
        try {
            await db.ref('users/' + auth.currentUser.uid).remove();
            showNotification('데이터가 성공적으로 초기화되었습니다.', false);
            await handleLogout();
        } catch(error) {
            console.error("Data reset failed:", error);
            showNotification('데이터 초기화에 실패했습니다.', true);
        }
    }
}

function handleCodeSubmit() {
    const input = document.getElementById('code-input') as HTMLInputElement;
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    if (gameState.usedCodes.includes(code)) {
        showNotification('이미 사용된 코드입니다.', true);
        return;
    }

    let rewardGiven = false;
    if (code === 'RESET') {
        if (confirm('정말로 모든 게임 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            if (confirm('경고: 두 번째 확인입니다. 모든 진행 상황이 영구적으로 삭제됩니다. 계속하시겠습니까?')) {
                resetUserData();
            }
        }
        return; 
    } else if (code === 'MONEYBAGS') {
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
    } else if (code === 'SORRY4DELAY') {
        gameState.userCubes += 20;
        showNotification('보상 코드: 20 CUBE 코인을 획득했습니다!', false);
        rewardGiven = true;
    } else if (code === 'THANKS4FEEDBACK') {
        gameState.userEnergy += 1;
        showNotification('보상 코드: 1 ENERGY 코인을 획득했습니다!', false);
        rewardGiven = true;
    } else if (code === 'ICE_CUBE102') {
        gameState.userCash += 1000000000000;
        showNotification('개발자 코드: 1조 KRW가 추가되었습니다!', false);
        rewardGiven = true;
    } else if (code === 'FARM4TREE') {
        gameState.seedInventory['banana'] = (gameState.seedInventory['banana'] || 0) + 2;
        showNotification('보상 코드: 바나나 씨앗 2개를 획득했습니다!', false);
        updateInventory();
        rewardGiven = true;
    } else if (code === 'ICE_CUBE101') {
        gameState.farmCoin += 1000000;
        showNotification('개발자 코드: 1,000,000 농장 코인을 획득했습니다!', false);
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

/**
 * Safely merges loaded game data with the initial state to prevent data loss on updates.
 * It ensures new state properties are added and handles nested objects correctly.
 * @param loadedData The game state data loaded from Firebase.
 * @returns A clean, merged game state object.
 */
function migrateAndMergeState(loadedData: any): any {
    const initialState = getInitialGameState();
    const migratedState: any = {};

    for (const key in initialState) {
        if (Object.prototype.hasOwnProperty.call(initialState, key)) {
            const initialValue = initialState[key as keyof typeof initialState];
            const loadedValue = loadedData[key];

            if (loadedValue !== undefined) {
                 // Special handling for nested plain objects to merge them
                if (
                    typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue) &&
                    typeof loadedValue === 'object' && loadedValue !== null && !Array.isArray(loadedValue)
                ) {
                    migratedState[key] = { ...initialValue, ...loadedValue };
                } else {
                    // For primitives, arrays, or mismatched types, prefer the saved value
                    migratedState[key] = loadedValue;
                }
            } else {
                // If no saved value, use the default from the initial state
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
                    // Offline Cash
                    let offlineCash = 0;
                    if(gameState.isCubePurchased) {
                        let avgBaseProd = 100;
                        if (gameState.isPrismUpgraded) avgBaseProd = 400;
                        else if (gameState.isEnergyUpgraded) avgBaseProd = 200;
                        avgBaseProd *= (1 + gameState.skills.cube_efficiency * 0.1);

                        const avgLunarBonus = gameState.isLunarUpgraded ? (100 * (14 / 24)) : 0; // Average lunar bonus
                        const vpnMultiplier = getVpnMultiplier(gameState.skills.cube_vpn);
                        offlineCash = (offlineSeconds / 4) * (avgBaseProd + avgLunarBonus) * vpnMultiplier;
                    }
                    
                    // Offline Mining
                    let minedCoinsReport = '';
                    if (gameState.computerTier > 0) {
                        const tier = gameState.computerTier;
                        const offlineRealMinutes = offlineSeconds / 60;
                        const minedCubes = Math.floor(offlineRealMinutes * tier * 0.02);
                        const minedLunar = Math.floor(offlineRealMinutes * tier * 0.015);
                        const minedEnergy = Math.floor(offlineRealMinutes * tier * 0.01);
                        const minedPrism = Math.floor(offlineRealMinutes * tier * 0.005);
                        gameState.userCubes += minedCubes;
                        gameState.userLunar += minedLunar;
                        gameState.userEnergy += minedEnergy;
                        gameState.userPrisms += minedPrism;
                        if (minedCubes+minedLunar+minedEnergy+minedPrism > 0) {
                            minedCoinsReport = "와 채굴된 코인";
                        }
                    }
                    
                    gameState.userCash += offlineCash;
                    
                    // Offline Farming
                    const offlineGrowth = offlineMillis; // 1ms real time = 1ms game time for growth calc
                    gameState.farmPlots.forEach((plot: any) => {
                        if (plot && plot.seedId && !plot.isGrown) {
                            let growthMultiplier = 1; // Base offline multiplier
                            if(gameState.hasSprinkler) growthMultiplier *= 1.5;

                            plot.currentGrowth += offlineGrowth * growthMultiplier * 0.25; // Adjusted for gameloop speed
                            if (plot.currentGrowth >= plot.totalGrowthTime) {
                                plot.isGrown = true;
                                plot.currentGrowth = plot.totalGrowthTime;
                            }
                        }
                    });

                    if(offlineCash > 0 || minedCoinsReport) {
                        setTimeout(() => showNotification(`${Math.floor(offlineSeconds / 60)}분간의 오프라인 보상으로 ${Math.floor(offlineCash).toLocaleString()} KRW${minedCoinsReport}을 획득했습니다!`, false), 1000);
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
// 인증 로직
// =======================================================
function handleAuthError(error: any) {
    let message = '오류가 발생했습니다. 다시 시도해주세요.';
    switch (error.code) {
        case 'auth/invalid-email':
            message = '유효하지 않은 이메일 주소입니다.';
            break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            message = '이메일 또는 비밀번호가 잘못되었습니다.';
            break;
        case 'auth/email-already-in-use':
            message = '이미 사용 중인 이메일 주소입니다.';
            break;
        case 'auth/weak-password':
            message = '비밀번호는 6자 이상이어야 합니다.';
            break;
    }
    showNotification(message, true);
}

async function onLoginSuccess(loginScreen: HTMLElement, mainContent: HTMLElement, logoutButton: HTMLElement) {
    await loadGameState();
    
    loginScreen.style.display = 'none';
    mainContent.classList.remove('hidden');
    logoutButton.classList.remove('hidden');
    
    initGame();
    startGame();

    if (window.autosaveInterval) clearInterval(window.autosaveInterval);
    window.autosaveInterval = setInterval(saveGameState, 30000);
}

async function handleLogin(loginScreen: HTMLElement, mainContent: HTMLElement, logoutButton: HTMLElement) {
    const emailInput = document.getElementById('login-email-input') as HTMLInputElement;
    const passwordInput = document.getElementById('login-password-input') as HTMLInputElement;
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        await onLoginSuccess(loginScreen, mainContent, logoutButton);
    } catch (error) {
        handleAuthError(error);
    }
}

async function handleRegister(loginScreen: HTMLElement, mainContent: HTMLElement, logoutButton: HTMLElement) {
    const emailInput = document.getElementById('register-email-input') as HTMLInputElement;
    const passwordInput = document.getElementById('register-password-input') as HTMLInputElement;
    const email = emailInput.value;
    const password = passwordInput.value;
    
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        showNotification('회원가입이 완료되었습니다! 게임을 시작합니다.', false);
        await onLoginSuccess(loginScreen, mainContent, logoutButton);
    } catch (error) {
        handleAuthError(error);
    }
}

async function handleLogout() {
    await saveGameState();
    stopGame();

    await auth.signOut();

    gameState = getInitialGameState();

    const mainContent = document.getElementById('main-content');
    const loginScreen = document.getElementById('login-screen');
    const logoutButton = document.getElementById('logout-button');

    if (mainContent && loginScreen && logoutButton) {
        mainContent.classList.add('hidden');
        loginScreen.style.display = 'flex';
        logoutButton.classList.add('hidden');
    }
}


// =======================================================
// 앱 초기화
// =======================================================
document.addEventListener('DOMContentLoaded', async () => {
    const loginScreen = document.getElementById('login-screen');
    const mainContent = document.getElementById('main-content');
    const loginButton = document.getElementById('login-button');
    const registerButton = document.getElementById('register-button');
    const logoutButton = document.getElementById('logout-button') as HTMLElement;
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterButton = document.getElementById('show-register-form');
    const showLoginButton = document.getElementById('show-login-form');

    const updateBanner = document.getElementById('update-banner');
    const countdownTimer = document.getElementById('countdown-timer');

    // v2 업데이트 카운트다운 로직
    const v2UpdateTime = new Date('2025-08-01T00:00:00+09:00').getTime();
    const countdownDuration = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

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

    // UI 섹션 토글 이벤트 리스너 등록
    ['assets', 'farm', 'skills', 'trade', 'charts', 'history', 'computer', 'trophy', 'almanac', 'shop', 'code'].forEach(s => {
        const toggle = document.getElementById(`toggle-${s}`);
        if (toggle) {
            toggle.addEventListener('click', () => {
                document.getElementById(`content-${s}`)?.classList.toggle('hidden');
                document.getElementById(`toggle-${s}-icon`)?.classList.toggle('rotate-180');
            });
        }
    });

    if (!loginScreen || !mainContent || !loginButton || !registerButton || !logoutButton || !loginForm || !registerForm || !showRegisterButton || !showLoginButton) {
        console.error("UI elements not found!");
        return;
    }
    
    showRegisterButton.addEventListener('click', () => {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    showLoginButton.addEventListener('click', () => {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });
    
    loginButton.addEventListener('click', () => handleLogin(loginScreen, mainContent, logoutButton));
    registerButton.addEventListener('click', () => handleRegister(loginScreen, mainContent, logoutButton));
    logoutButton.addEventListener('click', handleLogout);
});

// FIX: Add empty export to treat this file as a module, enabling global declarations.
export {};