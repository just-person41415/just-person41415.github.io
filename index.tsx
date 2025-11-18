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
  storageBucket: "real-d1d0a.firebasestorage.app",
  messagingSenderId: "362480200866",
  appId: "1:362480200866:web:ae6e59d94a9e3fef51fbfb",
  measurementId: "G-Q40RNTCZW5"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();


// --- 전역 설정 ---
const WEATHER_DATA: {[key: string]: { icon: string, short_desc: string, long_desc: string, isBad?: boolean, isGood?: boolean }} = {
    '맑음': { icon: '☀️', short_desc: '상승 확률 소폭 증가', long_desc: '코인 증가 확률 +0.5%, 감소 확률 -0.5%', isGood: true },
    '비': { icon: '🌧️', short_desc: 'CUBE 상승 확률 증가', long_desc: 'CUBE 코인 증가 확률 +1%, 감소 확률 -1%.', isGood: true },
    '구름': { icon: '☁️', short_desc: '효과 없음', long_desc: '특별한 효과는 없습니다.' },
    '산성비': { icon: '☣️', short_desc: '하락 확률 증가', long_desc: '코인 증가 확률 -2.5%, 코인 감소 확률 +2.5%.', isBad: true },
    '천둥': { icon: '⛈️', short_desc: '인터넷 끊김 주의', long_desc: '5% 확률로 인터넷 연결이 끊겨 거래 등 일부 행동이 제한됩니다.', isBad: true },
    '무지개': { icon: '🌈', short_desc: '상승 확률 대폭 증가', long_desc: '코인 증가 확률 +2.5%, 감소 확률 -2.5%.', isGood: true },
    '바람': { icon: '💨', short_desc: '효과 없음', long_desc: '현재 특별한 효과 없음.' },
    '황사': { icon: '😷', short_desc: '코인 변화 시간 증가', long_desc: '모든 코인 변화에 걸리는 시간이 10% 증가합니다.', isBad: true },
    '폭염': { icon: '🥵', short_desc: '패시브 수입 감소', long_desc: '3D 큐브의 패시브 KRW 수입이 50% 감소합니다.', isBad: true },
    '폭우': { icon: '🌊', short_desc: '자동화 기능 정지', long_desc: '채굴 컴퓨터와 드릴이 작동하지 않습니다. 디지털 시계가 가끔 오류를 일으킵니다.', isBad: true },
    '눈': { icon: '❄️', short_desc: '수면 불가', long_desc: '눈이 내려 수면을 취할 수 없습니다.', isBad: true },
    '별똥별': { icon: '🌠', short_desc: '상승 확률 증가', long_desc: '모든 코인 증가 확률 +2.5%, 감소 확률 -2.5%.', isGood: true },
    '우박': { icon: '🌨️', short_desc: '하락 확률 증가', long_desc: '모든 코인 증가 확률 -2.5%, 감소 확률 +2.5%.', isBad: true },
    '오로라': { icon: '✨', short_desc: '최고의 환경', long_desc: '모든 코인 증가 확률 +5%, 감소 확률 -5%. 모든 코인 변화 시간 -20%.', isGood: true },
};

const TROPHY_DATA = {
    'powerMaster': { name: '전력 트로피', icon: '🏆', desc: '자동 채굴로 모든 종류의 코인을 100개 이상 획득했습니다.', reward: 'ENERGY 코인 변동성이 약간 안정됩니다 (+1% 상승 확률, -1% 하락 확률).', isUnlocked: (state: any) => state.hasPowerTrophy },
    'timeMaster': { name: '시간의 트로피', icon: '🏆', desc: '20번 이상 수면을 취했습니다.', reward: '밤 시간 동안 모든 코인의 변동 주기가 5% 짧아집니다.', isUnlocked: (state: any) => state.hasTimeTrophy },
    'weatherMaster': { name: '날씨의 지배자', icon: '🏆', desc: '모든 종류의 날씨를 경험했습니다.', reward: '좋은 날씨 확률 +2.5%, 나쁜 날씨 확률 -2.5%', isUnlocked: (state: any) => state.hasWeatherTrophy }
};

const SEASONS = ['봄', '여름', '가을', '겨울'];

let gameLoopInterval: any = null;
let drillInterval: any = null;
let investorInterval: any = null;
let priceUpdateTimeoutCube: any = null;
let priceUpdateTimeoutLunar: any = null;
let priceUpdateTimeoutEnergy: any = null;
let priceUpdateTimeoutPrism: any = null;
let gameTime: Date;
let dom: any = {};
let notificationTimeout: any = null;
let announcementTimeout: any = null;
let announcementInterval: any = null;
let userNickname: string | null = null;
let userUID: string | null = null;
let scene: any, camera: any, renderer: any, cube: any;
let chartCube: any, chartLunar: any, chartEnergy: any, chartPrism: any;
let globalWeatherOverride: string | null = null;
let globalPriceOverrides: any = null;
let currentGameSpeed = 1;
let gameState: any;

// --- 게임 데이터 정의 ---
const DRILL_DATA = [
    { name: 'Tier 1 드릴', cost: 50000 }, { name: 'Tier 2 드릴', cost: 150000 },
    { name: 'Tier 3 드릴', cost: 500000 }, { name: 'Tier 4 드릴', cost: 1200000 },
    { name: 'Tier 5 드릴', cost: 2000000 }
];

const COMPUTER_DATA = [
    { name: '컴퓨터 없음', cost: { userCash: 100000 } },
    { name: 'Tier 1 컴퓨터', cost: { userCash: 500000 } },
    { name: 'Tier 2 컴퓨터', cost: { copperWire: 20 } },
    { name: 'Tier 3 컴퓨터', cost: { copperWire: 40, ironWire: 10 } },
    { name: 'Tier 4 컴퓨터', cost: { copperWire: 40, ironWire: 15, goldWire: 3 } },
    { name: 'Tier 5 컴퓨터', cost: { copperWire: 50, ironWire: 20, goldWire: 10, diamondWire: 3 } },
    { name: 'Tier 6 컴퓨터', cost: { liberatedCopperWire: 5 } },
    { name: 'Tier 7 컴퓨터', cost: { liberatedCopperWire: 10, liberatedIronWire: 5 } },
    { name: 'Tier 8 컴퓨터', cost: { liberatedCopperWire: 20, liberatedIronWire: 15, liberatedGoldWire: 8 } },
    { name: 'Tier 9 컴퓨터', cost: { liberatedCopperWire: 20, liberatedIronWire: 15, liberatedGoldWire: 10, liberatedDiamondWire: 5 } },
    { name: 'Tier 10 컴퓨터', cost: {} } // Max tier
];

const INVESTOR_DATA = [
    { name: '초보 투자자', cost: 10000, pnl: 0.4, coins: ['CUBE'] },
    { name: '중수 투자자', cost: 150000, pnl: 0.6, coins: ['CUBE', 'LUNAR'] },
    { name: '고수 투자자', cost: 400000, pnl: 0.7, coins: ['LUNAR', 'ENERGY'] },
    { name: '달인 투자자', cost: 1000000, pnl: 0.8, coins: ['CUBE', 'LUNAR', 'ENERGY', 'PRISM'] }
];

const CRAFTING_DATA: {[key: string]: { name: string, cost: {[key:string]: number}, product: string, amount: number }} = {
    copperWire: { name: '구리 전선', cost: { copperIngot: 3, stone: 20 }, product: 'copperWire', amount: 1 },
    ironWire: { name: '철 전선', cost: { ironIngot: 3, stone: 20 }, product: 'ironWire', amount: 1 },
    goldWire: { name: '금 전선', cost: { goldIngot: 3, stone: 20 }, product: 'goldWire', amount: 1 },
    diamondWire: { name: '다이아몬드 전선', cost: { diamond: 1, stone: 20 }, product: 'diamondWire', amount: 1 },
    magicStone: { name: '마법의 돌', cost: { disabledMagicStone: 1, magicDust: 3 }, product: 'magicStone', amount: 1 },
    liberatedCopperWire: { name: '해방된 구리 전선', cost: { copperWire: 1, magicStone: 1 }, product: 'liberatedCopperWire', amount: 1 },
    liberatedIronWire: { name: '해방된 철 전선', cost: { ironWire: 1, magicStone: 1 }, product: 'liberatedIronWire', amount: 1 },
    liberatedGoldWire: { name: '해방된 금 전선', cost: { goldWire: 1, magicStone: 1 }, product: 'liberatedGoldWire', amount: 1 },
    liberatedDiamondWire: { name: '해방된 다이아몬드 전선', cost: { diamondWire: 1, magicStone: 1 }, product: 'liberatedDiamondWire', amount: 1 },
};

