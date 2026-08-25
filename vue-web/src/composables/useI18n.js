import { ref, computed } from 'vue';

const locales = {
  en: {
    // Nav & Common
    poolName: 'ETC Pool',
    startMining: 'Start Mining',
    minerAddressPlaceholder: 'Miner address 0x...',
    themeLight: 'Switch to light theme',
    themeDark: 'Switch to dark theme',
    alertBell: 'Hashrate Notifications',
    search: 'Search',
    colorMode: 'Color Mode',

    // Dashboard Items
    poolStats: 'Pool Stats',
    miners: 'Miners',
    calculator: 'Calculator',
    blocks: 'Blocks',
    connect: 'Connect',
    hashrate: 'Hashrate',
    activeMiners: 'Active Miners',
    poolFee: 'Pool Fee',
    networkDiff: 'Network Diff',
    etcPrice: 'ETC Price',
    unconfirmed: 'Unconfirmed Balance',

    // Calculator Specific
    calculatorTitle: 'ETC Mining Revenue Calculator',
    calculatorSub: 'Estimate your mining earnings with real-time ETC price, difficulty, and pool parameters.',
    parametersTitle: 'Mining Rig Parameters',
    resetBtn: 'Reset',
    powerConsumption: 'Power Consumption',
    electricityCost: 'Electricity Cost',
    quickPresets: 'Quick Hardware Presets',
    projectedBreakdown: 'Projected Earnings Breakdown',
    estimatedEtc: 'ETC Estimated',
    grossRev: 'Gross Rev',
    powerCost: 'Power Cost',
    netProfit: 'Net Profit',
    daily24h: 'Daily (24h)',
    weekly7d: 'Weekly (7d)',
    monthly30d: 'Monthly (30d)',
    advancedSimulations: 'Advanced Simulations (Live Values Overrides)',
    useLiveStats: 'Use Live Stats',
    customizeStats: 'Customize Stats',
    etcPriceLabel: 'ETC Price ($)',
    difficultyLabel: 'Difficulty (T)',
    blockRewardLabel: 'Block Reward (ETC)',

    // Alerts Section
    alertsTitle: 'Mining Pool Price & Reward Alerts',
    soundAlertsMute: 'Mute Sounds',
    soundAlertsUnmute: 'Unmute Sounds',
    enablePush: 'Enable Push',
    pushEnabled: 'Push Enabled',
    etcTargetPrice: 'ETC Target Price',
    dailyRewardTarget: 'Daily Reward Target',
    risesAbove: '≥ Rises Above',
    dropsBelow: '≤ Drops Below',
    currentPriceIs: 'Current price is',
    currentRewardIs: 'Current reward is',
    alertsSaveAuto: 'Alerts save automatically and scan live.',
    simulateTestAlert: 'Simulate Test Alert',
    autoDetectTitle: 'Hashrate Auto-Detect & Quick Start',
    localMinerApi: 'Local Miner API URL',
    minerType: 'Miner Software',
    btnDetect: 'Detect Hashrate',
    quickTemplates: 'Quick Start Config Templates',
    walletAddress: 'Mining Wallet Address',
    miningPoolUrl: 'Mining Pool Server'
  },
  de: {
    // Nav & Common
    poolName: 'ETC Pool',
    startMining: 'Mining starten',
    minerAddressPlaceholder: 'Miner-Adresse 0x...',
    themeLight: 'Zum hellen Design wechseln',
    themeDark: 'Zum dunklen Design wechseln',
    alertBell: 'Hashrate Benachrichtigungen',
    search: 'Suchen',
    colorMode: 'Farbmodus',

    // Dashboard Items
    poolStats: 'Pool-Statistiken',
    miners: 'Miner',
    calculator: 'Rechner',
    blocks: 'Blöcke',
    connect: 'Verbinden',
    hashrate: 'Hashrate',
    activeMiners: 'Aktive Miner',
    poolFee: 'Pool-Gebühr',
    networkDiff: 'Netzwerk-Schwierigkeit',
    etcPrice: 'ETC Preis',
    unconfirmed: 'Unbestätigtes Guthaben',

    // Calculator Specific
    calculatorTitle: 'ETC Mining Einnahmen-Rechner',
    calculatorSub: 'Schätzen Sie Ihre Mining-Einnahmen mit Echtzeit-ETC-Preisen, Schwierigkeit und Pool-Parametern.',
    parametersTitle: 'Mining-Rig-Parameter',
    resetBtn: 'Zurücksetzen',
    powerConsumption: 'Stromverbrauch',
    electricityCost: 'Stromkosten',
    quickPresets: 'Hardware-Schnellprofile',
    projectedBreakdown: 'Voraussichtliche Ertragsaufschlüsselung',
    estimatedEtc: 'Geschätzte ETC',
    grossRev: 'Brutto-Umsatz',
    powerCost: 'Stromkosten',
    netProfit: 'Netto-Gewinn',
    daily24h: 'Täglich (24h)',
    weekly7d: 'Wöchentlich (7d)',
    monthly30d: 'Monatlich (30d)',
    advancedSimulations: 'Erweiterte Simulationen (Live-Werte überschreiben)',
    useLiveStats: 'Live-Werte nutzen',
    customizeStats: 'Werte anpassen',
    etcPriceLabel: 'ETC Preis ($)',
    difficultyLabel: 'Schwierigkeit (T)',
    blockRewardLabel: 'Block-Belohnung (ETC)',

    // Alerts Section
    alertsTitle: 'Mining-Pool Preis- & Belohnungs-Alarme',
    soundAlertsMute: 'Töne stummschalten',
    soundAlertsUnmute: 'Töne einschalten',
    enablePush: 'Push aktivieren',
    pushEnabled: 'Push aktiv',
    etcTargetPrice: 'ETC Zielpreis',
    dailyRewardTarget: 'Tägliches Belohnungsziel',
    risesAbove: '≥ Steigt über',
    dropsBelow: '≤ Fällt unter',
    currentPriceIs: 'Aktueller Preis ist',
    currentRewardIs: 'Aktuelle Belohnung ist',
    alertsSaveAuto: 'Alarme speichern sich automatisch und scannen live.',
    simulateTestAlert: 'Test-Alarm simulieren',
    autoDetectTitle: 'Hashrate-Auto-Erkennung & Schnellstart',
    localMinerApi: 'Lokale Miner-API-URL',
    minerType: 'Miner-Software',
    btnDetect: 'Hashrate erkennen',
    quickTemplates: 'Schnellstart-Konfigurationsvorlagen',
    walletAddress: 'Mining-Wallet-Adresse',
    miningPoolUrl: 'Mining-Pool-Server'
  },
  es: {
    // Nav & Common
    poolName: 'Pool ETC',
    startMining: 'Empezar Minería',
    minerAddressPlaceholder: 'Dirección de minero 0x...',
    themeLight: 'Cambiar a tema claro',
    themeDark: 'Cambiar a tema oscuro',
    alertBell: 'Notificaciones de Hashrate',
    search: 'Buscar',
    colorMode: 'Modo de Color',

    // Dashboard Items
    poolStats: 'Estadísticas',
    miners: 'Mineros',
    calculator: 'Calculadora',
    blocks: 'Bloques',
    connect: 'Conectarse',
    hashrate: 'Tasa de Hash',
    activeMiners: 'Mineros Activos',
    poolFee: 'Comisión del Pool',
    networkDiff: 'Dificultad de Red',
    etcPrice: 'Precio de ETC',
    unconfirmed: 'Saldo sin Confirmar',

    // Calculator Specific
    calculatorTitle: 'Calculadora de Ingresos de Minería ETC',
    calculatorSub: 'Estime sus ganancias de minería con precios de ETC, dificultad y parámetros del pool en tiempo real.',
    parametersTitle: 'Parámetros del Rig de Minería',
    resetBtn: 'Reiniciar',
    powerConsumption: 'Consumo Eléctrico',
    electricityCost: 'Costo de Electricidad',
    quickPresets: 'Ajustes Rápidos de Hardware',
    projectedBreakdown: 'Desglose de Ganancias Proyectadas',
    estimatedEtc: 'ETC Estimado',
    grossRev: 'Ingreso Bruto',
    powerCost: 'Costo de Energía',
    netProfit: 'Beneficio Neto',
    daily24h: 'Diario (24h)',
    weekly7d: 'Semanal (7d)',
    monthly30d: 'Mensual (30d)',
    advancedSimulations: 'Simulaciones Avanzadas (Sobrescribir Valores Reales)',
    useLiveStats: 'Usar Datos en Vivo',
    customizeStats: 'Personalizar Datos',
    etcPriceLabel: 'Precio de ETC ($)',
    difficultyLabel: 'Dificultad (T)',
    blockRewardLabel: 'Recompensa de Bloque (ETC)',

    // Alerts Section
    alertsTitle: 'Alertas de Precios y Recompensas del Pool',
    soundAlertsMute: 'Silenciar Sonidos',
    soundAlertsUnmute: 'Activar Sonidos',
    enablePush: 'Activar Push',
    pushEnabled: 'Push Activado',
    etcTargetPrice: 'Precio Objetivo de ETC',
    dailyRewardTarget: 'Objetivo de Recompensa Diaria',
    risesAbove: '≥ Sube por encima de',
    dropsBelow: '≤ Cae por debajo de',
    currentPriceIs: 'El precio actual es',
    currentRewardIs: 'La recompensa actual es',
    alertsSaveAuto: 'Las alertas se guardan automáticamente y se escanean en vivo.',
    simulateTestAlert: 'Simular Alerta de Prueba',
    autoDetectTitle: 'Autodetección de Hashrate y Configuración Rápida',
    localMinerApi: 'URL de la API del Minero Local',
    minerType: 'Software de Minería',
    btnDetect: 'Detectar Hashrate',
    quickTemplates: 'Plantillas de Configuración Rápida',
    walletAddress: 'Dirección de Billetera de Minería',
    miningPoolUrl: 'Servidor de Pool de Minería'
  },
  fr: {
    // Nav & Common
    poolName: 'Pool ETC',
    startMining: 'Démarrer le Minage',
    minerAddressPlaceholder: 'Adresse du mineur 0x...',
    themeLight: 'Passer au thème clair',
    themeDark: 'Passer au thème sombre',
    alertBell: 'Notifications de Hashrate',
    search: 'Rechercher',
    colorMode: 'Mode Couleur',

    // Dashboard Items
    poolStats: 'Statistiques',
    miners: 'Mineurs',
    calculator: 'Calculateur',
    blocks: 'Blocs',
    connect: 'Connexion',
    hashrate: 'Taux de Hachage',
    activeMiners: 'Mineurs Actifs',
    poolFee: 'Frais du Pool',
    networkDiff: 'Difficulté du Réseau',
    etcPrice: 'Prix de ETC',
    unconfirmed: 'Solde non Confirmé',

    // Calculator Specific
    calculatorTitle: 'Calculateur de Revenu de Minage ETC',
    calculatorSub: 'Estimez vos gains de minage avec le prix de l\'ETC, la difficulté et les paramètres du pool en temps réel.',
    parametersTitle: 'Paramètres de la Plateforme de Minage',
    resetBtn: 'Réinitialiser',
    powerConsumption: 'Consommation Électrique',
    electricityCost: 'Coût de l\'Électricité',
    quickPresets: 'Préréglages Matériels Rapides',
    projectedBreakdown: 'Répartition des Gains Prévus',
    estimatedEtc: 'ETC Estimé',
    grossRev: 'Revenu Brut',
    powerCost: 'Coût Électrique',
    netProfit: 'Bénéfice Net',
    daily24h: 'Quotidien (24h)',
    weekly7d: 'Hebdomadaire (7d)',
    monthly30d: 'Mensuel (30d)',
    advancedSimulations: 'Simulations Avancées (Remplacement des Valeurs)',
    useLiveStats: 'Utiliser les Valeurs Réelles',
    customizeStats: 'Personnaliser les Valeurs',
    etcPriceLabel: 'Prix de ETC ($)',
    difficultyLabel: 'Difficulté (T)',
    blockRewardLabel: 'Récompense de Bloc (ETC)',

    // Alerts Section
    alertsTitle: 'Alertes de Prix & Récompenses de Minage',
    soundAlertsMute: 'Couper les sons',
    soundAlertsUnmute: 'Activer les sons',
    enablePush: 'Activer le Push',
    pushEnabled: 'Push Activé',
    etcTargetPrice: 'Prix Cible ETC',
    dailyRewardTarget: 'Objectif de Récompense Quotidienne',
    risesAbove: '≥ Monte au-dessus de',
    dropsBelow: '≤ Tombe en dessous de',
    currentPriceIs: 'Le prix actuel est',
    currentRewardIs: 'La récompense actuelle est',
    alertsSaveAuto: 'Les alertes sont sauvegardées automatiquement et scannées en direct.',
    simulateTestAlert: 'Simuler une alerte test',
    autoDetectTitle: 'Autodétection du Hashrate & Démarrage Rapide',
    localMinerApi: 'URL de l\'API du Mineur Local',
    minerType: 'Logiciel de Minage',
    btnDetect: 'Détecter le Hashrate',
    quickTemplates: 'Modèles de Configuration Rapide',
    walletAddress: 'Adresse de Portefeuille de Minage',
    miningPoolUrl: 'Serveur de Pool de Minage'
  }
};

const currentLocale = ref(localStorage.getItem('etc_pool_locale') || 'en');

function setLocale(lang) {
  if (locales[lang]) {
    currentLocale.value = lang;
    localStorage.setItem('etc_pool_locale', lang);
  }
}

function t(key) {
  const dict = locales[currentLocale.value] || locales['en'];
  return dict[key] || locales['en'][key] || key;
}

const currentLocaleName = computed(() => {
  const names = {
    en: 'English',
    de: 'Deutsch',
    es: 'Español',
    fr: 'Français'
  };
  return names[currentLocale.value] || 'English';
});

export function useI18n() {
  return {
    currentLocale,
    setLocale,
    t,
    currentLocaleName,
    availableLocales: ['en', 'de', 'es', 'fr']
  };
}
