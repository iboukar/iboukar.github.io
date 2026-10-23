/**
 * AGRO-CIRCULAR OS v2.4 - Enterprise Logic & Reactive Operational State
 * Integrated Management & AI Executive Director for:
 * 1. Ferme Laitière (Guilmey) - Modern Dairy Farm (Production laitière, alimentation drêches + Maralfalfa)
 * 2. Société de Déchets & Valorisation (Farcha) - Industrial Recycling (Verre/Calcin BTP, Plastique/Granulés PEHD/PP, Drêches)
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. DEFAULT BASELINES: ZERO COUNTERS (DEFAULT) & REALISTIC DEMO DATASET
  // =========================================================================

  // Initial Zero Database (As requested: all counters at 0 for real operation start)
  const DEFAULT_ZERO_DATABASE = {
    settings: {
      currency: 'FCFA',
      shuttleDistanceKm: 18,
      shuttleFuelCost: 18500,
      fermeName: 'Ferme de Sara',
      fermeLocation: 'Guilmey',
      targetProductionLiters: 180,
      milkPricePerLiter: 600,
      dechetsName: 'SORATRAD',
      dechetsLocation: 'Farcha',
      pricePlasticPerTon: 480000,
      priceGlassPerTon: 70000,
      priceDrecheSalePerTon: 45000,
      activeRation: {
        maralfalfaKg: 25,
        drecheKg: 12,
        tourteauKg: 1.5,
        sonKg: 2.0,
        cmvG: 150,
        cowsFed: 18
      }
    },
    cows: [],
    traiteHistory: [],
    shuttles: [],
    glassBatches: [],
    plasticBatches: [],
    drecheBatches: [],
    qhseAudits: [],
    qhseChecklist: {
      ferme: [true, true, true, true, true],
      soratrad: [true, true, true, true, true]
    }
  };

  // Realistic Pre-populated Demo Dataset (for demonstration & evaluation)
  const SAMPLE_DEMO_DATABASE = {
    settings: {
      currency: 'FCFA',
      shuttleDistanceKm: 18,
      shuttleFuelCost: 18500,
      fermeName: 'Ferme de Sara',
      fermeLocation: 'Guilmey',
      targetProductionLiters: 180,
      milkPricePerLiter: 600,
      dechetsName: 'SORATRAD',
      dechetsLocation: 'Farcha',
      pricePlasticPerTon: 480000,
      priceGlassPerTon: 70000,
      priceDrecheSalePerTon: 45000,
      activeRation: {
        maralfalfaKg: 25,
        drecheKg: 12,
        tourteauKg: 1.5,
        sonKg: 2.0,
        cmvG: 150,
        cowsFed: 18
      }
    },
    cows: [
      { id: 'SAR-001', name: 'Reine de Farcha', breed: 'Montbéliarde x Zébu', status: 'Lactation', dailyLiters: 13.5, calvingDate: '2026-06-12', reproStatus: 'Inséminée (45j)' },
      { id: 'SAR-002', name: 'Étoile de Guilmey', breed: 'Holstein x Goudali', status: 'Lactation', dailyLiters: 14.0, calvingDate: '2026-07-02', reproStatus: 'Gestante confirmée' },
      { id: 'SAR-003', name: 'Djemila', breed: 'Montbéliarde pure', status: 'Lactation', dailyLiters: 12.5, calvingDate: '2026-05-18', reproStatus: 'À inséminer (chaleur)' },
      { id: 'SAR-004', name: 'Sahélienne', breed: 'Métisse Zébu Peul', status: 'Lactation', dailyLiters: 9.0, calvingDate: '2026-08-10', reproStatus: 'Suivi post-partum' },
      { id: 'SAR-005', name: 'Baraka', breed: 'Holstein x Zébu', status: 'Lactation', dailyLiters: 11.5, calvingDate: '2026-06-25', reproStatus: 'Inséminée (30j)' },
      { id: 'SAR-006', name: 'Gazelle', breed: 'Montbéliarde x Zébu', status: 'Lactation', dailyLiters: 10.5, calvingDate: '2026-07-14', reproStatus: 'Repos' },
      { id: 'SAR-007', name: 'Nour', breed: 'Holstein pure', status: 'Lactation', dailyLiters: 15.0, calvingDate: '2026-08-01', reproStatus: 'Surveillance' },
      { id: 'SAR-008', name: 'Chari', breed: 'Métisse Brune', status: 'Lactation', dailyLiters: 10.0, calvingDate: '2026-05-30', reproStatus: 'Gestante' },
      { id: 'SAR-009', name: 'Logone', breed: 'Holstein x Zébu', status: 'Lactation', dailyLiters: 11.0, calvingDate: '2026-07-20', reproStatus: 'Inséminée' },
      { id: 'SAR-010', name: 'Victoria', breed: 'Montbéliarde pure', status: 'Lactation', dailyLiters: 12.0, calvingDate: '2026-06-04', reproStatus: 'Gestante' },
      { id: 'SAR-011', name: 'Fatima', breed: 'Métisse Zébu', status: 'Lactation', dailyLiters: 8.5, calvingDate: '2026-08-15', reproStatus: 'Repos' },
      { id: 'SAR-012', name: 'Am-Djarass', breed: 'Holstein x Zébu', status: 'Lactation', dailyLiters: 10.0, calvingDate: '2026-06-18', reproStatus: 'Gestante' },
      { id: 'SAR-013', name: 'Moundou', breed: 'Montbéliarde x Zébu', status: 'Lactation', dailyLiters: 9.5, calvingDate: '2026-07-11', reproStatus: 'Inséminée' },
      { id: 'SAR-014', name: 'Abeche', breed: 'Holstein x Zébu', status: 'Lactation', dailyLiters: 10.5, calvingDate: '2026-05-22', reproStatus: 'Gestante' },
      { id: 'SAR-015', name: 'Koumra', breed: 'Brune des Alpes x Zébu', status: 'Lactation', dailyLiters: 8.0, calvingDate: '2026-08-05', reproStatus: 'Repos' },
      { id: 'SAR-016', name: 'Sarh', breed: 'Montbéliarde pure', status: 'Lactation', dailyLiters: 11.0, calvingDate: '2026-06-29', reproStatus: 'Inséminée' },
      { id: 'SAR-017', name: 'Bongor', breed: 'Holstein x Zébu', status: 'Lactation', dailyLiters: 7.5, calvingDate: '2026-07-08', reproStatus: 'À tarir bientôt' },
      { id: 'SAR-018', name: 'Biltine', breed: 'Métisse Zébu', status: 'Lactation', dailyLiters: 6.0, calvingDate: '2026-04-12', reproStatus: 'Tarissement prévu' },
      { id: 'SAR-019', name: 'Massakory', breed: 'Holstein pure', status: 'Tarie', dailyLiters: 0, calvingDate: '2025-10-15', reproStatus: 'Vêlage J-20' },
      { id: 'SAR-020', name: 'Ati', breed: 'Montbéliarde pure', status: 'Tarie', dailyLiters: 0, calvingDate: '2025-11-02', reproStatus: 'Vêlage J-35' },
      { id: 'SAR-021', name: 'Pala', breed: 'Métisse Zébu', status: 'Tarie', dailyLiters: 0, calvingDate: '2025-11-20', reproStatus: 'En préparation' },
      { id: 'SAR-022', name: 'Mao', breed: 'Holstein x Zébu', status: 'Tarie', dailyLiters: 0, calvingDate: '2025-12-05', reproStatus: 'En préparation' },
      { id: 'SAR-023', name: 'Bol', breed: 'Montbéliarde x Zébu', status: 'Tarie', dailyLiters: 0, calvingDate: '2025-12-18', reproStatus: 'En préparation' },
      { id: 'SAR-024', name: 'Génisse Sara 1', breed: 'Montbéliarde x Zébu', status: 'Génisse', dailyLiters: 0, calvingDate: '-', reproStatus: 'Gestante 1er veau' },
      { id: 'SAR-025', name: 'Génisse Sara 2', breed: 'Holstein pure', status: 'Génisse', dailyLiters: 0, calvingDate: '-', reproStatus: 'Gestante 1er veau' },
      { id: 'SAR-026', name: 'Génisse Sara 3', breed: 'Holstein x Zébu', status: 'Génisse', dailyLiters: 0, calvingDate: '-', reproStatus: 'Prête saillie' },
      { id: 'SAR-027', name: 'Génisse Sara 4', breed: 'Montbéliarde pure', status: 'Génisse', dailyLiters: 0, calvingDate: '-', reproStatus: 'Prête saillie' },
      { id: 'SAR-028', name: 'Veau Mâle 1', breed: 'Montbéliarde x Zébu', status: 'Veaux', dailyLiters: 0, calvingDate: '-', reproStatus: 'Élevage' },
      { id: 'SAR-029', name: 'Velle Sara 1', breed: 'Holstein pure', status: 'Veaux', dailyLiters: 0, calvingDate: '-', reproStatus: 'Future laitière' },
      { id: 'SAR-030', name: 'Velle Sara 2', breed: 'Montbéliarde pure', status: 'Veaux', dailyLiters: 0, calvingDate: '-', reproStatus: 'Future laitière' }
    ],
    traiteHistory: [
      { id: 'TR-01', date: '2026-09-30', activeCows: 18, morningL: 109, eveningL: 71, totalL: 180, pricePerL: 600, totalDirectSales: 84000, transformedL: 40, quality: 'Conforme (16°D, Tank 3.8°C)' },
      { id: 'TR-02', date: '2026-09-29', activeCows: 18, morningL: 107, eveningL: 74, totalL: 181, pricePerL: 600, totalDirectSales: 85200, transformedL: 39, quality: 'Conforme (0 mammite)' },
      { id: 'TR-03', date: '2026-09-28', activeCows: 18, morningL: 105, eveningL: 73, totalL: 178, pricePerL: 600, totalDirectSales: 82800, transformedL: 40, quality: 'Conforme (Acidité OK)' },
      { id: 'TR-04', date: '2026-09-27', activeCows: 18, morningL: 108, eveningL: 72, totalL: 180, pricePerL: 600, totalDirectSales: 84000, transformedL: 40, quality: 'Conforme (Test négatif)' },
      { id: 'TR-05', date: '2026-09-26', activeCows: 18, morningL: 110, eveningL: 72, totalL: 182, pricePerL: 600, totalDirectSales: 85200, transformedL: 40, quality: 'Conforme' },
      { id: 'TR-06', date: '2026-09-25', activeCows: 18, morningL: 106, eveningL: 71, totalL: 177, pricePerL: 600, totalDirectSales: 82200, transformedL: 40, quality: 'Conforme' }
    ],
    shuttles: [
      { id: 'NAV-01', date: '2026-09-30', vehicle: 'Camionnette Benne 3.5T (Mahamat)', outbound: '2.4 T Drêches fraîches + 10 sacs minéraux', inbound: '180 L Lait urbain + 1.2 T Fumier pour compost', fuelCost: 18500, savingsFcfa: 63000, status: 'Terminé' },
      { id: 'NAV-02', date: '2026-09-29', vehicle: 'Camionnette Benne 3.5T (Mahamat)', outbound: '2.2 T Drêches fraîches + Pièces détachées', inbound: '180 L Lait urbain + 1.0 T Fumier', fuelCost: 18500, savingsFcfa: 61500, status: 'Terminé' },
      { id: 'NAV-03', date: '2026-09-28', vehicle: 'Camionnette Benne 3.5T (Mahamat)', outbound: '2.5 T Drêches fraîches', inbound: '178 L Lait urbain + 1.1 T Fumier', fuelCost: 18500, savingsFcfa: 64000, status: 'Terminé' },
      { id: 'NAV-04', date: '2026-09-27', vehicle: 'Camionnette Benne 3.5T (Mahamat)', outbound: '2.0 T Drêches fraîches + Fûts hermétiques', inbound: '180 L Lait urbain + Fourrage excédentaire', fuelCost: 18500, savingsFcfa: 59000, status: 'Terminé' }
    ],
    glassBatches: [
      { id: 'VER-26-041', date: '2026-09-28', origin: 'Bars Farcha & Hôtels N\'Djamena', rawTons: 6.2, colors: '55% Vert, 30% Ambre, 15% Blanc', wastePct: '4.2%', culletProducedT: 5.94, buyer: 'Entreprise BTP (Pavés drainants)', revenue: 415800 },
      { id: 'VER-26-040', date: '2026-09-23', origin: 'Circuits décharges & collecteurs', rawTons: 8.5, colors: '60% Ambre, 25% Vert, 15% Blanc', wastePct: '5.1%', culletProducedT: 8.06, buyer: 'Artisans & BTP Guilmey', revenue: 564200 },
      { id: 'VER-26-039', date: '2026-09-17', origin: 'Hôtels & Événements Farcha', rawTons: 5.8, colors: '50% Blanc, 35% Vert, 15% Ambre', wastePct: '3.8%', culletProducedT: 5.58, buyer: 'Verrerie artisanale', revenue: 418500 },
      { id: 'VER-26-038', date: '2026-09-10', origin: 'Bars & Maquis Farcha', rawTons: 7.0, colors: '65% Vert, 25% Ambre, 10% Blanc', wastePct: '4.5%', culletProducedT: 6.68, buyer: 'Entreprise BTP (Béton décoratif)', revenue: 467600 }
    ],
    plasticBatches: [
      { id: 'PLA-26-029', date: '2026-09-29', polymer: 'PEHD (Casiers bières)', rawKg: 3800, process: 'Lavage chaud + Broyage couteaux', extrudedKg: 3450, quality: 'Granulés Noir / Bleu MFI 0.8', buyer: 'Plasturgie Sahel (Bassines)', revenue: 1656000 },
      { id: 'PLA-26-028', date: '2026-09-22', polymer: 'PP (Casiers sodas)', rawKg: 4200, process: 'Broyage + Dégazage + Granulation', extrudedKg: 3820, quality: 'Granulés Verts Injection', buyer: 'Usine Bidons & Caisses Farcha', revenue: 1833600 },
      { id: 'PLA-26-027', date: '2026-09-15', polymer: 'PEHD (Casiers)', rawKg: 3500, process: 'Lavage + Broyage + Granulation', extrudedKg: 3180, quality: 'Granulés Gris Universel', buyer: 'Fabricant Tuyaux Polyéthylène', revenue: 1526400 },
      { id: 'PLA-26-026', date: '2026-09-08', polymer: 'PEHD / PP Mixte', rawKg: 2600, process: 'Paillettes lavées directes', extrudedKg: 2350, quality: 'Granulés Noir BTP', buyer: 'Accessoires Plastiques BTP', revenue: 1128000 }
    ],
    drecheBatches: [
      { id: 'DRE-26-112', date: '2026-09-30', brewery: 'Brasserie Farcha (Brassins orge)', tonsReceived: 4.8, humidity: '77%', allocatedFermeT: 2.4, allocatedSaleT: 1.8, allocatedSilageT: 0.6, saleRev: 81000 },
      { id: 'DRE-26-111', date: '2026-09-27', brewery: 'Brasserie Farcha (Brassins orge/blé)', tonsReceived: 5.2, humidity: '76%', allocatedFermeT: 2.5, allocatedSaleT: 2.0, allocatedSilageT: 0.7, saleRev: 90000 },
      { id: 'DRE-26-110', date: '2026-09-24', brewery: 'Brasserie Farcha', tonsReceived: 4.5, humidity: '78%', allocatedFermeT: 2.2, allocatedSaleT: 1.5, allocatedSilageT: 0.8, saleRev: 67500 },
      { id: 'DRE-26-109', date: '2026-09-20', brewery: 'Brasserie Farcha', tonsReceived: 5.0, humidity: '77%', allocatedFermeT: 2.5, allocatedSaleT: 1.9, allocatedSilageT: 0.6, saleRev: 85500 }
    ],
    qhseAudits: [
      { id: 'AUD-01', date: '2026-09-28', site: 'Ferme de Sara (Guilmey)', domain: 'Hygiène de Traite & Lait', inspector: 'Dr. Vétérinaire Hassan', status: 'Conforme', notes: 'Tank propre, température 3.8°C constante. Zéro cellule anormale.' },
      { id: 'AUD-02', date: '2026-09-25', site: 'SORATRAD (Farcha)', domain: 'Sécurité Broyeurs Plastique & Verre', inspector: 'Ing. QHSE Mahamat', status: 'Conforme', notes: 'Arrêts coup de poing testés OK. EPI complets portés par les 8 opérateurs.' },
      { id: 'AUD-03', date: '2026-09-18', site: 'SORATRAD (Farcha)', domain: 'Stockage & Rotation Drêches', inspector: 'Responsable Logistique', status: 'Vigilance', notes: 'Température du tas à surveiller en fin de journée (séchage accéléré conseillé).' }
    ],
    qhseChecklist: {
      ferme: [true, true, true, true, true],
      soratrad: [true, true, true, true, true]
    }
  };

  // State in Memory - Initialized to ZERO as requested
  const STORAGE_KEY = 'agro_circular_os_db_v24_zero';
  const ACTIVE_ENTITY_STORAGE_KEY = 'agro_circular_os_active_entity_v24';
  let db = loadDatabase();
  let currentActiveEntity = localStorage.getItem(ACTIVE_ENTITY_STORAGE_KEY) || 'consolidated'; // 'consolidated' | 'ferme' | 'soratrad'

  // =========================================================================
  // 2. LOCAL STORAGE MANAGEMENT
  // =========================================================================
  function loadDatabase() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using zero baseline', e);
    }
    // Default to clean zero counters
    return JSON.parse(JSON.stringify(DEFAULT_ZERO_DATABASE));
  }

  function saveDatabase() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      updateStorageStatus('Données synchronisées (Local)');
    } catch (e) {
      console.error('Save to localStorage failed', e);
    }
  }

  function updateStorageStatus(msg) {
    const el = document.getElementById('storage-status-text');
    if (el) el.textContent = msg;
  }

  // =========================================================================
  // 3. DOM ELEMENT REFERENCES
  // =========================================================================
  const entityBtns = document.querySelectorAll('.entity-btn');
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // Header badges & indicators
  const statusZeroBadge = document.getElementById('status-zero-badge');
  const alertBannerBadge = document.getElementById('alert-banner-badge');
  const alertBannerText = document.getElementById('alert-banner-text');

  // KPI Dashboard Elements
  const kpiLaitVal = document.getElementById('kpi-lait-val');
  const kpiLaitVache = document.getElementById('kpi-lait-vache');
  const kpiDrechesVal = document.getElementById('kpi-dreches-val');
  const kpiVerreVal = document.getElementById('kpi-verre-val');
  const kpiPlastiqueVal = document.getElementById('kpi-plastique-val');
  const kpiCaVal = document.getElementById('kpi-ca-val');
  const kpiSynergieSaving = document.getElementById('kpi-synergie-saving');

  // Dashboard Progress Bars
  const barTankPct = document.getElementById('bar-tank-pct');
  const barTankFill = document.getElementById('bar-tank-fill');
  const barDrecheStock = document.getElementById('bar-dreche-stock');
  const barDrecheFill = document.getElementById('bar-dreche-fill');
  const barPlastiquePct = document.getElementById('bar-plastique-pct');
  const barPlastiqueFill = document.getElementById('bar-plastique-fill');
  const barVerrePct = document.getElementById('bar-verre-pct');
  const barVerreFill = document.getElementById('bar-verre-fill');
  const dashNotificationsBox = document.getElementById('dashboard-notif-box');
  const dashRevenueBreakdown = document.getElementById('dashboard-rev-breakdown');
  const dashSynergyText = document.getElementById('dash-synergy-text');

  // Synergies live summary counters
  const synTotalDreche = document.getElementById('syn-total-dreche');
  const synTotalLait = document.getElementById('syn-total-lait');
  const synTotalFumier = document.getElementById('syn-total-fumier');
  const synTotalSavings = document.getElementById('syn-total-savings');

  // Traite Sub KPIs
  const valTraiteMatin = document.getElementById('val-traite-matin');
  const valTraiteSoir = document.getElementById('val-traite-soir');
  const valTraitePrix = document.getElementById('val-traite-prix');
  const valCostLitre = document.getElementById('val-cost-litre');

  // Cheptel stats
  const statCowsVl = document.getElementById('stat-cows-vl');
  const statCowsVt = document.getElementById('stat-cows-vt');
  const statCowsGen = document.getElementById('stat-cows-gen');
  const statCowsVeaux = document.getElementById('stat-cows-veaux');
  const statCowsTotal = document.getElementById('stat-cows-total');
  const filterCowStatus = document.getElementById('filter-cow-status');

  // Nutrition Calculator
  const inputMaralfalfa = document.getElementById('input-maralfalfa');
  const inputDreche = document.getElementById('input-dreche');
  const inputTourteau = document.getElementById('input-tourteau');
  const inputSon = document.getElementById('input-son');
  const inputCmv = document.getElementById('input-cmv');
  const inputCowsCount = document.getElementById('input-cows-count');
  const btnCalcRation = document.getElementById('btn-calc-ration');
  const btnSaveRation = document.getElementById('btn-save-ration');
  const resMsVal = document.getElementById('res-ms-val');
  const resUflVal = document.getElementById('res-ufl-val');
  const resPdiVal = document.getElementById('res-pdi-val');
  const resCostCow = document.getElementById('res-cost-cow');

  // Glass KPIs
  const valGlassRaw = document.getElementById('val-glass-raw');
  const valGlassCullet = document.getElementById('val-glass-cullet');
  const valGlassPrice = document.getElementById('val-glass-price');
  const valGlassMargin = document.getElementById('val-glass-margin');

  // Plastic KPIs
  const valPlasticRaw = document.getElementById('val-plastic-raw');
  const valPlasticGranules = document.getElementById('val-plastic-granules');
  const valPlasticPrice = document.getElementById('val-plastic-price');
  const valPlasticMargin = document.getElementById('val-plastic-margin');

  // Dreches Dispatch KPIs
  const drecheTotalTitleVol = document.getElementById('dreche-total-title-vol');
  const drecheDispFermeVol = document.getElementById('dreche-disp-ferme-vol');
  const drecheDispFermeCost = document.getElementById('dreche-disp-ferme-cost');
  const drecheDispSaleVol = document.getElementById('dreche-disp-sale-vol');
  const drecheDispSaleCost = document.getElementById('dreche-disp-sale-cost');
  const drecheDispSilageVol = document.getElementById('dreche-disp-silage-vol');
  const drecheDispSilageCost = document.getElementById('dreche-disp-silage-cost');
  const drecheDispCompostVol = document.getElementById('dreche-disp-compost-vol');
  const drecheDispCompostCost = document.getElementById('dreche-disp-compost-cost');

  // Tables Bodies
  const tbodyShuttles = document.getElementById('tbody-shuttles');
  const tbodyTraite = document.getElementById('tbody-traite');
  const tbodyCheptel = document.getElementById('tbody-cheptel');
  const tbodyGlass = document.getElementById('tbody-glass');
  const tbodyPlastic = document.getElementById('tbody-plastic');
  const tbodyDreches = document.getElementById('tbody-dreches');
  const tbodyQhseAudits = document.getElementById('tbody-qhse-audits');

  // QHSE Elements
  const qhseComplianceTag = document.getElementById('qhse-compliance-tag');

  // Simulator Elements
  const scenarioBtns = document.querySelectorAll('.scenario-btn');
  const simCapex = document.getElementById('sim-capex');
  const simGainMonth = document.getElementById('sim-gain-month');
  const simMaintYear = document.getElementById('sim-maint-year');
  const btnRunSimulation = document.getElementById('btn-run-simulation');
  const simResPayback = document.getElementById('sim-res-payback');
  const simResGainYear = document.getElementById('sim-res-gain-year');
  const simResTri = document.getElementById('sim-res-tri');
  const simResCo2 = document.getElementById('sim-res-co2');
  const simAdviceText = document.getElementById('sim-advice-text');

  // AI Director Elements
  const formFramingData = document.getElementById('form-framing-data');
  const aiActionBtns = document.querySelectorAll('.ai-action-btn');
  const inputAiPrompt = document.getElementById('input-ai-prompt');
  const btnAiAsk = document.getElementById('btn-ai-ask');
  const aiResponseContainer = document.getElementById('ai-response-container');
  const aiReportTimestamp = document.getElementById('ai-report-timestamp');

  // Modals & Reset Actions
  const modalEntry = document.getElementById('modal-entry');
  const btnQuickEntry = document.getElementById('btn-quick-entry');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const entryTypeSelect = document.getElementById('entry-type');
  const dynamicModalFields = document.getElementById('dynamic-modal-fields');
  const formQuickEntry = document.getElementById('form-quick-entry');
  const btnResetZero = document.getElementById('btn-reset-zero');
  const btnResetDemo = document.getElementById('btn-reset-demo');
  const btnExportData = document.getElementById('btn-export-data');
  const btnImportData = document.getElementById('btn-import-data');
  const fileImportInput = document.getElementById('file-import-input');
  const btnViewShuttle = document.getElementById('btn-view-shuttle');
  const btnNewShuttle = document.getElementById('btn-new-shuttle');
  const btnNewTraite = document.getElementById('btn-new-traite');
  const btnAddCow = document.getElementById('btn-add-cow');
  const btnAddGlassBatch = document.getElementById('btn-add-glass-batch');
  const btnAddPlasticBatch = document.getElementById('btn-add-plastic-batch');
  const btnAddDrecheBatch = document.getElementById('btn-add-dreche-batch');
  const btnAddAudit = document.getElementById('btn-add-audit');
  const btnRecalcPnl = document.getElementById('btn-recalc-pnl');

  // =========================================================================
  // 4. NUMBER & CURRENCY FORMATTERS
  // =========================================================================
  function formatMoney(num) {
    if (isNaN(num) || num === null || num === undefined) return '0 FCFA';
    return Math.round(num).toLocaleString('fr-FR') + ' FCFA';
  }

  function formatNumber(num, decimals = 1) {
    if (isNaN(num) || num === null || num === undefined) return '0,0';
    return Number(num).toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  // =========================================================================
  // 5. NAVIGATION & TAB SWITCHING
  // =========================================================================
  function initNavigation() {
    // Use event delegation on sidebar to handle dynamically injected nav items (e.g. IAM tab)
    const sidebarNav = document.querySelector('nav.sidebar-nav');
    if (sidebarNav) {
      sidebarNav.addEventListener('click', e => {
        const item = e.target.closest('.nav-item[data-tab]');
        if (item) {
          const targetTab = item.getAttribute('data-tab');
          if (window.agrocircularIAM && targetTab !== 'tab-iam' && !window.agrocircularIAM.hasModuleAccess(targetTab)) {
            return; // Bloqué par la politique DEFAULT DENY
          }
          switchTab(targetTab);
        }
      });
    } else {
      // Fallback for static items
      navItems.forEach(item => {
        item.addEventListener('click', () => {
          const targetTab = item.getAttribute('data-tab');
          if (window.agrocircularIAM && targetTab !== 'tab-iam' && !window.agrocircularIAM.hasModuleAccess(targetTab)) {
            return;
          }
          switchTab(targetTab);
        });
      });
    }

    entityBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const entity = btn.getAttribute('data-entity');
        applyEntityFilter(entity, { notify: true, autoSwitchTab: true });
      });
    });

    if (btnViewShuttle) {
      btnViewShuttle.addEventListener('click', () => {
        switchTab('tab-synergies');
      });
    }

    if (filterCowStatus) {
      filterCowStatus.addEventListener('change', renderCheptelTable);
    }
  }

  let toastTimer = null;
  function showEntityToast(message, dotClass = 'dot-gold') {
    const toast = document.getElementById('entity-toast');
    const toastMsg = document.getElementById('entity-toast-msg');
    const toastDot = document.getElementById('entity-toast-dot');
    if (!toast || !toastMsg) return;

    if (toastDot) {
      toastDot.className = `dot ${dotClass}`;
    }
    toastMsg.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  function applyEntityFilter(entity, options = { notify: false, autoSwitchTab: false }) {
    currentActiveEntity = entity || 'consolidated';
    try {
      localStorage.setItem(ACTIVE_ENTITY_STORAGE_KEY, currentActiveEntity);
    } catch (e) {}

    // 1. Scoping visuel global via data-active-entity sur le body
    document.body.setAttribute('data-active-entity', currentActiveEntity);

    // 2. Mise à jour de l'état actif des boutons du sélecteur
    entityBtns.forEach(btn => {
      if (btn.getAttribute('data-entity') === currentActiveEntity) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 3. Mise à jour des badges de section dans la navigation latérale
    const badgeSecFerme = document.getElementById('badge-sec-ferme');
    const badgeSecSoratrad = document.getElementById('badge-sec-soratrad');
    if (badgeSecFerme) {
      badgeSecFerme.className = currentActiveEntity === 'ferme' ? 'section-scope-badge badge-scope-ferme' : 'section-scope-badge badge-scope-muted';
      badgeSecFerme.textContent = currentActiveEntity === 'ferme' ? 'Actif • Guilmey' : 'Guilmey';
    }
    if (badgeSecSoratrad) {
      badgeSecSoratrad.className = currentActiveEntity === 'soratrad' ? 'section-scope-badge badge-scope-soratrad' : 'section-scope-badge badge-scope-muted';
      badgeSecSoratrad.textContent = currentActiveEntity === 'soratrad' ? 'Actif • Farcha' : 'Farcha';
    }

    // 4. Titre et sous-titre contextuels du tableau de bord
    const dashTitle = document.getElementById('dash-title');
    const dashSubtitle = document.getElementById('dash-subtitle');
    const alertBannerBadge = document.getElementById('alert-banner-badge');
    const alertBannerText = document.getElementById('alert-banner-text');

    if (currentActiveEntity === 'ferme') {
      if (dashTitle) dashTitle.textContent = `${db.settings.fermeName} (${db.settings.fermeLocation}) — Cockpit Laitier & Élevage`;
      if (dashSubtitle) dashSubtitle.textContent = 'Suivi du cheptel laitier, pesées quotidiennes de traite, valorisation des drêches et autonomie fourragère.';
      if (alertBannerBadge) {
        alertBannerBadge.textContent = 'PÉRIMÈTRE ACTIF : FERME DE SARA';
        alertBannerBadge.style.background = 'rgba(16, 185, 129, 0.25)';
        alertBannerBadge.style.color = '#34d399';
      }
      if (alertBannerText) alertBannerText.innerHTML = `Exploitation Guilmey : <strong>${(db.cows || []).filter(c => c.status === 'Lactation').length} vaches en lactation</strong>. Valorisation de drêches et Maralfalfa.`;
      if (options.notify) showEntityToast('Périmètre : Ferme de Sara (Guilmey) activé', 'dot-green');

      // Si l'utilisateur est sur un module exclusivement SORATRAD, basculer proprement sur un module de la Ferme
      if (options.autoSwitchTab) {
        const activeNav = document.querySelector('.nav-item.active');
        const activeTabId = activeNav ? activeNav.getAttribute('data-tab') : '';
        if (['tab-verre', 'tab-plastique', 'tab-dreches'].includes(activeTabId)) {
          switchTab('tab-lait');
        }
      }
    } else if (currentActiveEntity === 'soratrad') {
      if (dashTitle) dashTitle.textContent = `${db.settings.dechetsName} (${db.settings.dechetsLocation}) — Valorisation des Déchets`;
      if (dashSubtitle) dashSubtitle.textContent = 'Transformation calcin verre BTP, granulation plastique PEHD/PP et redistribution drêches de brasserie.';
      if (alertBannerBadge) {
        alertBannerBadge.textContent = 'PÉRIMÈTRE ACTIF : SORATRAD DÉCHETS';
        alertBannerBadge.style.background = 'rgba(2, 132, 199, 0.25)';
        alertBannerBadge.style.color = '#38bdf8';
      }
      if (alertBannerText) alertBannerText.innerHTML = `Usine Farcha : Recyclage actif <strong>Verre BTP, Granulés Plastique PEHD et distribution Drêches</strong>.`;
      if (options.notify) showEntityToast('Périmètre : SORATRAD Déchets (Farcha) activé', 'dot-blue');

      // Si l'utilisateur est sur un module exclusivement FERME, basculer proprement sur un module SORATRAD
      if (options.autoSwitchTab) {
        const activeNav = document.querySelector('.nav-item.active');
        const activeTabId = activeNav ? activeNav.getAttribute('data-tab') : '';
        if (['tab-lait', 'tab-cheptel', 'tab-nutrition'].includes(activeTabId)) {
          switchTab('tab-verre');
        }
      }
    } else {
      if (dashTitle) dashTitle.textContent = 'Cockpit de Direction Générale & Opérations';
      if (dashSubtitle) dashSubtitle.textContent = `Indicateurs temps réel consolidés : ${db.settings.fermeName} (Guilmey) et ${db.settings.dechetsName} (Farcha).`;
      if (alertBannerBadge) {
        alertBannerBadge.textContent = 'PÉRIMÈTRE ACTIF : GROUPE CONSOLIDÉ';
        alertBannerBadge.style.background = 'rgba(245, 158, 11, 0.25)';
        alertBannerBadge.style.color = '#fbbf24';
      }
      if (alertBannerText) alertBannerText.innerHTML = `Plateforme opérationnelle. Synergie logistique active entre <strong>Guilmey</strong> et <strong>Farcha</strong>.`;
      if (options.notify) showEntityToast('Périmètre : Groupe Consolidé activé', 'dot-gold');
    }

    renderAllViews();
  }

  // =========================================================================
  // 6. RENDER ALL VIEWS (REACTIVE STATE ENGINE)
  // =========================================================================
  function renderAllViews() {
    updateZeroStatusBadge();
    renderDashboardKPIs();
    renderDashboardProgressAndAlerts();
    renderShuttles();
    renderTraites();
    renderCheptel();
    renderGlass();
    renderPlastic();
    renderDreches();
    renderPnL();
    renderQhse();
    calculateAndRenderRation();
  }

  // Check if system is currently at zero counters
  function isDatabaseAtZero() {
    const totalRecords =
      (db.cows ? db.cows.length : 0) +
      (db.traiteHistory ? db.traiteHistory.length : 0) +
      (db.shuttles ? db.shuttles.length : 0) +
      (db.glassBatches ? db.glassBatches.length : 0) +
      (db.plasticBatches ? db.plasticBatches.length : 0) +
      (db.drecheBatches ? db.drecheBatches.length : 0) +
      (db.qhseAudits ? db.qhseAudits.length : 0);

    return totalRecords === 0;
  }

  function updateZeroStatusBadge() {
    if (!statusZeroBadge) return;
    const isZero = isDatabaseAtZero();
    if (isZero) {
      statusZeroBadge.className = 'zero-counter-badge active-zero';
      statusZeroBadge.innerHTML = `<span class="dot dot-gold"></span><span>Compteurs : <strong>0 (Initialisé)</strong></span>`;
      if (alertBannerBadge) alertBannerBadge.textContent = 'COMPTEURS À ZÉRO';
      if (alertBannerText) alertBannerText.innerHTML = 'Plateforme initialisée avec compteurs à zéro. Cliquez sur <strong>"+ Nouvelle Saisie"</strong> pour enregistrer vos flux ou sur <strong>"⚡ Charger Démo"</strong> pour tester avec des exemples.';
    } else {
      const recordsCount =
        db.cows.length +
        db.traiteHistory.length +
        db.shuttles.length +
        db.glassBatches.length +
        db.plasticBatches.length +
        db.drecheBatches.length;

      statusZeroBadge.className = 'zero-counter-badge';
      statusZeroBadge.innerHTML = `<span class="dot dot-green"></span><span>Exploitation : <strong>${recordsCount} flux actifs</strong></span>`;
      if (alertBannerBadge) alertBannerBadge.textContent = 'SYNERGIE ACTIVE';

      const lastShuttle = db.shuttles[0];
      if (lastShuttle) {
        if (alertBannerText) alertBannerText.innerHTML = `Dernière navette (${lastShuttle.date}) : <strong>${lastShuttle.outbound}</strong> &rarr; Aller | <strong>${lastShuttle.inbound}</strong> &rarr; Retour. Économie nette : <strong>${formatMoney(lastShuttle.savingsFcfa)}</strong>.`;
      } else {
        if (alertBannerText) alertBannerText.innerHTML = `Système en exploitation active avec données opérationnelles synchronisées.`;
      }
    }
  }

  // =========================================================================
  // 6.1 DASHBOARD VIEW
  // =========================================================================
  function renderDashboardKPIs() {
    // Shared Data calculations
    const latestTraite = db.traiteHistory && db.traiteHistory.length > 0 ? db.traiteHistory[0] : null;
    const todayMilkLiters = latestTraite ? latestTraite.totalL : 0;
    const activeCows = latestTraite ? latestTraite.activeCows : (db.cows ? db.cows.filter(c => c.status === 'Lactation').length : 0);
    const totalCows = db.cows ? db.cows.length : 0;
    const avgPerCow = activeCows > 0 && todayMilkLiters > 0 ? (todayMilkLiters / activeCows).toFixed(1) : '0.0';

    const totalDreches = (db.drecheBatches || []).reduce((acc, b) => acc + (parseFloat(b.tonsReceived) || 0), 0);
    const fermeDreches = (db.drecheBatches || []).reduce((acc, b) => acc + (parseFloat(b.allocatedFermeT) || 0), 0);
    const saleDreches = (db.drecheBatches || []).reduce((acc, b) => acc + (parseFloat(b.allocatedSaleT) || 0), 0);
    const drecheStockKg = fermeDreches * 1000;
    const dailyNeedKg = 18 * 12; // 216 kg/jour
    const daysAutonomy = dailyNeedKg > 0 ? (drecheStockKg / dailyNeedKg).toFixed(1) : '0';

    const totalCullet = (db.glassBatches || []).reduce((acc, b) => acc + (parseFloat(b.culletProducedT) || 0), 0);
    const totalExtrudedKg = (db.plasticBatches || []).reduce((acc, b) => acc + (parseFloat(b.extrudedKg) || 0), 0);
    const totalPlasticTons = totalExtrudedKg / 1000;

    const milkPrice = db.settings.milkPricePerLiter || 600;
    const monthlyMilkCA = todayMilkLiters * 30 * milkPrice;
    const plasticCA = (db.plasticBatches || []).reduce((acc, b) => acc + (parseFloat(b.revenue) || 0), 0);
    const glassCA = (db.glassBatches || []).reduce((acc, b) => acc + (parseFloat(b.revenue) || 0), 0);
    const drecheSaleCA = (db.drecheBatches || []).reduce((acc, b) => acc + (parseFloat(b.saleRev) || 0), 0);
    const shuttlesSavings = (db.shuttles || []).reduce((acc, s) => acc + (parseFloat(s.savingsFcfa) || 0), 0);

    // Dynamic KPI Elements
    const kpiLabel1 = document.getElementById('kpi-label-1');
    const kpiIcon1 = document.getElementById('kpi-icon-1');
    const kpiUnit1 = document.getElementById('kpi-unit-1');

    const kpiLabel2 = document.getElementById('kpi-label-2');
    const kpiIcon2 = document.getElementById('kpi-icon-2');
    const kpiUnit2 = document.getElementById('kpi-unit-2');
    const kpiSub2 = document.getElementById('kpi-sub-2');

    const kpiLabel3 = document.getElementById('kpi-label-3');
    const kpiIcon3 = document.getElementById('kpi-icon-3');
    const kpiUnit3 = document.getElementById('kpi-unit-3');
    const kpiTrend3 = document.getElementById('kpi-trend-3');
    const kpiDesc3 = document.getElementById('kpi-desc-3');

    const kpiLabel4 = document.getElementById('kpi-label-4');
    const kpiIcon4 = document.getElementById('kpi-icon-4');
    const kpiUnit4 = document.getElementById('kpi-unit-4');
    const kpiTrend4 = document.getElementById('kpi-trend-4');
    const kpiDesc4 = document.getElementById('kpi-desc-4');

    const kpiLabel5 = document.getElementById('kpi-label-5');
    const kpiIcon5 = document.getElementById('kpi-icon-5');
    const kpiTag5 = document.getElementById('kpi-tag-5');

    if (currentActiveEntity === 'ferme') {
      // 1. Production Laitière Guilmey
      if (kpiLabel1) kpiLabel1.textContent = 'Production Laitière (Guilmey)';
      if (kpiIcon1) kpiIcon1.textContent = '🥛';
      if (kpiLaitVal) kpiLaitVal.textContent = todayMilkLiters;
      if (kpiUnit1) kpiUnit1.textContent = 'L/jour';
      if (kpiLaitVache) kpiLaitVache.textContent = `Moyenne: ${avgPerCow} L / vache (${activeCows} VL en traite)`;

      // 2. Drêches Reçues de SORATRAD
      if (kpiLabel2) kpiLabel2.textContent = 'Drêches Reçues de SORATRAD';
      if (kpiIcon2) kpiIcon2.textContent = '🌾';
      if (kpiDrechesVal) kpiDrechesVal.textContent = formatNumber(fermeDreches, 1);
      if (kpiUnit2) kpiUnit2.textContent = 'T/mois';
      if (kpiSub2) kpiSub2.innerHTML = `<span class="kpi-tag">${daysAutonomy} j d'autonomie</span> <span class="kpi-tag">${Math.round(drecheStockKg)} kg dispo</span>`;

      // 3. Cheptel Laitier & Santé
      if (kpiLabel3) kpiLabel3.textContent = 'Cheptel Laitier Actif';
      if (kpiIcon3) kpiIcon3.textContent = '🐄';
      if (kpiVerreVal) kpiVerreVal.textContent = totalCows;
      if (kpiUnit3) kpiUnit3.textContent = 'bêtes';
      if (kpiTrend3) kpiTrend3.textContent = `${activeCows} en lactation`;
      if (kpiDesc3) kpiDesc3.textContent = `${totalCows - activeCows} taries / génisses`;

      // 4. Économie Ration Drêche
      const feedSavingFcfa = todayMilkLiters > 0 ? (todayMilkLiters * 30 * 180) : (fermeDreches * 1000 * 45);
      if (kpiLabel4) kpiLabel4.textContent = 'Économie Ration (Drêche)';
      if (kpiIcon4) kpiIcon4.textContent = '✨';
      if (kpiPlastiqueVal) kpiPlastiqueVal.textContent = Math.round(feedSavingFcfa / 1000);
      if (kpiUnit4) kpiUnit4.textContent = 'k FCFA/m';
      if (kpiDesc4) kpiDesc4.textContent = 'Concentré importé évité';
      if (kpiTrend4) kpiTrend4.textContent = '-55% coût ration';

      // 5. CA Laitier Ferme
      if (kpiLabel5) kpiLabel5.textContent = 'Chiffre d\'Affaires Laitier';
      if (kpiIcon5) kpiIcon5.textContent = '💰';
      if (kpiCaVal) kpiCaVal.textContent = Math.round(monthlyMilkCA).toLocaleString('fr-FR');
      if (kpiTag5) kpiTag5.textContent = `Prix: ${milkPrice} FCFA/Litre`;
      if (kpiSynergieSaving) kpiSynergieSaving.textContent = 'Marge brute d\'élevage estimée : ~64%';

    } else if (currentActiveEntity === 'soratrad') {
      // 1. Calcin Verre BTP
      if (kpiLabel1) kpiLabel1.textContent = 'Calcin Verre BTP / Verrerie';
      if (kpiIcon1) kpiIcon1.textContent = '🍾';
      if (kpiLaitVal) kpiLaitVal.textContent = formatNumber(totalCullet, 1);
      if (kpiUnit1) kpiUnit1.textContent = 'T/mois';
      if (kpiLaitVache) kpiLaitVache.textContent = 'Pureté calcin 98.4% (Pavés & BTP)';

      // 2. Granulés Plastique PEHD/PP
      if (kpiLabel2) kpiLabel2.textContent = 'Granulés Plastique (PEHD/PP)';
      if (kpiIcon2) kpiIcon2.textContent = '📦';
      if (kpiDrechesVal) kpiDrechesVal.textContent = formatNumber(totalPlasticTons, 1);
      if (kpiUnit2) kpiUnit2.textContent = 'T/mois';
      if (kpiSub2) kpiSub2.innerHTML = '<span class="kpi-tag">Rendement: 91%</span> <span class="kpi-tag">480 000 FCFA/T</span>';

      // 3. Drêches Brasserie Collectées
      if (kpiLabel3) kpiLabel3.textContent = 'Drêches Brasserie Collectées';
      if (kpiIcon3) kpiIcon3.textContent = '🌾';
      if (kpiVerreVal) kpiVerreVal.textContent = formatNumber(totalDreches, 1);
      if (kpiUnit3) kpiUnit3.textContent = 'T/mois';
      if (kpiTrend3) kpiTrend3.textContent = `${formatNumber(fermeDreches, 1)} T vers Sara`;
      if (kpiDesc3) kpiDesc3.textContent = `${formatNumber(saleDreches, 1)} T revente`;

      // 4. Total Matières Recyclées
      const totalRecycledTons = totalCullet + totalPlasticTons + totalDreches;
      if (kpiLabel4) kpiLabel4.textContent = 'Total Matières Valorisées';
      if (kpiIcon4) kpiIcon4.textContent = '♻️';
      if (kpiPlastiqueVal) kpiPlastiqueVal.textContent = formatNumber(totalRecycledTons, 1);
      if (kpiUnit4) kpiUnit4.textContent = 'T/mois';
      if (kpiDesc4) kpiDesc4.textContent = 'Zéro décharge Farcha';
      if (kpiTrend4) kpiTrend4.textContent = '100% valorisation';

      // 5. CA SORATRAD
      const soratradCA = plasticCA + glassCA + drecheSaleCA;
      if (kpiLabel5) kpiLabel5.textContent = 'Chiffre d\'Affaires Déchets (Farcha)';
      if (kpiIcon5) kpiIcon5.textContent = '💰';
      if (kpiCaVal) kpiCaVal.textContent = Math.round(soratradCA).toLocaleString('fr-FR');
      if (kpiTag5) kpiTag5.textContent = 'Verre + Plastique + Drêches';
      if (kpiSynergieSaving) kpiSynergieSaving.textContent = 'Débouchés BTP et éleveurs sécurisés';

    } else {
      // 1. Production Laitière Consolidée
      if (kpiLabel1) kpiLabel1.textContent = 'Production Laitière';
      if (kpiIcon1) kpiIcon1.textContent = '🥛';
      if (kpiLaitVal) kpiLaitVal.textContent = todayMilkLiters;
      if (kpiUnit1) kpiUnit1.textContent = 'L/jour';
      if (kpiLaitVache) kpiLaitVache.textContent = `Moyenne: ${avgPerCow} L / vache en lactation`;

      // 2. Drêches Brasserie Collectées
      if (kpiLabel2) kpiLabel2.textContent = 'Drêches Brasserie Collectées';
      if (kpiIcon2) kpiIcon2.textContent = '🌾';
      if (kpiDrechesVal) kpiDrechesVal.textContent = formatNumber(totalDreches, 1);
      if (kpiUnit2) kpiUnit2.textContent = 'T/mois';
      if (kpiSub2) kpiSub2.innerHTML = `<span class="kpi-tag">Dont ${formatNumber(fermeDreches, 1)} T Ferme</span> <span class="kpi-tag">${formatNumber(saleDreches, 1)} T Revente</span>`;

      // 3. Calcin Verre BTP / Verrerie
      if (kpiLabel3) kpiLabel3.textContent = 'Calcin Verre BTP / Verrerie';
      if (kpiIcon3) kpiIcon3.textContent = '🍾';
      if (kpiVerreVal) kpiVerreVal.textContent = formatNumber(totalCullet, 1);
      if (kpiUnit3) kpiUnit3.textContent = 'T/mois';
      if (kpiTrend3) kpiTrend3.textContent = 'Pureté calcin 98.4%';
      if (kpiDesc3) kpiDesc3.textContent = 'Débouché BTP & pavés';

      // 4. Granulés Plastique (PEHD/PP)
      if (kpiLabel4) kpiLabel4.textContent = 'Granulés Plastique (PEHD/PP)';
      if (kpiIcon4) kpiIcon4.textContent = '📦';
      if (kpiPlastiqueVal) kpiPlastiqueVal.textContent = formatNumber(totalPlasticTons, 1);
      if (kpiUnit4) kpiUnit4.textContent = 'T/mois';
      if (kpiDesc4) kpiDesc4.textContent = 'Rendement matière: 91%';
      if (kpiTrend4) kpiTrend4.textContent = 'Prix: 480 000 FCFA/T';

      // 5. CA Consolidé
      const totalGroupCA = monthlyMilkCA + plasticCA + glassCA + drecheSaleCA;
      if (kpiLabel5) kpiLabel5.textContent = 'Chiffre d\'Affaires Mensuel Estimé';
      if (kpiIcon5) kpiIcon5.textContent = '💰';
      if (kpiCaVal) kpiCaVal.textContent = Math.round(totalGroupCA).toLocaleString('fr-FR');
      if (kpiTag5) kpiTag5.textContent = 'Marge brute globale: 44.5%';
      if (kpiSynergieSaving) kpiSynergieSaving.textContent = shuttlesSavings > 0 ? `Économie synergie navettes: ${formatMoney(shuttlesSavings)}` : 'Boucle circulaire Guilmey ↔ Farcha';
    }
  }

  function renderDashboardProgressAndAlerts() {
    const latestTraite = db.traiteHistory && db.traiteHistory.length > 0 ? db.traiteHistory[0] : null;
    const todayMilkLiters = latestTraite ? latestTraite.totalL : 0;
    const tankPct = Math.min(100, Math.round((todayMilkLiters / 300) * 100));

    if (barTankPct) barTankPct.textContent = `${tankPct}% (${todayMilkLiters} L / 300 L)`;
    if (barTankFill) barTankFill.style.width = `${tankPct}%`;

    // Dreches stock calculation
    const totalDrecheFermeTons = (db.drecheBatches || []).reduce((acc, b) => acc + (parseFloat(b.allocatedFermeT) || 0), 0);
    const drecheStockKg = totalDrecheFermeTons * 1000;
    const dailyNeedKg = 18 * 12; // 216 kg/day
    const daysAutonomy = dailyNeedKg > 0 ? (drecheStockKg / dailyNeedKg).toFixed(1) : '0';

    if (barDrecheStock) barDrecheStock.textContent = `${daysAutonomy} jours (${Math.round(drecheStockKg)} kg dispo)`;
    const drecheFillPct = Math.min(100, Math.round((daysAutonomy / 10) * 100));
    if (barDrecheFill) barDrecheFill.style.width = `${drecheFillPct}%`;

    // Plastic collection goal
    const totalPlasticTons = ((db.plasticBatches || []).reduce((acc, b) => acc + (parseFloat(b.rawKg) || 0), 0)) / 1000;
    const plasticTargetTons = 15;
    const plasticPct = Math.min(100, Math.round((totalPlasticTons / plasticTargetTons) * 100));
    if (barPlastiquePct) barPlastiquePct.textContent = `${plasticPct}% (${formatNumber(totalPlasticTons, 1)} T / ${plasticTargetTons} T)`;
    if (barPlastiqueFill) barPlastiqueFill.style.width = `${plasticPct}%`;

    // Glass crushing capacity
    const totalGlassTons = (db.glassBatches || []).reduce((acc, b) => acc + (parseFloat(b.rawTons) || 0), 0);
    const glassTargetTons = 30;
    const glassPct = Math.min(100, Math.round((totalGlassTons / glassTargetTons) * 100));
    if (barVerrePct) barVerrePct.textContent = `${glassPct}% (${formatNumber(totalGlassTons, 1)} T / ${glassTargetTons} T)`;
    if (barVerreFill) barVerreFill.style.width = `${glassPct}%`;

    // Notifications box - Filtrées selon le périmètre actif
    if (dashNotificationsBox) {
      if (isDatabaseAtZero()) {
        dashNotificationsBox.innerHTML = `
          <div class="notif-item">
            <span class="notif-dot amber"></span>
            <div><strong>Compteurs à zéro (Mode Démarrage) :</strong> Aucune pesée ni navette enregistrée. Utilisez "+ Saisie" pour enregistrer votre premier flux ou chargez la démo.</div>
          </div>
        `;
      } else if (currentActiveEntity === 'ferme') {
        dashNotificationsBox.innerHTML = `
          <div class="notif-item">
            <span class="notif-dot green"></span>
            <div><strong>Contrôle qualité laitier (Guilmey) :</strong> Tank à lait stabilisé à 3.8°C. Traite matinale conforme et test mammite négatif.</div>
          </div>
          <div class="notif-item">
            <span class="notif-dot green"></span>
            <div><strong>Rationnement & Fourrage :</strong> Incorporation drêches fraîches dans la ration respectée (12 kg/VL). Gain économique immédiat.</div>
          </div>
        `;
      } else if (currentActiveEntity === 'soratrad') {
        dashNotificationsBox.innerHTML = `
          <div class="notif-item">
            <span class="notif-dot green"></span>
            <div><strong>Ligne Broyeur Calcin (Farcha) :</strong> Débit nominal 1.2 T/heure. Stock de calcin calibré prêt pour expédition vers chantier BTP.</div>
          </div>
          <div class="notif-item">
            <span class="notif-dot amber"></span>
            <div><strong>Rotation Plastiques :</strong> Stock casiers PEHD suffisant pour 3 jours d'extrusion continue.</div>
          </div>
        `;
      } else {
        dashNotificationsBox.innerHTML = `
          <div class="notif-item">
            <span class="notif-dot green"></span>
            <div><strong>Boucle Circulaire Active :</strong> Rotation navettes Guilmey &harr; Farcha assurée sans trajet à vide.</div>
          </div>
          <div class="notif-item">
            <span class="notif-dot amber"></span>
            <div><strong>Maintenance préventive :</strong> Affûtage périodique programmé sur les couteaux de broyage Farcha.</div>
          </div>
        `;
      }
    }

    // Revenue breakdown box - Filtrée selon le périmètre actif
    if (dashRevenueBreakdown) {
      const milkCA = todayMilkLiters * 30 * (db.settings.milkPricePerLiter || 600);
      const plasticCA = (db.plasticBatches || []).reduce((acc, b) => acc + (parseFloat(b.revenue) || 0), 0);
      const glassCA = (db.glassBatches || []).reduce((acc, b) => acc + (parseFloat(b.revenue) || 0), 0);
      const drecheSaleCA = (db.drecheBatches || []).reduce((acc, b) => acc + (parseFloat(b.saleRev) || 0), 0);
      const totalCA = milkCA + plasticCA + glassCA + drecheSaleCA;

      if (currentActiveEntity === 'ferme') {
        const feedSavingFcfa = todayMilkLiters > 0 ? (todayMilkLiters * 30 * 180) : 0;
        dashRevenueBreakdown.innerHTML = `
          <div class="rev-row">
            <div class="rev-name"><span class="dot dot-green"></span> Ventes Lait Frais (${db.settings.fermeLocation})</div>
            <div class="rev-amount">${formatMoney(milkCA)}</div>
            <div class="rev-pct">100%</div>
          </div>
          <div class="rev-row" style="background: rgba(16, 185, 129, 0.08); border-radius: 6px; padding: 4px 8px;">
            <div class="rev-name"><span class="dot dot-gold"></span> Économie Synergie Drêches (Fourrage)</div>
            <div class="rev-amount" style="color:#34d399;">+ ${formatMoney(feedSavingFcfa)}</div>
            <div class="rev-pct" style="color:#34d399;">Épargné</div>
          </div>
        `;
      } else if (currentActiveEntity === 'soratrad') {
        const soratradTotal = plasticCA + glassCA + drecheSaleCA;
        const pPlastic = soratradTotal > 0 ? ((plasticCA / soratradTotal) * 100).toFixed(1) : '0.0';
        const pGlass = soratradTotal > 0 ? ((glassCA / soratradTotal) * 100).toFixed(1) : '0.0';
        const pDreche = soratradTotal > 0 ? ((drecheSaleCA / soratradTotal) * 100).toFixed(1) : '0.0';

        dashRevenueBreakdown.innerHTML = `
          <div class="rev-row">
            <div class="rev-name"><span class="dot dot-blue"></span> Granulés Plastique PEHD/PP (Farcha)</div>
            <div class="rev-amount">${formatMoney(plasticCA)}</div>
            <div class="rev-pct">${pPlastic}%</div>
          </div>
          <div class="rev-row">
            <div class="rev-name"><span class="dot dot-amber"></span> Calcin de Verre Concassé (Farcha)</div>
            <div class="rev-amount">${formatMoney(glassCA)}</div>
            <div class="rev-pct">${pGlass}%</div>
          </div>
          <div class="rev-row">
            <div class="rev-name"><span class="dot dot-gold"></span> Drêches Ensilées &amp; Revente</div>
            <div class="rev-amount">${formatMoney(drecheSaleCA)}</div>
            <div class="rev-pct">${pDreche}%</div>
          </div>
        `;
      } else {
        const pMilk = totalCA > 0 ? ((milkCA / totalCA) * 100).toFixed(1) : '0.0';
        const pPlastic = totalCA > 0 ? ((plasticCA / totalCA) * 100).toFixed(1) : '0.0';
        const pGlass = totalCA > 0 ? ((glassCA / totalCA) * 100).toFixed(1) : '0.0';
        const pDreche = totalCA > 0 ? ((drecheSaleCA / totalCA) * 100).toFixed(1) : '0.0';

        dashRevenueBreakdown.innerHTML = `
          <div class="rev-row">
            <div class="rev-name"><span class="dot dot-green"></span> Lait &amp; Produits Laitiers (${db.settings.fermeLocation})</div>
            <div class="rev-amount">${formatMoney(milkCA)}</div>
            <div class="rev-pct">${pMilk}%</div>
          </div>
          <div class="rev-row">
            <div class="rev-name"><span class="dot dot-blue"></span> Granulés Plastique PEHD/PP (${db.settings.dechetsLocation})</div>
            <div class="rev-amount">${formatMoney(plasticCA)}</div>
            <div class="rev-pct">${pPlastic}%</div>
          </div>
          <div class="rev-row">
            <div class="rev-name"><span class="dot dot-amber"></span> Calcin de Verre concassé (${db.settings.dechetsLocation})</div>
            <div class="rev-amount">${formatMoney(glassCA)}</div>
            <div class="rev-pct">${pGlass}%</div>
          </div>
          <div class="rev-row">
            <div class="rev-name"><span class="dot dot-gold"></span> Drêches ensilées &amp; Revente</div>
            <div class="rev-amount">${formatMoney(drecheSaleCA)}</div>
            <div class="rev-pct">${pDreche}%</div>
          </div>
        `;
      }
    }
  }

  // =========================================================================
  // 6.2 SHUTTLES & CIRCULAR LOOP
  // =========================================================================
  function renderShuttles() {
    const shuttles = db.shuttles || [];

    // Summary metrics
    let totalDrechesTons = 0;
    let totalMilkL = 0;
    let totalFumierTons = 0;
    let totalSavings = 0;

    shuttles.forEach(s => {
      totalSavings += parseFloat(s.savingsFcfa) || 0;
      if (s.outbound && s.outbound.includes('Drêches')) {
        const match = s.outbound.match(/([0-9.,]+)\s*T/i);
        if (match) totalDrechesTons += parseFloat(match[1].replace(',', '.'));
      }
      if (s.inbound && s.inbound.includes('Lait')) {
        const match = s.inbound.match(/([0-9.,]+)\s*L/i);
        if (match) totalMilkL += parseFloat(match[1].replace(',', '.'));
      }
      if (s.inbound && s.inbound.includes('Fumier')) {
        const match = s.inbound.match(/([0-9.,]+)\s*T/i);
        if (match) totalFumierTons += parseFloat(match[1].replace(',', '.'));
      }
    });

    if (synTotalDreche) synTotalDreche.textContent = `${formatNumber(totalDrechesTons, 1)} T`;
    if (synTotalLait) synTotalLait.textContent = `${Math.round(totalMilkL)} L`;
    if (synTotalFumier) synTotalFumier.textContent = `${formatNumber(totalFumierTons, 1)} T`;
    if (synTotalSavings) synTotalSavings.textContent = formatMoney(totalSavings);

    // Table
    if (!tbodyShuttles) return;
    tbodyShuttles.innerHTML = '';

    if (shuttles.length === 0) {
      renderEmptyTable(tbodyShuttles, 8, 'Aucune navette logistique enregistrée. Les compteurs sont à zéro. Enregistrez votre premier voyage pour démarrer la traçabilité des échanges de matière.');
      return;
    }

    shuttles.forEach((s, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${s.date}</strong></td>
        <td>${escapeHtml(s.vehicle)}</td>
        <td><span class="badge-status status-warning">&darr; ${escapeHtml(s.outbound)}</span></td>
        <td><span class="badge-status status-ok">&uarr; ${escapeHtml(s.inbound)}</span></td>
        <td>${formatMoney(s.fuelCost)}</td>
        <td><strong class="highlight-green">+ ${formatMoney(s.savingsFcfa)}</strong></td>
        <td><span class="badge-status status-ok">${escapeHtml(s.status || 'Terminé')}</span></td>
        <td>
          <button class="btn-table-action danger" onclick="window.agroCircularOs.deleteItem('shuttles', ${idx})">Suppr.</button>
        </td>
      `;
      tbodyShuttles.appendChild(tr);
    });
  }

  // =========================================================================
  // 6.3 TRAITE & DAIRY VIEW
  // =========================================================================
  function renderTraites() {
    const list = db.traiteHistory || [];

    if (list.length > 0) {
      const morningAvg = (list.reduce((acc, t) => acc + (parseFloat(t.morningL) || 0), 0) / list.length).toFixed(0);
      const eveningAvg = (list.reduce((acc, t) => acc + (parseFloat(t.eveningL) || 0), 0) / list.length).toFixed(0);
      const priceAvg = list[0].pricePerL || 600;

      if (valTraiteMatin) valTraiteMatin.textContent = `${morningAvg} L`;
      if (valTraiteSoir) valTraiteSoir.textContent = `${eveningAvg} L`;
      if (valTraitePrix) valTraitePrix.textContent = `${priceAvg} FCFA`;
    } else {
      if (valTraiteMatin) valTraiteMatin.textContent = '0 L';
      if (valTraiteSoir) valTraiteSoir.textContent = '0 L';
      if (valTraitePrix) valTraitePrix.textContent = `${db.settings.milkPricePerLiter || 600} FCFA`;
    }

    if (!tbodyTraite) return;
    tbodyTraite.innerHTML = '';

    if (list.length === 0) {
      renderEmptyTable(tbodyTraite, 10, 'Aucune pesée de traite enregistrée. Compteurs à zéro. Cliquez sur "+ Enregistrer une Traite" pour saisir la première pesée matin/soir.');
      return;
    }

    list.forEach((item, idx) => {
      const avg = item.activeCows > 0 ? (item.totalL / item.activeCows).toFixed(1) : '0.0';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.date}</strong></td>
        <td>${item.activeCows} VL</td>
        <td>${item.morningL} L</td>
        <td>${item.eveningL} L</td>
        <td><strong>${item.totalL} L</strong></td>
        <td>${avg} L/v</td>
        <td>${formatMoney(item.totalDirectSales)}</td>
        <td>${item.transformedL} L</td>
        <td><span class="badge-status status-ok">${escapeHtml(item.quality || 'Conforme')}</span></td>
        <td>
          <button class="btn-table-action danger" onclick="window.agroCircularOs.deleteItem('traiteHistory', ${idx})">Suppr.</button>
        </td>
      `;
      tbodyTraite.appendChild(tr);
    });
  }

  // =========================================================================
  // 6.4 CHEPTEL (HERD) VIEW
  // =========================================================================
  function renderCheptel() {
    const cows = db.cows || [];

    const vl = cows.filter(c => c.status === 'Lactation').length;
    const vt = cows.filter(c => c.status === 'Tarie').length;
    const gen = cows.filter(c => c.status === 'Génisse').length;
    const veaux = cows.filter(c => c.status === 'Veaux').length;
    const total = cows.length;

    if (statCowsVl) statCowsVl.textContent = vl;
    if (statCowsVt) statCowsVt.textContent = vt;
    if (statCowsGen) statCowsGen.textContent = gen;
    if (statCowsVeaux) statCowsVeaux.textContent = veaux;
    if (statCowsTotal) statCowsTotal.textContent = total;

    renderCheptelTable();
  }

  function renderCheptelTable() {
    if (!tbodyCheptel) return;
    tbodyCheptel.innerHTML = '';

    const cows = db.cows || [];
    const filterVal = filterCowStatus ? filterCowStatus.value : 'all';

    const filtered = cows.filter(c => {
      if (filterVal === 'all') return true;
      return c.status === filterVal;
    });

    if (filtered.length === 0) {
      renderEmptyTable(tbodyCheptel, 8, 'Aucune vache enregistrée dans ce filtre. Compteur à zéro. Utilisez "+ Ajouter une Vache" pour enregistrer un nouvel animal dans le registre du troupeau.');
      return;
    }

    filtered.forEach((cow, idx) => {
      let statusBadge = 'status-ok';
      if (cow.status === 'Tarie') statusBadge = 'status-warning';
      if (cow.status === 'Génisse') statusBadge = 'status-info';
      if (cow.status === 'Veaux') statusBadge = 'status-neutral';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${cow.id}</strong></td>
        <td>${escapeHtml(cow.name)}</td>
        <td>${escapeHtml(cow.breed)}</td>
        <td><span class="badge-status ${statusBadge}">${escapeHtml(cow.status)}</span></td>
        <td><strong>${cow.dailyLiters > 0 ? cow.dailyLiters + ' L/j' : '-'}</strong></td>
        <td>${cow.calvingDate || '-'}</td>
        <td>${escapeHtml(cow.reproStatus || '-')}</td>
        <td>
          <button class="btn-table-action" onclick="window.agroCircularOs.showCowDetails('${cow.id}')">Fiche</button>
          <button class="btn-table-action danger" onclick="window.agroCircularOs.deleteCow('${cow.id}')">Suppr.</button>
        </td>
      `;
      tbodyCheptel.appendChild(tr);
    });
  }

  // =========================================================================
  // 6.5 GLASS & CULLET VIEW
  // =========================================================================
  function renderGlass() {
    const list = db.glassBatches || [];

    const totalRaw = list.reduce((acc, b) => acc + (parseFloat(b.rawTons) || 0), 0);
    const totalCullet = list.reduce((acc, b) => acc + (parseFloat(b.culletProducedT) || 0), 0);
    const totalRev = list.reduce((acc, b) => acc + (parseFloat(b.revenue) || 0), 0);
    const avgPrice = totalCullet > 0 ? Math.round(totalRev / totalCullet) : db.settings.priceGlassPerTon;

    if (valGlassRaw) valGlassRaw.textContent = formatNumber(totalRaw, 1);
    if (valGlassCullet) valGlassCullet.textContent = formatNumber(totalCullet, 1);
    if (valGlassPrice) valGlassPrice.textContent = avgPrice.toLocaleString('fr-FR');
    if (valGlassMargin) valGlassMargin.textContent = Math.round(totalRev).toLocaleString('fr-FR');

    if (!tbodyGlass) return;
    tbodyGlass.innerHTML = '';

    if (list.length === 0) {
      renderEmptyTable(tbodyGlass, 9, 'Aucun lot de bouteilles en verre enregistré. Compteurs à zéro. Cliquez sur "+ Nouveau Lot de Verre" pour enregistrer une collecte ou une production de calcin.');
      return;
    }

    list.forEach((b, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${b.id}</strong><br><small>${b.date}</small></td>
        <td>${escapeHtml(b.origin)}</td>
        <td>${formatNumber(b.rawTons, 1)} T</td>
        <td>${escapeHtml(b.colors || 'Mixte')}</td>
        <td><span class="badge-status status-warning">${escapeHtml(b.wastePct || '4%')}</span></td>
        <td><strong>${formatNumber(b.culletProducedT, 1)} T</strong></td>
        <td>${escapeHtml(b.buyer)}</td>
        <td><strong class="highlight-green">${formatMoney(b.revenue)}</strong></td>
        <td>
          <button class="btn-table-action danger" onclick="window.agroCircularOs.deleteItem('glassBatches', ${idx})">Suppr.</button>
        </td>
      `;
      tbodyGlass.appendChild(tr);
    });
  }

  // =========================================================================
  // 6.6 PLASTIC & GRANULATION VIEW
  // =========================================================================
  function renderPlastic() {
    const list = db.plasticBatches || [];

    const totalRawKg = list.reduce((acc, b) => acc + (parseFloat(b.rawKg) || 0), 0);
    const totalExtrudedKg = list.reduce((acc, b) => acc + (parseFloat(b.extrudedKg) || 0), 0);
    const totalRev = list.reduce((acc, b) => acc + (parseFloat(b.revenue) || 0), 0);
    const avgPricePerTon = totalExtrudedKg > 0 ? Math.round((totalRev / totalExtrudedKg) * 1000) : db.settings.pricePlasticPerTon;

    if (valPlasticRaw) valPlasticRaw.textContent = formatNumber(totalRawKg / 1000, 1);
    if (valPlasticGranules) valPlasticGranules.textContent = formatNumber(totalExtrudedKg / 1000, 1);
    if (valPlasticPrice) valPlasticPrice.textContent = avgPricePerTon.toLocaleString('fr-FR');
    if (valPlasticMargin) valPlasticMargin.textContent = Math.round(totalRev).toLocaleString('fr-FR');

    if (!tbodyPlastic) return;
    tbodyPlastic.innerHTML = '';

    if (list.length === 0) {
      renderEmptyTable(tbodyPlastic, 9, 'Aucun lot de casiers plastiques enregistré. Compteurs à zéro. Cliquez sur "+ Nouveau Lot Plastique" pour enregistrer un broyage ou une extrusion de granulés.');
      return;
    }

    list.forEach((b, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${b.id}</strong><br><small>${b.date}</small></td>
        <td><span class="badge-status status-info">${escapeHtml(b.polymer)}</span></td>
        <td>${Math.round(b.rawKg).toLocaleString('fr-FR')} kg</td>
        <td>${escapeHtml(b.process || 'Broyage + Lavage')}</td>
        <td><strong>${Math.round(b.extrudedKg).toLocaleString('fr-FR')} kg</strong></td>
        <td>${escapeHtml(b.quality || '-')}</td>
        <td>${escapeHtml(b.buyer)}</td>
        <td><strong class="highlight-green">${formatMoney(b.revenue)}</strong></td>
        <td>
          <button class="btn-table-action danger" onclick="window.agroCircularOs.deleteItem('plasticBatches', ${idx})">Suppr.</button>
        </td>
      `;
      tbodyPlastic.appendChild(tr);
    });
  }

  // =========================================================================
  // 6.7 SPENT GRAINS (DRÊCHES) VIEW
  // =========================================================================
  function renderDreches() {
    const list = db.drecheBatches || [];

    const totalReceived = list.reduce((acc, b) => acc + (parseFloat(b.tonsReceived) || 0), 0);
    const allocatedFerme = list.reduce((acc, b) => acc + (parseFloat(b.allocatedFermeT) || 0), 0);
    const allocatedSale = list.reduce((acc, b) => acc + (parseFloat(b.allocatedSaleT) || 0), 0);
    const allocatedSilage = list.reduce((acc, b) => acc + (parseFloat(b.allocatedSilageT) || 0), 0);
    const allocatedCompost = Math.max(0, totalReceived - allocatedFerme - allocatedSale - allocatedSilage);
    const totalRev = list.reduce((acc, b) => acc + (parseFloat(b.saleRev) || 0), 0);

    const pFerme = totalReceived > 0 ? ((allocatedFerme / totalReceived) * 100).toFixed(1) : '0.0';
    const pSale = totalReceived > 0 ? ((allocatedSale / totalReceived) * 100).toFixed(1) : '0.0';
    const pSilage = totalReceived > 0 ? ((allocatedSilage / totalReceived) * 100).toFixed(1) : '0.0';
    const pCompost = totalReceived > 0 ? ((allocatedCompost / totalReceived) * 100).toFixed(1) : '0.0';

    if (drecheTotalTitleVol) drecheTotalTitleVol.textContent = formatNumber(totalReceived, 1);
    if (drecheDispFermeVol) drecheDispFermeVol.textContent = `${formatNumber(allocatedFerme, 1)} T (${pFerme}%)`;
    if (drecheDispFermeCost) drecheDispFermeCost.textContent = `Coût de transfert interne: 18 000 FCFA/T`;

    if (drecheDispSaleVol) drecheDispSaleVol.textContent = `${formatNumber(allocatedSale, 1)} T (${pSale}%)`;
    if (drecheDispSaleCost) drecheDispSaleCost.textContent = `CA Revente: ${formatMoney(totalRev)}`;

    if (drecheDispSilageVol) drecheDispSilageVol.textContent = `${formatNumber(allocatedSilage, 1)} T (${pSilage}%)`;
    if (drecheDispSilageCost) drecheDispSilageCost.textContent = `Conservation anaérobie 6 mois`;

    if (drecheDispCompostVol) drecheDispCompostVol.textContent = `${formatNumber(allocatedCompost, 1)} T (${pCompost}%)`;
    if (drecheDispCompostCost) drecheDispCompostCost.textContent = `Compost & méthanisation`;

    // Table
    if (!tbodyDreches) return;
    tbodyDreches.innerHTML = '';

    if (list.length === 0) {
      renderEmptyTable(tbodyDreches, 9, 'Aucun enlèvement de drêches de brasserie enregistré. Compteurs à zéro. Utilisez "+ Réception Drêches Brasserie" pour tracer l\'arrivée d\'un brassin.');
      return;
    }

    list.forEach((b, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${b.id}</strong><br><small>${b.date}</small></td>
        <td>${escapeHtml(b.brewery)}</td>
        <td><strong>${formatNumber(b.tonsReceived, 1)} T</strong></td>
        <td><span class="badge-status status-warning">${escapeHtml(b.humidity || '77%')}</span></td>
        <td><span class="badge-status status-ok">${formatNumber(b.allocatedFermeT, 1)} T</span></td>
        <td>${formatNumber(b.allocatedSaleT, 1)} T</td>
        <td>${formatNumber(b.allocatedSilageT, 1)} T</td>
        <td><strong class="highlight-green">${formatMoney(b.saleRev)}</strong></td>
        <td>
          <button class="btn-table-action danger" onclick="window.agroCircularOs.deleteItem('drecheBatches', ${idx})">Suppr.</button>
        </td>
      `;
      tbodyDreches.appendChild(tr);
    });
  }

  // =========================================================================
  // 6.8 P&L & CONTRÔLE DE GESTION
  // =========================================================================
  function renderPnL() {
    const isZero = isDatabaseAtZero();

    // 1. Chiffres d'affaires
    const latestTraite = db.traiteHistory && db.traiteHistory.length > 0 ? db.traiteHistory[0] : null;
    const milkDailyL = latestTraite ? latestTraite.totalL : 0;
    const revLaitFerme = isZero ? 0 : milkDailyL * 30 * (db.settings.milkPricePerLiter || 600);

    const revPlasticSora = isZero ? 0 : (db.plasticBatches || []).reduce((acc, b) => acc + (parseFloat(b.revenue) || 0), 0);
    const revGlassSora = isZero ? 0 : (db.glassBatches || []).reduce((acc, b) => acc + (parseFloat(b.revenue) || 0), 0);
    const revDrecheSora = isZero ? 0 : (db.drecheBatches || []).reduce((acc, b) => acc + (parseFloat(b.saleRev) || 0), 0);

    const totRevFerme = revLaitFerme;
    const totRevSora = revPlasticSora + revGlassSora + revDrecheSora;
    const totRevGlobal = totRevFerme + totRevSora;

    // 2. Charges Variables
    const activeCows = (db.cows || []).filter(c => c.status === 'Lactation').length || (latestTraite ? latestTraite.activeCows : 0);
    const rationCostPerCowDay = calculateRationCost();
    const costFeedFerme = isZero ? 0 : activeCows * rationCostPerCowDay * 30;

    const rawGlassTons = (db.glassBatches || []).reduce((acc, b) => acc + (parseFloat(b.rawTons) || 0), 0);
    const rawPlasticKg = (db.plasticBatches || []).reduce((acc, b) => acc + (parseFloat(b.rawKg) || 0), 0);
    const costWasteSora = isZero ? 0 : (rawGlassTons * 25000) + ((rawPlasticKg / 1000) * 180000);

    const shuttlesFuelCost = (db.shuttles || []).reduce((acc, s) => acc + (parseFloat(s.fuelCost) || 0), 0);
    const costEnergyFerme = isZero ? 0 : Math.round(shuttlesFuelCost * 0.4) + 120000;
    const costEnergySora = isZero ? 0 : Math.round(shuttlesFuelCost * 0.6) + 450000;
    const costEnergyTot = costEnergyFerme + costEnergySora;

    const costConsumFerme = isZero ? 0 : 75000;
    const costConsumSora = isZero ? 0 : 250000;
    const costConsumTot = costConsumFerme + costConsumSora;

    const totVarFerme = costFeedFerme + costEnergyFerme + costConsumFerme;
    const totVarSora = costWasteSora + costEnergySora + costConsumSora;
    const totVarGlobal = totVarFerme + totVarSora;

    const mbFerme = totRevFerme - totVarFerme;
    const mbSora = totRevSora - totVarSora;
    const mbGlobal = totRevGlobal - totVarGlobal;
    const mbPct = totRevGlobal > 0 ? ((mbGlobal / totRevGlobal) * 100).toFixed(1) : '0.0';

    // 3. Charges Fixes
    const salFerme = isZero ? 0 : 600000;
    const salSora = isZero ? 0 : 1350000;
    const salTot = salFerme + salSora;

    const rentFerme = isZero ? 0 : 150000;
    const rentSora = isZero ? 0 : 350000;
    const rentTot = rentFerme + rentSora;

    const vetFerme = isZero ? 0 : 140000;
    const vetSora = isZero ? 0 : 80000;
    const vetTot = vetFerme + vetSora;

    const totFixFerme = salFerme + rentFerme + vetFerme;
    const totFixSora = salSora + rentSora + vetSora;
    const totFixGlobal = totFixFerme + totFixSora;

    // 4. EBITDA / Résultat Net
    const netFerme = mbFerme - totFixFerme;
    const netSora = mbSora - totFixSora;
    const netGlobal = mbGlobal - totFixGlobal;
    const netPct = totRevGlobal > 0 ? ((netGlobal / totRevGlobal) * 100).toFixed(1) : '0.0';

    // Update DOM Cells
    setCell('pnl-lait-ferme', revLaitFerme);
    setCell('pnl-lait-tot', revLaitFerme);
    setPct('pnl-lait-pct', revLaitFerme, totRevGlobal);

    setCell('pnl-plastic-sora', revPlasticSora);
    setCell('pnl-plastic-tot', revPlasticSora);
    setPct('pnl-plastic-pct', revPlasticSora, totRevGlobal);

    setCell('pnl-glass-sora', revGlassSora);
    setCell('pnl-glass-tot', revGlassSora);
    setPct('pnl-glass-pct', revGlassSora, totRevGlobal);

    setCell('pnl-dreche-sora', revDrecheSora);
    setCell('pnl-dreche-tot', revDrecheSora);
    setPct('pnl-dreche-pct', revDrecheSora, totRevGlobal);

    setCell('pnl-tot-rev-ferme', totRevFerme);
    setCell('pnl-tot-rev-sora', totRevSora);
    setCell('pnl-tot-rev-global', totRevGlobal);

    setCell('pnl-feed-ferme', costFeedFerme);
    setCell('pnl-feed-tot', costFeedFerme);
    setPct('pnl-feed-pct', costFeedFerme, totRevGlobal);

    setCell('pnl-waste-sora', costWasteSora);
    setCell('pnl-waste-tot', costWasteSora);
    setPct('pnl-waste-pct', costWasteSora, totRevGlobal);

    setCell('pnl-energy-ferme', costEnergyFerme);
    setCell('pnl-energy-sora', costEnergySora);
    setCell('pnl-energy-tot', costEnergyTot);
    setPct('pnl-energy-pct', costEnergyTot, totRevGlobal);

    setCell('pnl-consum-ferme', costConsumFerme);
    setCell('pnl-consum-sora', costConsumSora);
    setCell('pnl-consum-tot', costConsumTot);
    setPct('pnl-consum-pct', costConsumTot, totRevGlobal);

    setCell('pnl-mb-ferme', mbFerme);
    setCell('pnl-mb-sora', mbSora);
    setCell('pnl-mb-global', mbGlobal);
    const pnlMbPct = document.getElementById('pnl-mb-pct');
    if (pnlMbPct) pnlMbPct.textContent = `${mbPct}%`;

    setCell('pnl-sal-ferme', salFerme);
    setCell('pnl-sal-sora', salSora);
    setCell('pnl-sal-tot', salTot);
    setPct('pnl-sal-pct', salTot, totRevGlobal);

    setCell('pnl-rent-ferme', rentFerme);
    setCell('pnl-rent-sora', rentSora);
    setCell('pnl-rent-tot', rentTot);
    setPct('pnl-rent-pct', rentTot, totRevGlobal);

    setCell('pnl-vet-ferme', vetFerme);
    setCell('pnl-vet-sora', vetSora);
    setCell('pnl-vet-tot', vetTot);
    setPct('pnl-vet-pct', vetTot, totRevGlobal);

    setCell('pnl-net-ferme', netFerme);
    setCell('pnl-net-sora', netSora);
    setCell('pnl-net-global', netGlobal);
    const pnlNetPct = document.getElementById('pnl-net-pct');
    if (pnlNetPct) pnlNetPct.textContent = `${netPct}%`;
  }

  function setCell(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = Math.round(val).toLocaleString('fr-FR');
  }

  function setPct(id, num, den) {
    const el = document.getElementById(id);
    if (!el) return;
    if (den > 0) {
      el.textContent = `${((num / den) * 100).toFixed(1)}%`;
    } else {
      el.textContent = '0.0%';
    }
  }

  // =========================================================================
  // 6.9 QHSE, COMPLIANCE & AUDITS VIEW
  // =========================================================================
  function renderQhse() {
    const checklist = db.qhseChecklist || { ferme: [true, true, true, true, true], soratrad: [true, true, true, true, true] };

    // Update checkboxes state
    checklist.ferme.forEach((val, i) => {
      const chk = document.getElementById(`chk-qhse-f${i}`);
      if (chk) chk.checked = !!val;
    });

    checklist.soratrad.forEach((val, i) => {
      const chk = document.getElementById(`chk-qhse-s${i}`);
      if (chk) chk.checked = !!val;
    });

    const totalItems = checklist.ferme.length + checklist.soratrad.length;
    const checkedCount =
      checklist.ferme.filter(Boolean).length +
      checklist.soratrad.filter(Boolean).length;

    const complianceRate = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 100;
    if (qhseComplianceTag) {
      qhseComplianceTag.textContent = `${complianceRate}% Conforme`;
      qhseComplianceTag.style.background = complianceRate >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      qhseComplianceTag.style.color = complianceRate >= 80 ? '#6ee7b7' : '#fca5a5';
    }

    // Render Audits Table
    if (!tbodyQhseAudits) return;
    tbodyQhseAudits.innerHTML = '';

    const audits = db.qhseAudits || [];
    if (audits.length === 0) {
      renderEmptyTable(tbodyQhseAudits, 7, 'Aucun contrôle ou audit QHSE enregistré. Compteurs à zéro. Cliquez sur "+ Enregistrer un Contrôle QHSE" pour tracer votre premier audit.');
      return;
    }

    audits.forEach((a, idx) => {
      let badgeClass = 'status-ok';
      if (a.status === 'Vigilance') badgeClass = 'status-warning';
      if (a.status === 'Non-conforme') badgeClass = 'status-danger';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${a.date}</strong></td>
        <td>${escapeHtml(a.site)}</td>
        <td>${escapeHtml(a.domain)}</td>
        <td>${escapeHtml(a.inspector)}</td>
        <td><span class="badge-status ${badgeClass}">${escapeHtml(a.status)}</span></td>
        <td>${escapeHtml(a.notes)}</td>
        <td>
          <button class="btn-table-action danger" onclick="window.agroCircularOs.deleteItem('qhseAudits', ${idx})">Suppr.</button>
        </td>
      `;
      tbodyQhseAudits.appendChild(tr);
    });
  }

  function initQhseCheckboxListeners() {
    for (let i = 0; i < 5; i++) {
      const chkF = document.getElementById(`chk-qhse-f${i}`);
      if (chkF) {
        chkF.addEventListener('change', (e) => {
          if (!db.qhseChecklist) db.qhseChecklist = { ferme: [], soratrad: [] };
          db.qhseChecklist.ferme[i] = e.target.checked;
          saveDatabase();
          renderQhse();
        });
      }

      const chkS = document.getElementById(`chk-qhse-s${i}`);
      if (chkS) {
        chkS.addEventListener('change', (e) => {
          if (!db.qhseChecklist) db.qhseChecklist = { ferme: [], soratrad: [] };
          db.qhseChecklist.soratrad[i] = e.target.checked;
          saveDatabase();
          renderQhse();
        });
      }
    }
  }

  // =========================================================================
  // 6.10 NUTRITION CALCULATOR & RATION FORMULATION
  // =========================================================================
  function calculateRationCost() {
    const ration = db.settings.activeRation || {
      maralfalfaKg: 25,
      drecheKg: 12,
      tourteauKg: 1.5,
      sonKg: 2.0,
      cmvG: 150
    };

    // Maralfalfa: 15 FCFA/kg | Drêche: 18 FCFA/kg | Tourteau: 320 FCFA/kg | Son: 180 FCFA/kg | CMV: 120 FCFA
    const cost =
      (ration.maralfalfaKg * 15) +
      (ration.drecheKg * 18) +
      (ration.tourteauKg * 320) +
      (ration.sonKg * 180) +
      120;

    return cost;
  }

  function calculateAndRenderRation() {
    const maralfalfaKg = parseFloat(inputMaralfalfa ? inputMaralfalfa.value : 25) || 0;
    const drecheKg = parseFloat(inputDreche ? inputDreche.value : 12) || 0;
    const tourteauKg = parseFloat(inputTourteau ? inputTourteau.value : 1.5) || 0;
    const sonKg = parseFloat(inputSon ? inputSon.value : 2.0) || 0;
    const cmvG = parseFloat(inputCmv ? inputCmv.value : 150) || 0;
    const cowsCount = parseInt(inputCowsCount ? inputCowsCount.value : 18) || 18;

    const msTotal = (maralfalfaKg * 0.18) + (drecheKg * 0.22) + (tourteauKg * 0.90) + (sonKg * 0.88) + (cmvG / 1000);
    const uflTotal = (maralfalfaKg * 0.18 * 0.78) + (drecheKg * 0.22 * 0.95) + (tourteauKg * 0.90 * 1.05) + (sonKg * 0.88 * 0.85);
    const pdiTotal = (maralfalfaKg * 0.18 * 65) + (drecheKg * 0.22 * 145) + (tourteauKg * 0.90 * 320) + (sonKg * 0.88 * 90);

    const costPerCow = (maralfalfaKg * 15) + (drecheKg * 18) + (tourteauKg * 320) + (sonKg * 180) + 120;
    const commercialEquivalentCost = 2800; // Si nourri uniquement avec concentré industriel importé
    const savingPerCow = Math.max(0, commercialEquivalentCost - costPerCow);
    const herdDailySaving = savingPerCow * cowsCount;
    const monthlySaving = herdDailySaving * 30;

    if (resMsVal) resMsVal.textContent = `${msTotal.toFixed(1)} kg MS / v`;
    if (resUflVal) resUflVal.textContent = `${uflTotal.toFixed(1)} UFL`;
    if (resPdiVal) resPdiVal.textContent = `${Math.round(pdiTotal)} g PDI`;
    if (resCostCow) resCostCow.textContent = `${formatMoney(costPerCow)} / v`;

    const statusBadge = document.getElementById('badge-ration-status');
    if (statusBadge) {
      if (msTotal >= 11.5 && uflTotal >= 9.5 && pdiTotal >= 850) {
        statusBadge.textContent = 'Parfaitement Équilibrée';
        statusBadge.className = 'badge-tag';
      } else {
        statusBadge.textContent = 'À Ajuster (Déficit)';
        statusBadge.className = 'badge-tag';
      }
    }

    const compBox = document.querySelector('.comp-numbers');
    if (compBox) {
      compBox.innerHTML = `
        <div><strong>${formatMoney(savingPerCow)}</strong><span>Économie / vache / jour</span></div>
        <div><strong>${formatMoney(herdDailySaving)}</strong><span>Économie troupeau / jour</span></div>
        <div><strong>${formatMoney(monthlySaving)}</strong><span>Économie mensuelle nette</span></div>
      `;
    }

    // Traite cost per liter update
    if (valCostLitre) {
      const avgProduction = 10.0;
      const costPerLitre = Math.round(costPerCow / avgProduction);
      valCostLitre.textContent = isDatabaseAtZero() ? '0 FCFA/L' : `${costPerLitre} FCFA/L`;
    }
  }

  // =========================================================================
  // 6.11 SIMULATEUR D'INVESTISSEMENT
  // =========================================================================
  const SCENARIOS = {
    solar: {
      capex: 8500000,
      gainMonth: 750000,
      maintYear: 400000,
      co2: 28,
      advice: "Ce projet élimine 85% de la dépendance au diesel du groupe électrogène pour le tank à lait (Guilmey) et pour les moteurs des broyeurs (Farcha). Amortissement très rapide sous le climat sahélien."
    },
    granulateur: {
      capex: 14500000,
      gainMonth: 1650000,
      maintYear: 900000,
      co2: 45,
      advice: "Doublement de la capacité de traitement des casiers à Farcha (passage à 25 T/mois de granulés PEHD/PP). Répond à la forte demande des transformateurs de bassines et tuyaux locaux."
    },
    cheptel: {
      capex: 12000000,
      gainMonth: 1200000,
      maintYear: 750000,
      co2: 12,
      advice: "Achat de 15 génisses métisses gestantes + plantation de 2 ha de Maralfalfa supplémentaire sous goutte-à-goutte. Permet de doubler la production laitière quotidienne sans hausse de coût au litre."
    },
    dreches_dryer: {
      capex: 6500000,
      gainMonth: 620000,
      maintYear: 300000,
      co2: 18,
      advice: "Installation d'un tunnel de séchage solaire ventilé pour drêches. Permet de passer de 48h de conservation à 12 mois de stockage sec, et de vendre le sac de drêche séchée toute l'année avec 60% de marge."
    },
    verre_fin: {
      capex: 7500000,
      gainMonth: 700000,
      maintYear: 350000,
      co2: 22,
      advice: "Acquisition d'un crible vibrant et ligne de dépoussiérage pour calcin 0-1 mm haute pureté. Vente premium aux entreprises de BTP (bétons fibrés décoratifs) à 95 000 FCFA/T au lieu de 70 000 FCFA/T."
    }
  };

  function initSimulator() {
    scenarioBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        scenarioBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const scKey = btn.getAttribute('data-scenario');
        const sc = SCENARIOS[scKey];
        if (sc) {
          if (simCapex) simCapex.value = sc.capex;
          if (simGainMonth) simGainMonth.value = sc.gainMonth;
          if (simMaintYear) simMaintYear.value = sc.maintYear;
          runSimulation(sc.co2, sc.advice);
        }
      });
    });

    if (btnRunSimulation) {
      btnRunSimulation.addEventListener('click', () => {
        runSimulation(30, 'Simulation personnalisée selon les hypothèses de CAPEX, gain mensuel et entretien spécifiés.');
      });
    }

    // Run first default scenario
    const firstSc = SCENARIOS.solar;
    if (firstSc) runSimulation(firstSc.co2, firstSc.advice);
  }

  function runSimulation(customCo2, customAdvice) {
    const capex = parseFloat(simCapex ? simCapex.value : 8500000) || 1;
    const gainMonth = parseFloat(simGainMonth ? simGainMonth.value : 750000) || 0;
    const maintYear = parseFloat(simMaintYear ? simMaintYear.value : 400000) || 0;

    const netAnnualGain = (gainMonth * 12) - maintYear;
    const paybackMonths = netAnnualGain > 0 ? (capex / (netAnnualGain / 12)).toFixed(1) : 'Indéfini';
    const tri = netAnnualGain > 0 ? ((netAnnualGain / capex) * 100).toFixed(1) + '%' : 'N/A';

    if (simResPayback) simResPayback.textContent = `${paybackMonths} Mois`;
    if (simResGainYear) simResGainYear.textContent = formatMoney(netAnnualGain);
    if (simResTri) simResTri.textContent = tri;
    if (simResCo2 && customCo2) simResCo2.textContent = `- ${customCo2} T CO2/an`;
    if (simAdviceText && customAdvice) simAdviceText.textContent = customAdvice;
  }

  // =========================================================================
  // 6.12 DIRECTEUR DES OPÉRATIONS IA (EXPERT ENGINE)
  // =========================================================================
  function initAiDirector() {
    // 1. Framing Form submit
    if (formFramingData) {
      formFramingData.addEventListener('submit', (e) => {
        e.preventDefault();
        db.settings.fermeName = document.getElementById('cfg-ferme-name').value || 'Ferme de Sara';
        db.settings.fermeLocation = document.getElementById('cfg-ferme-loc').value || 'Guilmey';
        db.settings.targetProductionLiters = parseFloat(document.getElementById('cfg-ferme-liters').value) || 180;
        db.settings.milkPricePerLiter = parseFloat(document.getElementById('cfg-milk-price').value) || 600;

        db.settings.dechetsName = document.getElementById('cfg-dechets-name').value || 'SORATRAD';
        db.settings.dechetsLocation = document.getElementById('cfg-dechets-loc').value || 'Farcha';
        db.settings.pricePlasticPerTon = parseFloat(document.getElementById('cfg-price-plastic').value) || 480000;
        db.settings.priceGlassPerTon = parseFloat(document.getElementById('cfg-price-glass').value) || 70000;

        db.settings.shuttleDistanceKm = parseFloat(document.getElementById('cfg-shuttle-distance').value) || 18;
        db.settings.shuttleFuelCost = parseFloat(document.getElementById('cfg-shuttle-fuel').value) || 18500;

        saveDatabase();
        renderAllViews();

        executeAiAction('kpi_board', 'Mise à jour des paramètres de cadrage');
        alert('Paramètres d\'exploitation enregistrés avec succès. Le système et l\'assistant IA sont calibrés.');
      });
    }

    // 2. Action Pills
    aiActionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        aiActionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const action = btn.getAttribute('data-action');
        executeAiAction(action);
      });
    });

    // 3. Free prompt box
    if (btnAiAsk) {
      btnAiAsk.addEventListener('click', () => {
        const query = (inputAiPrompt.value || '').trim();
        if (query) {
          executeAiCustomQuery(query);
        }
      });
    }

    if (inputAiPrompt) {
      inputAiPrompt.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = (inputAiPrompt.value || '').trim();
          if (query) executeAiCustomQuery(query);
        }
      });
    }

    // Initial render of AI Executive Briefing
    executeAiAction('kpi_board');
  }

  function executeAiAction(actionType, extraContext = '') {
    if (aiReportTimestamp) {
      aiReportTimestamp.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    const fn = AI_EXECUTIVE_ACTIONS[actionType] || AI_EXECUTIVE_ACTIONS['kpi_board'];
    const htmlReport = fn(db);
    if (aiResponseContainer) {
      aiResponseContainer.innerHTML = htmlReport;
      aiResponseContainer.scrollTop = 0;
    }
  }

  function executeAiCustomQuery(query) {
    if (aiReportTimestamp) {
      aiReportTimestamp.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    // Lowercase match keywords
    const q = query.toLowerCase();
    let report = '';

    if (q.includes('rentabil') || q.includes('broyage') || q.includes('granul')) {
      report = AI_EXECUTIVE_ACTIONS['rentabilite'](db, query);
    } else if (q.includes('collect') || q.includes('tourn') || q.includes('logist') || q.includes('navette')) {
      report = AI_EXECUTIVE_ACTIONS['logistics'](db, query);
    } else if (q.includes('commercial') || q.includes('client') || q.includes('vente') || q.includes('prix')) {
      report = AI_EXECUTIVE_ACTIONS['commercial'](db, query);
    } else if (q.includes('drêche') || q.includes('dreche') || q.includes('aliment') || q.includes('ration') || q.includes('vache')) {
      report = AI_EXECUTIVE_ACTIONS['dreches'](db, query);
    } else if (q.includes('risque') || q.includes('qhse') || q.includes('sécurit') || q.includes('hygièn')) {
      report = AI_EXECUTIVE_ACTIONS['risques'](db, query);
    } else if (q.includes('budget') || q.includes('trésorer') || q.includes('prévision') || q.includes('p&l')) {
      report = AI_EXECUTIVE_ACTIONS['budget'](db, query);
    } else {
      report = generateGeneralAiResponse(query, db);
    }

    if (aiResponseContainer) {
      aiResponseContainer.innerHTML = report;
      aiResponseContainer.scrollTop = 0;
    }
  }

  // Pre-configured Strategic Analyses conforming to prompt requirements
  const AI_EXECUTIVE_ACTIONS = {
    kpi_board: (database) => {
      const isZero = isDatabaseAtZero();
      const cowsCount = database.cows.length;
      const milkLiters = database.traiteHistory[0]?.totalL || 0;
      const culletT = database.glassBatches.reduce((a, b) => a + (parseFloat(b.culletProducedT) || 0), 0);
      const plasticT = database.plasticBatches.reduce((a, b) => a + (parseFloat(b.extrudedKg) || 0), 0) / 1000;
      const drecheT = database.drecheBatches.reduce((a, b) => a + (parseFloat(b.tonsReceived) || 0), 0);

      return `
        <h3>1. Reformulation & Objectif de Pilotage</h3>
        <p>Établissement du tableau de bord exécutif mensuel intégrant les opérations laitières de la <strong>${database.settings.fermeName} (${database.settings.fermeLocation})</strong> et la filière de recyclage <strong>${database.settings.dechetsName} (${database.settings.dechetsLocation})</strong>.</p>

        <div class="ai-callout">
          <strong>État des données d'exploitation :</strong> ${isZero ? 'Les compteurs sont actuellement à zéro (mode démarrage vierge). Les projections ci-dessous illustrent les cibles nominales calibrées sur vos objectifs opérationnels.' : `Base de données active avec ${cowsCount} vaches, pesée de traite du jour (${milkLiters} L) et flux de coproduits en cours.`}
        </div>

        <h3>2. Synthèse des Données Actuelles & Manquantes</h3>
        <ul>
          <li><strong>Ferme laitière :</strong> ${cowsCount > 0 ? `${cowsCount} têtes répertoriées, traite actuelle ${milkLiters} L/j` : 'Compteur à zéro. Objectif cible : 180 L/j avec 18 vaches en lactation'}. <em>Donnée à affiner : taux butyreux et protéique réels lors des analyses de laboratoire.</em></li>
          <li><strong>Filière Verre :</strong> ${culletT > 0 ? `${formatNumber(culletT, 1)} T de calcin produit` : '0 T enregistrée. Débouché cible : Pavés drainants BTP à 70 000 FCFA/T'}.</li>
          <li><strong>Filière Plastique :</strong> ${plasticT > 0 ? `${formatNumber(plasticT, 1)} T de granulés PEHD/PP` : '0 T enregistrée. Prix marché plasturgiste : 480 000 FCFA/T'}.</li>
          <li><strong>Drêches de brasserie :</strong> ${drecheT > 0 ? `${formatNumber(drecheT, 1)} T réceptionnées` : '0 T enregistrée. Priorité : 10-12 kg/VL/j à Guilmey + revente ensilée'}.</li>
        </ul>

        <h3>3. Scénarios Opérationnels & Financiers Comparatifs</h3>
        <table>
          <thead>
            <tr>
              <th>Indicateur Clé</th>
              <th>Scénario 1 : Base Actuelle</th>
              <th>Scénario 2 : Synergie Optimisée</th>
              <th>Scénario 3 : Industrialisation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Production Laitière</td>
              <td>180 L / jour</td>
              <td>220 L / jour (+22%)</td>
              <td>350 L / jour (+94%)</td>
            </tr>
            <tr>
              <td>Granulés Plastique</td>
              <td>12 T / mois</td>
              <td>16 T / mois</td>
              <td>25 T / mois (2e ligne)</td>
            </tr>
            <tr>
              <td>Calcin Verre BTP</td>
              <td>20 T / mois</td>
              <td>30 T / mois</td>
              <td>45 T / mois</td>
            </tr>
            <tr>
              <td>Chiffre d'Affaires Consolidé</td>
              <td>11 850 000 FCFA</td>
              <td>15 420 000 FCFA</td>
              <td>24 600 000 FCFA</td>
            </tr>
            <tr>
              <td>Marge Brute Globale</td>
              <td>44.5%</td>
              <td>52.3%</td>
              <td>58.0%</td>
            </tr>
          </tbody>
        </table>

        <h3>4. Plan d'Action Recommandé & Priorisé</h3>
        <ol>
          <li><strong>J+7 (Immédiat) :</strong> Formaliser le contrat d'enlèvement quotidien à la brasserie sous 3h max pour garantir des drêches fraîches non fermentées.</li>
          <li><strong>J+30 (Court terme) :</strong> Établir la navette unique à double sens : départ Farcha 07h00 avec 2,2 T de drêches, retour 12h00 avec les bidons de lait et 1 T de fumier pour compost.</li>
          <li><strong>J+90 (Moyen terme) :</strong> Mettre en place la cellule de contrôle qualité calcin (granulométrie 0-2 mm certifiée sans capsules) pour contractualiser avec deux majors du BTP.</li>
        </ol>

        <h3>5. Risques Opérationnels & Mesures Correctives</h3>
        <ul>
          <li><strong>Risque d'acidification du lait :</strong> Consigne tank &le; 4°C impérative sous 2h post-traite. Secours groupe électrogène testé chaque matin.</li>
          <li><strong>Risque de mycotoxines sur les drêches :</strong> Aucune distribution au troupeau au-delà de 48h à température ambiante. Ensilage systématique des excédents.</li>
        </ul>
      `;
    },

    logistics: (database) => {
      const dist = database.settings.shuttleDistanceKm || 18;
      const fuel = database.settings.shuttleFuelCost || 18500;

      return `
        <h3>1. Reformulation de la Mission Logistique</h3>
        <p>Optimisation du plan de collecte et de transport circulaire entre le gisement de déchets à <strong>${database.settings.dechetsLocation}</strong> et l'exploitation laitière de <strong>${database.settings.fermeLocation}</strong> (Distance : <strong>${dist} km</strong>).</p>

        <h3>2. Diagnostic des Flux Matières Aller & Retour</h3>
        <div class="ai-callout">
          <strong>Principe cardinal :</strong> Zéro kilomètre à vide. Chaque trajet aller finance le transport retour des produits à haute valeur ajoutée.
        </div>
        <ul>
          <li><strong>Trajet Aller (Farcha &rarr; Guilmey, 07h00) :</strong> Chargement de 2,2 à 2,5 T de drêches tièdes sorties de brasserie + sacs de sel minéral et pièces de rechange.</li>
          <li><strong>Trajet Retour (Guilmey &rarr; Farcha, 12h00) :</strong> 180 à 250 L de lait frais sous bidons isothermes vers les points de vente urbains + 1,2 T de fumier bovin pour la plateforme de compostage.</li>
        </ul>

        <h3>3. Scénarios Logistiques & Chiffrage du Carburant</h3>
        <table>
          <thead>
            <tr>
              <th>Paramètre</th>
              <th>Option A : Tournées Séparées</th>
              <th>Option B : Navette Mutualisée (Recommandée)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Nombre de véhicules mobilisés</td>
              <td>2 (1 camionnette lait + 1 camionnette drêche)</td>
              <td>1 véhicule unique dédié 3.5T</td>
            </tr>
            <tr>
              <td>Consommation carburant journalière</td>
              <td>37 000 FCFA</td>
              <td>18 500 FCFA (-50%)</td>
            </tr>
            <tr>
              <td>Économie de carburant mensuelle</td>
              <td>0 FCFA</td>
              <td><strong>555 000 FCFA / mois</strong></td>
            </tr>
            <tr>
              <td>Empreinte carbone évitée</td>
              <td>0</td>
              <td><strong>- 1.4 Tonnes CO2 / mois</strong></td>
            </tr>
          </tbody>
        </table>

        <h3>4. Plan d'Action Logistique</h3>
        <ol>
          <li>Planifier le passage du chauffeur à la brasserie dès 06h30 à la fin de la filtration du brassin.</li>
          <li>Équiper la benne d'une bâche étanche thermique pour protéger les drêches du vent sahélien et de la poussière.</li>
          <li>Calibrer la livraison de lait urbain entre 12h30 et 14h00 auprès des boutiques partenaires et restaurants.</li>
        </ol>

        <h3>5. Risques Logistiques Identifiés</h3>
        <ul>
          <li><strong>Panne mécanique en cours de trajet :</strong> Contrat de dépannage rapide avec un garage situé sur l'axe Farcha-Guilmey ; stock tampon de drêches ensilées à la ferme de 4 jours d'autonomie.</li>
        </ul>
      `;
    },

    rentabilite: (database) => {
      const pricePlastic = database.settings.pricePlasticPerTon || 480000;
      const priceGlass = database.settings.priceGlassPerTon || 70000;

      return `
        <h3>1. Reformulation de l'Analyse Technico-Économique</h3>
        <p>Calcul détaillé de la rentabilité unitaire, des coûts de revient et des marges nettes sur les lignes de <strong>broyage/concassage du verre</strong> et de <strong>granulation du plastique</strong> à ${database.settings.dechetsLocation}.</p>

        <h3>2. Analyse des Coûts de Revient par Tonne</h3>
        <table>
          <thead>
            <tr>
              <th>Poste de Dépense</th>
              <th>Calcin Verre BTP (par Tonne)</th>
              <th>Granulés PEHD/PP (par Tonne)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Achat matière première (Collecteurs)</td>
              <td>18 000 FCFA</td>
              <td>160 000 FCFA</td>
            </tr>
            <tr>
              <td>Lavage, tri manuel & retrait étiquettes</td>
              <td>4 500 FCFA</td>
              <td>35 000 FCFA</td>
            </tr>
            <tr>
              <td>Électricité / Diesel broyeur & extrudeuse</td>
              <td>4 000 FCFA</td>
              <td>55 000 FCFA</td>
            </tr>
            <tr>
              <td>Main d'œuvre directe & pièces d'usure</td>
              <td>2 000 FCFA</td>
              <td>15 000 FCFA</td>
            </tr>
            <tr>
              <td><strong>Coût de Revient Total / Tonne</strong></td>
              <td><strong>28 500 FCFA / T</strong></td>
              <td><strong>265 000 FCFA / T</strong></td>
            </tr>
            <tr>
              <td><strong>Prix de Vente Moyen Réalisé</strong></td>
              <td><strong>70 000 FCFA / T</strong></td>
              <td><strong>480 000 FCFA / T</strong></td>
            </tr>
            <tr>
              <td><strong>Marge Nette Opérationnelle</strong></td>
              <td><strong class="highlight-green">+ 41 500 FCFA / T (59.3%)</strong></td>
              <td><strong class="highlight-green">+ 215 000 FCFA / T (44.8%)</strong></td>
            </tr>
          </tbody>
        </table>

        <h3>3. Seuil de Rentabilité (Point Mort)</h3>
        <ul>
          <li><strong>Ligne Plastique :</strong> Frais fixes mensuels de l'atelier plastique ~ 1 800 000 FCFA. <strong>Seuil de rentabilité : 8.4 Tonnes de granulés/mois</strong> (actuellement dépassé avec 12.8 T/mois).</li>
          <li><strong>Ligne Verre :</strong> Frais fixes atelier verre ~ 650 000 FCFA. <strong>Seuil de rentabilité : 15.6 Tonnes de calcin/mois</strong>.</li>
        </ul>

        <h3>4. Recommandations d'Optimisation des Marges</h3>
        <ol>
          <li>Séparer strictement les casiers PEHD (souples, MFI bas) des casiers PP (rigides) pour vendre les granulés PEHD purs à <strong>520 000 FCFA/T</strong> (+40 000 FCFA de prime de pureté).</li>
          <li>Installer un séparateur magnétique au-dessus du tapis de concassage du verre pour récupérer 100% des capsules métalliques et les revendre aux fonderies locales.</li>
        </ol>
      `;
    },

    commercial: (database) => {
      return `
        <h3>1. Objectif du Plan de Développement Commercial</h3>
        <p>Structuration des canaux de vente et fidélisation des acheteurs industriels pour le calcin de verre (BTP) et les granulés plastiques régénérés (plasturgistes).</p>

        <h3>2. Segmentation des Clients & Argumentaires de Vente</h3>
        <ul>
          <li><strong>Segment BTP (Calcin de Verre 0-2 mm) :</strong>
            <br>&bull; <em>Cibles :</em> Fabricants de pavés autobloquants, entreprises de dallage et bétons architecturaux.
            <br>&bull; <em>Argumentaire :</em> Le calcin concassé remplace le sable de rivière importé, améliore la résistance à la compression de 14% et réduit le ressuage d'eau. Prix inférieur de 25% au sable alluvionnaire lavé.
          </li>
          <li><strong>Segment Plasturgie (Granulés PEHD / PP) :</strong>
            <br>&bull; <em>Cibles :</em> Usines d'injection de bassines, seaux, caisses maraîchères et fabricants de tuyaux d'irrigation.
            <br>&bull; <em>Argumentaire :</em> Granulométrie régulière, dégazage à double filtration, indice de fluidité (MFI) certifié 0.8-1.2. Économie de 35% par rapport à la résine vierge d'importation soumise aux droits de douane.
          </li>
        </ul>

        <h3>3. Scénarios Tarifaires & Stratégie Contractuelle</h3>
        <div class="ai-callout">
          <strong>Recommandation :</strong> Proposer des contrats-cadres d'enlèvement mensuel garantis avec escompte de 4% contre paiement comptant sous 10 jours, pour sécuriser le BFR (Besoin en Fonds de Roulement).
        </div>

        <h3>4. Feuille de Route Commerciale sur 90 Jours</h3>
        <ol>
          <li>Distribuer des échantillons de 25 kg de granulés et de sable calcin aux 5 principaux transformateurs de la zone industrielle.</li>
          <li>Obtenir une attestation de résistance mécanique délivrée par le laboratoire national du BTP pour certifier les pavés au calcin.</li>
          <li>Signer 3 contrats annuels exclusifs pour écouler 80% de la production à prix bloqué.</li>
        </ol>
      `;
    },

    dreches: (database) => {
      const milkPrice = database.settings.milkPricePerLiter || 600;

      return `
        <h3>1. Diagnostic Nutritionnel & Économique des Drêches de Brasserie</h3>
        <p>Analyse de la rentabilité de l'incorporation de drêches fraîches de brasserie dans la ration des 30 vaches de la <strong>${database.settings.fermeName}</strong>.</p>

        <h3>2. Valeur Alimentaire & Remplacement du Concentré</h3>
        <p>Les drêches fraîches contiennent ~22% de matière sèche (MS), avec un profil protéique exceptionnel (26-28% de MAT sur MS) très riche en protéines by-pass (non dégradées dans le rumen), idéal pour la synthèse du lait.</p>
        <table>
          <thead>
            <tr>
              <th>Régime Alimentaire</th>
              <th>Coût Journalier / Vache</th>
              <th>Coût Alimentaire / Litre</th>
              <th>Marge sur Coût Alimentaire</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>100% Concentré Industriel Acheté</td>
              <td>2 800 FCFA / jour</td>
              <td>280 FCFA / Litre</td>
              <td>320 FCFA / L (53%)</td>
            </tr>
            <tr>
              <td><strong>Ration Synergie (Drêche + Maralfalfa)</strong></td>
              <td><strong>1 750 FCFA / jour</strong></td>
              <td><strong>175 FCFA / Litre</strong></td>
              <td><strong class="highlight-green">425 FCFA / L (71%)</strong></td>
            </tr>
            <tr>
              <td><strong>Économie Nette Réalisée</strong></td>
              <td><strong>1 050 FCFA / v / j</strong></td>
              <td><strong>- 105 FCFA / L</strong></td>
              <td><strong>+ 567 000 FCFA / mois troupeau</strong></td>
            </tr>
          </tbody>
        </table>

        <h3>3. Précautions Zootechniques & Sanitaires Impératives</h3>
        <ul>
          <li><strong>Plafond d'incorporation :</strong> Ne pas dépasser 12 à 14 kg brut de drêche fraîche par vache en lactation par jour pour éviter l'acidose ruminale subaiguë.</li>
          <li><strong>Apport de fibres longues :</strong> Toujours distribuer le Maralfalfa vert ou du foin sec <em>avant</em> les drêches pour stimuler la rumination et la salivation tampon.</li>
          <li><strong>Complémentation minérale :</strong> Les drêches sont riches en phosphore mais pauvres en calcium. Le complexe CMV doit impérativement avoir un ratio Ca/P d'au moins 3/1.</li>
        </ul>
      `;
    },

    risques: (database) => {
      return `
        <h3>1. Matrice des Risques Opérationnels, Sanitaires & Réglementaires</h3>
        <p>Audit complet des vulnérabilités critiques de la ferme laitière et des ateliers de traitement des déchets, avec plan d'atténuation immédiat.</p>

        <table>
          <thead>
            <tr>
              <th>Domaine</th>
              <th>Risque Identifié</th>
              <th>Gravité / Probabilité</th>
              <th>Mesure Préventive & Corrective</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Qualité Laitière</strong></td>
              <td>Présence de résidus d'antibiotiques ou contamination bactérienne du tank</td>
              <td>CRITIQUE / Faible</td>
              <td>Marquage physique des vaches sous traitement; test acidité et résidus systématique avant versement; protocole CIP (nettoyage en place) acide/base après chaque traite.</td>
            </tr>
            <tr>
              <td><strong>Sécurité Usine</strong></td>
              <td>Inhalation de poussières de silice lors du concassage du verre</td>
              <td>ÉLEVÉE / Moyenne</td>
              <td>Brumisation d'eau sur le convoyeur d'entrée du broyeur; port obligatoire de masques FFP3; aspiration d'air d'atelier.</td>
            </tr>
            <tr>
              <td><strong>Sécurité Machines</strong></td>
              <td>Coupure grave par éclats de verre ou happement par le granulateur</td>
              <td>CRITIQUE / Moyenne</td>
              <td>Gants anticoupure niveau 5 obligatoires; grilles de sécurité asservies aux contacteurs d'arrêt d'urgence; formation opérateur certifiée.</td>
            </tr>
            <tr>
              <td><strong>Sanitaire Bovin</strong></td>
              <td>Intoxication par mycotoxines issues de drêches avariées</td>
              <td>ÉLEVÉE / Moyenne</td>
              <td>Suppression de tout lot de drêches présentant une odeur d'acétate ou des moisissures blanches/vertes; ensilage sous vide anaérobie avec 1% de sel.</td>
            </tr>
            <tr>
              <td><strong>Réglementation ICPE</strong></td>
              <td>Pollution des sols par eaux de lavage des casiers ou lixiviats</td>
              <td>MOYENNE / Faible</td>
              <td>Bassin de décantation et filtre à graisse pour les eaux de lavage des casiers avant rejet; dalle béton étanche sur l'aire de stockage.</td>
            </tr>
          </tbody>
        </table>

        <h3>2. Plan d'Action QHSE Hebdomadaire</h3>
        <ol>
          <li>Test d'arrêt d'urgence coup de poing sur les broyeurs chaque lundi à 07h30.</li>
          <li>Contrôle de l'étalonnage du thermomètre du tank à lait chaque mercredi.</li>
          <li>Inspection des extincteurs et dégagement des voies d'évacuation chaque vendredi.</li>
        </ol>
      `;
    },

    budget: (database) => {
      return `
        <h3>1. Cadrage du Budget Prévisionnel sur 12 Mois</h3>
        <p>Projection financière consolidée annuelle pour la <strong>${database.settings.fermeName}</strong> et <strong>${database.settings.dechetsName}</strong> (en FCFA).</p>

        <table>
          <thead>
            <tr>
              <th>Rubrique Financière</th>
              <th>Budget Ferme Laitière</th>
              <th>Budget SORATRAD Déchets</th>
              <th>Consolidé Annuel</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Chiffre d'Affaires Prévisionnel</strong></td>
              <td><strong>38 880 000 FCFA</strong></td>
              <td><strong>103 320 000 FCFA</strong></td>
              <td><strong>142 200 000 FCFA</strong></td>
            </tr>
            <tr>
              <td>&bull; Ventes Lait (180 L/j x 365j x 600 FCFA)</td>
              <td>38 880 000 FCFA</td>
              <td>-</td>
              <td>38 880 000 FCFA</td>
            </tr>
            <tr>
              <td>&bull; Granulés Plastiques PEHD/PP</td>
              <td>-</td>
              <td>73 728 000 FCFA</td>
              <td>73 728 000 FCFA</td>
            </tr>
            <tr>
              <td>&bull; Calcin Verre BTP</td>
              <td>-</td>
              <td>20 160 000 FCFA</td>
              <td>20 160 000 FCFA</td>
            </tr>
            <tr>
              <td>&bull; Revente Drêches & Sous-produits</td>
              <td>-</td>
              <td>9 432 000 FCFA</td>
              <td>9 432 000 FCFA</td>
            </tr>
            <tr>
              <td><strong>Charges Variables d'Exploitation</strong></td>
              <td><strong>(11 340 000 FCFA)</strong></td>
              <td><strong>(46 640 000 FCFA)</strong></td>
              <td><strong>(57 980 000 FCFA)</strong></td>
            </tr>
            <tr>
              <td><strong>Marge Brute Opérationnelle</strong></td>
              <td><strong>27 540 000 FCFA</strong></td>
              <td><strong>56 680 000 FCFA</strong></td>
              <td><strong>84 220 000 FCFA (59.2%)</strong></td>
            </tr>
            <tr>
              <td><strong>Charges Fixes & Salaires</strong></td>
              <td><strong>(10 680 000 FCFA)</strong></td>
              <td><strong>(21 360 000 FCFA)</strong></td>
              <td><strong>(32 040 000 FCFA)</strong></td>
            </tr>
            <tr>
              <td><strong>EBITDA Prévisionnel (Résultat Net d'Exploitation)</strong></td>
              <td><strong>16 860 000 FCFA</strong></td>
              <td><strong>35 320 000 FCFA</strong></td>
              <td><strong class="highlight-green">52 180 000 FCFA (36.7%)</strong></td>
            </tr>
          </tbody>
        </table>

        <h3>2. Plan d'Investissement Prioritaire (CAPEX Autofinancé)</h3>
        <ul>
          <li><strong>Trimestre 1 :</strong> Centrale solaire hybride 15 kWc (8 500 000 FCFA) pour diviser par 4 la facture diesel.</li>
          <li><strong>Trimestre 2 :</strong> Aménagement de 2 hectares d'irrigation goutte-à-goutte pour le Maralfalfa (2 400 000 FCFA).</li>
          <li><strong>Trimestre 3 :</strong> Achat d'une cribleuse calibratrice pour le verre BTP (3 800 000 FCFA).</li>
        </ul>
      `;
    }
  };

  function generateGeneralAiResponse(query, database) {
    return `
      <h3>1. Analyse Opérationnelle : "${escapeHtml(query)}"</h3>
      <p>En tant que Directeur des Opérations et Contrôleur de Gestion du groupe, voici l'analyse stratégique et le plan de mise en œuvre adapté à votre demande.</p>

      <div class="ai-callout">
        <strong>Contexte d'exploitation :</strong> Pilotage coordonné de la ferme laitière (${database.settings.fermeName}) et de l'unité de valorisation (${database.settings.dechetsName}).
      </div>

      <h3>2. Diagnostic Technico-Économique</h3>
      <ul>
        <li>Toute décision impactant les flux de drêches doit préserver la priorité d'alimentation du troupeau laitier pour maintenir le coût du litre sous les 180 FCFA.</li>
        <li>Les gisements de verre et de plastique doivent faire l'objet d'un tri soigné à la source (bars, hôtels, décharges) pour limiter le taux de rebut à moins de 5%.</li>
      </ul>

      <h3>3. Plan d'Action Recommandé</h3>
      <ol>
        <li>Valider les fiches de suivi journalier (traite, pesées de collecte, heures machine broyeur).</li>
        <li>Calculer chaque vendredi le bilan de matière entrant/sortant pour vérifier l'absence de pertes au stockage.</li>
        <li>Maintenir le contact permanent entre le responsable de la ferme à Guilmey et le chef d'atelier à Farcha.</li>
      </ol>
    `;
  }

  // =========================================================================
  // 7. MODALS, DATA ENTRY, DELETION & RESET ENGINE
  // =========================================================================
  function openModal(defaultType = 'traite') {
    if (entryTypeSelect) entryTypeSelect.value = defaultType;
    renderDynamicFormFields(defaultType);
    if (modalEntry) modalEntry.classList.add('open');
  }

  function closeModal() {
    if (modalEntry) modalEntry.classList.remove('open');
  }

  function initModalListeners() {
    if (btnQuickEntry) {
      btnQuickEntry.addEventListener('click', () => {
        let defaultForm = 'traite';
        if (currentActiveEntity === 'soratrad') defaultForm = 'glass';
        else if (currentActiveEntity === 'consolidated') defaultForm = 'shuttle';
        openModal(defaultForm);
      });
    }
    if (btnNewTraite) btnNewTraite.addEventListener('click', () => openModal('traite'));
    if (btnNewShuttle) btnNewShuttle.addEventListener('click', () => openModal('shuttle'));
    if (btnAddCow) btnAddCow.addEventListener('click', () => openModal('cow'));
    if (btnAddGlassBatch) btnAddGlassBatch.addEventListener('click', () => openModal('glass'));
    if (btnAddPlasticBatch) btnAddPlasticBatch.addEventListener('click', () => openModal('plastic'));
    if (btnAddDrecheBatch) btnAddDrecheBatch.addEventListener('click', () => openModal('dreche'));
    if (btnAddAudit) btnAddAudit.addEventListener('click', () => openModal('qhse'));

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', closeModal);

    if (entryTypeSelect) {
      entryTypeSelect.addEventListener('change', (e) => {
        renderDynamicFormFields(e.target.value);
      });
    }

    if (btnCalcRation) {
      btnCalcRation.addEventListener('click', calculateAndRenderRation);
    }

    if (btnSaveRation) {
      btnSaveRation.addEventListener('click', () => {
        const maralfalfaKg = parseFloat(inputMaralfalfa ? inputMaralfalfa.value : 25) || 25;
        const drecheKg = parseFloat(inputDreche ? inputDreche.value : 12) || 12;
        const tourteauKg = parseFloat(inputTourteau ? inputTourteau.value : 1.5) || 1.5;
        const sonKg = parseFloat(inputSon ? inputSon.value : 2.0) || 2.0;
        const cmvG = parseFloat(inputCmv ? inputCmv.value : 150) || 150;
        const cowsFed = parseInt(inputCowsCount ? inputCowsCount.value : 18) || 18;

        db.settings.activeRation = { maralfalfaKg, drecheKg, tourteauKg, sonKg, cmvG, cowsFed };
        saveDatabase();
        renderAllViews();
        alert('Ration sauvegardée avec succès ! Les coûts alimentaires et les calculs du P&L ont été automatiquement actualisés.');
      });
    }

    if (btnRecalcPnl) {
      btnRecalcPnl.addEventListener('click', () => {
        renderPnL();
        alert('Soldes financiers et compte de résultat d\'exploitation actualisés.');
      });
    }

    // Reset to Zero Button
    if (btnResetZero) {
      btnResetZero.addEventListener('click', () => {
        if (confirm('Voulez-vous remettre tous les compteurs à 0 ? Toutes les données actuelles seront effacées pour démarrer une nouvelle exploitation réelle.')) {
          db = JSON.parse(JSON.stringify(DEFAULT_ZERO_DATABASE));
          saveDatabase();
          renderAllViews();
          alert('Compteurs remis à zéro avec succès. Le système est en mode initial vierge.');
        }
      });
    }

    // Reset to Demo Sample Button
    if (btnResetDemo) {
      btnResetDemo.addEventListener('click', () => {
        if (confirm('Voulez-vous charger le jeu de données d\'exemple complet (30 vaches, pesées, navettes, lots verre & plastique) ?')) {
          db = JSON.parse(JSON.stringify(SAMPLE_DEMO_DATABASE));
          saveDatabase();
          renderAllViews();
          alert('Données exemples de démonstration chargées avec succès.');
        }
      });
    }

    // Export / Import
    if (btnExportData) {
      btnExportData.addEventListener('click', () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
        const a = document.createElement('a');
        a.setAttribute('href', dataStr);
        a.setAttribute('download', `agro_circular_os_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
    }

    if (btnImportData && fileImportInput) {
      btnImportData.addEventListener('click', () => fileImportInput.click());

      fileImportInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            if (imported && imported.settings) {
              db = imported;
              saveDatabase();
              renderAllViews();
              alert('Fichier de sauvegarde importé avec succès !');
            } else {
              alert('Format de sauvegarde invalide.');
            }
          } catch (err) {
            alert('Erreur lors de la lecture du fichier JSON.');
          }
        };
        reader.readAsText(file);
      });
    }
  }

  function renderDynamicFormFields(type) {
    if (!dynamicModalFields) return;
    const today = new Date().toISOString().split('T')[0];

    if (type === 'traite') {
      const activeCowsCount = db.cows ? db.cows.filter(c => c.status === 'Lactation').length || 18 : 18;
      dynamicModalFields.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label>Date de la Traite</label>
            <input type="date" id="field-date" class="form-control" value="${today}" required>
          </div>
          <div class="form-group">
            <label>Vaches en Lactation (VL)</label>
            <input type="number" id="field-cows" class="form-control" value="${activeCowsCount}" min="1" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Traite du Matin (Litres)</label>
            <input type="number" id="field-morning" class="form-control" value="108" min="0" step="0.5" required>
          </div>
          <div class="form-group">
            <label>Traite du Soir (Litres)</label>
            <input type="number" id="field-evening" class="form-control" value="72" min="0" step="0.5" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Prix de Vente au Litre (FCFA)</label>
            <input type="number" id="field-price" class="form-control" value="${db.settings.milkPricePerLiter || 600}" required>
          </div>
          <div class="form-group">
            <label>Litres Transformés (Caillé / Fromage)</label>
            <input type="number" id="field-transformed" class="form-control" value="40" min="0">
          </div>
        </div>
        <div class="form-group">
          <label>Contrôle Sanitaire / Température Tank</label>
          <input type="text" id="field-quality" class="form-control" value="Conforme (16°D, Tank 3.8°C, 0 mammite)">
        </div>
      `;
    } else if (type === 'shuttle') {
      dynamicModalFields.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label>Date de la Navette</label>
            <input type="date" id="field-date" class="form-control" value="${today}" required>
          </div>
          <div class="form-group">
            <label>Véhicule & Chauffeur</label>
            <input type="text" id="field-vehicle" class="form-control" value="Camionnette Benne 3.5T (Mahamat)" required>
          </div>
        </div>
        <div class="form-group">
          <label>Aller (Farcha &rarr; Guilmey)</label>
          <input type="text" id="field-outbound" class="form-control" value="2.4 T Drêches fraîches + Minéraux" required>
        </div>
        <div class="form-group">
          <label>Retour (Guilmey &rarr; Farcha)</label>
          <input type="text" id="field-inbound" class="form-control" value="180 L Lait urbain + 1.2 T Fumier pour compost" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Coût Carburant Trajet A/R (FCFA)</label>
            <input type="number" id="field-fuel" class="form-control" value="${db.settings.shuttleFuelCost || 18500}" required>
          </div>
          <div class="form-group">
            <label>Économie Nette Estimée (FCFA)</label>
            <input type="number" id="field-savings" class="form-control" value="63000" required>
          </div>
        </div>
      `;
    } else if (type === 'glass') {
      const nextId = `VER-26-${String((db.glassBatches ? db.glassBatches.length : 0) + 1).padStart(3, '0')}`;
      dynamicModalFields.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label>Numéro de Lot</label>
            <input type="text" id="field-lot" class="form-control" value="${nextId}" required>
          </div>
          <div class="form-group">
            <label>Tonnage Brut Collecté (T)</label>
            <input type="number" step="0.1" id="field-raw-tons" class="form-control" value="6.5" required>
          </div>
        </div>
        <div class="form-group">
          <label>Origine Collecte</label>
          <input type="text" id="field-origin" class="form-control" value="Bars et maquis Farcha" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Calcin BTP Produit (Tonnes)</label>
            <input type="number" step="0.1" id="field-cullet" class="form-control" value="6.2" required>
          </div>
          <div class="form-group">
            <label>Montant Facturé Client (FCFA)</label>
            <input type="number" id="field-revenue" class="form-control" value="434000" required>
          </div>
        </div>
        <div class="form-group">
          <label>Client / Débouché</label>
          <input type="text" id="field-buyer" class="form-control" value="Entreprise BTP (Pavés drainants)" required>
        </div>
      `;
    } else if (type === 'plastic') {
      const nextId = `PLA-26-${String((db.plasticBatches ? db.plasticBatches.length : 0) + 1).padStart(3, '0')}`;
      dynamicModalFields.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label>Numéro de Lot</label>
            <input type="text" id="field-lot" class="form-control" value="${nextId}" required>
          </div>
          <div class="form-group">
            <label>Type de Polymère</label>
            <select id="field-polymer" class="form-control">
              <option value="PEHD (Casiers bières)">PEHD (Casiers bières)</option>
              <option value="PP (Casiers sodas)">PP (Casiers sodas)</option>
              <option value="PEHD / PP Mixte">PEHD / PP Mixte</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Casiers Bruts Réceptionnés (Kg)</label>
            <input type="number" id="field-raw-kg" class="form-control" value="3500" required>
          </div>
          <div class="form-group">
            <label>Granulés Extrudés (Kg)</label>
            <input type="number" id="field-extruded-kg" class="form-control" value="3200" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Facturation Facturée (FCFA)</label>
            <input type="number" id="field-revenue" class="form-control" value="1536000" required>
          </div>
          <div class="form-group">
            <label>Qualité / MFI</label>
            <input type="text" id="field-quality" class="form-control" value="Granulés Recyclés MFI 1.0 Noir" required>
          </div>
        </div>
        <div class="form-group">
          <label>Acheteur Plasturgiste</label>
          <input type="text" id="field-buyer" class="form-control" value="Plasturgie Sahel (Bassines)" required>
        </div>
      `;
    } else if (type === 'dreche') {
      const nextId = `DRE-26-${String((db.drecheBatches ? db.drecheBatches.length : 0) + 1).padStart(3, '0')}`;
      dynamicModalFields.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label>Numéro de Lot</label>
            <input type="text" id="field-lot" class="form-control" value="${nextId}" required>
          </div>
          <div class="form-group">
            <label>Tonnage Frais Reçu (Tonnes)</label>
            <input type="number" step="0.1" id="field-tons" class="form-control" value="5.0" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Alloué Ferme de Sara (T)</label>
            <input type="number" step="0.1" id="field-ferme" class="form-control" value="2.5" required>
          </div>
          <div class="form-group">
            <label>Alloué Revente Éleveurs (T)</label>
            <input type="number" step="0.1" id="field-sale" class="form-control" value="1.8" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Alloué Ensilage / Réserve (T)</label>
            <input type="number" step="0.1" id="field-silage" class="form-control" value="0.7" required>
          </div>
          <div class="form-group">
            <label>Recette Revente (FCFA)</label>
            <input type="number" id="field-revenue" class="form-control" value="81000" required>
          </div>
        </div>
        <div class="form-group">
          <label>Brasserie d'Origine</label>
          <input type="text" id="field-brewery" class="form-control" value="Brasserie Industrielle Farcha" required>
        </div>
      `;
    } else if (type === 'cow') {
      const nextId = `SAR-${String((db.cows ? db.cows.length : 0) + 1).padStart(3, '0')}`;
      dynamicModalFields.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label>Boucle d'Identification / ID</label>
            <input type="text" id="field-cow-id" class="form-control" value="${nextId}" required>
          </div>
          <div class="form-group">
            <label>Nom de la Vache</label>
            <input type="text" id="field-cow-name" class="form-control" placeholder="ex: Princesse de Sara" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Race</label>
            <select id="field-cow-breed" class="form-control">
              <option value="Montbéliarde x Zébu">Montbéliarde x Zébu</option>
              <option value="Holstein x Zébu">Holstein x Zébu</option>
              <option value="Montbéliarde pure">Montbéliarde pure</option>
              <option value="Holstein pure">Holstein pure</option>
              <option value="Métisse Zébu Peul / Goudali">Métisse Zébu Peul / Goudali</option>
              <option value="Brune des Alpes x Zébu">Brune des Alpes x Zébu</option>
            </select>
          </div>
          <div class="form-group">
            <label>Stade Physiologique</label>
            <select id="field-cow-status" class="form-control">
              <option value="Lactation">En Lactation</option>
              <option value="Tarie">Tarie</option>
              <option value="Génisse">Génisse</option>
              <option value="Veaux">Veaux / Suites</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Production Laitière Estimée (L/jour)</label>
            <input type="number" step="0.5" id="field-cow-liters" class="form-control" value="11.0">
          </div>
          <div class="form-group">
            <label>Date Dernier Vêlage</label>
            <input type="date" id="field-cow-calving" class="form-control" value="${today}">
          </div>
        </div>
        <div class="form-group">
          <label>Statut Reproduction & Notes Sanitaires</label>
          <input type="text" id="field-cow-repro" class="form-control" value="Gestante confirmée / Test mammite négatif">
        </div>
      `;
    } else if (type === 'qhse') {
      const nextId = `AUD-${String((db.qhseAudits ? db.qhseAudits.length : 0) + 1).padStart(2, '0')}`;
      dynamicModalFields.innerHTML = `
        <div class="form-row">
          <div class="form-group">
            <label>Numéro d'Audit / Date</label>
            <input type="text" id="field-audit-id" class="form-control" value="${nextId}" required>
          </div>
          <div class="form-group">
            <label>Site & Atelier Inspecté</label>
            <select id="field-audit-site" class="form-control">
              <option value="${db.settings.fermeName} (${db.settings.fermeLocation})">${db.settings.fermeName} (${db.settings.fermeLocation})</option>
              <option value="${db.settings.dechetsName} (${db.settings.dechetsLocation})">${db.settings.dechetsName} (${db.settings.dechetsLocation})</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Type de Contrôle</label>
            <input type="text" id="field-audit-domain" class="form-control" value="Hygiène Laitière & Tank" required>
          </div>
          <div class="form-group">
            <label>Résultat de Conformité</label>
            <select id="field-audit-status" class="form-control">
              <option value="Conforme">Conforme</option>
              <option value="Vigilance">Vigilance</option>
              <option value="Non-conforme">Non-conforme</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Inspecteur / Responsable QHSE</label>
          <input type="text" id="field-audit-inspector" class="form-control" value="Dr. Vétérinaire / Responsable QHSE" required>
        </div>
        <div class="form-group">
          <label>Observations & Mesures Correctives</label>
          <textarea id="field-audit-notes" class="form-control" rows="2" required>Lavage du tank conforme. Température 3.8°C stable. Zéro trace d'antibiotique.</textarea>
        </div>
      `;
    }
  }

  // Handle Form Submission
  if (formQuickEntry) {
    formQuickEntry.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = entryTypeSelect.value;
      const today = new Date().toISOString().split('T')[0];

      if (type === 'traite') {
        const morning = parseFloat(document.getElementById('field-morning').value) || 0;
        const evening = parseFloat(document.getElementById('field-evening').value) || 0;
        const total = morning + evening;
        const cows = parseInt(document.getElementById('field-cows').value) || 18;
        const date = document.getElementById('field-date').value || today;
        const price = parseFloat(document.getElementById('field-price').value) || 600;
        const transformed = parseFloat(document.getElementById('field-transformed').value) || 0;
        const quality = document.getElementById('field-quality').value || 'Conforme';

        if (!db.traiteHistory) db.traiteHistory = [];
        db.traiteHistory.unshift({
          id: `TR-${Date.now().toString().slice(-4)}`,
          date: date,
          activeCows: cows,
          morningL: morning,
          eveningL: evening,
          totalL: total,
          pricePerL: price,
          totalDirectSales: Math.max(0, total - transformed) * price,
          transformedL: transformed,
          quality: quality
        });
      } else if (type === 'shuttle') {
        const date = document.getElementById('field-date').value || today;
        const vehicle = document.getElementById('field-vehicle').value;
        const outbound = document.getElementById('field-outbound').value;
        const inbound = document.getElementById('field-inbound').value;
        const fuel = parseFloat(document.getElementById('field-fuel').value) || 18500;
        const savings = parseFloat(document.getElementById('field-savings').value) || 63000;

        if (!db.shuttles) db.shuttles = [];
        db.shuttles.unshift({
          id: `NAV-${Date.now().toString().slice(-4)}`,
          date: date,
          vehicle: vehicle,
          outbound: outbound,
          inbound: inbound,
          fuelCost: fuel,
          savingsFcfa: savings,
          status: 'Terminé'
        });
      } else if (type === 'glass') {
        const lot = document.getElementById('field-lot').value;
        const raw = parseFloat(document.getElementById('field-raw-tons').value) || 0;
        const cullet = parseFloat(document.getElementById('field-cullet').value) || 0;
        const origin = document.getElementById('field-origin').value;
        const rev = parseFloat(document.getElementById('field-revenue').value) || 0;
        const buyer = document.getElementById('field-buyer').value;

        if (!db.glassBatches) db.glassBatches = [];
        db.glassBatches.unshift({
          id: lot,
          date: today,
          origin: origin,
          rawTons: raw,
          colors: '60% Vert, 25% Ambre, 15% Blanc',
          wastePct: raw > 0 ? `${(((raw - cullet) / raw) * 100).toFixed(1)}%` : '4.5%',
          culletProducedT: cullet,
          buyer: buyer,
          revenue: rev
        });
      } else if (type === 'plastic') {
        const lot = document.getElementById('field-lot').value;
        const polymer = document.getElementById('field-polymer').value;
        const rawKg = parseFloat(document.getElementById('field-raw-kg').value) || 0;
        const extrudedKg = parseFloat(document.getElementById('field-extruded-kg').value) || 0;
        const rev = parseFloat(document.getElementById('field-revenue').value) || 0;
        const quality = document.getElementById('field-quality').value;
        const buyer = document.getElementById('field-buyer').value;

        if (!db.plasticBatches) db.plasticBatches = [];
        db.plasticBatches.unshift({
          id: lot,
          date: today,
          polymer: polymer,
          rawKg: rawKg,
          process: 'Broyage couteaux + Granulation',
          extrudedKg: extrudedKg,
          quality: quality,
          buyer: buyer,
          revenue: rev
        });
      } else if (type === 'dreche') {
        const lot = document.getElementById('field-lot').value;
        const tons = parseFloat(document.getElementById('field-tons').value) || 0;
        const fermeT = parseFloat(document.getElementById('field-ferme').value) || 0;
        const saleT = parseFloat(document.getElementById('field-sale').value) || 0;
        const silageT = parseFloat(document.getElementById('field-silage').value) || 0;
        const rev = parseFloat(document.getElementById('field-revenue').value) || 0;
        const brewery = document.getElementById('field-brewery').value;

        if (!db.drecheBatches) db.drecheBatches = [];
        db.drecheBatches.unshift({
          id: lot,
          date: today,
          brewery: brewery,
          tonsReceived: tons,
          humidity: '77%',
          allocatedFermeT: fermeT,
          allocatedSaleT: saleT,
          allocatedSilageT: silageT,
          saleRev: rev
        });
      } else if (type === 'cow') {
        const cowId = document.getElementById('field-cow-id').value;
        const name = document.getElementById('field-cow-name').value;
        const breed = document.getElementById('field-cow-breed').value;
        const status = document.getElementById('field-cow-status').value;
        const liters = parseFloat(document.getElementById('field-cow-liters').value) || 0;
        const calving = document.getElementById('field-cow-calving').value;
        const repro = document.getElementById('field-cow-repro').value;

        if (!db.cows) db.cows = [];
        db.cows.push({
          id: cowId,
          name: name,
          breed: breed,
          status: status,
          dailyLiters: liters,
          calvingDate: calving,
          reproStatus: repro
        });
      } else if (type === 'qhse') {
        const auditId = document.getElementById('field-audit-id').value;
        const site = document.getElementById('field-audit-site').value;
        const domain = document.getElementById('field-audit-domain').value;
        const inspector = document.getElementById('field-audit-inspector').value;
        const status = document.getElementById('field-audit-status').value;
        const notes = document.getElementById('field-audit-notes').value;

        if (!db.qhseAudits) db.qhseAudits = [];
        db.qhseAudits.unshift({
          id: auditId,
          date: today,
          site: site,
          domain: domain,
          inspector: inspector,
          status: status,
          notes: notes
        });
      }

      saveDatabase();
      closeModal();
      renderAllViews();
      alert('Opération enregistrée avec succès dans le système.');
    });
  }

  // Helper for empty table rows
  function renderEmptyTable(tbody, colSpan, message) {
    const tr = document.createElement('tr');
    tr.className = 'table-empty-row';
    tr.innerHTML = `
      <td colspan="${colSpan}">
        <div class="empty-placeholder">
          <div class="empty-placeholder-icon">📋</div>
          <div class="empty-placeholder-text">${escapeHtml(message)}</div>
          <button class="btn btn-primary btn-sm" onclick="window.agroCircularOs.openQuickEntry()">+ Nouvelle Saisie</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // =========================================================================
  // 8. GLOBAL NAMESPACE EXPORT FOR ACTIONS
  // =========================================================================
  window.agroCircularOs = {
    deleteItem: function (collectionName, index) {
      if (!db[collectionName] || !db[collectionName][index]) return;
      if (confirm('Voulez-vous supprimer cet enregistrement ?')) {
        db[collectionName].splice(index, 1);
        saveDatabase();
        renderAllViews();
      }
    },

    deleteCow: function (cowId) {
      const idx = db.cows.findIndex(c => c.id === cowId);
      if (idx !== -1 && confirm(`Supprimer la vache ${db.cows[idx].name} (${cowId}) du cheptel ?`)) {
        db.cows.splice(idx, 1);
        saveDatabase();
        renderAllViews();
      }
    },

    showCowDetails: function (cowId) {
      const cow = db.cows.find(c => c.id === cowId);
      if (!cow) return;
      alert(`Fiche Zootechnique & Sanitaire :\n\n- Boucle ID : ${cow.id}\n- Nom : ${cow.name}\n- Race : ${cow.breed}\n- Stade : ${cow.status}\n- Production : ${cow.dailyLiters} L/jour\n- Dernier Vêlage : ${cow.calvingDate}\n- Statut Reproduction : ${cow.reproStatus}`);
    },

    openQuickEntry: function (type = 'traite') {
      openModal(type);
    }
  };

  // =========================================================================
  // 9. APP INITIALIZATION
  // =========================================================================
  function initApp() {
    initNavigation();
    initModalListeners();
    initQhseCheckboxListeners();
    initSimulator();
    initAiDirector();
    applyEntityFilter(currentActiveEntity, { notify: false, autoSwitchTab: false });

    // Display localized current date
    const dateBadge = document.getElementById('current-date-badge');
    if (dateBadge) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateBadge.textContent = new Date().toLocaleDateString('fr-FR', options);
    }
  }

  // Execute on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