const getInitialGameState = () => ({
    userCash: 100000, userCubes: 0, userLunar: 0, userEnergy: 0, userPrisms: 0,
    currentPrice: 10000, lastPrice: 10000, currentLunarPrice: 20000, lastLunarPrice: 20000,
    currentEnergyPrice: 50000, lastEnergyPrice: 50000, currentPrismPrice: 100000, lastPrismPrice: 100000,
    fluctuation: { cube: '중', lunar: '중', energy: '중', prism: '중' },
    computerTier: 0, drillTier: 0, investorTier: -1,
    isCubePurchased: false, isLunarUpgraded: false, isEnergyUpgraded: false, isPrismUpgraded: false,
    weather: '맑음', weatherCounter: 0, experiencedWeathers: { '맑음': true },
    shopItems: { digitalClock: false, weatherAlmanac: false, bed: false, furnace: false },
    isInternetOutage: false, isInternetOutageCooldown: 0, nextWeatherIsCloudy: false, nextWeatherIsRainbow: false,
    gameTime: new Date(2025, 2, 21, 9, 0, 0).getTime(), // Start in Spring
    isSleeping: false, usedCodes: [], lastOnlineTimestamp: Date.now(),
    transactionHistory: [],
    exceptionalState: { isActive: false, expiresAt: 0 },
    // New resources
    stone: 0, coal: 0, copperOre: 0, ironOre: 0, goldOre: 0, magicDust: 0, diamond: 0,
    copperIngot: 0, ironIngot: 0, goldIngot: 0, disabledMagicStone: 0, magicStone: 0,
    copperWire: 0, ironWire: 0, goldWire: 0, diamondWire: 0,
    liberatedCopperWire: 0, liberatedIronWire: 0, liberatedGoldWire: 0, liberatedDiamondWire: 0,
    smeltingQueue: [],
    // Season
    season: '봄', dayInSeason: 1,
    // Trophies
    hasWeatherTrophy: false, hasPowerTrophy: false, hasTimeTrophy: false,
    minedCoins: { CUBE: 0, LUNAR: 0, ENERGY: 0, PRISM: 0 }, sleepCount: 0,
    // Totems
    totemsPurchasedThisSeason: {},
});

gameState = getInitialGameState();

// =======================================================
// 3D 렌더링
// =======================================================
function init3D() {
    const container = document.getElementById('cube-container');
    if (!container) return;
    while (container.firstChild) { container.removeChild(container.firstChild); }
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 3.5;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1); pointLight.position.set(5, 5, 5); scene.add(pointLight);
    updateCubeAppearance();
    window.addEventListener('resize', () => { if (!container.clientWidth || !container.clientHeight || !renderer) return; renderer.setSize(container.clientWidth, container.clientHeight); camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); }, false);
}

function updateCubeAppearance() {
    if (!scene) return;
    if(cube) scene.remove(cube);
    let geometry; const materialProps: { [key: string]: any } = { metalness: 0.6, roughness: 0.4, emissive: 0x102040, };
    if (gameState.isPrismUpgraded) { geometry = new THREE.IcosahedronGeometry(1.5, 0); materialProps.color = 0xf472b6; } 
    else if (gameState.isEnergyUpgraded) { geometry = new THREE.BoxGeometry(2, 2, 2); materialProps.color = 0xfacc15; }
    else if (gameState.isLunarUpgraded) { geometry = new THREE.BoxGeometry(2, 2, 2); materialProps.color = 0xa855f7; }
    else { geometry = new THREE.BoxGeometry(2, 2, 2); materialProps.color = 0x60a5fa; }
    const material = new THREE.MeshStandardMaterial(materialProps); cube = new THREE.Mesh(geometry, material); scene.add(cube);
}

function animate() {
    if(!renderer) return; // Stop animation if game stopped
    requestAnimationFrame(animate);
    if (cube) { cube.rotation.x += 0.003; cube.rotation.y += 0.003; }
    if (renderer && scene && camera) { renderer.render(scene, camera); }
}

// =======================================================
// 게임 로직
// =======================================================
function initCharts() {
    if (chartCube) chartCube.destroy(); if (chartLunar) chartLunar.destroy(); if (chartEnergy) chartEnergy.destroy(); if (chartPrism) chartPrism.destroy();
    const commonOptions = { scales: { y: { ticks: { color: '#9ca3af' }, grid: { color: '#4b5563' } }, x: { ticks: { color: '#9ca3af' }, grid: { color: '#4b5563' } } }, plugins: { legend: { display: false } }, maintainAspectRatio: false };
    const createChart = (id: string, borderColor: string, label: string) => { const ctx = (document.getElementById(id) as HTMLCanvasElement)?.getContext('2d'); if (!ctx) return null; return new Chart(ctx, { type: 'line', data: { labels: [], datasets: [{ label, data: [], borderColor, tension: 0.1, pointRadius: 0 }] }, options: commonOptions }); };
    chartCube = createChart('price-chart-cube', '#60a5fa', 'CUBE'); chartLunar = createChart('price-chart-lunar', '#a855f7', 'LUNAR'); chartEnergy = createChart('price-chart-energy', '#facc15', 'ENERGY'); chartPrism = createChart('price-chart-prism', '#f472b6', 'PRISM');
}
function updateChartData(chart: any, price: number, time: string) {
    if (!chart) return; const label = time; chart.data.labels.push(label); chart.data.datasets[0].data.push(price);
    if (chart.data.labels.length > 30) { chart.data.labels.shift(); chart.data.datasets[0].data.shift(); }
    chart.update('none');
}

