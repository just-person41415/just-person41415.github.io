// FIX: Add declarations for global variables and extend Window interface to avoid TypeScript errors.
declare var THREE: any;
declare var firebase: any;

declare global {
    interface Window {
        // FIX: Changed timer handle type to 'any' to support both browser (number) and Node.js (Timeout) return types from setInterval.
        autosaveInterval?: any;
        handleTrade?: (type: 'buy' | 'sell', coinId: string) => void;
        handleMaxAmount?: (type: 'buy' | 'sell', coinId: string) => void;
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
const V2_UPDATE_TIMESTAMP = new Date('2024-09-01T09:00:00Z').getTime(); // v2 업데이트 예시 시간 (UTC)
const WEATHER_DATA: {[key: string]: { icon: string, short_desc: string, long_desc: string, isBad?: boolean, isGood?: boolean }} = {
    '맑음': { icon: '☀️', short_desc: '상승 확률 소폭 증가', long_desc: '코인 증가 확률 +0.5%, 감소 확률 -0.5%', isGood: true },
    '비': { icon: '🌧️', short_desc: 'CUBE 상승 확률 증가', long_desc: 'CUBE 코인 증가 확률 +1%, 감소 확률 -1%.', isGood: true },
    '구름': { icon: '☁️', short_desc: '효과 없음', long_desc: '특별한 효과는 없습니다.' },
    '산성비': { icon: '☣️', short_desc: '하락 확률 증가', long_desc: '코인 증가 확률 -2.5%, 코인 감소 확률 +2.5%.', isBad: true },
    '천둥': { icon: '⛈️', short_desc: '인터넷 끊김 주의', long_desc: '5% 확률로 인터넷 연결이 끊겨 거래 등 일부 행동이 제한됩니다.', isBad: true },
    '무지개': { icon: '🌈', short_desc: '상승 확률 대폭 증가', long_desc: '코인 증가 확률 +2.5%, 감소 확률 -2.5%.', isGood: true },
    '바람': { icon: '💨', short_desc: '효과 없음', long_desc: '현재 특별한 효과 없음.' },
    '황사': { icon: '😷', short_desc: '코인 변화 시간 증가', long_desc: '모든 코인 변화에 걸리는 시간이 10% 증가합니다.', isBad: true },
    '폭염': { icon: '🥵🔥', short_desc: '패시브 수입 감소', long_desc: '3D 큐브의 패시브 KRW 수입이 50% 감소합니다.', isBad: true },
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
const SEASON_EMOJI_MAP: { [key: string]: string } = { '봄': '🌸', '여름': '☀️', '가을': '🍁', '겨울': '❄️' };

const RESOURCE_NAME_MAP: { [key: string]: string } = {
    userCash: 'KRW', stone: '돌', coal: '석탄', copperOre: '구리 원석', ironOre: '철 원석', goldOre: '금 원석', magicDust: '마법의 가루', diamond: '다이아몬드',
    copperIngot: '구리 주괴', ironIngot: '철 주괴', goldIngot: '금 주괴', disabledMagicStone: '비활성 마법석', magicStone: '마법의 돌',
    copperWire: '구리 전선', ironWire: '철 전선', goldWire: '금 전선', diamondWire: '다이아몬드 전선',
    liberatedCopperWire: '해방된 구리 전선', liberatedIronWire: '해방된 철 전선', liberatedGoldWire: '해방된 금 전선', liberatedDiamondWire: '해방된 다이아몬드 전선',
    userCubes: 'CUBE', userLunar: 'LUNAR', userEnergy: 'ENERGY', userPrisms: 'PRISM',
};

let gameLoopInterval: any = null;
let drillInterval: any = null;
let computerInterval: any = null;
let weatherInterval: any = null;
let priceUpdateIntervals: any = {};
let gameTime: Date;
let dom: any = {};
let notificationTimeout: any = null;
let announcementInterval: any = null;
let userNickname: string | null = null;
let userUID: string | null = null;
let scene: any, camera: any, renderer: any, cube: any;
let globalWeatherOverride: string | null = null;
let globalPriceOverrides: any = null;
let currentGameSpeed = 1;
let gameState: any;

const COIN_DATA: {[key: string]: any} = {
    Cube: {
        priceKey: 'currentPrice',
        amountKey: 'userCubes',
        minPrice: 5000,
        maxPrice: 25000,
        interval: 2000,
        upChance: 0.55,
        fluctuation: {
            day: { small: 0.6, medium: 0.35, large: 0.05 },
            night: { small: 0.6, medium: 0.35, large: 0.05 }
        }
    },
    Lunar: {
        priceKey: 'currentLunarPrice',
        amountKey: 'userLunar',
        minPrice: 10000,
        maxPrice: 50000,
        interval: { day: 2500, night: 1500 },
        upChance: { day: 0.45, night: 0.55 },
        fluctuation: {
            day: { small: 0.7, medium: 0.3, large: 0 },
            night: { small: 0.5, medium: 0.4, large: 0.1 }
        }
    },
    Energy: {
        priceKey: 'currentEnergyPrice',
        amountKey: 'userEnergy',
        minPrice: 20000,
        maxPrice: 100000,
        interval: 3500, // No specific interval given, using a reasonable default
        upChance: 0.50,
        fluctuation: {
            day: { small: 0, medium: 0.9, large: 0.1 },
            night: { small: 0, medium: 0.9, large: 0.1 }
        }
    },
    Prism: {
        priceKey: 'currentPrismPrice',
        amountKey: 'userPrisms',
        minPrice: 40000,
        maxPrice: 200000,
        interval: 3000,
        upChance: 0.51,
        fluctuation: {
            day: { small: 0.6, medium: 0.38, large: 0.02 },
            night: { small: 0.6, medium: 0.38, large: 0.02 }
        }
    }
};

// --- 게임 데이터 정의 ---
const DRILL_DATA = [
    { name: 'Tier 1 드릴', cost: 50000 }, { name: 'Tier 2 드릴', cost: 150000 },
    { name: 'Tier 3 드릴', cost: 500000 }, { name: 'Tier 4 드릴', cost: 1200000 },
    { name: 'Tier 5 드릴', cost: 2000000 }
];

const COMPUTER_DATA = [
    { name: '컴퓨터 없음', cost: {} },
    { name: 'Tier 1 컴퓨터', cost: { userCash: 100000 } },
    { name: 'Tier 2 컴퓨터', cost: { userCash: 500000 } },
    { name: 'Tier 3 컴퓨터', cost: { copperWire: 20 } },
    { name: 'Tier 4 컴퓨터', cost: { copperWire: 40, ironWire: 10 } },
    { name: 'Tier 5 컴퓨터', cost: { copperWire: 40, ironWire: 15, goldWire: 3 } },
    { name: 'Tier 6 컴퓨터', cost: { copperWire: 50, ironWire: 20, goldWire: 10, diamondWire: 3 } },
    { name: 'Tier 7 컴퓨터', cost: { liberatedCopperWire: 5 } },
    { name: 'Tier 8 컴퓨터', cost: { liberatedCopperWire: 10, liberatedIronWire: 5 } },
    { name: 'Tier 9 컴퓨터', cost: { liberatedCopperWire: 20, liberatedIronWire: 15, liberatedGoldWire: 8 } },
    { name: 'Tier 10 컴퓨터', cost: { liberatedCopperWire: 20, liberatedIronWire: 15, liberatedGoldWire: 10, liberatedDiamondWire: 5 } },
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

const TOTEM_DATA: {[key: string]: { name: string, desc: string, cost: number, tier: number, type: 'weather' | 'time', effect: any, conditions: { season?: string[], time?: 'day' | 'night' } }} = {
    'acidRainTotem': { name: '산성비 토템', desc: '다음 날씨를 산성비로 바꿉니다.', cost: 10000, tier: 1, type: 'weather', effect: '산성비', conditions: {} },
    'thunderTotem': { name: '천둥 토템', desc: '다음 날씨를 천둥으로 바꿉니다.', cost: 10000, tier: 1, type: 'weather', effect: '천둥', conditions: { season: ['여름'] } },
    'yellowDustTotem': { name: '황사 토템', desc: '다음 날씨를 황사로 바꿉니다.', cost: 10000, tier: 1, type: 'weather', effect: '황사', conditions: { season: ['봄'] } },
    'heatWaveTotem': { name: '폭염 토템', desc: '다음 날씨를 폭염으로 바꿉니다.', cost: 10000, tier: 1, type: 'weather', effect: '폭염', conditions: { season: ['여름'] } },
    'snowTotem': { name: '눈 토템', desc: '다음 날씨를 눈으로 바꿉니다.', cost: 10000, tier: 1, type: 'weather', effect: '눈', conditions: { season: ['겨울'] } },
    'hailTotem': { name: '우박 토템', desc: '다음 날씨를 우박으로 바꿉니다.', cost: 10000, tier: 1, type: 'weather', effect: '우박', conditions: { season: ['겨울'] } },
    
    'sunTotem': { name: '맑음 토템', desc: '다음 날씨를 맑음으로 바꿉니다.', cost: 50000, tier: 3, type: 'weather', effect: '맑음', conditions: {} },
    'rainTotem': { name: '비 토템', desc: '다음 날씨를 비로 바꿉니다.', cost: 50000, tier: 3, type: 'weather', effect: '비', conditions: { season: ['봄', '여름', '가을'] } },
    'heavyRainTotem': { name: '폭우 토템', desc: '다음 날씨를 폭우로 바꿉니다.', cost: 50000, tier: 3, type: 'weather', effect: '폭우', conditions: { season: ['여름'] } },

    'meteorTotem': { name: '별똥별 토템', desc: '다음 날씨를 별똥별로 바꿉니다.', cost: 100000, tier: 4, type: 'weather', effect: '별똥별', conditions: { time: 'night' } },
    'rainbowTotem': { name: '무지개 토템', desc: '다음 날씨를 무지개로 바꿉니다.', cost: 100000, tier: 4, type: 'weather', effect: '무지개', conditions: {} },
    
    'auroraTotem': { name: '오로라 토템', desc: '다음 날씨를 오로라로 바꿉니다.', cost: 500000, tier: 5, type: 'weather', effect: '오로라', conditions: { season: ['겨울'], time: 'night' } },
    
    'timeTotem': { name: '시간의 토템', desc: '게임 시간을 즉시 8시간 뒤로 이동시킵니다.', cost: 20000, tier: 2, type: 'time', effect: 8, conditions: {} },
};
const TOTEM_PURCHASE_LIMITS = { 1: 7, 2: 7, 3: 4, 4: 2, 5: 1 };

const SKILL_TREE_DATA: any = {
    'cube': {
        name: '3D 큐브',
        skills: {
            'efficientProduction': {
                name: '효율적인 생산',
                desc: (level: number) => `패시브 KRW 생산량이 +${level * 10}% 증가합니다.`,
                maxLevel: 5,
                levels: [
                    { cost: { userCash: 50000 }, effect: 0.1 }, { cost: { userCash: 200000 }, effect: 0.2 },
                    { cost: { userCash: 500000 }, effect: 0.3 }, { cost: { userCash: 1000000 }, effect: 0.4 },
                    { cost: { userCash: 2000000 }, effect: 0.5 },
                ]
            },
            'fastRotation': {
                name: '빠른 회전',
                desc: (level: number) => `${level}% 확률로 2배의 패시브 KRW 생산량을 얻습니다.`,
                maxLevel: 5,
                levels: [
                    { cost: { userCubes: 5 }, effect: 0.01 }, { cost: { userCubes: 20 }, effect: 0.02 },
                    { cost: { userCubes: 50 }, effect: 0.03 }, { cost: { userCubes: 160 }, effect: 0.04 },
                    { cost: { userCubes: 400 }, effect: 0.05 },
                ]
            },
            'exceptional': {
                name: '특출남',
                desc: (level: number) => `별똥별 날씨에서 ${level}% 확률로 1분간 수익이 2배가 되는 '특출남' 상태에 돌입합니다.`,
                maxLevel: 5,
                levels: [
                    { cost: { userLunar: 4 }, effect: 0.01 }, { cost: { userLunar: 8 }, effect: 0.02 },
                    { cost: { userLunar: 16 }, effect: 0.03 }, { cost: { userLunar: 32 }, effect: 0.04 },
                    { cost: { userLunar: 64 }, effect: 0.05 },
                ]
            }
        }
    },
    'shop': {
        name: '상점',
        skills: {
            'regularCustomer': {
                name: '단골 손님',
                desc: (level: number) => `상점 기능 아이템, 드릴 구매 비용이 ${level * 5}% 할인됩니다.`,
                maxLevel: 5,
                levels: [
                    { cost: { userEnergy: 1 }, effect: 0.05 }, { cost: { userEnergy: 2 }, effect: 0.10 },
                    { cost: { userEnergy: 4 }, effect: 0.15 }, { cost: { userEnergy: 8 }, effect: 0.20 },
                    { cost: { userEnergy: 20 }, effect: 0.25 },
                ]
            }
        }
    },
    'computer': {
        name: '채굴 컴퓨터',
        skills: {
            'gpuEfficiency': {
                name: 'GPU 효율성 강화',
                desc: (level: number) => `컴퓨터의 코인 채굴 주기가 ${level * 2}초 감소합니다. (기본 60초)`,
                maxLevel: 5,
                levels: [
                    { cost: { userPrisms: 1 }, effect: 2 }, { cost: { userPrisms: 3 }, effect: 4 },
                    { cost: { userPrisms: 9 }, effect: 6 }, { cost: { userPrisms: 27 }, effect: 8 },
                    { cost: { userPrisms: 81 }, effect: 10 },
                ]
            }
        }
    }
};

const getInitialGameState = () => ({
    userCash: 100000, userCubes: 0, userLunar: 0, userEnergy: 0, userPrisms: 0,
    currentPrice: 10000, lastPrice: 10000, currentLunarPrice: 20000, lastLunarPrice: 20000,
    currentEnergyPrice: 50000, lastEnergyPrice: 50000, currentPrismPrice: 100000, lastPrismPrice: 100000,
    computerTier: 0, drillTier: 0,
    isCubePurchased: false, isLunarUpgraded: false, isEnergyUpgraded: false, isPrismUpgraded: false,
    weather: '맑음', experiencedWeathers: { '맑음': true },
    shopItems: { digitalClock: false, weatherAlmanac: false, bed: false, furnace: false },
    isInternetOutage: false, isInternetOutageCooldown: 0,
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
    totemPurchaseCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    nextWeatherOverride: null,
    // Skills
    skills: {
        efficientProduction: 0, fastRotation: 0, exceptional: 0,
        regularCustomer: 0, gpuEfficiency: 0,
    },
    // Settings
    settings: {
        showNotifications: true,
        notificationDuration: 3000, // in ms
    },
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
    window.addEventListener('resize', () => { if (!renderer || !container || !container.clientWidth || !container.clientHeight) return; renderer.setSize(container.clientWidth, container.clientHeight); camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); }, false);
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
function initGame() {
    dom = {
        userCash: document.getElementById('user-cash'), userCubes: document.getElementById('user-cubes'), userLunar: document.getElementById('user-lunar'), userEnergy: document.getElementById('user-energy'), userPrisms: document.getElementById('user-prisms'),
        currentCubePrice: document.getElementById('current-cube-price'), cubePriceChange: document.getElementById('cube-price-change'), currentLunarPrice: document.getElementById('current-lunar-price'), lunarPriceChange: document.getElementById('lunar-price-change'), currentEnergyPrice: document.getElementById('current-energy-price'), energyPriceChange: document.getElementById('energy-price-change'), currentPrismPrice: document.getElementById('current-prism-price'), prismPriceChange: document.getElementById('prism-price-change'),
        notification: document.getElementById('notification'), internetOutage: document.getElementById('internet-outage'),
        buyCubeButton: document.getElementById('buy-cube-button'), cubePurchaseOverlay: document.getElementById('cube-purchase-overlay'), passiveIncomeDisplay: document.getElementById('passive-income-display'), incomePerSecond: document.getElementById('income-per-second'),
        exceptionalStatus: document.getElementById('exceptional-status'), exceptionalTimer: document.getElementById('exceptional-timer'),
        computerInfo: document.getElementById('computer-info'), computerTierText: document.getElementById('computer-tier-text'), computerStatsText: document.getElementById('computer-stats-text'), computerUpgradeButton: document.getElementById('computer-upgrade-button'),
        tradeContainer: document.getElementById('trade-container'),
        timeContainer: document.getElementById('time-container'), gameTime: document.getElementById('game-time'), weatherContainer: document.getElementById('weather-container'), weatherDisplay: document.getElementById('weather-display'), seasonDisplay: document.getElementById('season-display'),
        shopSection: document.getElementById('shop-section'), shopItems: document.getElementById('shop-items'), codeSubmitButton: document.getElementById('code-submit-button'), codeInput: document.getElementById('code-input'),
        upgradeLunarSection: document.getElementById('upgrade-lunar-section'), upgradeLunarButton: document.getElementById('upgrade-lunar-button'), upgradeEnergySection: document.getElementById('upgrade-energy-section'), upgradeEnergyButton: document.getElementById('upgrade-energy-button'), upgradePrismSection: document.getElementById('upgrade-prism-section'), upgradePrismButton: document.getElementById('upgrade-prism-button'),
        weatherAlmanacSection: document.getElementById('weather-almanac-section'), weatherAlmanacContent: document.getElementById('weather-almanac-content'), incomeSourceUpgrades: document.getElementById('income-source-upgrades'),
        trophyList: document.getElementById('trophy-list'), transactionHistoryList: document.getElementById('transaction-history-list'),
        chatMessages: document.getElementById('chat-messages'), chatInput: document.getElementById('chat-input'), chatSendButton: document.getElementById('chat-send-button'), logoutButton: document.getElementById('logout-button'),
        drillInfo: document.getElementById('drill-info'), drillTierText: document.getElementById('drill-tier-text'), drillStatsText: document.getElementById('drill-stats-text'), drillUpgradeButton: document.getElementById('drill-upgrade-button'),
        smeltingControls: document.getElementById('smelting-controls'), smeltingQueueList: document.getElementById('smelting-queue-list'),
        shopTabFunction: document.getElementById('shop-tab-function'), shopTabTotems: document.getElementById('shop-tab-totems'),
        shopContentFunction: document.getElementById('shop-content-function'), shopContentTotems: document.getElementById('shop-content-totems'),
        craftingItems: document.getElementById('crafting-items'), totemItems: document.getElementById('totem-items'),
        userStone: document.getElementById('user-stone'), userCoal: document.getElementById('user-coal'), userCopperOre: document.getElementById('user-copperOre'), userIronOre: document.getElementById('user-ironOre'), userGoldOre: document.getElementById('user-goldOre'), userMagicDust: document.getElementById('user-magicDust'), userDiamond: document.getElementById('user-diamond'), userCopperIngot: document.getElementById('user-copperIngot'), userIronIngot: document.getElementById('user-ironIngot'), userGoldIngot: document.getElementById('user-goldIngot'), userDisabledMagicStone: document.getElementById('user-disabledMagicStone'), userMagicStone: document.getElementById('user-magicStone'), userCopperWire: document.getElementById('user-copperWire'), userIronWire: document.getElementById('user-ironWire'), userGoldWire: document.getElementById('user-goldWire'), userDiamondWire: document.getElementById('user-diamondWire'), userLiberatedCopperWire: document.getElementById('user-liberatedCopperWire'), userLiberatedIronWire: document.getElementById('user-liberatedIronWire'), userLiberatedGoldWire: document.getElementById('user-liberatedGoldWire'), userLiberatedDiamondWire: document.getElementById('user-liberatedDiamondWire'),
        yellowDustOverlay: document.getElementById('yellow-dust-overlay'), heatWaveOverlay: document.getElementById('heat-wave-overlay'), snowOverlay: document.getElementById('snow-overlay'),
        updateBanner: document.getElementById('update-banner'), countdownTimer: document.getElementById('countdown-timer'),
        skillTreeContent: document.getElementById('content-skills'),
        // Dev Panel
        devPanel: document.getElementById('dev-panel'), closeDevPanel: document.getElementById('close-dev-panel'), devWeatherSelect: document.getElementById('dev-weather-select'),
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
    ['function', 'totems'].forEach(t => dom[`shopTab${t.charAt(0).toUpperCase() + t.slice(1)}`]?.addEventListener('click', () => switchShopTab(t)));
    
    const showToggle = document.getElementById('setting-show-notifications') as HTMLInputElement;
    const saveDurationBtn = document.getElementById('setting-save-duration-btn');
    const durationInput = document.getElementById('setting-notification-duration') as HTMLInputElement;
    
    if(showToggle) {
        showToggle.addEventListener('change', () => {
            gameState.settings.showNotifications = showToggle.checked;
            saveGameState();
            showNotification(`알림이 ${showToggle.checked ? '활성화' : '비활성화'}되었습니다.`, false);
        });
    }

    if(saveDurationBtn && durationInput) {
        saveDurationBtn.addEventListener('click', () => {
            const duration = parseInt(durationInput.value, 10);
            if (!isNaN(duration) && duration >= 1 && duration <= 30) {
                gameState.settings.notificationDuration = duration * 1000; // s to ms
                saveGameState();
                showNotification(`알림 표시 시간이 ${duration}초로 설정되었습니다.`, false);
            } else {
                showNotification('1초에서 30초 사이의 값을 입력해주세요.', true);
            }
        });
    }

    initDevPanel();
    populateTradeUI();
    populateShopUI();
    populateDrillAndProductionUI();
    populateSkillTreeUI();
    populateSettingsUI();
    init3D();
}

function restartGameLoop() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    if (drillInterval) clearInterval(drillInterval);
    if (weatherInterval) clearInterval(weatherInterval);

    gameLoopInterval = setInterval(gameLoop, 250 / currentGameSpeed);
    drillInterval = setInterval(runDrill, 10000 / currentGameSpeed); // 10초로 변경
    weatherInterval = setInterval(updateWeather, 60000 / currentGameSpeed);
    startComputerMining();
}

function startGame() {
    gameTime = new Date(gameState.gameTime);
    restoreUIState(); updateTrophyUI(); updateTransactionHistoryUI();
    restartGameLoop();
    startPriceUpdateLoops();
    if(renderer) animate();
}

function stopGame() {
    if (gameLoopInterval) clearInterval(gameLoopInterval);
    if (drillInterval) clearInterval(drillInterval);
    if (computerInterval) clearInterval(computerInterval);
    if (weatherInterval) clearInterval(weatherInterval);
    Object.values(priceUpdateIntervals).forEach(interval => clearInterval(interval));
    priceUpdateIntervals = {};
    if (window.autosaveInterval) clearInterval(window.autosaveInterval);
    gameLoopInterval = drillInterval = computerInterval = weatherInterval = null;
    window.autosaveInterval = null;
}

function showNotification(message: string, isError = true) {
    if (!gameState.settings.showNotifications && !message.includes('알림이')) return; // Allow settings notifications to always show
    if (!dom.notification) return; if (notificationTimeout) { clearTimeout(notificationTimeout); }
    dom.notification.innerHTML = `<span>${message}</span><button id="notification-close-btn" class="ml-4 font-bold text-xl leading-none transition-transform hover:scale-125">&times;</button>`;
    dom.notification.className = `fixed bottom-6 right-6 text-white p-4 rounded-lg shadow-xl z-50 transition-all duration-300 flex items-center justify-between ${isError ? 'bg-red-500' : 'bg-green-500'}`;
    dom.notification.classList.remove('opacity-0', 'translate-y-10'); dom.notification.classList.add('opacity-100', 'translate-y-0');
    const hideNotification = () => { if (!dom.notification) return; dom.notification.classList.remove('opacity-100', 'translate-y-0'); dom.notification.classList.add('opacity-0', 'translate-y-10'); notificationTimeout = null; };
    document.getElementById('notification-close-btn')?.addEventListener('click', hideNotification, { once: true });
    notificationTimeout = setTimeout(hideNotification, gameState.settings.notificationDuration);
}

function updateSmeltingQueueUI() {
    if (!dom.smeltingQueueList) return;

    dom.smeltingQueueList.innerHTML = '';
    if (gameState.smeltingQueue.length === 0) {
        dom.smeltingQueueList.innerHTML = '<li class="text-gray-500 italic p-2">제련 대기열이 비어있습니다.</li>';
        return;
    }

    const smeltingTime = gameState.shopItems.furnace ? 3000 : 5000;
    gameState.smeltingQueue.forEach((item: any, index: number) => {
        const li = document.createElement('li');
        li.className = 'flex justify-between items-center p-2 bg-gray-700/50 rounded mb-1 text-sm';

        const itemName = RESOURCE_NAME_MAP[item.product] || item.product;
        
        if (index === 0) { // Currently smelting item
            const elapsedTime = item.startTime ? Date.now() - item.startTime : 0;
            const remainingTimeMs = Math.max(0, smeltingTime - elapsedTime);
            const progress = Math.min(100, (elapsedTime / smeltingTime) * 100);
            
            li.innerHTML = `
                <span class="font-semibold">${itemName}</span>
                <div class="w-1/2 mx-2 bg-gray-600 rounded-full h-2.5">
                    <div class="bg-orange-500 h-2.5 rounded-full" style="width: ${progress}%"></div>
                </div>
                <span class="w-12 text-right text-orange-300">${(remainingTimeMs / 1000).toFixed(1)}s</span>
            `;
        } else { // Queued item
            li.innerHTML = `
                <span class="font-semibold">${itemName}</span>
                <span class="text-gray-400">대기 중...</span>
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
    // FIX: Use Number() for safer type conversion, as values from gameState can be of mixed types.
    for(const key in resourceMap) { if(dom[key]) dom[key].textContent = Math.floor(Number(resourceMap[key as keyof typeof resourceMap])).toLocaleString('ko-KR'); }

    const updatePriceDisplay = (priceEl: HTMLElement, changeEl: HTMLElement, current: number, last: number) => { if (!priceEl || !changeEl) return; priceEl.textContent = `${current.toLocaleString('ko-KR')} KRW`; const change = current - last; const pct = last > 0 ? ((change / last) * 100).toFixed(2) : '0.00'; if (change > 0) changeEl.innerHTML = `<span class="text-green-500">▲ +${pct}%</span>`; else if (change < 0) changeEl.innerHTML = `<span class="text-red-500">▼ ${pct}%</span>`; else changeEl.innerHTML = `0.00%`; };
    // FIX: Argument of type 'unknown' is not assignable to parameter of type 'number'. Removed redundant `as any` cast.
    updatePriceDisplay(dom.currentCubePrice, dom.cubePriceChange, Number(state.currentPrice), Number(state.lastPrice));
    updatePriceDisplay(dom.currentLunarPrice, dom.lunarPriceChange, Number(state.currentLunarPrice), Number(state.lastLunarPrice));
    updatePriceDisplay(dom.currentEnergyPrice, dom.energyPriceChange, Number(state.currentEnergyPrice), Number(state.lastEnergyPrice));
    updatePriceDisplay(dom.currentPrismPrice, dom.prismPriceChange, Number(state.currentPrismPrice), Number(state.lastPrismPrice));

    if (dom.weatherDisplay) dom.weatherDisplay.textContent = `${state.weather} ${WEATHER_DATA[state.weather].icon}`;
    if (dom.seasonDisplay) dom.seasonDisplay.textContent = `${state.season} ${SEASON_EMOJI_MAP[state.season as keyof typeof SEASON_EMOJI_MAP]} ${state.dayInSeason}일차`;

    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    let baseProduction = 0;
    if (state.isCubePurchased) { baseProduction = 100; if (state.isPrismUpgraded) baseProduction = 400; else if (state.isEnergyUpgraded) baseProduction = 200; }
    const lunarBonus = (state.isLunarUpgraded && isNight) ? 100 : 0;
    let totalIncome = baseProduction + lunarBonus;
    if (state.weather === '폭염') totalIncome *= 0.5;
    
    // Skill: efficientProduction
    const prodSkillLevel = gameState.skills.efficientProduction;
    if (prodSkillLevel > 0) {
        totalIncome *= (1 + SKILL_TREE_DATA.cube.skills.efficientProduction.levels[prodSkillLevel-1].effect);
    }
    // Skill: fastRotation
    const rotSkillLevel = gameState.skills.fastRotation;
    if (rotSkillLevel > 0 && Math.random() < SKILL_TREE_DATA.cube.skills.fastRotation.levels[rotSkillLevel-1].effect) {
        totalIncome *= 2;
    }

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
    
    updateComputerUI(); 
    populateDrillAndProductionUI(); 
    updateSmeltingQueueUI();
}

function updateComputerUI() {
    if (!dom.computerTierText || !dom.computerStatsText || !dom.computerUpgradeButton) return;
    const tier = gameState.computerTier;
    const isMaxTier = tier >= COMPUTER_DATA.length - 1;
    dom.computerTierText.textContent = tier > 0 ? `Tier ${tier} 컴퓨터` : '컴퓨터 없음';

    const efficiencyLevel = gameState.skills.gpuEfficiency;
    const miningInterval = 60 - (efficiencyLevel > 0 ? SKILL_TREE_DATA.computer.skills.gpuEfficiency.levels[efficiencyLevel - 1].effect : 0);
    
    const miningRates = tier > 0 ? `<br>자동 코인 획득 (${miningInterval}초 주기):<br>CUBE: ${tier*2}, LUNAR: ${tier*1.5}<br>ENERGY: ${tier*1}, PRISM: ${tier*0.5}` : '';
    dom.computerStatsText.innerHTML = `자동 코인 획득 활성화${miningRates}`;
    
    dom.computerUpgradeButton.classList.toggle('hidden', isMaxTier);
    if (!isMaxTier) {
        const nextTierData = COMPUTER_DATA[tier + 1];
        const cost = nextTierData.cost;
        let costString = '';
        for(const item in cost) { 
            const itemName = RESOURCE_NAME_MAP[item] || item;
            costString += `${(cost as any)[item].toLocaleString()} ${itemName} `;
        }
        dom.computerUpgradeButton.textContent = `Tier ${tier + 1} 업그레이드 (${costString.trim()})`;
    } else {
         dom.computerUpgradeButton.textContent = '최고 티어';
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
        const tradeBox = document.createElement('div');
        tradeBox.className = 'bg-gray-800 p-4 rounded-lg flex flex-col gap-3';
        tradeBox.innerHTML = `
            <div>
                <h4 class="font-bold text-lg text-${coin.color}-300">${coin.name}</h4>
                <p class="text-sm text-gray-400">보유: ${coin.owned.toLocaleString()}개</p>
            </div>
            <div class="flex items-center gap-2">
                <input type="number" id="trade-amount-${coin.id}" class="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-${coin.color}-500" placeholder="수량" min="1">
                <button onclick="handleMaxAmount('buy', '${coin.id}')" class="bg-gray-600 hover:bg-gray-500 text-xs font-bold px-2 py-1 rounded-md">MAX</button>
            </div>
            <div class="flex gap-2">
                <button onclick="handleTrade('buy', '${coin.id}')" class="flex-1 bg-${coin.color}-600 hover:bg-${coin.color}-700 text-white font-bold py-2 px-3 rounded-lg text-sm">매수</button>
                <button onclick="handleTrade('sell', '${coin.id}')" class="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-3 rounded-lg text-sm">매도</button>
            </div>
        `;
        dom.tradeContainer.appendChild(tradeBox);
    });
    window.handleTrade = handleTrade;
    window.handleMaxAmount = handleMaxAmount;
}

function populateShopUI() {
    populateFunctionItems();
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
        const discountedCost = getDiscountedCost(item.cost);
        const canAfford = gameState.userCash >= discountedCost;
        const itemEl = document.createElement('div');
        itemEl.className = 'bg-gray-800 p-3 rounded-lg flex flex-col justify-between';
        itemEl.innerHTML = `
            <div>
                <h4 class="font-bold text-base">${item.name}</h4>
                <p class="text-xs text-gray-400 my-1">${item.desc}</p>
            </div>
            <button class="w-full mt-2 text-sm font-bold py-1.5 px-3 rounded-lg ${isOwned ? 'bg-green-700 cursor-default' : (canAfford ? 'bg-blue-600 hover:bg-blue-700' : 'btn-disabled')}" ${isOwned || !canAfford ? 'disabled' : ''}>
                ${isOwned ? '보유중' : `${discountedCost.toLocaleString()} KRW`}
            </button>
        `;
        if (!isOwned) {
            itemEl.querySelector('button')?.addEventListener('click', () => handleShopBuy(item.id, discountedCost));
        }
        dom.shopItems.appendChild(itemEl);
    });
}
function populateCraftingItems() {
    if(!dom.craftingItems) return;
    dom.craftingItems.innerHTML = '';
    Object.keys(CRAFTING_DATA).forEach(key => {
        const item = CRAFTING_DATA[key];
        let costString = '';
        const canCraft = Object.keys(item.cost).every(res => gameState[res] >= item.cost[res]);
        for(const res in item.cost){
            const resName = RESOURCE_NAME_MAP[res] || res;
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
function populateTotemItems() {
    if (!dom.totemItems) return;
    dom.totemItems.innerHTML = '';
    Object.keys(TOTEM_DATA).forEach(key => {
        const totem = TOTEM_DATA[key];
        const hasExperienced = totem.type === 'weather' ? gameState.experiencedWeathers[totem.effect] : true;
        const purchaseLimit = TOTEM_PURCHASE_LIMITS[totem.tier as keyof typeof TOTEM_PURCHASE_LIMITS];
        const purchaseCount = gameState.totemPurchaseCounts[totem.tier] || 0;
        const isSoldOut = purchaseCount >= purchaseLimit;
        const canAfford = gameState.userCash >= totem.cost;

        let buttonText = `${totem.cost.toLocaleString()} KRW`;
        let isDisabled = false;
        let buttonClass = 'bg-purple-600 hover:bg-purple-700';

        let totemName = totem.name;
        let totemDesc = totem.desc;

        if (totem.type === 'weather' && !hasExperienced) {
            totemName = '???';
            totemDesc = '해당 날씨를 경험하면 잠금 해제됩니다.';
        }

        if (!hasExperienced) {
            buttonText = '경험 필요';
            isDisabled = true;
            buttonClass = 'btn-disabled';
        } else if (isSoldOut) {
            buttonText = `시즌 구매 완료 (${purchaseCount}/${purchaseLimit})`;
            isDisabled = true;
            buttonClass = 'bg-gray-500 cursor-default';
        } else if (!canAfford) {
            buttonText = `${totem.cost.toLocaleString()} KRW`;
            isDisabled = true;
            buttonClass = 'btn-disabled';
        }

        const itemEl = document.createElement('div');
        itemEl.className = 'bg-gray-800 p-3 rounded-lg flex flex-col justify-between';
        itemEl.innerHTML = `
            <div>
                <h4 class="font-bold text-base">${totemName}</h4>
                <p class="text-xs text-gray-400 my-1">${totemDesc}</p>
            </div>
            <button id="buy-totem-${key}" class="w-full mt-2 text-sm font-bold py-1.5 px-3 rounded-lg ${buttonClass}" ${isDisabled ? 'disabled' : ''}>
                ${buttonText}
            </button>
        `;
        if (!isDisabled) {
            itemEl.querySelector('button')?.addEventListener('click', () => handleTotemBuy(key));
        }
        dom.totemItems.appendChild(itemEl);
    });
}

function handleTotemBuy(totemId: string) {
    const totem = TOTEM_DATA[totemId];
    if (!totem) return;

    const hasExperienced = totem.type === 'weather' ? gameState.experiencedWeathers[totem.effect] : true;
    const purchaseLimit = TOTEM_PURCHASE_LIMITS[totem.tier as keyof typeof TOTEM_PURCHASE_LIMITS];
    const purchaseCount = gameState.totemPurchaseCounts[totem.tier] || 0;
    const isSoldOut = purchaseCount >= purchaseLimit;
    const canAfford = gameState.userCash >= totem.cost;

    if (!hasExperienced) { showNotification('해당 날씨를 경험해야 구매할 수 있습니다.', true); return; }
    if (isSoldOut) { showNotification('이번 시즌 구매 한도를 초과했습니다.', true); return; }
    if (!canAfford) { showNotification('자금이 부족합니다.', true); return; }

    gameState.userCash -= totem.cost;
    gameState.totemPurchaseCounts[totem.tier]++;

    if (totem.type === 'weather') {
        const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
        const season = gameState.season;
        const conditions = totem.conditions;
        const seasonMatch = !conditions.season || conditions.season.includes(season);
        const timeMatch = !conditions.time || (conditions.time === 'night' && isNight) || (conditions.time === 'day' && !isNight);

        if (seasonMatch && timeMatch) {
            gameState.weather = totem.effect;
            gameState.experiencedWeathers[totem.effect] = true;
            showNotification(`${totem.name} 효과로 날씨가 즉시 변경되었습니다!`, false);
            checkTrophies();
            startPriceUpdateLoops();
        } else {
             showNotification(`${totem.name} 구매 완료! 다음 날씨 변경 시 조건이 맞으면 적용됩니다.`, false);
             gameState.nextWeatherOverride = totem.effect;
        }

    } else if (totem.type === 'time') {
        gameTime.setHours(gameTime.getHours() + totem.effect);
        showNotification(`${totem.name} 효과로 시간이 8시간 경과했습니다.`, false);
        startPriceUpdateLoops();
    }
    
    populateTotemItems(); // Re-render shop
    saveGameState();
}
function handleShopBuy(itemId: string, cost: number) {
    if (gameState.userCash >= cost && !gameState.shopItems[itemId]) {
        gameState.userCash -= cost;
        gameState.shopItems[itemId] = true;
        showNotification(`${itemId} 구매 완료!`, false);
        populateShopUI();
        restoreUIState();
        if (itemId === 'furnace') populateDrillAndProductionUI();
        saveGameState();
    } else {
        showNotification('자금이 부족하거나 이미 보유한 아이템입니다.', true);
    }
}

function updateWeatherAlmanacUI() {
    if (!dom.weatherAlmanacSection || !dom.weatherAlmanacContent) return;

    const hasAlmanac = gameState.shopItems.weatherAlmanac;
    dom.weatherAlmanacSection.classList.toggle('hidden', !hasAlmanac);
    if (!hasAlmanac) return;

    dom.weatherAlmanacContent.innerHTML = '';
    const experienced = Object.keys(gameState.experiencedWeathers);
    
    Object.keys(WEATHER_DATA).forEach(weatherName => {
        const weather = WEATHER_DATA[weatherName];
        const hasExperienced = experienced.includes(weatherName);
        const el = document.createElement('div');
        el.className = 'bg-gray-800/50 p-2 rounded flex items-center gap-3';
        
        if (hasExperienced) {
            el.innerHTML = `
                <span class="text-2xl">${weather.icon}</span>
                <div>
                    <h5 class="font-bold">${weatherName}</h5>
                    <p class="text-xs text-gray-400">${weather.long_desc}</p>
                </div>
            `;
        } else {
            el.innerHTML = `
                <span class="text-2xl">❓</span>
                <div>
                    <h5 class="font-bold text-gray-500">???</h5>
                    <p class="text-xs text-gray-500">아직 경험하지 못했습니다.</p>
                </div>
            `;
        }
        dom.weatherAlmanacContent.appendChild(el);
    });
}
function updateTrophyUI() {
    if (!dom.trophyList) return;
    dom.trophyList.innerHTML = '';

    Object.keys(TROPHY_DATA).forEach(key => {
        const trophy = TROPHY_DATA[key as keyof typeof TROPHY_DATA];
        const isUnlocked = trophy.isUnlocked(gameState);
        const el = document.createElement('div');
        el.className = `p-3 rounded-lg flex items-center gap-4 ${isUnlocked ? 'bg-yellow-800/50' : 'bg-gray-800/50'}`;
        el.innerHTML = `
            <span class="text-4xl">${isUnlocked ? trophy.icon : '❓'}</span>
            <div>
                <h4 class="font-bold ${isUnlocked ? 'text-yellow-300' : ''}">${trophy.name}</h4>
                <p class="text-xs text-gray-400">${trophy.desc}</p>
                ${isUnlocked ? `<p class="text-xs text-green-400 mt-1">보상: ${trophy.reward}</p>` : ''}
            </div>
        `;
        dom.trophyList.appendChild(el);
    });
}
function checkTrophies() {
    const state = gameState;
    if (!state.hasWeatherTrophy) { if (Object.keys(state.experiencedWeathers).length >= Object.keys(WEATHER_DATA).length) { state.hasWeatherTrophy = true; showNotification(`트로피 획득: ${TROPHY_DATA.weatherMaster.name}!`, false); updateTrophyUI(); saveGameState(); } }
    if (!state.hasPowerTrophy) { const {CUBE, LUNAR, ENERGY, PRISM} = state.minedCoins; if (CUBE >= 100 && LUNAR >= 100 && ENERGY >= 100 && PRISM >= 100) { state.hasPowerTrophy = true; showNotification(`트로피 획득: ${TROPHY_DATA.powerMaster.name}!`, false); updateTrophyUI(); saveGameState(); } }
    if (!state.hasTimeTrophy) { if (state.sleepCount >= 20) { state.hasTimeTrophy = true; showNotification(`트로피 획득: ${TROPHY_DATA.timeMaster.name}!`, false); updateTrophyUI(); saveGameState(); } }
}

function getNewPrice(coinId: string) {
    // Check for global override first
    if (globalPriceOverrides && globalPriceOverrides[coinId]) {
        return globalPriceOverrides[coinId];
    }

    const coinConfig = COIN_DATA[coinId];
    if (!coinConfig) return gameState[coinConfig.priceKey];

    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    const timeOfDay = isNight ? 'night' : 'day';

    let upChance = (typeof coinConfig.upChance === 'object') ? coinConfig.upChance[timeOfDay] : coinConfig.upChance;
    const fluctuation = coinConfig.fluctuation[timeOfDay];

    // Weather effects
    const weatherEffect = WEATHER_DATA[gameState.weather];
    if (weatherEffect.isGood) upChance += 0.025;
    if (weatherEffect.isBad) upChance -= 0.025;
    if (gameState.weather === '비' && coinId === 'Cube') upChance += 0.01;
    if (gameState.weather === '오로라') upChance += 0.05;
    if (gameState.weather === '별똥별') upChance += 0.025;
    if (gameState.weather === '우박') upChance -= 0.025;


    // Trophy effects
    if (gameState.hasPowerTrophy && coinId === 'Energy') upChance += 0.01;
    
    // Determine magnitude
    const rand = Math.random();
    let magnitude;
    if (rand < fluctuation.large) {
        magnitude = (Math.random() * 0.08) + 0.07; // 7% ~ 15%
    } else if (rand < fluctuation.large + fluctuation.medium) {
        magnitude = (Math.random() * 0.04) + 0.03; // 3% ~ 7%
    } else {
        magnitude = (Math.random() * 0.02) + 0.01; // 1% ~ 3%
    }

    let multiplier = 1 + magnitude;
    const currentPrice = gameState[coinConfig.priceKey];
    let newPrice;

    if (Math.random() < upChance) {
        newPrice = currentPrice * multiplier;
    } else {
        newPrice = currentPrice / multiplier;
    }

    // Clamp price within min/max bounds
    return Math.floor(Math.max(coinConfig.minPrice, Math.min(coinConfig.maxPrice, newPrice)));
}


function startPriceUpdateLoops() {
    Object.keys(priceUpdateIntervals).forEach(key => clearInterval(priceUpdateIntervals[key]));
    priceUpdateIntervals = {};

    Object.keys(COIN_DATA).forEach(coinId => {
        const coinConfig = COIN_DATA[coinId];
        const lastPriceKey = coinConfig.priceKey === 'currentPrice' ? 'lastPrice' : `last${coinId}Price`;
        
        const updatePrice = () => {
            const newPrice = getNewPrice(coinId);
            gameState[lastPriceKey] = gameState[coinConfig.priceKey];
            gameState[coinConfig.priceKey] = newPrice;
        };
        
        const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
        let interval = (typeof coinConfig.interval === 'object') ? coinConfig.interval[isNight ? 'night' : 'day'] : coinConfig.interval;

        // Apply weather/trophy time modifiers
        if (gameState.weather === '황사') interval *= 1.1;
        if (gameState.weather === '오로라') interval *= 0.8;
        if (isNight && gameState.hasTimeTrophy) interval *= 0.95;

        priceUpdateIntervals[coinId] = setInterval(updatePrice, interval / currentGameSpeed);
    });
}

function gameLoop() {
    const state = gameState; if(state.isSleeping) return; gameTime.setMinutes(gameTime.getMinutes() + 1);
    const oldIsNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    if (gameTime.getMinutes() === 0) { // Check for day/night change on the hour
        const newIsNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
        if(oldIsNight !== newIsNight) {
            startPriceUpdateLoops(); // Restart loops if day/night status changes
        }
    }
    
    if (gameTime.getHours() === 0 && gameTime.getMinutes() === 0) { state.dayInSeason++; if (state.dayInSeason > 3) { state.dayInSeason = 1; state.season = SEASONS[(SEASONS.indexOf(state.season) + 1) % SEASONS.length]; state.totemPurchaseCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; populateShopUI(); } }
    
    // Disabled Magic Stone from 3D Cube
    if (state.isLunarUpgraded && Math.random() < (0.002 / 4)) { state.disabledMagicStone++; }

    // Weather logic
    if (globalWeatherOverride) { if(gameState.weather !== globalWeatherOverride) { gameState.weather = globalWeatherOverride; startPriceUpdateLoops(); } }
    if (state.isInternetOutage && Date.now() > state.isInternetOutageCooldown) { state.isInternetOutage = false; showNotification('인터넷 연결이 복구되었습니다.', false); }
    if (dom.internetOutage) dom.internetOutage.classList.toggle('hidden', !state.isInternetOutage);
    
    // Income Logic
    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    let baseProduction = 0; if(state.isCubePurchased) { baseProduction = 100; if(state.isPrismUpgraded) baseProduction = 400; else if(state.isEnergyUpgraded) baseProduction = 200; }
    const lunarBonus = (state.isLunarUpgraded && isNight) ? 100 : 0;
    let totalIncome = baseProduction + lunarBonus; if (state.weather === '폭염') totalIncome *= 0.5;

    // Skill: efficientProduction
    const prodSkillLevel = gameState.skills.efficientProduction;
    if (prodSkillLevel > 0) {
        totalIncome *= (1 + SKILL_TREE_DATA.cube.skills.efficientProduction.levels[prodSkillLevel-1].effect);
    }
    // Skill: fastRotation
    const rotSkillLevel = gameState.skills.fastRotation;
    if (rotSkillLevel > 0 && Math.random() < SKILL_TREE_DATA.cube.skills.fastRotation.levels[rotSkillLevel-1].effect) {
        totalIncome *= 2;
    }

    if (state.exceptionalState.isActive) { if(Date.now() > state.exceptionalState.expiresAt) { state.exceptionalState.isActive = false; } else { totalIncome *= 2; } }
    state.userCash += totalIncome / 4;
    
    // v2 Update Banner Logic
    if (dom.updateBanner && dom.countdownTimer) {
        const showBannerThreshold = 5 * 60 * 60 * 1000; // 5 hours in ms
        const timeToUpdate = V2_UPDATE_TIMESTAMP - Date.now();
        if (timeToUpdate > 0 && timeToUpdate < showBannerThreshold) {
            dom.updateBanner.classList.remove('hidden');
            const hours = Math.floor(timeToUpdate / (1000 * 60 * 60));
            const minutes = Math.floor((timeToUpdate % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeToUpdate % (1000 * 60)) / 1000);
            dom.countdownTimer.textContent = `${String(hours).padStart(2, '0')}시간 ${String(minutes).padStart(2, '0')}분 ${String(seconds).padStart(2, '0')}초`;
        } else {
            dom.updateBanner.classList.add('hidden');
        }
    }

    processSmeltingQueue();
    updateUI();
}
function runDrill() {
    const state = gameState;
    if (state.isSleeping || state.drillTier === 0 || state.weather === '폭우') return;
    const tier = state.drillTier;
    const mine = (chance: number, item: keyof typeof gameState, name: string) => { if (Math.random() < chance) {state[item]++; showNotification(`${name} 1개 채굴!`, false)} };
    mine(0.05 * tier, 'stone', '돌'); 
    mine(0.04 * tier, 'coal', '석탄'); 
    mine(0.03 * tier, 'copperOre', '구리 원석'); 
    mine(0.02 * tier, 'ironOre', '철 원석'); 
    mine(0.01 * tier, 'goldOre', '금 원석'); 
    mine(0.005 * tier, 'magicDust', '마법 가루'); 
    mine(0.002 * tier, 'diamond', '다이아몬드');
}

function processSmeltingQueue() {
    const state = gameState;
    if (state.smeltingQueue.length === 0) return;

    const firstItem = state.smeltingQueue[0];
    const smeltingTime = state.shopItems.furnace ? 3000 : 5000;

    if (!firstItem.startTime) {
        firstItem.startTime = Date.now();
    }

    if (Date.now() - firstItem.startTime >= smeltingTime) {
        const completedItem = state.smeltingQueue.shift(); 
        const productName = completedItem.product;
        gameState[productName] = (gameState[productName] || 0) + 1;
        const friendlyName = RESOURCE_NAME_MAP[productName] || productName;
        showNotification(`${friendlyName} 1개 제련 완료!`, false);
        populateDrillAndProductionUI();
        saveGameState();
    }
}
function updateWeather() {
    if (globalWeatherOverride) { return; }
    
    const isNight = gameTime.getHours() < 9 || gameTime.getHours() >= 19;
    const season = gameState.season;

    // 1. Check for totem override
    if (gameState.nextWeatherOverride) {
        const targetWeather = gameState.nextWeatherOverride;
        gameState.nextWeatherOverride = null; // Consume the override
        
        const totemKey = Object.keys(TOTEM_DATA).find(k => TOTEM_DATA[k].effect === targetWeather);
        if (totemKey) {
            const conditions = TOTEM_DATA[totemKey].conditions;
            const seasonMatch = !conditions.season || conditions.season.includes(season);
            const timeMatch = !conditions.time || (conditions.time === 'night' && isNight) || (conditions.time === 'day' && !isNight);

            if (seasonMatch && timeMatch) {
                if (gameState.weather !== targetWeather) {
                    gameState.weather = targetWeather;
                    gameState.experiencedWeathers[targetWeather] = true;
                    showNotification(`토템 효과로 날씨가 ${targetWeather}(으)로 변경됩니다!`, false);
                    checkTrophies();
                    startPriceUpdateLoops();
                }
                return; // Weather changed successfully
            } else {
                showNotification(`${targetWeather} 토템을 사용하기 위한 계절/시간 조건이 맞지 않아 실패했습니다.`, true);
            }
        }
    }

    // 2. Generate random weather
    let weights: { [key: string]: number } = {};
    const addWeight = (w: string, val: number) => { weights[w] = (weights[w] || 0) + val; };

    // Base weights
    addWeight('맑음', 20); addWeight('구름', 20); addWeight('비', 15); addWeight('바람', 10);
    addWeight('무지개', 1); addWeight('산성비', 2); addWeight('천둥', 2);

    // Seasonal adjustments
    if (season === '봄') {
        addWeight('비', 15); addWeight('황사', 5); weights['구름'] -= 5;
    } else if (season === '여름') {
        addWeight('맑음', 15); addWeight('폭염', 5); addWeight('천둥', 5);
        addWeight('폭우', 5); weights['비'] -= 5;
    } else if (season === '가을') {
        addWeight('구름', 15); addWeight('바람', 15);
    } else if (season === '겨울') {
       delete weights['비'];
       addWeight('눈', 20); addWeight('우박', 2);
    }
    
    // Night-specific weather
    if (isNight) {
        addWeight('별똥별', 5);
        if (season === '겨울') { addWeight('오로라', 1); weights['별똥별'] -= 1;}
    }

    // Trophy adjustment
    if (gameState.hasWeatherTrophy) {
        Object.keys(weights).forEach(w => {
            if (WEATHER_DATA[w]?.isGood) weights[w] *= 1.025;
            if (WEATHER_DATA[w]?.isBad) weights[w] *= 0.975;
        });
    }

    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;
    let newWeather = '맑음';

    for (const weather in weights) {
        random -= weights[weather];
        if (random <= 0) {
            newWeather = weather;
            break;
        }
    }
    
    if (gameState.weather !== newWeather) {
        gameState.weather = newWeather;
        gameState.experiencedWeathers[newWeather] = true;
        // Skill: exceptional state
        if (newWeather === '별똥별') {
            const exceptionalSkillLevel = gameState.skills.exceptional;
            if (exceptionalSkillLevel > 0 && Math.random() < SKILL_TREE_DATA.cube.skills.exceptional.levels[exceptionalSkillLevel-1].effect) {
                gameState.exceptionalState.isActive = true;
                gameState.exceptionalState.expiresAt = Date.now() + 60000; // 1 minute
                showNotification("특출남 상태 발동! 1분간 수익이 2배가 됩니다!", false);
            }
        }
        checkTrophies();
        startPriceUpdateLoops();
    }
}


function addTransaction(type: 'buy' | 'sell', coin: string, amount: number, price: number) {
    const transaction = {
        type: type,
        coin: coin,
        amount: amount,
        price: price,
        timestamp: new Date(gameTime).toLocaleTimeString('ko-KR')
    };
    gameState.transactionHistory.unshift(transaction);
    if (gameState.transactionHistory.length > 50) gameState.transactionHistory.pop();
}

function handleTrade(type: 'buy' | 'sell', coinId: string) {
    const coinConfig = COIN_DATA[coinId];
    if (!coinConfig) return;

    const amountInput = document.getElementById(`trade-amount-${coinId}`) as HTMLInputElement;
    const amount = parseInt(amountInput.value, 10);

    if (isNaN(amount) || amount <= 0) {
        showNotification('유효한 수량을 입력하세요.', true);
        return;
    }

    const price = gameState[coinConfig.priceKey];
    const totalCost = price * amount;

    if (type === 'buy') {
        if (gameState.userCash >= totalCost) {
            gameState.userCash -= totalCost;
            gameState[coinConfig.amountKey] += amount;
            addTransaction(type, coinId, amount, price);
        } else {
            showNotification('자금이 부족합니다.', true);
        }
    } else if (type === 'sell') {
        if (gameState[coinConfig.amountKey] >= amount) {
            gameState.userCash += totalCost;
            gameState[coinConfig.amountKey] -= amount;
            addTransaction(type, coinId, amount, price);
        } else {
            showNotification('보유한 코인이 부족합니다.', true);
        }
    }
    amountInput.value = '';
    updateTransactionHistoryUI();
}

function handleMaxAmount(type: 'buy' | 'sell', coinId: string) {
    const coinConfig = COIN_DATA[coinId];
    if (!coinConfig) return;

    const amountInput = document.getElementById(`trade-amount-${coinId}`) as HTMLInputElement;
    const price = gameState[coinConfig.priceKey];

    if (type === 'buy') {
        const maxCanBuy = Math.floor(gameState.userCash / price);
        amountInput.value = String(maxCanBuy > 0 ? maxCanBuy : '');
    } else { // 'sell'
        const maxCanSell = gameState[coinConfig.amountKey];
        amountInput.value = String(maxCanSell > 0 ? maxCanSell : '');
    }
}

function updateTransactionHistoryUI() {
    if (!dom.transactionHistoryList) return;
    dom.transactionHistoryList.innerHTML = '';
    if (gameState.transactionHistory.length === 0) {
        dom.transactionHistoryList.innerHTML = '<li class="text-sm text-gray-500 italic">거래 기록이 없습니다.</li>';
        return;
    }
    gameState.transactionHistory.forEach((tx: any) => {
        const el = document.createElement('li');
        const isBuy = tx.type === 'buy';
        const color = isBuy ? 'text-green-400' : 'text-red-400';
        const typeText = isBuy ? '매수' : '매도';
        el.className = 'text-sm flex justify-between items-center p-1 bg-gray-800/50 rounded';
        el.innerHTML = `
            <span class="${color} font-semibold w-12">${typeText}</span>
            <span class="flex-1">${tx.coin.toUpperCase()} ${tx.amount.toLocaleString()}개</span>
            <span class="w-24 text-right">${tx.price.toLocaleString()} KRW</span>
            <span class="w-20 text-right text-gray-400 text-xs">${tx.timestamp}</span>
        `;
        dom.transactionHistoryList.appendChild(el);
    });
}
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
    const costData = COMPUTER_DATA[tier + 1];
    const cost = costData.cost;
    
    const canAfford = Object.keys(cost).every(key => gameState[key] >= cost[key as keyof typeof cost]);

    if (canAfford) {
        for(const key in cost) { gameState[key as keyof typeof cost] -= cost[key as keyof typeof cost]; }
        gameState.computerTier++;
        showNotification(`컴퓨터를 Tier ${gameState.computerTier}으로 업그레이드했습니다!`, false);
        updateComputerUI();
        saveGameState();
    } else {
        let missing = [];
        for (const key in cost) {
            const needed = (cost as any)[key];
            const owned = gameState[key] || 0;
            if (owned < needed) {
                missing.push(`${needed - owned} ${RESOURCE_NAME_MAP[key]}`);
            }
        }
        showNotification(`업그레이드 재료 부족: ${missing.join(', ')}`, true);
    }
}
function handleDrillUpgrade() {
    const tier = gameState.drillTier;
    if (tier >= DRILL_DATA.length) return;
    const originalCost = DRILL_DATA[tier].cost;
    const cost = getDiscountedCost(originalCost);

    if (gameState.userCash >= cost) {
        gameState.userCash -= cost;
        gameState.drillTier++;
        showNotification(`드릴을 Tier ${gameState.drillTier}으로 업그레이드했습니다!`, false);
        populateDrillAndProductionUI();
        saveGameState();
    } else {
        showNotification(`자금 부족: ${ (cost - gameState.userCash).toLocaleString() } KRW`, true);
    }
}

function handleUpgradeLunar() {
    if (gameState.userLunar >= 200 && !gameState.isLunarUpgraded) {
        gameState.userLunar -= 200;
        gameState.isLunarUpgraded = true;
        showNotification('LUNAR 강화 완료!', false);
        restoreUIState(); saveGameState();
    } else { showNotification('LUNAR 코인이 부족합니다.', true); }
}
function handleUpgradeEnergy() {
    if (gameState.userEnergy >= 100 && !gameState.isEnergyUpgraded) {
        gameState.userEnergy -= 100;
        gameState.isEnergyUpgraded = true;
        showNotification('ENERGY 강화 완료!', false);
        restoreUIState(); saveGameState();
    } else { showNotification('ENERGY 코인이 부족합니다.', true); }
}
function handleUpgradePrism() {
    if (gameState.userPrisms >= 100 && !gameState.isPrismUpgraded) {
        gameState.userPrisms -= 100;
        gameState.isPrismUpgraded = true;
        showNotification('PRISM 강화 완료!', false);
        restoreUIState(); saveGameState();
    } else { showNotification('PRISM 코인이 부족합니다.', true); }
}

function handleSleep() {
    const state = gameState;
    if (state.weather === '눈') { showNotification('눈이 와서 잘 수 없습니다.', true); return; }
    if (!state.shopItems.bed) { showNotification('침대가 없어서 잘 수 없습니다. 상점에서 구매하세요.', true); return; }
    state.sleepCount++;
    const currentHour = gameTime.getHours();
    if (currentHour >= 19 || currentHour < 9) {
        if(currentHour >= 19) { gameTime.setDate(gameTime.getDate() + 1); }
        gameTime.setHours(9, 0, 0, 0);
        showNotification('수면을 취하고 다음 날 아침이 되었습니다.', false);
        startPriceUpdateLoops(); // Day/night change
        checkTrophies();
    } else {
        showNotification('밤에만 잘 수 있습니다.', true);
    }
}

function switchShopTab(tabName: string) {
    const tabs = ['function', 'totems'];
    tabs.forEach(t => {
        const content = dom[`shopContent${t.charAt(0).toUpperCase() + t.slice(1)}`];
        const tab = dom[`shopTab${t.charAt(0).toUpperCase() + t.slice(1)}`];
        if (content) content.classList.toggle('hidden', t !== tabName);
        if (tab) tab.classList.toggle('tab-active', t !== tabName);
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
async function handleCodeSubmit() {
    const codeInput = dom.codeInput as HTMLInputElement;
    const code = codeInput.value.toUpperCase().trim();
    if (!code) return;

    if (code === 'RESET') {
        resetUserData();
        return;
    }

    if (gameState.usedCodes && gameState.usedCodes.includes(code)) {
        showNotification('이미 사용한 코드입니다.', true);
        return;
    }

    const codeRef = db.ref(`promoCodes/${code}`);
    const snapshot = await codeRef.get();

    if (snapshot.exists()) {
        const reward = snapshot.val();
        gameState[reward.rewardType] = (gameState[reward.rewardType] || 0) + reward.amount;
        
        if (!gameState.usedCodes) {
            gameState.usedCodes = [];
        }
        gameState.usedCodes.push(code);

        showNotification(`보상 획득: ${RESOURCE_NAME_MAP[reward.rewardType] || reward.rewardType} ${reward.amount.toLocaleString()}!`, false);
        codeInput.value = '';
        await saveGameState();
    } else {
        showNotification('유효하지 않은 코드입니다.', true);
    }
}
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
            let offlineKRW = (baseProduction + lunarBonus) * offlineSeconds;
            // Apply production skill
            const prodSkillLevel = gameState.skills.efficientProduction;
            if (prodSkillLevel > 0) {
                offlineKRW *= (1 + SKILL_TREE_DATA.cube.skills.efficientProduction.levels[prodSkillLevel-1].effect);
            }
            gameState.userCash += offlineKRW;
            
            // 2. Drill income
            const drillCycles = Math.floor(offlineSeconds / 10); // 10초로 변경
            if (drillCycles > 0 && gameState.drillTier > 0) {
                const tier = gameState.drillTier;
                gameState.stone += Math.floor(drillCycles * (0.05 * tier));
                gameState.coal += Math.floor(drillCycles * (0.04 * tier));
                gameState.copperOre += Math.floor(drillCycles * (0.03 * tier));
                gameState.ironOre += Math.floor(drillCycles * (0.02 * tier));
                gameState.goldOre += Math.floor(drillCycles * (0.01 * tier));
                gameState.magicDust += Math.floor(drillCycles * (0.005 * tier));
                gameState.diamond += Math.floor(drillCycles * (0.002 * tier));
            }

            // 3. Computer income
            const tier = gameState.computerTier;
            if (tier > 0) {
                const efficiencyLevel = gameState.skills.gpuEfficiency;
                const miningInterval = 60 - (efficiencyLevel > 0 ? SKILL_TREE_DATA.computer.skills.gpuEfficiency.levels[efficiencyLevel - 1].effect : 0);
                const computerCycles = Math.floor(offlineSeconds / miningInterval);
                if(computerCycles > 0) {
                    gameState.userCubes += Math.floor(tier * 2 * computerCycles);
                    gameState.userLunar += Math.floor(tier * 1.5 * computerCycles);
                    gameState.userEnergy += Math.floor(tier * 1 * computerCycles);
                    gameState.userPrisms += Math.floor(tier * 0.5 * computerCycles);
                }
            }

            showNotification(`오프라인 보상: ${Math.floor(offlineKRW).toLocaleString()} KRW 및 자원을 획득했습니다!`, false);
        }
        
        gameState.lastOnlineTimestamp = now;
        return true;
    }
    return false;
}
function handleSendMessage() {
    const input = dom.chatInput as HTMLInputElement;
    const text = input.value.trim();

    if (text === '/dev.mod') {
        dom.devPanel.classList.toggle('hidden');
        input.value = '';
        return;
    }

    if (text && userNickname) {
        db.ref('chat').push({
            nickname: userNickname,
            text: text,
        });
        input.value = '';
    }
}
function appendChatMessage(message: { nickname: string, text: string }) {
    if (!dom.chatMessages) return;
    const msgEl = document.createElement('div');
    msgEl.innerHTML = `<span class="font-semibold text-blue-300">${message.nickname}</span>: <span>${message.text}</span>`;
    dom.chatMessages.appendChild(msgEl);
    dom.chatMessages.scrollTop = dom.chatMessages.scrollHeight;
}

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
    
    stopGame(); // Stop any leftover intervals from a previous session
    initGame();
    startGame();
    
    const chatRef = db.ref('chat').limitToLast(100);
    chatRef.on('child_added', (snapshot) => {
        const message = snapshot.val();
        if (message) {
            appendChatMessage(message);
        }
    });

    db.ref('chat').on('child_removed', () => {
        dom.chatMessages.innerHTML = ''; // Clear chat on client side
    });

    const globalRef = db.ref('globalState');
    globalRef.on('value', (snapshot) => {
        const globals = snapshot.val() || {};
        const newSpeed = globals.speed || 1;
        if (newSpeed !== currentGameSpeed) {
            currentGameSpeed = newSpeed;
            restartGameLoop();
            startPriceUpdateLoops();
        }
        globalWeatherOverride = globals.weather || null;
        globalPriceOverrides = globals.prices || null;
        if(globalPriceOverrides) {
           Object.keys(globalPriceOverrides).forEach(coinId => {
               const coinConfig = COIN_DATA[coinId];
               if(coinConfig) {
                   gameState[coinConfig.priceKey] = globalPriceOverrides[coinId];
               }
           });
        }
        handleAnnouncementUpdate(globals.announcement || null);
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
            renderer = null; // Ensure 3D animation stops on logout
            userUID = null;
            userNickname = null;
            document.getElementById('auth-container')?.classList.remove('hidden');
            document.getElementById('main-content')?.classList.add('hidden');
        }
    });

    ['assets', 'inventory', 'trade', 'history', 'drill', 'computer', 'skills', 'trophy', 'almanac', 'shop', 'code', 'settings'].forEach(s => {
        const toggle = document.getElementById(`toggle-${s}`);
        if (toggle) {
            toggle.addEventListener('click', () => {
                document.getElementById(`content-${s}`)?.classList.toggle('hidden');
                document.getElementById(`toggle-${s}-icon`)?.classList.toggle('rotate-180');
            });
        }
    });
});

function populateDrillAndProductionUI() {
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
    dom.drillUpgradeButton.classList.toggle('hidden', isMaxTier);
    if (!isMaxTier) {
        const cost = getDiscountedCost(DRILL_DATA[tier].cost);
        dom.drillUpgradeButton.textContent = `${DRILL_DATA[tier].name} 구매 (${cost.toLocaleString()} KRW)`;
    } else {
        dom.drillUpgradeButton.textContent = '최고 티어';
    }
    populateSmeltingControls();
    updateSmeltingQueueUI();
    populateCraftingItems();
}

function populateSmeltingControls() {
    if(!dom.smeltingControls) return;
    if (!gameState.shopItems.furnace) {
        dom.smeltingControls.parentElement.classList.add('hidden');
        return;
    }
    dom.smeltingControls.parentElement.classList.remove('hidden');
    dom.smeltingControls.innerHTML = '';

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
        dom.smeltingControls.appendChild(button);
    });
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
        populateCraftingItems();
        updateComputerUI();
        saveGameState();
    } else {
        showNotification('재료가 부족합니다.', true);
    }
}

function handleSmeltItem(ore: string, ingot: string) {
    if (gameState.smeltingQueue.length >= 3) {
        showNotification('제련 대기열이 가득 찼습니다. (최대 3개)', true);
        return;
    }
    if(gameState[ore] > 0 && gameState.coal > 0) {
        gameState[ore]--;
        gameState.coal--;
        gameState.smeltingQueue.push({ product: ingot, startTime: null });
        showNotification('제련 대기열에 추가되었습니다.', false);
        populateSmeltingControls();
        updateSmeltingQueueUI();
    } else {
        showNotification('자원이 부족합니다.', true);
    }
}

function getDiscountedCost(originalCost: number): number {
    const discountLevel = gameState.skills.regularCustomer;
    if (discountLevel > 0) {
        const discountRate = SKILL_TREE_DATA.shop.skills.regularCustomer.levels[discountLevel - 1].effect;
        return Math.floor(originalCost * (1 - discountRate));
    }
    return originalCost;
}

function startComputerMining() {
    if (computerInterval) clearInterval(computerInterval);
    if (gameState.computerTier === 0) return;

    const efficiencyLevel = gameState.skills.gpuEfficiency;
    const intervalSeconds = 60 - (efficiencyLevel > 0 ? SKILL_TREE_DATA.computer.skills.gpuEfficiency.levels[efficiencyLevel - 1].effect : 0);
    
    const runComputerMining = () => {
        const state = gameState;
        if (state.isSleeping || state.computerTier === 0 || state.weather === '폭우') return;
        const tier = state.computerTier;
        const gainCoin = (baseAmount: number, coin: string, coinKey: keyof typeof gameState) => {
            const amount = tier * baseAmount;
            state[coinKey] += amount;
            (state.minedCoins as any)[coin] = ((state.minedCoins as any)[coin] || 0) + amount;
        };
        gainCoin(2, 'CUBE', 'userCubes');
        gainCoin(1.5, 'LUNAR', 'userLunar');
        gainCoin(1, 'ENERGY', 'userEnergy');
        gainCoin(0.5, 'PRISM', 'userPrisms');
        checkTrophies();
    };

    computerInterval = setInterval(runComputerMining, intervalSeconds * 1000 / currentGameSpeed);
}

function populateSkillTreeUI() {
    if (!dom.skillTreeContent) return;
    dom.skillTreeContent.innerHTML = '';

    Object.keys(SKILL_TREE_DATA).forEach(categoryKey => {
        const category = SKILL_TREE_DATA[categoryKey];
        const categoryEl = document.createElement('div');
        categoryEl.className = 'bg-gray-800/50 p-3 rounded-lg';
        categoryEl.innerHTML = `<h4 class="text-md font-semibold text-gray-300 mb-2">${category.name}</h4>`;
        
        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'space-y-3';

        Object.keys(category.skills).forEach(skillKey => {
            const skill = category.skills[skillKey];
            const currentLevel = gameState.skills[skillKey] || 0;
            const isMaxLevel = currentLevel >= skill.maxLevel;

            let costString = '최고 레벨';
            let canAfford = false;
            let nextLevelData: any = null;

            if (!isMaxLevel) {
                nextLevelData = skill.levels[currentLevel];
                const cost = nextLevelData.cost;
                canAfford = Object.keys(cost).every(res => gameState[res] >= cost[res]);
                costString = Object.keys(cost).map(res => `${cost[res].toLocaleString()} ${RESOURCE_NAME_MAP[res] || res}`).join(', ');
            }
            
            const skillEl = document.createElement('div');
            skillEl.className = 'bg-gray-700 p-3 rounded';
            skillEl.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h5 class="font-bold text-sm">${skill.name}</h5>
                        <p class="text-xs text-gray-400 mt-1">${skill.desc(currentLevel)}</p>
                    </div>
                    <div class="flex items-center gap-1">
                        ${[...Array(skill.maxLevel)].map((_, i) => `<div class="w-3 h-3 rounded-sm ${i < currentLevel ? 'bg-yellow-400' : 'bg-gray-500'}"></div>`).join('')}
                    </div>
                </div>
                <button 
                    class="w-full mt-2 text-xs font-bold py-1 px-2 rounded-lg ${isMaxLevel ? 'bg-green-700 cursor-default' : (canAfford ? 'bg-blue-600 hover:bg-blue-700' : 'btn-disabled')}"
                    ${isMaxLevel || !canAfford ? 'disabled' : ''}
                    onclick="handleSkillUpgrade('${skillKey}')"
                >${costString}</button>
            `;
            skillsContainer.appendChild(skillEl);
        });

        categoryEl.appendChild(skillsContainer);
        dom.skillTreeContent.appendChild(categoryEl);
    });

    (window as any).handleSkillUpgrade = handleSkillUpgrade;
}

function handleSkillUpgrade(skillKey: string) {
    // FIX: Property 'skills' does not exist on type 'unknown'. Explicitly type 'cat' as 'any'.
    const skillCategory: any = Object.values(SKILL_TREE_DATA).find((cat: any) => cat.skills[skillKey]);
    if (!skillCategory) return;
    // FIX: Property 'skills' does not exist on type 'unknown'. This is resolved by the fix above.
    const skill = skillCategory.skills[skillKey];
    const currentLevel = gameState.skills[skillKey] || 0;
    if (currentLevel >= skill.maxLevel) return;

    const nextLevelData = skill.levels[currentLevel];
    const cost = nextLevelData.cost;
    const canAfford = Object.keys(cost).every(res => gameState[res] >= cost[res]);

    if (canAfford) {
        Object.keys(cost).forEach(res => { gameState[res] -= cost[res]; });
        gameState.skills[skillKey]++;
        showNotification(`${skill.name} 스킬 레벨 업!`, false);
        populateSkillTreeUI();
        if (skillKey === 'gpuEfficiency') {
            startComputerMining();
            updateComputerUI();
        }
        if (skillKey === 'regularCustomer') {
            populateDrillAndProductionUI();
            populateShopUI();
        }
        saveGameState();
    } else {
        showNotification('업그레이드 비용이 부족합니다.', true);
    }
}

function initDevPanel() {
    if (dom.closeDevPanel) dom.closeDevPanel.addEventListener('click', () => dom.devPanel.classList.add('hidden'));

    if (dom.devWeatherSelect) {
        dom.devWeatherSelect.innerHTML = Object.keys(WEATHER_DATA).map(w => `<option value="${w}">${w}</option>`).join('');
    }

    document.getElementById('dev-post-announcement-btn')?.addEventListener('click', () => {
        const text = (document.getElementById('dev-announcement-text') as HTMLInputElement).value.trim();
        const duration = parseInt((document.getElementById('dev-announcement-duration') as HTMLInputElement).value, 10);
        if (text && !isNaN(duration) && duration > 0) {
            const expiresAt = Date.now() + duration * 1000;
            db.ref('globalState/announcement').set({ text, expiresAt });
            showNotification('공지가 게시되었습니다.', false);
        } else {
            showNotification('공지 내용과 시간을 올바르게 입력해주세요.', true);
        }
    });
    document.getElementById('dev-clear-announcement-btn')?.addEventListener('click', () => {
        db.ref('globalState/announcement').set(null);
        showNotification('공지가 삭제되었습니다.', false);
    });

    document.getElementById('dev-set-speed-btn')?.addEventListener('click', () => {
        const speed = parseInt((document.getElementById('dev-speed-input') as HTMLInputElement).value, 10);
        if (speed >= 1 && speed <= 10) {
            db.ref('globalState/speed').set(speed);
            showNotification(`게임 속도를 ${speed}배로 설정했습니다.`, false);
        } else {
            showNotification('속도는 1-10 사이로 입력해주세요.', true);
        }
    });

    document.getElementById('dev-clear-chat-btn')?.addEventListener('click', () => {
        if (confirm('정말로 모든 채팅 기록을 삭제하시겠습니까?')) {
            db.ref('chat').remove();
            showNotification('채팅 기록이 삭제되었습니다.', false);
        }
    });

    document.getElementById('dev-create-code-btn')?.addEventListener('click', () => {
        const codeId = (document.getElementById('dev-code-id') as HTMLInputElement).value.toUpperCase().trim();
        const rewardType = (document.getElementById('dev-code-reward-type') as HTMLSelectElement).value;
        const amount = parseInt((document.getElementById('dev-code-reward-amount') as HTMLInputElement).value, 10);
        if (codeId && rewardType && amount > 0) {
            db.ref(`promoCodes/${codeId}`).set({ rewardType, amount });
            showNotification(`프로모션 코드 [${codeId}]가 생성되었습니다.`, false);
        } else {
            showNotification('모든 필드를 올바르게 입력해주세요.', true);
        }
    });

    document.getElementById('dev-set-weather-btn')?.addEventListener('click', () => {
        const weather = (document.getElementById('dev-weather-select') as HTMLSelectElement).value;
        db.ref('globalState/weather').set(weather);
        showNotification(`모든 유저의 날씨를 [${weather}] (으)로 설정했습니다.`, false);
    });
    document.getElementById('dev-clear-weather-btn')?.addEventListener('click', () => {
        db.ref('globalState/weather').set(null);
        showNotification('날씨 고정을 해제했습니다.', false);
    });

    document.getElementById('dev-set-prices-btn')?.addEventListener('click', () => {
        const prices = {
            Cube: parseInt((document.getElementById('dev-price-cube') as HTMLInputElement).value, 10),
            Lunar: parseInt((document.getElementById('dev-price-lunar') as HTMLInputElement).value, 10),
            Energy: parseInt((document.getElementById('dev-price-energy') as HTMLInputElement).value, 10),
            Prism: parseInt((document.getElementById('dev-price-prism') as HTMLInputElement).value, 10),
        };
        const validPrices: any = {};
        for (const [key, value] of Object.entries(prices)) {
            if (!isNaN(value) && value > 0) {
                validPrices[key] = value;
            }
        }
        db.ref('globalState/prices').set(validPrices);
        showNotification('코인 가격을 고정했습니다.', false);
    });
    document.getElementById('dev-clear-prices-btn')?.addEventListener('click', () => {
        db.ref('globalState/prices').set(null);
        showNotification('코인 가격 고정을 해제했습니다.', false);
    });
    
    document.getElementById('dev-reset-user-btn')?.addEventListener('click', () => {
        const uidToReset = (document.getElementById('dev-reset-uid') as HTMLInputElement).value.trim();
        if (uidToReset && confirm(`정말로 UID: ${uidToReset} 유저의 데이터를 초기화하시겠습니까?`)) {
            db.ref(`users/${uidToReset}`).set(getInitialGameState());
            showNotification(`${uidToReset} 유저의 데이터가 초기화되었습니다.`, false);
        } else if (!uidToReset) {
            showNotification('UID를 입력해주세요.', true);
        }
    });
}
function populateSettingsUI() {
    if (!document.getElementById('content-settings')) return;
    const showToggle = document.getElementById('setting-show-notifications') as HTMLInputElement;
    const durationInput = document.getElementById('setting-notification-duration') as HTMLInputElement;
    if (showToggle) {
        showToggle.checked = gameState.settings.showNotifications;
    }
    if (durationInput) {
        durationInput.value = String(gameState.settings.notificationDuration / 1000); // ms to s
    }
}

function handleAnnouncementUpdate(announcementData: { text: string, expiresAt: number } | null) {
    const banner = dom.globalAnnouncement || (dom.globalAnnouncement = document.getElementById('global-announcement'));
    const bannerText = dom.announcementText || (dom.announcementText = document.getElementById('announcement-text'));
    const bannerTimer = dom.announcementTimer || (dom.announcementTimer = document.getElementById('announcement-timer'));
    const closeBtn = dom.closeAnnouncement || (dom.closeAnnouncement = document.getElementById('close-announcement'));

    if (announcementInterval) {
        clearInterval(announcementInterval);
        announcementInterval = null;
    }

    const hideBanner = () => {
        if (banner) banner.classList.add('hidden');
        if (announcementInterval) {
            clearInterval(announcementInterval);
            announcementInterval = null;
        }
    };
    
    if (closeBtn && !closeBtn.dataset.listener) {
        closeBtn.addEventListener('click', hideBanner);
        closeBtn.dataset.listener = 'true';
    }

    if (!banner || !announcementData || !announcementData.text || Date.now() >= announcementData.expiresAt) {
        hideBanner();
        return;
    }

    if (bannerText && bannerTimer) {
        bannerText.textContent = announcementData.text;
        banner.classList.remove('hidden');

        const updateTimer = () => {
            const timeLeft = Math.max(0, announcementData.expiresAt - Date.now());
            if (timeLeft === 0) {
                hideBanner();
            } else {
                const seconds = Math.floor(timeLeft / 1000);
                bannerTimer.textContent = `${seconds}초 후 사라짐`;
            }
        };

        updateTimer();
        announcementInterval = setInterval(updateTimer, 1000);
    }
}

export {};