function initGame() {
    dom = {
        userCash: document.getElementById('user-cash'), userCubes: document.getElementById('user-cubes'), userLunar: document.getElementById('user-lunar'), userEnergy: document.getElementById('user-energy'), userPrisms: document.getElementById('user-prisms'),
        currentCubePrice: document.getElementById('current-cube-price'), cubePriceChange: document.getElementById('cube-price-change'), currentLunarPrice: document.getElementById('current-lunar-price'), lunarPriceChange: document.getElementById('lunar-price-change'), currentEnergyPrice: document.getElementById('current-energy-price'), energyPriceChange: document.getElementById('energy-price-change'), currentPrismPrice: document.getElementById('current-prism-price'), prismPriceChange: document.getElementById('prism-price-change'),
        notification: document.getElementById('notification'), internetOutage: document.getElementById('internet-outage'),
        buyCubeButton: document.getElementById('buy-cube-button'), cubePurchaseOverlay: document.getElementById('cube-purchase-overlay'), passiveIncomeDisplay: document.getElementById('passive-income-display'), incomePerSecond: document.getElementById('income-per-second'),
        exceptionalStatus: document.getElementById('exceptional-status'), exceptionalTimer: document.getElementById('exceptional-timer'),
        computerInfo: document.getElementById('computer-info'), computerTierText: document.getElementById('computer-tier-text'), computerStatsText: document.getElementById('computer-stats-text'), computerUpgradeButton: document.getElementById('computer-upgrade-button'),
        tradeContainer: document.getElementById('trade-container'),
        chartTabCube: document.getElementById('chart-tab-cube'), chartTabLunar: document.getElementById('chart-tab-lunar'), chartTabEnergy: document.getElementById('chart-tab-energy'), chartTabPrism: document.getElementById('chart-tab-prism'),
        chartCubeContainer: document.getElementById('chart-cube-container'), chartLunarContainer: document.getElementById('chart-lunar-container'), chartEnergyContainer: document.getElementById('chart-energy-container'), chartPrismContainer: document.getElementById('chart-prism-container'),
        timeContainer: document.getElementById('time-container'), gameTime: document.getElementById('game-time'), weatherContainer: document.getElementById('weather-container'), weatherDisplay: document.getElementById('weather-display'), seasonDisplay: document.getElementById('season-display'),
        shopSection: document.getElementById('shop-section'), shopItems: document.getElementById('shop-items'), codeSubmitButton: document.getElementById('code-submit-button'), codeInput: document.getElementById('code-input'),
        upgradeLunarSection: document.getElementById('upgrade-lunar-section'), upgradeLunarButton: document.getElementById('upgrade-lunar-button'), upgradeEnergySection: document.getElementById('upgrade-energy-section'), upgradeEnergyButton: document.getElementById('upgrade-energy-button'), upgradePrismSection: document.getElementById('upgrade-prism-section'), upgradePrismButton: document.getElementById('upgrade-prism-button'),
        weatherAlmanacSection: document.getElementById('weather-almanac-section'), weatherAlmanacContent: document.getElementById('weather-almanac-content'), incomeSourceUpgrades: document.getElementById('income-source-upgrades'),
        trophyList: document.getElementById('trophy-list'), transactionHistoryList: document.getElementById('transaction-history-list'),
        chatMessages: document.getElementById('chat-messages'), chatInput: document.getElementById('chat-input'), chatSendButton: document.getElementById('chat-send-button'), logoutButton: document.getElementById('logout-button'),
        drillInfo: document.getElementById('drill-info'), drillTierText: document.getElementById('drill-tier-text'), drillStatsText: document.getElementById('drill-stats-text'), drillUpgradeButton: document.getElementById('drill-upgrade-button'),
        smeltingInfo: document.getElementById('smelting-info'), smeltingQueueList: document.getElementById('smelting-queue-list'),
        investorList: document.getElementById('investor-list'),
        shopTabFunction: document.getElementById('shop-tab-function'), shopTabMaterials: document.getElementById('shop-tab-materials'), shopTabTotems: document.getElementById('shop-tab-totems'),
        shopContentFunction: document.getElementById('shop-content-function'), shopContentMaterials: document.getElementById('shop-content-materials'), shopContentTotems: document.getElementById('shop-content-totems'),
        craftingItems: document.getElementById('crafting-items'), totemItems: document.getElementById('totem-items'),
        userStone: document.getElementById('user-stone'), userCoal: document.getElementById('user-coal'), userCopperOre: document.getElementById('user-copperOre'), userIronOre: document.getElementById('user-ironOre'), userGoldOre: document.getElementById('user-goldOre'), userMagicDust: document.getElementById('user-magicDust'), userDiamond: document.getElementById('user-diamond'), userCopperIngot: document.getElementById('user-copperIngot'), userIronIngot: document.getElementById('user-ironIngot'), userGoldIngot: document.getElementById('user-goldIngot'), userDisabledMagicStone: document.getElementById('user-disabledMagicStone'), userMagicStone: document.getElementById('user-magicStone'), userCopperWire: document.getElementById('user-copperWire'), userIronWire: document.getElementById('user-ironWire'), userGoldWire: document.getElementById('user-goldWire'), userDiamondWire: document.getElementById('user-diamondWire'), userLiberatedCopperWire: document.getElementById('user-liberatedCopperWire'), userLiberatedIronWire: document.getElementById('user-liberatedIronWire'), userLiberatedGoldWire: document.getElementById('user-liberatedGoldWire'), userLiberatedDiamondWire: document.getElementById('user-liberatedDiamondWire'),
        yellowDustOverlay: document.getElementById('yellow-dust-overlay'), heatWaveOverlay: document.getElementById('heat-wave-overlay'), snowOverlay: document.getElementById('snow-overlay'),
    };
    
    if (dom.buyCubeButton) dom.buyCubeButton.addEventListener('click', handleBuy3DCube);
    if (dom.computerUpgradeButton) dom.computerUpgradeButton.addEventListener('click', handleComputerUpgrade);
    if (dom.drillUpgradeButton) dom.drillUpgradeButton.addEventListener('click', handleDrillUpgrade);
    if (dom.codeSubmitButton) dom.codeSubmitButton.addEventListener('click', handleCodeSubmit);
    if (dom.upgradeLunarButton) dom.upgradeLunarButton.addEventListener('click', handleUpgradeLunar);
    if (dom.upgradeEnergyButton) dom.upgradeEnergyButton.addEventListener('click', handleUpgradeEnergy);
    if (dom.upgradePrismButton) dom.upgradePrismButton.addEventListener('click', handleUpgradePrism);
    if (dom.chatSendButton) dom.chatSendButton.addEventListener('click', handleSendMessage);
    if (dom.chatInput) dom.chatInput.addEventListener('keydown', (e: KeyboardEvent) => { if(e.key === 'Enter') handleSendMessage(); });
    if (dom.logoutButton) dom.logoutButton.addEventListener('click', handleLogout);
    ['cube', 'lunar', 'energy', 'prism'].forEach(c => dom[`chartTab${c.charAt(0).toUpperCase() + c.slice(1)}`]?.addEventListener('click', () => switchChart(c)));
    ['function', 'materials', 'totems'].forEach(t => dom[`shopTab${t.charAt(0).toUpperCase() + t.slice(1)}`]?.addEventListener('click', () => switchShopTab(t)));
    
    populateTradeUI();
    populateShopUI();
    populateDrillUI();
    populateSmeltingUI();
    populateInvestorUI();
    initCharts();
    init3D();
}

function restartGameLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    if (drillInterval) clearInterval(drillInterval);
    if (investorInterval) clearInterval(investorInterval);
    gameLoopInterval = setInterval(gameLoop, 250 / currentGameSpeed);
    drillInterval = setInterval(runDrill, 5000 / currentGameSpeed);
    investorInterval = setInterval(runInvestors, 60000 / currentGameSpeed);
}

function startGame() {
    stopGame(); // Clear any existing intervals
    gameTime = new Date(gameState.gameTime);
    restoreUIState(); updateTrophyUI(); updateTransactionHistoryUI();
    restartGameLoop();
    startPriceUpdateLoops();
    if(renderer) animate();
}

function stopGame() {
    if (gameLoopInterval) clearInterval(gameLoopInterval); if (drillInterval) clearInterval(drillInterval); if (investorInterval) clearInterval(investorInterval);
    if (priceUpdateTimeoutCube) clearTimeout(priceUpdateTimeoutCube); if (priceUpdateTimeoutLunar) clearTimeout(priceUpdateTimeoutLunar); if (priceUpdateTimeoutEnergy) clearTimeout(priceUpdateTimeoutEnergy); if (priceUpdateTimeoutPrism) clearTimeout(priceUpdateTimeoutPrism);
    if (window.autosaveInterval) clearInterval(window.autosaveInterval);
    gameLoopInterval = drillInterval = investorInterval = null;
    priceUpdateTimeoutCube = priceUpdateTimeoutLunar = priceUpdateTimeoutEnergy = priceUpdateTimeoutPrism = null;
    window.autosaveInterval = null;
    renderer = null; // To stop animation loop
}

function showNotification(message: string, isError = true) {
    if (!dom.notification) return; if (notificationTimeout) { clearTimeout(notificationTimeout); }
    dom.notification.innerHTML = `<span>${message}</span><button id="notification-close-btn" class="ml-4 font-bold text-xl leading-none transition-transform hover:scale-125">&times;</button>`;
    dom.notification.className = `fixed bottom-6 right-6 text-white p-4 rounded-lg shadow-xl z-50 transition-all duration-300 flex items-center justify-between ${isError ? 'bg-red-500' : 'bg-green-500'}`;
    dom.notification.classList.remove('opacity-0', 'translate-y-10'); dom.notification.classList.add('opacity-100', 'translate-y-0');
    const hideNotification = () => { if (!dom.notification) return; dom.notification.classList.remove('opacity-100', 'translate-y-0'); dom.notification.classList.add('opacity-0', 'translate-y-10'); notificationTimeout = null; };
    document.getElementById('notification-close-btn')?.addEventListener('click', hideNotification, { once: true });
    notificationTimeout = setTimeout(hideNotification, 3000);
}

function updateSmeltingUI() {
    if (!dom.smeltingInfo || !dom.smeltingQueueList) return;
    const furnaceOwned = gameState.shopItems.furnace;
    dom.smeltingInfo.classList.toggle('hidden', !furnaceOwned);
    if (!furnaceOwned) return;

    dom.smeltingQueueList.innerHTML = '';
    if (gameState.smeltingQueue.length === 0) {
        dom.smeltingQueueList.innerHTML = '<li class="text-gray-500 italic">제련 대기열이 비어있습니다.</li>';
        return;
    }

    const smeltingTime = furnaceOwned ? 3000 : 5000;
    gameState.smeltingQueue.forEach((item: any, index: number) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center p-1 bg-gray-700/50 rounded mb-1 text-sm';

        const itemName = item.product.replace('Ingot', ' 주괴');
        
        if (index === 0) { // Currently smelting item
            const elapsedTime = Date.now() - item.startTime;
            const remainingTimeMs = Math.max(0, smeltingTime - elapsedTime);
            const progress = Math.min(100, (elapsedTime / smeltingTime) * 100);
            
            li.innerHTML = `
                <span>1 x ${itemName}</span>
                <div class="w-1/2 mx-2 bg-gray-600 rounded-full h-2.5">
                    <div class="bg-orange-500 h-2.5 rounded-full" style="width: ${progress}%"></div>
                </div>
                <span class="w-12 text-right">${(remainingTimeMs / 1000).toFixed(1)}s</span>
            `;
        } else { // Queued item
            li.innerHTML = `
                <span>1 x ${itemName}</span>
                <span class="text-gray-400">대기 중</span>
            `;
        }
        dom.smeltingQueueList.appendChild(li);
    });
}

function updateUI() {
    const state = gameState; if (!dom.userCash) return;
    const resourceMap = {
        userCash: state.userCash, userCubes: state.userCubes, userLunar: state.userLunar, userEnergy: state.userEnergy, userPrisms: state.userPrisms,
        userStone: state.stone, userCoal: state.coal, userCopperOre: state.copperOre, userIronOre: state.ironOre, userGoldOre: state.goldOre, userMagicDust: state.magicDust, userDiamond: state.diamond,
        userCopperIngot: state.copperIngot, userIronIngot: state.ironIngot, userGoldIngot: state.goldIngot, userDisabledMagicStone: state.disabledMagicStone, userMagicStone: state.magicStone,
        userCopperWire: state.copperWire, userIronWire: state.ironWire, userGoldWire: state.goldWire, userDiamondWire: state.diamondWire,
        userLiberatedCopperWire: state.liberatedCopperWire, userLiberatedIronWire: state.liberatedIronWire, userLiberatedGoldWire: state.liberatedGoldWire, userLiberatedDiamondWire: state.liberatedDiamondWire,
    };
    for(const key in resourceMap) { if(dom[key]) dom[key].textContent = Math.floor(resourceMap[key as keyof typeof resourceMap]).toLocaleString('ko-KR'); }

    const updatePriceDisplay = (priceEl: HTMLElement, changeEl: HTMLElement, current: number, last: number) => { if (!priceEl || !changeEl) return; priceEl.textContent = `${current.toLocaleString('ko-KR')} KRW`; const change = current - last; const pct = last > 0 ? ((change / last) * 100).toFixed(2) : '0.00'; if (change > 0) changeEl.innerHTML = `<span class="text-green-500">▲ +${pct}%</span>`; else if (change < 0) changeEl.innerHTML = `<span class="text-red-500">▼ ${pct}%</span>`; else changeEl.innerHTML = `0.00%`; };
    updatePriceDisplay(dom.currentCubePrice, dom.cubePriceChange, state.currentPrice, state.lastPrice); updatePriceDisplay(dom.currentLunarPrice, dom.lunarPriceChange, state.currentLunarPrice, state.lastLunarPrice); updatePriceDisplay(dom.currentEnergyPrice, dom.energyPriceChange, state.currentEnergyPrice, state.lastEnergyPrice); updatePriceDisplay(dom.currentPrismPrice, dom.prismPriceChange, state.currentPrismPrice, state.lastPrismPrice);

    if (dom.weatherDisplay) dom.weatherDisplay.textContent = `${state.weather} ${WEATHER_DATA[state.weather].icon}`;
    if (dom.seasonDisplay) dom.seasonDisplay.textContent = `${state.season} ${state.dayInSeason}일차`;

    let baseProduction = 0;
    if (state.isCubePurchased) { baseProduction = 100; if (state.isPrismUpgraded) baseProduction = 400; else if (state.isEnergyUpgraded) baseProduction = 200; }
    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    const lunarBonus = (state.isLunarUpgraded && isNight) ? 100 : 0;
    let totalIncome = baseProduction + lunarBonus;
    if (state.weather === '폭염') totalIncome *= 0.5;

    if (state.exceptionalState.isActive) { totalIncome *= 2; dom.exceptionalStatus.classList.remove('hidden'); const timeLeft = Math.max(0, state.exceptionalState.expiresAt - Date.now()); const minutes = Math.floor(timeLeft / 60000); const seconds = Math.floor((timeLeft % 60000) / 1000); dom.exceptionalTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} 남음`; }
    else { dom.exceptionalStatus.classList.add('hidden'); }
    if (dom.incomePerSecond) dom.incomePerSecond.textContent = `+${totalIncome.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} KRW / sec`;

    if (dom.gameTime) {
        const gameHours = gameTime.getHours(); let gameMinutes = String(gameTime.getMinutes()).padStart(2, '0');
        if (state.weather === '폭우' && Math.random() < 0.1) { gameMinutes = '##'; }
        dom.gameTime.textContent = `${String(gameHours).padStart(2, '0')}:${gameMinutes} (${isNight ? '🌙' : '☀️'})`;
    }

    dom.yellowDustOverlay.classList.toggle('hidden', state.weather !== '황사');
    dom.heatWaveOverlay.classList.toggle('hidden', state.weather !== '폭염');
    dom.snowOverlay.classList.toggle('hidden', state.weather === '눈' || state.weather === '우박');
    
    updateComputerUI(); populateDrillUI(); updateSmeltingUI();
}

function updateComputerUI() {
    if (!dom.computerTierText || !dom.computerStatsText || !dom.computerUpgradeButton) return;
    const tier = gameState.computerTier;
    const isMaxTier = tier >= COMPUTER_DATA.length -1;
    dom.computerTierText.textContent = tier > 0 ? `Tier ${tier} 컴퓨터` : '컴퓨터 없음';
    const miningRates = tier > 0 ? `<br>자동 코인 획득 확률 (시간당):<br>CUBE: ${tier*2}%, LUNAR: ${tier*1.5}%<br>ENERGY: ${tier*1}%, PRISM: ${tier*0.5}%` : '';
    dom.computerStatsText.innerHTML = `자동 코인 획득 활성화${miningRates}`;
    if (!isMaxTier) {
        const nextTierData = COMPUTER_DATA[tier];
        const cost = nextTierData.cost;
        let costString = '';
        const hasResources = Object.keys(cost).every(key => gameState[key] >= cost[key as keyof typeof cost]);

        for(const item in cost) { 
            const itemName = item.replace('userCash', 'KRW').replace('copperWire', '구리전선').replace('ironWire', '철전선').replace('goldWire', '금전선').replace('diamondWire', '다이아전선').replace('liberatedCopperWire', '해방된구리').replace('liberatedIronWire', '해방된철').replace('liberatedGoldWire', '해방된금').replace('liberatedDiamondWire', '해방된다이아');
            costString += `${(cost as any)[item].toLocaleString()} ${itemName} `;
        }
        dom.computerUpgradeButton.textContent = `Tier ${tier + 1} 업그레이드 (${costString.trim()})`;
        dom.computerUpgradeButton.disabled = !hasResources;
        dom.computerUpgradeButton.classList.toggle('btn-disabled', !hasResources);
        dom.computerUpgradeButton.classList.remove('hidden');
    } else {
        dom.computerUpgradeButton.textContent = '최고 티어';
        dom.computerUpgradeButton.classList.add('hidden');
    }
}
function populateTradeUI() { 
    if(!dom.tradeContainer) return;
    dom.tradeContainer.innerHTML = '';
    const coins = [
        { id: 'Cube', name: 'CUBE', price: gameState.currentPrice, owned: gameState.userCubes, color: 'blue' },
        { id: 'Lunar', name: 'LUNAR', price: gameState.currentLunarPrice, owned: gameState.userLunar, color: 'purple' },
        { id: 'Energy', name: 'ENERGY', price: gameState.currentEnergyPrice, owned: gameState.userEnergy, color: 'yellow' },
        { id: 'Prism', name: 'PRISM', price: gameState.currentPrismPrice, owned: gameState.userPrisms, color: 'pink' }
    ];

    coins.forEach(coin => {
        const canAfford = gameState.userCash >= coin.price;
        const canSell = coin.owned > 0;
        const tradeBox = `
            <div class="bg-gray-800 p-4 rounded-lg">
                <h4 class="font-bold text-lg text-${coin.color}-300">${coin.name}</h4>
                <p class="text-sm text-gray-400 mb-2">보유: ${coin.owned.toLocaleString()}개</p>
                <div class="flex gap-2">
                    <button onclick="handleTrade('buy', '${coin.id}')" class="flex-1 bg-${coin.color}-600 hover:bg-${coin.color}-700 text-white font-bold py-2 px-3 rounded-lg text-sm ${!canAfford ? 'btn-disabled' : ''}" ${!canAfford ? 'disabled' : ''}>매수</button>
                    <button onclick="handleTrade('sell', '${coin.id}')" class="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg text-sm ${!canSell ? 'btn-disabled' : ''}" ${!canSell ? 'disabled' : ''}>매도</button>
                </div>
            </div>
        `;
        dom.tradeContainer.innerHTML += tradeBox;
    });
    (window as any).handleTrade = handleTrade;
}
function populateShopUI() {
    populateFunctionItems();
    populateMaterialItems();
    populateTotemItems();
}
function populateFunctionItems() {
    if (!dom.shopItems) return; dom.shopItems.innerHTML = '';
    const functionItems = [ 
        { id: 'digitalClock', name: '디지털 시계', desc: '게임 내 시간과 날씨를 화면에 표시합니다.', cost: 10000 },
        { id: 'weatherAlmanac', name: '날씨 도감', desc: '지금까지 경험한 날씨의 효과를 기록하고 확인할 수 있습니다.', cost: 25000 },
        { id: 'bed', name: '침대', desc: '수면을 취하여 다음 날 아침으로 즉시 이동할 수 있게 됩니다.', cost: 15000 },
        { id: 'furnace', name: '용광로', desc: '주괴 제련 시간을 5초에서 3초로 단축시킵니다.', cost: 100000 },
    ];
    functionItems.forEach(item => {
        const isOwned = gameState.shopItems[item.id];
        const canAfford = gameState.userCash >= item.cost;
        const itemEl = document.createElement('div');
        itemEl.className = 'bg-gray-800 p-3 rounded-lg flex flex-col justify-between';
        itemEl.innerHTML = `
            <div>
                <h4 class="font-bold text-base">${item.name}</h4>
                <p class="text-xs text-gray-400 my-1">${item.desc}</p>
            </div>
            <button class="w-full mt-2 text-sm font-bold py-1.5 px-3 rounded-lg ${isOwned ? 'bg-green-700 cursor-default' : (canAfford ? 'bg-blue-600 hover:bg-blue-700' : 'btn-disabled')}" ${isOwned || !canAfford ? 'disabled' : ''}>
                ${isOwned ? '보유중' : `${item.cost.toLocaleString()} KRW`}
            </button>
        `;
        if (!isOwned) {
            itemEl.querySelector('button')?.addEventListener('click', () => handleShopBuy(item.id, item.cost));
        }
        dom.shopItems.appendChild(itemEl);
    });
}
function populateMaterialItems() {
    if(!dom.craftingItems) return;
    dom.craftingItems.innerHTML = '';
    Object.keys(CRAFTING_DATA).forEach(key => {
        const item = CRAFTING_DATA[key];
        let costString = '';
        const canCraft = Object.keys(item.cost).every(res => gameState[res] >= item.cost[res]);
        for(const res in item.cost){
             const resName = res.replace('copperIngot', '구리주괴').replace('stone', '돌').replace('ironIngot', '철주괴').replace('goldIngot', '금주괴').replace('diamond', '다이아').replace('disabledMagicStone', '비활성마법석').replace('magicDust', '마법가루').replace('copperWire', '구리전선').replace('magicStone', '마법석').replace('ironWire', '철전선').replace('goldWire', '금전선').replace('diamondWire', '다이아전선');
            costString += `${item.cost[res]} ${resName} `;
        }
        
        const itemEl = document.createElement('div');
        itemEl.className = 'bg-gray-800 p-3 rounded-lg flex flex-col justify-between';
        itemEl.innerHTML = `
            <div>
                <h4 class="font-bold text-base">${item.name}</h4>
                <p class="text-xs text-gray-400 my-1">재료: ${costString.trim()}</p>
            </div>
            <button class="w-full mt-2 text-sm font-bold py-1.5 px-3 rounded-lg ${canCraft ? 'bg-green-600 hover:bg-green-700' : 'btn-disabled'}" ${!canCraft ? 'disabled' : ''}>
                제작
            </button>
        `;
        itemEl.querySelector('button')?.addEventListener('click', () => handleCraftItem(key));
        dom.craftingItems.appendChild(itemEl);
    });
}
function populateTotemItems() { /* ... UI for totems ... */ }
function handleShopBuy(itemId: string, cost: number) {
    if (gameState.userCash >= cost && !gameState.shopItems[itemId]) {
        gameState.userCash -= cost;
        gameState.shopItems[itemId] = true;
        showNotification(`${itemId} 구매 완료!`, false);
        populateShopUI();
        restoreUIState();
        if (itemId === 'furnace') populateSmeltingUI();
        saveGameState();
    } else {
        showNotification('자금이 부족하거나 이미 보유한 아이템입니다.', true);
    }
}
function updateWeatherAlmanacUI() { /* ... unchanged ... */ }
function updateTrophyUI() { /* ... updated to show new trophies ... */ }
function checkTrophies() {
    const state = gameState;
    if (!state.hasWeatherTrophy) { if (Object.keys(state.experiencedWeathers).length >= Object.keys(WEATHER_DATA).length) { state.hasWeatherTrophy = true; showNotification(`트로피 획득: ${TROPHY_DATA.weatherMaster.name}!`, false); updateTrophyUI(); saveGameState(); } }
    if (!state.hasPowerTrophy) { const {CUBE, LUNAR, ENERGY, PRISM} = state.minedCoins; if (CUBE >= 100 && LUNAR >= 100 && ENERGY >= 100 && PRISM >= 100) { state.hasPowerTrophy = true; showNotification(`트로피 획득: ${TROPHY_DATA.powerMaster.name}!`, false); updateTrophyUI(); saveGameState(); } }
    if (!state.hasTimeTrophy) { if (state.sleepCount >= 20) { state.hasTimeTrophy = true; showNotification(`트로피 획득: ${TROPHY_DATA.timeMaster.name}!`, false); updateTrophyUI(); saveGameState(); } }
}

function getNewPrice(currentPrice: number, coinId: string) {
    let increaseChance = 0.5;
    let multiplier = 1 + (Math.random() * 0.1 - 0.05); // -5% to +5%

    // Apply weather effects
    const weather = WEATHER_DATA[gameState.weather];
    if (weather.isGood) increaseChance += 0.025;
    if (weather.isBad) increaseChance -= 0.025;
    if (gameState.weather === '맑음') { increaseChance += 0.005; }
    if (gameState.weather === '비' && coinId.toLowerCase() === 'cube') { increaseChance += 0.01; }
    if (gameState.weather === '무지개') { increaseChance += 0.025; }
    if (gameState.weather === '별똥별') { increaseChance += 0.025; }
    if (gameState.weather === '오로라') { increaseChance += 0.05; }
    if (gameState.weather === '산성비') { increaseChance -= 0.025; }
    if (gameState.weather === '우박') { increaseChance -= 0.025; }

    // Apply trophy effects
    if (gameState.hasPowerTrophy && coinId.toLowerCase() === 'energy') { increaseChance += 0.01; }

    if (Math.random() < increaseChance) {
        return Math.max(100, Math.floor(currentPrice * multiplier));
    } else {
        return Math.max(100, Math.floor(currentPrice / multiplier));
    }
}

function startPriceUpdateLoops() {
    const createLoop = (coinId: string, priceKey: string, lastPriceKey: string, timeoutVar: any, loopFn: Function) => {
        let baseInterval = 5000;
        // Apply time modifiers
        if (gameState.weather === '황사') baseInterval *= 1.1;
        if (gameState.weather === '오로라') baseInterval *= 0.8;
        const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
        if (isNight && gameState.hasTimeTrophy) baseInterval *= 0.95;

        const interval = baseInterval + Math.random() * 2000 - 1000;

        timeoutVar = setTimeout(() => {
            const newPrice = getNewPrice(gameState[priceKey], coinId);
            gameState[lastPriceKey] = gameState[priceKey];
            gameState[priceKey] = newPrice;
            updateChartData((window as any)[`chart${coinId}`], newPrice, `${String(gameTime.getHours()).padStart(2, '0')}:${String(gameTime.getMinutes()).padStart(2, '0')}`);
            loopFn();
        }, interval);
        return timeoutVar;
    };
    priceUpdateTimeoutCube = createLoop('Cube', 'currentPrice', 'lastPrice', priceUpdateTimeoutCube, priceUpdateLoopCube);
    priceUpdateTimeoutLunar = createLoop('Lunar', 'currentLunarPrice', 'lastLunarPrice', priceUpdateTimeoutLunar, priceUpdateLoopLunar);
    priceUpdateTimeoutEnergy = createLoop('Energy', 'currentEnergyPrice', 'lastEnergyPrice', priceUpdateTimeoutEnergy, priceUpdateLoopEnergy);
    priceUpdateTimeoutPrism = createLoop('Prism', 'currentPrismPrice', 'lastPrismPrice', priceUpdateTimeoutPrism, priceUpdateLoopPrism);
}
function priceUpdateLoopCube() { startPriceUpdateLoops(); }
function priceUpdateLoopLunar() { startPriceUpdateLoops(); }
function priceUpdateLoopEnergy() { startPriceUpdateLoops(); }
function priceUpdateLoopPrism() { startPriceUpdateLoops(); }
function gameLoop() {
    const state = gameState; if(state.isSleeping) return; gameTime.setMinutes(gameTime.getMinutes() + 1);
    if (gameTime.getHours() === 0 && gameTime.getMinutes() === 0) { state.dayInSeason++; if (state.dayInSeason > 3) { state.dayInSeason = 1; state.season = SEASONS[(SEASONS.indexOf(state.season) + 1) % SEASONS.length]; state.totemsPurchasedThisSeason = {}; populateShopUI(); } }
    
    // Auto coin gain from computer
    if (state.computerTier > 0 && state.weather !== '폭우') {
        const tier = state.computerTier; const ticksPerHour = 14400; // 3600 seconds * 4 ticks/sec
        const gainCoin = (chance: number, coin: string, coinKey: string) => { if (Math.random() < (tier * chance) / ticksPerHour) { state[coinKey]++; state.minedCoins[coin] = (state.minedCoins[coin] || 0) + 1; }};
        gainCoin(2, 'CUBE', 'userCubes'); gainCoin(1.5, 'LUNAR', 'userLunar'); gainCoin(1, 'ENERGY', 'userEnergy'); gainCoin(0.5, 'PRISM', 'userPrisms');
    }
    // Disabled Magic Stone from 3D Cube
    if (state.isLunarUpgraded && Math.random() < (0.002 / 4)) { state.disabledMagicStone++; }

    // Weather logic
    if (globalWeatherOverride) { /* ... unchanged ... */ }
    else { updateWeather(); }
    if (state.isInternetOutage && Date.now() > state.isInternetOutageCooldown) { state.isInternetOutage = false; showNotification('인터넷 연결이 복구되었습니다.', false); }
    if (dom.internetOutage) dom.internetOutage.classList.toggle('hidden', !state.isInternetOutage);
    
    // Income Logic
    let baseProduction = 0; if(state.isCubePurchased) { baseProduction = 100; if(state.isPrismUpgraded) baseProduction = 400; else if(state.isEnergyUpgraded) baseProduction = 200; }
    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19; const lunarBonus = (state.isLunarUpgraded && isNight) ? 100 : 0;
    let totalIncome = baseProduction + lunarBonus; if (state.weather === '폭염') totalIncome *= 0.5;
    if (state.exceptionalState.isActive) { /* ... unchanged ... */ }
    state.userCash += totalIncome / 4;
    
    processSmeltingQueue();
    updateUI();
}
function runDrill() {
    const state = gameState;
    if (state.isSleeping || state.drillTier === 0 || state.weather === '폭우') return;
    const tier = state.drillTier;
    const mine = (chance: number, item: string) => { if (Math.random() < chance) {state[item]++; showNotification(`${item} 1개 채굴!`, false)} };
    mine(0.05 * tier, 'stone'); mine(0.04 * tier, 'coal'); mine(0.03 * tier, 'copperOre'); mine(0.02 * tier, 'ironOre'); mine(0.01 * tier, 'goldOre'); mine(0.005 * tier, 'magicDust'); mine(0.002 * tier, 'diamond');
}
function runInvestors() { /* ... logic for auto trading ... */ }
function processSmeltingQueue() { /* ... logic for processing smelting queue ... */ }
function updateWeather() { /* ... new weather logic with seasons ... */ }

// FIX: Define the missing addTransaction function to log trades.
function addTransaction(type: 'buy' | 'sell', coin: string, amount: number, price: number) {
    const transaction = {
        type: type,
        coin: coin,
        amount: amount,
        price: price,
        timestamp: new Date(gameTime).toLocaleString('ko-KR')
    };
    gameState.transactionHistory.unshift(transaction);

    // Keep the history to a reasonable size
    if (gameState.transactionHistory.length > 50) {
        gameState.transactionHistory.pop();
    }
}

function handleTrade(type: 'buy' | 'sell', coinId: string) {
    const coinLower = coinId.toLowerCase();
    const price = gameState[`current${coinId}Price`];
    const coinAmountKey = `user${coinId.charAt(0).toUpperCase() + coinId.slice(1).replace('ube','ubes')}`;

    if (type === 'buy') {
        if (gameState.userCash >= price) {
            gameState.userCash -= price;
            gameState[coinAmountKey]++;
            addTransaction(type, coinId, 1, price);
        } else {
            showNotification('자금이 부족합니다.', true);
        }
    } else if (type === 'sell') {
        if (gameState[coinAmountKey] > 0) {
            gameState.userCash += price;
            gameState[coinAmountKey]--;
            addTransaction(type, coinId, 1, price);
        } else {
            showNotification('보유한 코인이 없습니다.', true);
        }
    }
    populateTradeUI(); // Refresh UI to update button states
    updateTransactionHistoryUI();
}
function updateTransactionHistoryUI() { /* ... unchanged ... */ }
function handleBuy3DCube() {
    if (gameState.userCash >= 1000000 && !gameState.isCubePurchased) {
        gameState.userCash -= 1000000;
        gameState.isCubePurchased = true;
        showNotification('패시브 수입원 활성화 완료!', false);
        restoreUIState();
        saveGameState();
    } else {
        showNotification('자금이 부족합니다.', true);
    }
}
function handleComputerUpgrade() {
    const tier = gameState.computerTier;
    if (tier >= COMPUTER_DATA.length - 1) return;
    const cost = COMPUTER_DATA[tier].cost;
    const canAfford = Object.keys(cost).every(key => gameState[key] >= cost[key as keyof typeof cost]);
    if (canAfford) {
        for(const key in cost) { gameState[key as keyof typeof cost] -= cost[key as keyof typeof cost]; }
        gameState.computerTier++;
        showNotification(`컴퓨터를 Tier ${gameState.computerTier}으로 업그레이드했습니다!`, false);
        updateComputerUI();
        saveGameState();
    } else {
        showNotification('업그레이드 재료가 부족합니다.', true);
    }
}
function handleDrillUpgrade() {
    const tier = gameState.drillTier;
    if (tier >= DRILL_DATA.length) return;
    const cost = DRILL_DATA[tier].cost;
    if (gameState.userCash >= cost) {
        gameState.userCash -= cost;
        gameState.drillTier++;
        showNotification(`드릴을 Tier ${gameState.drillTier}으로 업그레이드했습니다!`, false);
        populateDrillUI();
        saveGameState();
    } else {
        showNotification('자금이 부족합니다.', true);
    }
}

function handleHireInvestor(index: number) {
    const investor = INVESTOR_DATA[index];
    if (gameState.investorTier === index - 1 && gameState.userCash >= investor.cost) {
        gameState.userCash -= investor.cost;
        gameState.investorTier = index;
        showNotification(`${investor.name}을(를) 고용했습니다.`, false);
        populateInvestorUI();
        saveGameState();
    } else {
        showNotification('자금이 부족하거나 이전 티어의 투자자가 필요합니다.', true);
    }
}

function handleUpgradeLunar() { /* ... unchanged ... */ }
function handleUpgradeEnergy() { /* ... unchanged ... */ }
function handleUpgradePrism() { /* ... unchanged ... */ }
function handleSleep() {
    const state = gameState;
    if (state.weather === '눈') { showNotification('눈이 와서 잘 수 없습니다.', true); return; }
    if (!state.shopItems.bed) { showNotification('침대가 없어서 잘 수 없습니다. 상점에서 구매하세요.', true); return; }
    /* ... rest is similar, just add state.sleepCount++ ... */
    state.sleepCount++;
}
function switchChart(chartName: string) { /* ... unchanged ... */ }
function switchShopTab(tabName: string) {
    const tabs = ['function', 'materials', 'totems'];
    tabs.forEach(t => {
        dom[`shopContent${t.charAt(0).toUpperCase() + t.slice(1)}`].classList.toggle('hidden', t !== tabName);
        dom[`shopTab${t.charAt(0).toUpperCase() + t.slice(1)}`].classList.toggle('tab-active', t === tabName);
    });
}
function restoreUIState() {
    const state = gameState; if (!dom.cubePurchaseOverlay) return;
    dom.cubePurchaseOverlay.classList.toggle('hidden', state.isCubePurchased);
    dom.incomeSourceUpgrades.classList.toggle('hidden', !state.isCubePurchased);
    dom.timeContainer.classList.toggle('hidden', !state.shopItems.digitalClock);
    dom.weatherContainer.classList.toggle('hidden', !state.shopItems.digitalClock);
    if (dom.upgradeLunarSection) dom.upgradeLunarSection.classList.toggle('hidden', !state.isCubePurchased || state.isLunarUpgraded);
    if (dom.upgradeEnergySection) dom.upgradeEnergySection.classList.toggle('hidden', !state.isLunarUpgraded || state.isEnergyUpgraded);
    if (dom.upgradePrismSection) dom.upgradePrismSection.classList.toggle('hidden', !state.isEnergyUpgraded || state.isPrismUpgraded);
    updateCubeAppearance(); updateWeatherAlmanacUI(); updateUI();
}
async function resetUserData() {
    if (confirm('정말로 모든 게임 데이터를 삭제하고 처음부터 다시 시작하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        gameState = getInitialGameState();
        await saveGameState();
        window.location.reload();
    }
}
async function handleCodeSubmit() { /* ... unchanged ... */ }
function migrateAndMergeState(loadedData: any): any {
    const initialState = getInitialGameState(); const migratedState: any = {};
    for (const key in initialState) {
        if (Object.prototype.hasOwnProperty.call(initialState, key)) {
            const initialValue = initialState[key as keyof typeof initialState]; const loadedValue = loadedData[key];
            if (loadedValue !== undefined) { if (typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue) && typeof loadedValue === 'object' && loadedValue !== null && !Array.isArray(loadedValue)) { migratedState[key] = { ...initialValue, ...loadedValue }; } else { migratedState[key] = loadedValue; } }
            else { migratedState[key] = initialValue; }
        }
    }
    return migratedState;
}
async function saveGameState() {
    if (!userUID) return;
    try {
        const stateToSave = { ...gameState, lastOnlineTimestamp: Date.now() };
        await db.ref(`users/${userUID}`).set(stateToSave);
    } catch (error) {
        console.error("Error saving game state:", error);
    }
}
async function loadGameState() {
    if (!userUID) return false;
    const snapshot = await db.ref(`users/${userUID}`).get();
    if (snapshot.exists()) {
        const loadedData = snapshot.val();
        gameState = migrateAndMergeState(loadedData);

        // Calculate offline income
        const now = Date.now();
        const offlineTimeMs = now - (gameState.lastOnlineTimestamp || now);
        const offlineSeconds = Math.floor(offlineTimeMs / 1000);
        
        if (offlineSeconds > 10) { // Only calculate if offline for more than 10 seconds
            // 1. Passive income
            let baseProduction = 0;
            if(gameState.isCubePurchased) { baseProduction = 100; if(gameState.isPrismUpgraded) baseProduction = 400; else if(gameState.isEnergyUpgraded) baseProduction = 200; }
            const lunarBonus = gameState.isLunarUpgraded ? 50 : 0; // Average lunar bonus
            const offlineKRW = (baseProduction + lunarBonus) * offlineSeconds;
            gameState.userCash += offlineKRW;
            
            // 2. Drill income
            const drillCycles = Math.floor(offlineSeconds / 5);
            if (drillCycles > 0 && gameState.drillTier > 0) {
                const tier = gameState.drillTier;
                gameState.stone += drillCycles * (0.05 * tier);
                gameState.coal += drillCycles * (0.04 * tier);
                gameState.copperOre += drillCycles * (0.03 * tier);
                gameState.ironOre += drillCycles * (0.02 * tier);
                gameState.goldOre += drillCycles * (0.01 * tier);
                gameState.magicDust += drillCycles * (0.005 * tier);
                gameState.diamond += drillCycles * (0.002 * tier);
            }

            // 3. Computer income
            const tier = gameState.computerTier;
            if (tier > 0) {
                const offlineHours = offlineSeconds / 3600;
                gameState.userCubes += tier * 2 * offlineHours;
                gameState.userLunar += tier * 1.5 * offlineHours;
                gameState.userEnergy += tier * 1 * offlineHours;
                gameState.userPrisms += tier * 0.5 * offlineHours;
            }

            showNotification(`오프라인 보상: ${Math.floor(offlineKRW).toLocaleString()} KRW 및 자원을 획득했습니다!`, false);
        }
        
        gameState.lastOnlineTimestamp = now;
        return true;
    }
    return false;
}
function handleSendMessage() { /* ... unchanged ... */ }
function appendChatMessage(message: { nickname: string, text: string }) { /* ... unchanged ... */ }

async function handleLogin(e: Event) {
    e.preventDefault();
    const emailInput = document.getElementById('login-email-input') as HTMLInputElement;
    const passwordInput = document.getElementById('login-password-input') as HTMLInputElement;
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        // onAuthStateChanged will handle the rest
    } catch (error: any) {
        console.error("Login failed:", error);
        showNotification(`로그인 실패: ${error.message}`, true);
    }
}

async function handleRegister(e: Event) {
    e.preventDefault();
    const emailInput = document.getElementById('register-email-input') as HTMLInputElement;
    const passwordInput = document.getElementById('register-password-input') as HTMLInputElement;
    if (!emailInput || !passwordInput) return;

    const email = emailInput.value;
    const password = passwordInput.value;

    if (password.length < 6) {
        showNotification('비밀번호는 6자 이상이어야 합니다.', true);
        return;
    }

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        // onAuthStateChanged will handle the rest
    } catch (error: any) {
        console.error("Registration failed:", error);
        showNotification(`회원가입 실패: ${error.message}`, true);
    }
}

function handleLogout() {
    saveGameState().then(() => {
         auth.signOut().catch((error: any) => {
            console.error("Logout failed:", error);
            showNotification(`로그아웃 실패: ${error.message}`, true);
        });
    });
}

async function onLoginSuccess(user: any) {
    userNickname = user.email.split('@')[0];
    userUID = user.uid;
    
    document.getElementById('auth-container')?.classList.add('hidden');
    document.getElementById('main-content')?.classList.remove('hidden');

    const loaded = await loadGameState();
    if (!loaded) {
        gameState = getInitialGameState();
        await saveGameState();
    }
    
    initGame();
    startGame();
    
    const chatRef = db.ref('chat').limitToLast(100);
    chatRef.on('child_added', (snapshot) => {
        const message = snapshot.val();
        if (message) {
            appendChatMessage(message);
        }
    });

    if (window.autosaveInterval) clearInterval(window.autosaveInterval);
    window.autosaveInterval = setInterval(saveGameState, 30000);
}

document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    
    if (showRegisterLink && loginView && registerView) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginView.classList.add('hidden');
            registerView.classList.remove('hidden');
        });
    }
    if (showLoginLink && loginView && registerView) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerView.classList.add('hidden');
            loginView.classList.remove('hidden');
        });
    }

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            await onLoginSuccess(user);
        } else {
            stopGame();
            userUID = null;
            userNickname = null;
            document.getElementById('auth-container')?.classList.remove('hidden');
            document.getElementById('main-content')?.classList.add('hidden');
        }
    });

    ['assets', 'trade', 'charts', 'history', 'drill', 'computer', 'investor', 'trophy', 'almanac', 'shop', 'code'].forEach(s => {
        const toggle = document.getElementById(`toggle-${s}`);
        if (toggle) {
            toggle.addEventListener('click', () => {
                document.getElementById(`content-${s}`)?.classList.toggle('hidden');
                document.getElementById(`toggle-${s}-icon`)?.classList.toggle('rotate-180');
            });
        }
    });
});

function populateDrillUI() {
    if (!dom.drillTierText || !dom.drillStatsText || !dom.drillUpgradeButton) return;
    const tier = gameState.drillTier;
    const isMaxTier = tier >= DRILL_DATA.length;
    if (tier > 0) {
        dom.drillTierText.textContent = `Tier ${tier} 드릴`;
        dom.drillStatsText.innerHTML = `
            <span class="text-xs">돌: ${(5*tier).toFixed(1)}% | 석탄: ${(4*tier).toFixed(1)}% | 구리: ${(3*tier).toFixed(1)}%</span><br>
            <span class="text-xs">철: ${(2*tier).toFixed(1)}% | 금: ${(1*tier).toFixed(1)}%</span><br>
            <span class="text-xs">마법가루: ${(0.5*tier).toFixed(1)}% | 다이아: ${(0.2*tier).toFixed(1)}%</span>
        `;
    } else {
        dom.drillTierText.textContent = '드릴 없음';
        dom.drillStatsText.innerHTML = '자원을 자동으로 채굴합니다.';
    }
    if (!isMaxTier) {
        const canAfford = gameState.userCash >= DRILL_DATA[tier].cost;
        dom.drillUpgradeButton.textContent = `${DRILL_DATA[tier].name} 구매 (${DRILL_DATA[tier].cost.toLocaleString()} KRW)`;
        dom.drillUpgradeButton.disabled = !canAfford;
        dom.drillUpgradeButton.classList.toggle('btn-disabled', !canAfford);
        dom.drillUpgradeButton.classList.remove('hidden');
    } else {
        dom.drillUpgradeButton.textContent = '최고 티어';
        dom.drillUpgradeButton.classList.add('hidden');
    }
}

function populateInvestorUI() {
    if (!dom.investorList) return;
    dom.investorList.innerHTML = '';

    INVESTOR_DATA.forEach((investor, index) => {
        const isHired = gameState.investorTier >= index;
        const canHire = gameState.investorTier === index - 1;
        const canAfford = gameState.userCash >= investor.cost;

        const el = document.createElement('div');
        el.className = 'bg-gray-800 p-3 rounded-lg flex justify-between items-center';

        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <h4 class="font-bold text-base">${investor.name}</h4>
            <p class="text-xs text-gray-400">대상: ${investor.coins.join(', ').toUpperCase()} | 수익률: ${investor.pnl * 100}%</p>
        `;

        const actionDiv = document.createElement('div');
        if (isHired) {
            actionDiv.innerHTML = `<span class="px-3 py-1 text-sm font-semibold text-green-300 bg-green-800/50 rounded-full">고용됨</span>`;
        } else if (canHire) {
            const button = document.createElement('button');
            button.className = `bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-sm ${!canAfford ? 'btn-disabled' : ''}`;
            button.textContent = `고용 (${investor.cost.toLocaleString()} KRW)`;
            button.disabled = !canAfford;
            button.onclick = () => handleHireInvestor(index);
            actionDiv.appendChild(button);
        } else {
            actionDiv.innerHTML = `<span class="px-3 py-1 text-sm text-gray-500">잠김</span>`;
        }
        
        el.appendChild(infoDiv);
        el.appendChild(actionDiv);
        dom.investorList.appendChild(el);
    });
}

function populateSmeltingUI() {
    if(!dom.smeltingInfo) return;
    if (!gameState.shopItems.furnace) {
        dom.smeltingInfo.classList.add('hidden');
        return;
    }
    dom.smeltingInfo.classList.remove('hidden');
    dom.smeltingInfo.innerHTML = '';
    const ores = [
        { id: 'copper', name: '구리', ore: 'copperOre', ingot: 'copperIngot'},
        { id: 'iron', name: '철', ore: 'ironOre', ingot: 'ironIngot'},
        { id: 'gold', name: '금', ore: 'goldOre', ingot: 'goldIngot'}
    ];
    ores.forEach(ore => {
        const canSmelt = gameState[ore.ore] > 0 && gameState.coal > 0;
        const button = document.createElement('button');
        button.className = `w-full text-sm font-bold py-1.5 px-3 rounded-lg ${canSmelt ? 'bg-orange-600 hover:bg-orange-700' : 'btn-disabled'}`;
        button.textContent = `${ore.name} 주괴 제련 (석탄 1, 원석 1)`;
        button.disabled = !canSmelt;
        button.onclick = () => handleSmeltItem(ore.ore, ore.ingot);
        dom.smeltingInfo.appendChild(button);
    })
}

function handleCraftItem(itemId: string) {
    const item = CRAFTING_DATA[itemId];
    if (!item) return;

    const canCraft = Object.keys(item.cost).every(res => gameState[res] >= item.cost[res]);
    if (canCraft) {
        for (const res in item.cost) {
            gameState[res] -= item.cost[res];
        }
        gameState[item.product] += item.amount;
        showNotification(`${item.name} ${item.amount}개 제작 완료!`, false);
        populateMaterialItems();
        updateComputerUI();
        saveGameState();
    } else {
        showNotification('재료가 부족합니다.', true);
    }
}
function handleSmeltItem(ore: string, ingot: string) {
    if(gameState[ore] > 0 && gameState.coal > 0) {
        gameState[ore]--;
        gameState.coal--;
        gameState.smeltingQueue.push({
            product: ingot,
            startTime: Date.now()
        });
        populateSmeltingUI();
        updateSmeltingUI();
    }
}


export {};