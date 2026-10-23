/**
 * AUTH.JS — AGRO-CIRCULAR OS v2.4
 * IAM: Identity & Access Management Engine (Client-Side, LocalStorage)
 * Architecture: RBAC + MFA (TOTP simulation) + Session tokens + Module DEFAULT DENY
 * Security: Password hashing, rate limiting, audit log
 *
 * RÔLES (niveaux d'accès croissants):
 *   operateur   → Saisie de données terrain uniquement
 *   superviseur → Lecture complète + validation des saisies
 *   admin       → Gestion complète sauf droits root
 *   root        → Tous les droits, gestion IAM, paramètres système
 *
 * ACCÈS MODULES: DEFAULT DENY
 *   Aucun module n'est visible sans autorisation explicite (user_module_access).
 *   root/admin : accès automatique à tout.
 *   superviseur/operateur : uniquement les modules accordés explicitement.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. CONSTANTS & PERMISSION MATRIX (RBAC)
  // =========================================================================

  const ROLES = {
    root:        { level: 4, label: 'ROOT',        color: '#f87171', bg: 'rgba(239,68,68,0.15)' },
    admin:       { level: 3, label: 'ADMIN',       color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
    superviseur: { level: 2, label: 'SUPERVISEUR', color: '#a78bfa', bg: 'rgba(139,92,246,0.15)' },
    operateur:   { level: 1, label: 'OPÉRATEUR',  color: '#60a5fa', bg: 'rgba(2,132,199,0.15)' }
  };

  const PERMISSIONS = {
    'traite.create':      ['operateur', 'superviseur', 'admin', 'root'],
    'cheptel.create':     ['superviseur', 'admin', 'root'],
    'cheptel.delete':     ['admin', 'root'],
    'glass.create':       ['operateur', 'superviseur', 'admin', 'root'],
    'plastic.create':     ['operateur', 'superviseur', 'admin', 'root'],
    'dreche.create':      ['operateur', 'superviseur', 'admin', 'root'],
    'shuttle.create':     ['operateur', 'superviseur', 'admin', 'root'],
    'qhse.create':        ['superviseur', 'admin', 'root'],
    'finance.view':       ['superviseur', 'admin', 'root'],
    'finance.export':     ['admin', 'root'],
    'users.view':         ['admin', 'root'],
    'users.create':       ['admin', 'root'],
    'users.edit':         ['admin', 'root'],
    'users.delete':       ['root'],
    'users.lock':         ['admin', 'root'],
    'roles.assign':       ['admin', 'root'],
    'roles.assign_root':  ['root'],
    'modules.grant':      ['admin', 'root'],
    'modules.revoke':     ['admin', 'root'],
    'settings.view':      ['admin', 'root'],
    'settings.edit':      ['root'],
    'logs.view':          ['admin', 'root'],
    'data.reset_zero':    ['admin', 'root'],
    'data.load_demo':     ['admin', 'root'],
    'infra.view':         ['admin', 'root'],
    'infra.edit':         ['root']
  };

  const MAX_LOGIN_ATTEMPTS  = 5;
  const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
  const SESSION_DURATION_MS = 8  * 60 * 60 * 1000;
  const MFA_CODE_VALIDITY_MS = 5 * 60 * 1000;

  const STORAGE_KEYS = {
    users:        'agrocircular_users',
    session:      'agrocircular_session',
    attempts:     'agrocircular_attempts',
    auditLog:     'agrocircular_audit_log',
    moduleAccess: 'agrocircular_module_access'  // user_id -> { modules: [...], grantedBy, grantedAt }
  };

  // =========================================================================
  // CATALOGUE DES MODULES APPLICATIFS (DEFAULT DENY)
  // =========================================================================

  const MODULE_CATALOG = [
    { id: 'tab-dashboard',  navId: 'nav-dashboard',  label: 'Tableau de Bord',            icon: '📊', section: 'PILOTAGE' },
    { id: 'tab-synergies',  navId: 'nav-synergies',  label: 'Boucle Circulaire & Flux',   icon: '🔄', section: 'PILOTAGE' },
    { id: 'tab-ai-expert',  navId: 'nav-ai-expert',  label: 'Directeur IA & Stratégie',   icon: '🤖', section: 'PILOTAGE' },
    { id: 'tab-lait',       navId: 'nav-lait',       label: 'Production & Traite',        icon: '🥛', section: 'FERME' },
    { id: 'tab-cheptel',    navId: 'nav-cheptel',    label: 'Cheptel & Vaches',           icon: '🐄', section: 'FERME' },
    { id: 'tab-nutrition',  navId: 'nav-nutrition',  label: 'Rationneur Drêche/Fourrage', icon: '🌾', section: 'FERME' },
    { id: 'tab-verre',      navId: 'nav-verre',      label: 'Bouteilles & Calcin (BTP)',  icon: '🍾', section: 'DÉCHETS' },
    { id: 'tab-plastique',  navId: 'nav-plastique',  label: 'Casiers & Granulés Plast.',  icon: '📦', section: 'DÉCHETS' },
    { id: 'tab-dreches',    navId: 'nav-dreches',    label: 'Drêches de Brasserie',       icon: '🍺', section: 'DÉCHETS' },
    { id: 'tab-finance',    navId: 'nav-finance',    label: 'P&L & Contrôle de Gestion',  icon: '💶', section: 'GESTION' },
    { id: 'tab-qhse',       navId: 'nav-qhse',       label: 'QHSE, Hygiène & Sécurité',   icon: '🛡️', section: 'GESTION' },
    { id: 'tab-simulateur', navId: 'nav-simulateur', label: "Simulateur d'Investissement",icon: '📈', section: 'GESTION' },
    { id: 'tab-infra',      navId: 'nav-infra',      label: 'Infrastructure & Déploiement', icon: '🖥️', section: 'SYSTÈME', adminOnly: true }
  ];

  // Matrice des modules autorisés par rôle par défaut (DEFAULT DENY)
  const DEFAULT_MODULES_BY_ROLE = {
    root:        ['tab-dashboard', 'tab-synergies', 'tab-ai-expert', 'tab-lait', 'tab-cheptel', 'tab-nutrition', 'tab-verre', 'tab-plastique', 'tab-dreches', 'tab-finance', 'tab-qhse', 'tab-simulateur', 'tab-infra'],
    admin:       ['tab-dashboard', 'tab-synergies', 'tab-ai-expert', 'tab-lait', 'tab-cheptel', 'tab-nutrition', 'tab-verre', 'tab-plastique', 'tab-dreches', 'tab-finance', 'tab-qhse', 'tab-simulateur', 'tab-infra'],
    superviseur: ['tab-dashboard', 'tab-synergies', 'tab-lait', 'tab-cheptel', 'tab-nutrition', 'tab-verre', 'tab-plastique', 'tab-dreches', 'tab-qhse'],
    operateur:   ['tab-dashboard'] // Refus par défaut de tous les autres modules tant que non attribués
  };

  // Périmètre initial distinct pour les utilisateurs de démonstration
  const DEFAULT_USER_MODULES = {
    'usr-001': ['tab-dashboard', 'tab-synergies', 'tab-ai-expert', 'tab-lait', 'tab-cheptel', 'tab-nutrition', 'tab-verre', 'tab-plastique', 'tab-dreches', 'tab-finance', 'tab-qhse', 'tab-simulateur', 'tab-infra'],
    'usr-002': ['tab-dashboard', 'tab-synergies', 'tab-ai-expert', 'tab-lait', 'tab-cheptel', 'tab-nutrition', 'tab-verre', 'tab-plastique', 'tab-dreches', 'tab-finance', 'tab-qhse', 'tab-simulateur', 'tab-infra'],
    'usr-003': ['tab-dashboard', 'tab-synergies', 'tab-lait', 'tab-cheptel', 'tab-nutrition', 'tab-verre', 'tab-plastique', 'tab-dreches', 'tab-qhse'],
    // Opérateur Guilmey : UNIQUEMENT les modules ferme laitière
    'usr-004': ['tab-dashboard', 'tab-lait', 'tab-nutrition'],
    // Opérateur Farcha : UNIQUEMENT les modules déchets et recyclage
    'usr-005': ['tab-dashboard', 'tab-verre', 'tab-plastique', 'tab-dreches']
  };

  // =========================================================================
  // 2. DEFAULT USER REGISTRY
  // =========================================================================

  function hashSimple(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
      hash = hash >>> 0;
    }
    return 'sh2_' + hash.toString(16).padStart(8, '0') + '_' + str.length;
  }

  const DEFAULT_USERS = [
    {
      id: 'usr-001', username: 'root', email: 'root@agrocircular.local',
      displayName: 'Super Administrateur', role: 'root', entity: 'consolidated',
      mfaEnabled: true, mfaEmail: 'r**t@agrocircular.local',
      passwordHash: hashSimple('Root@2024!'), isLocked: false, isActive: true,
      createdAt: '2024-01-01T00:00:00Z', lastLogin: null, loginCount: 0, permissions: [], avatar: '🛡️'
    },
    {
      id: 'usr-002', username: 'admin', email: 'admin@agrocircular.local',
      displayName: 'Administrateur Général', role: 'admin', entity: 'consolidated',
      mfaEnabled: true, mfaEmail: 'a***n@agrocircular.local',
      passwordHash: hashSimple('Admin@2024!'), isLocked: false, isActive: true,
      createdAt: '2024-01-02T00:00:00Z', lastLogin: null, loginCount: 0, permissions: [], avatar: '⚙️'
    },
    {
      id: 'usr-003', username: 'superviseur', email: 'superviseur@agrocircular.local',
      displayName: 'Superviseur Opérations', role: 'superviseur', entity: 'consolidated',
      mfaEnabled: false, mfaEmail: '',
      passwordHash: hashSimple('Super@2024!'), isLocked: false, isActive: true,
      createdAt: '2024-01-03T00:00:00Z', lastLogin: null, loginCount: 0, permissions: [], avatar: '👁️'
    },
    {
      id: 'usr-004', username: 'operateur', email: 'operateur.ferme@agrocircular.local',
      displayName: 'Opérateur Ferme Guilmey', role: 'operateur', entity: 'ferme',
      mfaEnabled: false, mfaEmail: '',
      passwordHash: hashSimple('Oper@2024!'), isLocked: false, isActive: true,
      createdAt: '2024-01-04T00:00:00Z', lastLogin: null, loginCount: 0, permissions: [], avatar: '🐄'
    },
    {
      id: 'usr-005', username: 'farcha_op', email: 'operateur.farcha@agrocircular.local',
      displayName: 'Opérateur Usine Farcha', role: 'operateur', entity: 'soratrad',
      mfaEnabled: false, mfaEmail: '',
      passwordHash: hashSimple('Farcha@2024!'), isLocked: false, isActive: true,
      createdAt: '2024-01-05T00:00:00Z', lastLogin: null, loginCount: 0, permissions: [], avatar: '♻️'
    }
  ];

  // =========================================================================
  // MODULE ACCESS STORAGE LAYER
  // user_module_access: { [userId]: { modules: [moduleId], grantedBy, grantedAt, expiresAt? } }
  // =========================================================================

  function loadModuleAccess() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.moduleAccess);
      if (!raw) {
        // Premier démarrage : initialiser selon DEFAULT_USER_MODULES ou DEFAULT_MODULES_BY_ROLE
        const defaults = {};
        DEFAULT_USERS.forEach(function(u) {
          defaults[u.id] = {
            modules: (DEFAULT_USER_MODULES[u.id] || DEFAULT_MODULES_BY_ROLE[u.role] || []).slice(),
            grantedBy: 'system',
            grantedAt: new Date().toISOString()
          };
        });
        saveModuleAccess(defaults);
        return defaults;
      }
      return JSON.parse(raw);
    } catch { return {}; }
  }

  function saveModuleAccess(access) {
    localStorage.setItem(STORAGE_KEYS.moduleAccess, JSON.stringify(access));
  }

  function ensureUserModuleAccess(user) {
    // Garantit qu'un utilisateur a toujours un enregistrement d'accès aux modules
    const access = loadModuleAccess();
    if (!access[user.id]) {
      access[user.id] = {
        modules: (DEFAULT_USER_MODULES[user.id] || DEFAULT_MODULES_BY_ROLE[user.role] || []).slice(),
        grantedBy: 'system',
        grantedAt: new Date().toISOString()
      };
      saveModuleAccess(access);
    }
    return access;
  }

  // =========================================================================
  // 3. UTILITY FUNCTIONS
  // =========================================================================

  function verifyPassword(plain, stored) { return hashSimple(plain) === stored; }

  function generateToken(userId, role) {
    const payload = { uid: userId, role: role, iat: Date.now(), exp: Date.now() + SESSION_DURATION_MS };
    return 'agro.' + btoa(JSON.stringify(payload)).replace(/=/g, '');
  }

  function parseToken(token) {
    try {
      if (!token || !token.startsWith('agro.')) return null;
      const b64 = token.slice(5);
      const pad = b64.length % 4;
      const padded = pad ? b64 + '='.repeat(4 - pad) : b64;
      return JSON.parse(atob(padded));
    } catch { return null; }
  }

  function generateOTP() { return String(Math.floor(100000 + Math.random() * 900000)); }

  function generateId(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  }

  function ts() {
    return new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'medium' });
  }

  function evaluatePassword(pwd) {
    const rules = {
      len:     pwd.length >= 10,
      upper:   /[A-Z]/.test(pwd),
      lower:   /[a-z]/.test(pwd),
      digit:   /[0-9]/.test(pwd),
      special: /[!@#$%^&*()\-_=+\[\]{};':"\\|,.<>\/?`~]/.test(pwd)
    };
    let score = Object.values(rules).filter(Boolean).length;
    if (pwd.length >= 16) score++;
    const pass = Object.values(rules).every(Boolean);
    const strength = score <= 2 ? 'Faible' : score <= 4 ? 'Moyen' : 'Fort';
    return { score, rules, strength, pass };
  }

  // =========================================================================
  // 4. STORAGE LAYER
  // =========================================================================

  function loadUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.users);
      if (!raw) { saveUsers(DEFAULT_USERS); return JSON.parse(JSON.stringify(DEFAULT_USERS)); }
      return JSON.parse(raw);
    } catch { return JSON.parse(JSON.stringify(DEFAULT_USERS)); }
  }

  function saveUsers(users) { localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users)); }
  function loadSession() { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.session)); } catch { return null; } }
  function saveSession(s) { localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(s)); }
  function clearSession() { localStorage.removeItem(STORAGE_KEYS.session); }
  function loadAttempts() { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.attempts)) || {}; } catch { return {}; } }
  function saveAttempts(a) { localStorage.setItem(STORAGE_KEYS.attempts, JSON.stringify(a)); }
  function loadAuditLog() { try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.auditLog)) || []; } catch { return []; } }

  function addAuditEntry(action, userId, result, detail) {
    const log = loadAuditLog();
    log.unshift({ id: generateId('log'), ts: ts(), action, userId, result, detail: detail || '', ip: 'local' });
    if (log.length > 500) log.splice(500);
    localStorage.setItem(STORAGE_KEYS.auditLog, JSON.stringify(log));
  }

  // =========================================================================
  // 5. IAM CORE ENGINE
  // =========================================================================

  const IAM = {
    getCurrentUser() {
      const session = loadSession();
      if (!session) return null;
      const parsed = parseToken(session.token);
      if (!parsed || parsed.exp < Date.now()) { clearSession(); return null; }
      const users = loadUsers();
      return users.find(u => u.id === parsed.uid && u.isActive && !u.isLocked) || null;
    },

    hasPermission(perm) {
      const user = this.getCurrentUser();
      if (!user) return false;
      if (user.role === 'root') return true;
      return (PERMISSIONS[perm] || []).includes(user.role);
    },

    hasRole(minRole) {
      const user = this.getCurrentUser();
      if (!user) return false;
      return (ROLES[user.role]?.level || 0) >= (ROLES[minRole]?.level || 99);
    },

    isAuthenticated() { return !!this.getCurrentUser(); },

    login(usernameOrEmail, password, honeypot) {
      if (honeypot && honeypot.trim() !== '') return { success: false, reason: 'Bot détecté.' };
      const attempts = loadAttempts();
      const key = usernameOrEmail.toLowerCase();
      const now = Date.now();

      if (attempts[key]) {
        const a = attempts[key];
        if (a.count >= MAX_LOGIN_ATTEMPTS) {
          const remaining = a.lockedAt + LOCKOUT_DURATION_MS - now;
          if (remaining > 0) {
            return { success: false, reason: 'Compte verrouillé. Réessayez dans ' + Math.ceil(remaining / 60000) + ' min.', locked: true, remaining };
          } else { delete attempts[key]; saveAttempts(attempts); }
        }
      }

      const users = loadUsers();
      const user = users.find(u => (u.username.toLowerCase() === key || u.email.toLowerCase() === key) && u.isActive);

      if (!user) {
        if (!attempts[key]) attempts[key] = { count: 0 };
        attempts[key].count++;
        if (attempts[key].count >= MAX_LOGIN_ATTEMPTS) attempts[key].lockedAt = now;
        saveAttempts(attempts);
        addAuditEntry('LOGIN_FAILED', key, 'ÉCHEC', 'Utilisateur non trouvé');
        return { success: false, reason: 'Identifiant ou mot de passe incorrect.' };
      }

      if (user.isLocked) {
        addAuditEntry('LOGIN_BLOCKED', user.id, 'BLOQUÉ', 'Compte verrouillé par admin');
        return { success: false, reason: 'Ce compte est verrouillé. Contactez un administrateur.', locked: true };
      }

      if (!verifyPassword(password, user.passwordHash)) {
        if (!attempts[key]) attempts[key] = { count: 0 };
        attempts[key].count++;
        if (attempts[key].count >= MAX_LOGIN_ATTEMPTS) attempts[key].lockedAt = now;
        saveAttempts(attempts);
        const left = MAX_LOGIN_ATTEMPTS - attempts[key].count;
        addAuditEntry('LOGIN_FAILED', user.id, 'ÉCHEC', 'Mot de passe incorrect (' + attempts[key].count + '/' + MAX_LOGIN_ATTEMPTS + ')');
        if (left <= 0) return { success: false, reason: 'Compte verrouillé après ' + MAX_LOGIN_ATTEMPTS + ' tentatives. Réessayez dans 15 min.', locked: true };
        return { success: false, reason: 'Mot de passe incorrect. ' + left + ' tentative(s) restante(s).' };
      }

      delete attempts[key];
      saveAttempts(attempts);

      if (user.mfaEnabled) {
        const otp = generateOTP();
        window._pendingMfa = { userId: user.id, otp: otp, expiresAt: Date.now() + MFA_CODE_VALIDITY_MS };
        console.log('[AGRO-CIRCULAR AUTH] MFA Code pour "' + user.username + '": ' + otp + ' (valable 5 min)');
        return { success: true, mfaRequired: true, mfaEmailHint: user.mfaEmail || user.email, userId: user.id, otp: otp };
      }

      return this._createSession(user);
    },

    verifyMfa(code) {
      const pending = window._pendingMfa;
      if (!pending) return { success: false, reason: 'Session MFA expirée. Reconnectez-vous.' };
      if (Date.now() > pending.expiresAt) { delete window._pendingMfa; return { success: false, reason: 'Code expiré. Reconnectez-vous.' }; }
      if (code.trim() !== pending.otp) {
        addAuditEntry('MFA_FAILED', pending.userId, 'ÉCHEC', 'Code OTP incorrect');
        return { success: false, reason: 'Code MFA incorrect.' };
      }
      const users = loadUsers();
      const user = users.find(u => u.id === pending.userId);
      delete window._pendingMfa;
      if (!user) return { success: false, reason: 'Utilisateur introuvable.' };
      return this._createSession(user);
    },

    _createSession(user) {
      const token = generateToken(user.id, user.role);
      saveSession({ token: token, userId: user.id, role: user.role, loginAt: Date.now() });
      const users = loadUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) { users[idx].lastLogin = ts(); users[idx].loginCount = (users[idx].loginCount || 0) + 1; saveUsers(users); }
      addAuditEntry('LOGIN_SUCCESS', user.id, 'SUCCÈS', 'Rôle: ' + user.role.toUpperCase());
      return { success: true, mfaRequired: false, user: user };
    },

    logout() {
      const user = this.getCurrentUser();
      if (user) addAuditEntry('LOGOUT', user.id, 'SUCCÈS', '');
      clearSession();
    },

    requestPasswordReset(identifier) {
      const users = loadUsers();
      const user = users.find(u => u.username.toLowerCase() === identifier.toLowerCase() || u.email.toLowerCase() === identifier.toLowerCase());
      addAuditEntry('PWD_RESET_REQUEST', identifier, 'INITIÉ', user ? 'ID: ' + user.id : 'Utilisateur non trouvé');
      if (user) {
        const resetToken = generateId('rst');
        window._pendingReset = { userId: user.id, token: resetToken, expiresAt: Date.now() + 15 * 60 * 1000 };
        console.log('[AGRO-CIRCULAR AUTH] Reset token pour "' + user.username + '": ' + resetToken);
      }
      return { success: true, message: 'Si cet identifiant existe, un lien de réinitialisation a été envoyé.' };
    },

    resetPassword(newPassword) {
      const pending = window._pendingReset;
      if (!pending || Date.now() > pending.expiresAt) return { success: false, reason: 'Lien expiré ou invalide.' };
      const strength = evaluatePassword(newPassword);
      if (!strength.pass) return { success: false, reason: 'Le mot de passe ne respecte pas la politique de sécurité.' };
      const users = loadUsers();
      const idx = users.findIndex(u => u.id === pending.userId);
      if (idx === -1) return { success: false, reason: 'Utilisateur introuvable.' };
      users[idx].passwordHash = hashSimple(newPassword);
      saveUsers(users);
      addAuditEntry('PWD_RESET_SUCCESS', pending.userId, 'SUCCÈS', '');
      delete window._pendingReset;
      return { success: true };
    },

    getUsers() { return loadUsers(); },

    createUser(data, performedBy) {
      if (!this.hasPermission('users.create')) return { success: false, reason: 'Permission refusée.' };
      const strength = evaluatePassword(data.password);
      if (!strength.pass) return { success: false, reason: 'Mot de passe non conforme à la politique.' };
      const users = loadUsers();
      if (users.find(u => u.username === data.username || u.email === data.email)) return { success: false, reason: "Nom d'utilisateur ou e-mail déjà utilisé." };
      if (data.role === 'root' && !this.hasPermission('roles.assign_root')) return { success: false, reason: 'Seul un ROOT peut attribuer le rôle root.' };
      const newUser = {
        id: generateId('usr'),
        username: data.username, email: data.email,
        displayName: data.displayName || data.username,
        role: data.role || 'operateur', entity: data.entity || 'consolidated',
        mfaEnabled: data.mfaEnabled || false, mfaEmail: data.email,
        passwordHash: hashSimple(data.password),
        isLocked: false, isActive: true,
        createdAt: new Date().toISOString(), lastLogin: null, loginCount: 0,
        permissions: [], avatar: data.avatar || '👤'
      };
      users.push(newUser);
      saveUsers(users);

      // Initialisation des accès modules pour ce nouvel utilisateur (DEFAULT DENY)
      const initialModules = Array.isArray(data.modules) ? data.modules : (DEFAULT_MODULES_BY_ROLE[newUser.role] || []).slice();
      const access = loadModuleAccess();
      access[newUser.id] = {
        modules: initialModules,
        grantedBy: performedBy,
        grantedAt: new Date().toISOString()
      };
      saveModuleAccess(access);

      addAuditEntry('USER_CREATED', performedBy, 'SUCCÈS', 'Nouvel utilisateur: ' + newUser.username + ' (' + newUser.role + ') — ' + initialModules.length + ' module(s) accordé(s)');
      return { success: true, user: newUser };
    },

    updateUser(userId, data, performedBy) {
      if (!this.hasPermission('users.edit')) return { success: false, reason: 'Permission refusée.' };
      const users = loadUsers();
      const idx = users.findIndex(u => u.id === userId);
      if (idx === -1) return { success: false, reason: 'Utilisateur introuvable.' };
      if (users[idx].role === 'root' && data.role && data.role !== 'root' && !this.hasPermission('roles.assign_root')) return { success: false, reason: 'Seul un ROOT peut retirer le rôle root.' };
      if (data.role === 'root' && !this.hasPermission('roles.assign_root')) return { success: false, reason: 'Seul un ROOT peut attribuer le rôle root.' };
      ['displayName', 'email', 'role', 'entity', 'mfaEnabled', 'isActive', 'avatar'].forEach(k => { if (data[k] !== undefined) users[idx][k] = data[k]; });
      if (data.newPassword) {
        const str = evaluatePassword(data.newPassword);
        if (!str.pass) return { success: false, reason: 'Nouveau mot de passe non conforme.' };
        users[idx].passwordHash = hashSimple(data.newPassword);
      }
      saveUsers(users);
      addAuditEntry('USER_UPDATED', performedBy, 'SUCCÈS', 'Utilisateur modifié: ' + users[idx].username);
      return { success: true };
    },

    toggleLock(userId, performedBy) {
      if (!this.hasPermission('users.lock')) return { success: false, reason: 'Permission refusée.' };
      const users = loadUsers();
      const idx = users.findIndex(u => u.id === userId);
      if (idx === -1) return { success: false, reason: 'Utilisateur introuvable.' };
      const me = this.getCurrentUser();
      if (me && me.id === userId) return { success: false, reason: 'Vous ne pouvez pas verrouiller votre propre compte.' };
      users[idx].isLocked = !users[idx].isLocked;
      saveUsers(users);
      addAuditEntry(users[idx].isLocked ? 'USER_LOCKED' : 'USER_UNLOCKED', performedBy, 'SUCCÈS', 'Cible: ' + users[idx].username);
      return { success: true, isLocked: users[idx].isLocked };
    },

    deleteUser(userId, performedBy) {
      if (!this.hasPermission('users.delete')) return { success: false, reason: 'Seul ROOT peut supprimer des utilisateurs.' };
      const me = this.getCurrentUser();
      if (me && me.id === userId) return { success: false, reason: 'Vous ne pouvez pas supprimer votre propre compte.' };
      const users = loadUsers();
      const idx = users.findIndex(u => u.id === userId);
      if (idx === -1) return { success: false, reason: 'Utilisateur introuvable.' };
      const name = users[idx].username;
      users.splice(idx, 1);
      saveUsers(users);
      addAuditEntry('USER_DELETED', performedBy, 'SUCCÈS', 'Supprimé: ' + name);
      return { success: true };
    },

    assignRole(userId, newRole, performedBy) {
      if (!this.hasPermission('roles.assign')) return { success: false, reason: 'Permission refusée.' };
      if (newRole === 'root' && !this.hasPermission('roles.assign_root')) return { success: false, reason: 'Seul ROOT peut élever un utilisateur au rang root.' };
      const result = this.updateUser(userId, { role: newRole }, performedBy);
      // When role changes, reset module access to new role defaults
      if (result.success) {
        const access = loadModuleAccess();
        const prevModules = access[userId] ? access[userId].modules : [];
        const newDefaults = (DEFAULT_MODULES_BY_ROLE[newRole] || []).slice();
        // Merge: keep previous explicit grants that are still valid for new role
        access[userId] = {
          modules: newDefaults,
          grantedBy: performedBy,
          grantedAt: new Date().toISOString(),
          roleChangeFrom: 'previous',
          prevModules: prevModules
        };
        saveModuleAccess(access);
        addAuditEntry('MODULE_ACCESS_RESET', performedBy, 'SUCCÈS',
          'Accès modules réinitialisés suite au changement de rôle -> ' + newRole + ' pour ' + userId);
      }
      return result;
    },

    // -----------------------------------------------------------------------
    // MODULE ACCESS MANAGEMENT (DEFAULT DENY)
    // -----------------------------------------------------------------------

    hasModuleAccess(moduleId) {
      const user = this.getCurrentUser();
      if (!user) return false;
      // root and admin always have full access
      if (user.role === 'root' || user.role === 'admin') return true;
      const access = loadModuleAccess();
      const userAccess = access[user.id];
      if (!userAccess) return false;
      // Check expiration
      if (userAccess.expiresAt && Date.now() > new Date(userAccess.expiresAt).getTime()) return false;
      return (userAccess.modules || []).includes(moduleId);
    },

    getUserModules(userId) {
      // Returns the list of module IDs accessible to a given user
      const users = loadUsers();
      const user = users.find(function(u) { return u.id === userId; });
      if (!user) return [];
      if (user.role === 'root' || user.role === 'admin') {
        return MODULE_CATALOG.map(function(m) { return m.id; });
      }
      const access = loadModuleAccess();
      const userAccess = access[userId];
      if (!userAccess) return [];
      if (userAccess.expiresAt && Date.now() > new Date(userAccess.expiresAt).getTime()) return [];
      return userAccess.modules || [];
    },

    grantModuleAccess(targetUserId, moduleIds, performedBy, expiresAt) {
      if (!this.hasPermission('modules.grant')) return { success: false, reason: 'Permission refusée : modules.grant requis.' };
      // Admin cannot grant modules they don't have access to themselves
      const me = this.getCurrentUser();
      if (!me) return { success: false, reason: 'Session invalide.' };
      if (me.role !== 'root') {
        const myModules = this.getUserModules(me.id);
        const forbidden = moduleIds.filter(function(m) { return !myModules.includes(m); });
        if (forbidden.length > 0) {
          return { success: false, reason: 'Vous ne pouvez accorder que les modules auxquels vous avez accès vous-même.' };
        }
      }
      const targetUser = loadUsers().find(function(u) { return u.id === targetUserId; });
      if (!targetUser) return { success: false, reason: 'Utilisateur introuvable.' };
      if (targetUser.role === 'root') return { success: false, reason: 'Impossible de modifier les accès du super-administrateur ROOT.' };

      const access = loadModuleAccess();
      if (!access[targetUserId]) access[targetUserId] = { modules: [] };
      moduleIds.forEach(function(m) {
        if (!access[targetUserId].modules.includes(m)) access[targetUserId].modules.push(m);
      });
      access[targetUserId].grantedBy = performedBy;
      access[targetUserId].grantedAt = new Date().toISOString();
      if (expiresAt) access[targetUserId].expiresAt = expiresAt;
      saveModuleAccess(access);
      addAuditEntry('MODULE_GRANT', performedBy, 'SUCCÈS',
        'Accordé [' + moduleIds.join(', ') + '] à ' + targetUser.username);
      return { success: true };
    },

    revokeModuleAccess(targetUserId, moduleIds, performedBy) {
      if (!this.hasPermission('modules.revoke')) return { success: false, reason: 'Permission refusée : modules.revoke requis.' };
      const targetUser = loadUsers().find(function(u) { return u.id === targetUserId; });
      if (!targetUser) return { success: false, reason: 'Utilisateur introuvable.' };
      if (targetUser.role === 'root') return { success: false, reason: 'Impossible de révoquer les accès du ROOT.' };

      const access = loadModuleAccess();
      if (!access[targetUserId]) return { success: true }; // already no access
      access[targetUserId].modules = (access[targetUserId].modules || []).filter(function(m) {
        return !moduleIds.includes(m);
      });
      access[targetUserId].revokedBy = performedBy;
      access[targetUserId].revokedAt = new Date().toISOString();
      saveModuleAccess(access);
      addAuditEntry('MODULE_REVOKE', performedBy, 'SUCCÈS',
        'Révoqué [' + moduleIds.join(', ') + '] de ' + targetUser.username);
      return { success: true };
    },

    revokeAllModules(targetUserId, performedBy) {
      return this.revokeModuleAccess(targetUserId, MODULE_CATALOG.map(function(m) { return m.id; }), performedBy);
    },

    getModuleCatalog() { return MODULE_CATALOG; },
    getModuleAccessMap() { return loadModuleAccess(); },

    getAuditLog(limit) { return loadAuditLog().slice(0, limit || 100); },

    // Export for external use
    ROLES: ROLES,
    PERMISSIONS: PERMISSIONS,
    MODULE_CATALOG: MODULE_CATALOG,
    evaluatePassword: evaluatePassword
  };


  // =========================================================================
  // 6. AUTH PAGE CONTROLLER (auth.html)
  // =========================================================================

  let mfaTimer = null;
  let mfaTimeLeft = 300;

  function showScreen(id) {
    document.querySelectorAll('.auth-screen').forEach(function(el) { el.classList.remove('active'); });
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('active');
  }

  function showAlert(id, msg, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = 'auth-alert ' + (type || 'error');
    el.textContent = msg;
    el.style.display = 'block';
  }

  function hideAlert(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }

  function setLoading(btnId, spinnerId, loading) {
    const btn = document.getElementById(btnId);
    const spinner = document.getElementById(spinnerId);
    if (btn) btn.disabled = loading;
    if (spinner) spinner.style.display = loading ? 'block' : 'none';
  }

  function initOtpInputs() {
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach(function(inp, i) {
      inp.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && !inp.value && i > 0) inputs[i - 1].focus();
      });
      inp.addEventListener('input', function() {
        inp.value = inp.value.replace(/\D/g, '').slice(-1);
        if (inp.value && i < inputs.length - 1) inputs[i + 1].focus();
        inp.classList.toggle('filled', !!inp.value);
        const allFilled = Array.from(inputs).every(function(x) { return x.value.length === 1; });
        if (allFilled) {
          const form = document.getElementById('form-mfa');
          if (form) form.dispatchEvent(new Event('submit'));
        }
      });
      inp.addEventListener('paste', function(e) {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        inputs.forEach(function(inp2, j) { inp2.value = paste[j] || ''; inp2.classList.toggle('filled', !!inp2.value); });
        if (paste.length >= 6) {
          const form = document.getElementById('form-mfa');
          if (form) form.dispatchEvent(new Event('submit'));
        }
      });
    });
  }

  function startMfaTimer() {
    clearInterval(mfaTimer);
    mfaTimeLeft = 300;
    const el = document.getElementById('mfa-countdown');
    mfaTimer = setInterval(function() {
      mfaTimeLeft--;
      if (el) {
        const m = Math.floor(mfaTimeLeft / 60);
        const s = mfaTimeLeft % 60;
        el.textContent = m + ':' + String(s).padStart(2, '0');
        el.style.color = mfaTimeLeft < 60 ? '#ef4444' : '#f59e0b';
      }
      if (mfaTimeLeft <= 0) {
        clearInterval(mfaTimer);
        showAlert('mfa-alert', 'Code expiré. Veuillez vous reconnecter.', 'error');
      }
    }, 1000);
  }

  function initPasswordStrength() {
    const input = document.getElementById('reset-password');
    if (!input) return;
    input.addEventListener('input', function() {
      const ev = evaluatePassword(input.value);
      const pct = Math.round((ev.score / 6) * 100);
      const fill = document.getElementById('pwd-strength-fill');
      const label = document.getElementById('pwd-strength-label');
      if (fill) {
        fill.style.width = pct + '%';
        fill.style.backgroundColor = ev.score <= 2 ? '#ef4444' : ev.score <= 4 ? '#f59e0b' : '#10b981';
      }
      if (label) {
        label.textContent = ev.strength;
        label.style.color = ev.score <= 2 ? '#f87171' : ev.score <= 4 ? '#fbbf24' : '#10b981';
      }
      const ruleMap = { len: 'rule-len', upper: 'rule-upper', lower: 'rule-lower', digit: 'rule-digit', special: 'rule-special' };
      const lOk =  { len: '✓ Au moins 10 caractères', upper: '✓ Une majuscule', lower: '✓ Une minuscule', digit: '✓ Un chiffre', special: '✓ Un caractère spécial' };
      const lErr = { len: '✗ Au moins 10 caractères', upper: '✗ Une majuscule', lower: '✗ Une minuscule', digit: '✗ Un chiffre', special: '✗ Un caractère spécial' };
      Object.keys(ev.rules).forEach(function(k) {
        const el2 = document.getElementById(ruleMap[k]);
        if (el2) { el2.textContent = ev.rules[k] ? lOk[k] : lErr[k]; el2.className = 'rule-item' + (ev.rules[k] ? ' rule-ok' : ''); }
      });
    });
  }

  function redirectToApp(user) {
    const loginAlert = document.getElementById('login-alert');
    if (loginAlert) {
      loginAlert.className = 'auth-alert success';
      loginAlert.textContent = 'Bienvenue, ' + user.displayName + ' (' + (ROLES[user.role] ? ROLES[user.role].label : user.role) + ') ! Redirection...';
      loginAlert.style.display = 'block';
    }
    setTimeout(function() { window.location.href = 'index.html'; }, 1200);
  }

  function initAuthPage() {
    if (!document.getElementById('screen-login')) return;

    initOtpInputs();
    initPasswordStrength();

    // Toggle password visibility
    const toggleLogin = document.getElementById('btn-toggle-login-pwd');
    const loginPwd = document.getElementById('login-password');
    if (toggleLogin && loginPwd) {
      toggleLogin.addEventListener('click', function() {
        loginPwd.type = loginPwd.type === 'password' ? 'text' : 'password';
      });
    }

    const toggleReset = document.getElementById('btn-toggle-reset-pwd');
    const resetPwd = document.getElementById('reset-password');
    if (toggleReset && resetPwd) {
      toggleReset.addEventListener('click', function() {
        resetPwd.type = resetPwd.type === 'password' ? 'text' : 'password';
      });
    }

    // Screen navigation
    const gotoForgot = document.getElementById('btn-goto-forgot');
    if (gotoForgot) gotoForgot.addEventListener('click', function() { hideAlert('login-alert'); showScreen('screen-forgot'); });
    const backFromForgot = document.getElementById('btn-back-from-forgot');
    if (backFromForgot) backFromForgot.addEventListener('click', function() { showScreen('screen-login'); });
    const backToLogin = document.getElementById('btn-back-to-login');
    if (backToLogin) backToLogin.addEventListener('click', function() { clearInterval(mfaTimer); showScreen('screen-login'); });

    const resendCode = document.getElementById('btn-resend-code');
    if (resendCode) {
      resendCode.addEventListener('click', function() {
        if (window._pendingMfa) {
          window._pendingMfa.otp = generateOTP();
          window._pendingMfa.expiresAt = Date.now() + MFA_CODE_VALIDITY_MS;
          console.log('[MFA Renvoi] Nouveau code: ' + window._pendingMfa.otp);
          const demoCodeEl = document.getElementById('mfa-demo-code');
          if (demoCodeEl) demoCodeEl.textContent = window._pendingMfa.otp;
          showAlert('mfa-alert', 'Nouveau code généré : ' + window._pendingMfa.otp, 'info');
          startMfaTimer();
        }
      });
    }

    const autofillOtpBtn = document.getElementById('btn-autofill-otp');
    if (autofillOtpBtn) {
      autofillOtpBtn.addEventListener('click', function() {
        const otp = (window._pendingMfa && window._pendingMfa.otp) || (document.getElementById('mfa-demo-code') ? document.getElementById('mfa-demo-code').textContent.trim() : '');
        if (otp && otp.length === 6) {
          const inputs = document.querySelectorAll('.otp-input');
          inputs.forEach(function(inp, i) {
            inp.value = otp[i] || '';
            inp.classList.add('filled');
          });
          const form = document.getElementById('form-mfa');
          if (form) form.dispatchEvent(new Event('submit'));
        }
      });
    }

    // Login form submit
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
      formLogin.addEventListener('submit', function(e) {
        e.preventDefault();
        hideAlert('login-alert');
        const username = (document.getElementById('login-username') || {}).value || '';
        const password = (document.getElementById('login-password') || {}).value || '';
        const honeypot = (document.getElementById('hp-field') || {}).value || '';

        if (!username.trim() || !password) {
          showAlert('login-alert', 'Veuillez saisir vos identifiants.', 'error');
          return;
        }

        setLoading('btn-login', 'login-spinner', true);

        setTimeout(function() {
          const result = IAM.login(username.trim(), password, honeypot);
          setLoading('btn-login', 'login-spinner', false);

          if (!result.success) {
            showAlert('login-alert', result.reason, 'error');
            if (result.locked) {
              const bar = document.getElementById('lockout-bar');
              const msg = document.getElementById('lockout-msg');
              if (bar) bar.style.display = 'flex';
              if (msg) msg.textContent = result.reason;
            }
            return;
          }

          if (result.mfaRequired) {
            const hint = document.getElementById('mfa-email-hint');
            if (hint) hint.textContent = result.mfaEmailHint;
            const demoCodeEl = document.getElementById('mfa-demo-code');
            const currentOtp = result.otp || (window._pendingMfa ? window._pendingMfa.otp : '');
            if (demoCodeEl) demoCodeEl.textContent = currentOtp;
            document.querySelectorAll('.otp-input').forEach(function(i) { i.value = ''; i.classList.remove('filled'); });
            showScreen('screen-mfa');
            startMfaTimer();
            showAlert('mfa-alert', 'Code de vérification généré : ' + currentOtp, 'info');
          } else {
            redirectToApp(result.user);
          }
        }, 600);
      });
    }

    // MFA form submit
    const formMfa = document.getElementById('form-mfa');
    if (formMfa) {
      formMfa.addEventListener('submit', function(e) {
        e.preventDefault();
        hideAlert('mfa-alert');
        const code = Array.from(document.querySelectorAll('.otp-input')).map(function(i) { return i.value; }).join('');
        if (code.length !== 6) { showAlert('mfa-alert', 'Saisissez le code à 6 chiffres complet.', 'error'); return; }
        setLoading('btn-mfa-verify', 'mfa-spinner', true);
        setTimeout(function() {
          const result = IAM.verifyMfa(code);
          setLoading('btn-mfa-verify', 'mfa-spinner', false);
          if (!result.success) {
            showAlert('mfa-alert', result.reason, 'error');
            document.querySelectorAll('.otp-input').forEach(function(i) { i.value = ''; i.classList.remove('filled'); });
            const first = document.getElementById('otp-0');
            if (first) first.focus();
          } else {
            clearInterval(mfaTimer);
            redirectToApp(result.user);
          }
        }, 500);
      });
    }

    // Forgot password form
    const formForgot = document.getElementById('form-forgot');
    if (formForgot) {
      formForgot.addEventListener('submit', function(e) {
        e.preventDefault();
        const identifier = (document.getElementById('forgot-email') || {}).value || '';
        if (!identifier.trim()) { showAlert('forgot-alert', 'Veuillez saisir votre identifiant.', 'error'); return; }
        const result = IAM.requestPasswordReset(identifier.trim());
        showAlert('forgot-alert', result.message, 'success');
        setTimeout(function() {
          showScreen('screen-reset');
          showAlert('reset-alert', 'Mode démo: le token reset est disponible en console (F12).', 'info');
        }, 2000);
      });
    }

    // Reset password form
    const formReset = document.getElementById('form-reset');
    if (formReset) {
      formReset.addEventListener('submit', function(e) {
        e.preventDefault();
        const pwd = (document.getElementById('reset-password') || {}).value || '';
        const confirm = (document.getElementById('reset-confirm') || {}).value || '';
        if (pwd !== confirm) { showAlert('reset-alert', 'Les mots de passe ne correspondent pas.', 'error'); return; }
        const result = IAM.resetPassword(pwd);
        if (!result.success) { showAlert('reset-alert', result.reason, 'error'); return; }
        showAlert('reset-alert', 'Mot de passe mis à jour ! Redirection...', 'success');
        setTimeout(function() { showScreen('screen-login'); }, 2000);
      });
    }

    // Auto-redirect if already logged in
    if (IAM.isAuthenticated()) redirectToApp(IAM.getCurrentUser());
  }

  // =========================================================================
  // 7. APP GUARD & USER BANNER (index.html)
  // =========================================================================

  function initAppGuard() {
    if (!document.querySelector('.app-header')) return;

    const user = IAM.getCurrentUser();
    if (!user) {
      window.location.href = 'auth.html';
      return;
    }

    injectUserBanner(user);
    enforceRBAC(user);
    injectIAMTab(user);

    window.agrocircularIAM = IAM;
    window.renderIAMPanel = renderIAMPanel;
  }

  function injectUserBanner(user) {
    const header = document.querySelector('.header-right');
    if (!header) return;
    const existing = document.getElementById('auth-user-banner');
    if (existing) existing.remove();

    const roleInfo = ROLES[user.role] || ROLES.operateur;
    const banner = document.createElement('div');
    banner.id = 'auth-user-banner';
    banner.style.cssText = [
      'display:flex', 'align-items:center', 'gap:0.6rem',
      'background:rgba(255,255,255,0.04)',
      'border:1px solid rgba(255,255,255,0.08)',
      'border-radius:9999px',
      'padding:0.3rem 0.9rem 0.3rem 0.5rem',
      'font-size:0.78rem', 'cursor:pointer',
      'transition:all 0.2s ease', 'margin-right:0.5rem'
    ].join(';');

    banner.innerHTML = [
      '<div style="width:28px;height:28px;border-radius:50%;background:' + roleInfo.bg + ';border:1px solid ' + roleInfo.color + '40;display:flex;align-items:center;justify-content:center;font-size:0.85rem;">' + user.avatar + '</div>',
      '<div style="display:flex;flex-direction:column;gap:1px;">',
        '<span style="color:#f8fafc;font-weight:600;font-size:0.78rem;line-height:1;">' + user.displayName + '</span>',
        '<span style="color:' + roleInfo.color + ';font-size:0.66rem;font-weight:700;letter-spacing:0.5px;">' + roleInfo.label + '</span>',
      '</div>'
    ].join('');

    banner.addEventListener('mouseenter', function() { banner.style.background = 'rgba(16,185,129,0.08)'; });
    banner.addEventListener('mouseleave', function() { banner.style.background = 'rgba(255,255,255,0.04)'; });
    banner.addEventListener('click', function() { toggleUserDropdown(user); });
    header.insertBefore(banner, header.firstChild);

    // Also inject logout button in sidebar footer
    const sidebarFooter = document.querySelector('.sidebar-footer');
    if (sidebarFooter && !document.getElementById('btn-sidebar-logout')) {
      const logoutLine = document.createElement('div');
      logoutLine.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid rgba(255,255,255,0.06);';
      logoutLine.innerHTML = '<span style="font-size:0.75rem;color:#64748b;flex:1;">' + user.avatar + ' ' + user.username + '</span>' +
        '<button id="btn-sidebar-logout" style="background:none;border:none;color:#f87171;font-size:0.75rem;cursor:pointer;padding:2px 6px;border-radius:4px;transition:background 0.2s;" title="Déconnexion">🚪 Quitter</button>';
      sidebarFooter.appendChild(logoutLine);
      document.getElementById('btn-sidebar-logout').addEventListener('click', function() {
        if (confirm('Se déconnecter de AGRO-CIRCULAR OS ?')) {
          IAM.logout();
          window.location.href = 'auth.html';
        }
      });
    }
  }

  let dropdownOpen = false;

  function toggleUserDropdown(user) {
    const existing = document.getElementById('user-dropdown-menu');
    if (existing) { existing.remove(); dropdownOpen = false; return; }
    dropdownOpen = true;
    const roleInfo = ROLES[user.role] || ROLES.operateur;
    const menu = document.createElement('div');
    menu.id = 'user-dropdown-menu';
    menu.style.cssText = [
      'position:fixed', 'top:68px', 'right:16px', 'z-index:9999',
      'background:rgba(15,23,42,0.98)',
      'border:1px solid rgba(255,255,255,0.1)',
      'border-radius:12px', 'padding:0.5rem',
      'min-width:240px',
      'box-shadow:0 20px 50px rgba(0,0,0,0.6)',
      'backdrop-filter:blur(20px)'
    ].join(';');

    const items = [
      { icon: '👤', label: 'Connecté : ' + user.username, style: 'color:#94a3b8;font-size:0.75rem;', disabled: true },
      { icon: '\uD83C\uDFF7\uFE0F', label: 'Rôle : ' + roleInfo.label, style: 'color:' + roleInfo.color + ';font-size:0.75rem;', disabled: true },
      { sep: true },
      { icon: '⚙️', label: 'Administration IAM', show: IAM.hasPermission('users.view'), action: function() { navigateToIAM(); closeDropdown(); } },
      { sep: true },
      { icon: '🚪', label: 'Se Déconnecter', style: 'color:#f87171;', action: function() { IAM.logout(); window.location.href = 'auth.html'; } }
    ];

    items.forEach(function(item) {
      if (item.sep) {
        const sep = document.createElement('div');
        sep.style.cssText = 'height:1px;background:rgba(255,255,255,0.06);margin:0.3rem 0;';
        menu.appendChild(sep);
        return;
      }
      if (item.show === false) return;
      const el = document.createElement('div');
      el.style.cssText = 'display:flex;align-items:center;gap:0.6rem;padding:0.5rem 0.7rem;border-radius:8px;font-size:0.82rem;cursor:' + (item.disabled ? 'default' : 'pointer') + ';transition:background 0.15s;' + (item.style || 'color:#f8fafc;');
      el.innerHTML = '<span>' + item.icon + '</span><span>' + item.label + '</span>';
      if (!item.disabled && item.action) {
        el.addEventListener('mouseenter', function() { el.style.background = 'rgba(255,255,255,0.05)'; });
        el.addEventListener('mouseleave', function() { el.style.background = 'transparent'; });
        el.addEventListener('click', item.action);
      }
      menu.appendChild(el);
    });

    document.body.appendChild(menu);
    setTimeout(function() { document.addEventListener('click', closeDropdownOutside); }, 10);
  }

  function closeDropdown() { const m = document.getElementById('user-dropdown-menu'); if (m) m.remove(); dropdownOpen = false; }
  function closeDropdownOutside(e) {
    if (!e.target.closest('#user-dropdown-menu') && !e.target.closest('#auth-user-banner')) {
      closeDropdown();
      document.removeEventListener('click', closeDropdownOutside);
    }
  }

  function navigateToIAM() {
    const iamNav = document.querySelector('[data-tab="tab-iam"]');
    if (iamNav) iamNav.click();
  }

  function enforceRBAC(user) {
    // Ensure user has a module access record
    ensureUserModuleAccess(user);

    // ---- DEFAULT DENY: Hide/lock all nav items ----
    // 1. Start by hiding ALL nav items
    document.querySelectorAll('.nav-item[data-tab]').forEach(function(btn) {
      const tabId = btn.getAttribute('data-tab');
      // iam tab is handled separately
      if (tabId === 'tab-iam') return;
      // Check if user has module access
      if (IAM.hasModuleAccess(tabId)) {
        btn.style.display = '';
        btn.style.opacity = '1';
        btn.style.pointerEvents = '';
        btn.title = '';
      } else {
        btn.style.display = 'none'; // Hard hide — DEFAULT DENY
      }
    });

    // Also hide the corresponding tab panes for unauthorized modules
    MODULE_CATALOG.forEach(function(mod) {
      const pane = document.getElementById(mod.id);
      if (!pane) return;
      if (!IAM.hasModuleAccess(mod.id)) {
        pane.style.display = 'none';
        pane.setAttribute('data-access-denied', 'true');
      } else {
        pane.style.display = '';
        pane.removeAttribute('data-access-denied');
      }
    });

    // Masquer les titres de section si tous leurs boutons sont masqués
    document.querySelectorAll('.nav-section-title').forEach(function(title) {
      let sibling = title.nextElementSibling;
      let hasVisibleChild = false;
      while (sibling && !sibling.classList.contains('nav-section-title')) {
        if (sibling.classList.contains('nav-item') && sibling.style.display !== 'none') {
          hasVisibleChild = true;
          break;
        }
        sibling = sibling.nextElementSibling;
      }
      title.style.display = hasVisibleChild ? '' : 'none';
    });

    // 2. Redirect to first allowed module if current active tab is denied
    const activePane = document.querySelector('.tab-pane.active');
    if (activePane && activePane.getAttribute('data-access-denied') === 'true') {
      const firstAllowed = MODULE_CATALOG.find(function(m) { return IAM.hasModuleAccess(m.id); });
      if (firstAllowed) {
        const firstNavBtn = document.getElementById(firstAllowed.navId);
        if (firstNavBtn) firstNavBtn.click();
      }
    }

    // 3. Action-level permissions
    if (!IAM.hasPermission('data.reset_zero')) {
      const btn = document.getElementById('btn-reset-zero');
      if (btn) btn.style.display = 'none';
    }
    if (!IAM.hasPermission('data.load_demo')) {
      const btn = document.getElementById('btn-reset-demo');
      if (btn) btn.style.display = 'none';
    }
    if (!IAM.hasPermission('finance.export')) {
      const btn = document.getElementById('btn-export-data');
      if (btn) btn.style.display = 'none';
    }
  }

  // Inject the IAM tab in sidebar and main if not present
  function injectIAMTab(user) {
    if (!IAM.hasPermission('users.view')) return;
    if (document.getElementById('nav-iam')) return;

    // Sidebar nav item
    const nav = document.querySelector('nav.sidebar-nav');
    if (nav) {
      const btn = document.createElement('button');
      btn.className = 'nav-item';
      btn.dataset.tab = 'tab-iam';
      btn.id = 'nav-iam';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>Administration IAM</span>';
      nav.appendChild(btn);
    }

    // Tab pane
    const main = document.querySelector('.app-main');
    if (main) {
      const pane = document.createElement('section');
      pane.className = 'tab-pane';
      pane.id = 'tab-iam';
      pane.innerHTML = [
        '<div class="view-header">',
          '<div>',
            '<h1 class="view-title">\uD83D\uDD10 Administration IAM — Identités & Accès</h1>',
            '<p class="view-desc">Gestion des utilisateurs, rôles, permissions et journal d\'audit AGRO-CIRCULAR OS.</p>',
          '</div>',
        '</div>',
        '<div id="iam-panel-content"></div>'
      ].join('');
      main.appendChild(pane);
    }

    // Use event delegation on sidebar to detect IAM tab clicks robustly
    const sidebarNav = document.querySelector('nav.sidebar-nav');
    if (sidebarNav && !sidebarNav._iamListenerAttached) {
      sidebarNav._iamListenerAttached = true;
      sidebarNav.addEventListener('click', function(e) {
        const item = e.target.closest('.nav-item[data-tab]');
        if (item && item.dataset.tab === 'tab-iam') {
          setTimeout(renderIAMPanel, 60);
        }
      });
    }
  }

  // =========================================================================
  // 8. IAM ADMIN PANEL RENDERER
  // =========================================================================

  function renderIAMPanel() {
    const container = document.getElementById('iam-panel-content');
    if (!container) return;
    const me = IAM.getCurrentUser();
    if (!me || !IAM.hasPermission('users.view')) {
      container.innerHTML = '<div style="text-align:center;padding:3rem;color:#64748b;"><div style="font-size:2rem;margin-bottom:1rem;">\uD83D\uDD12</div><p>Accès réservé aux administrateurs.</p></div>';
      return;
    }

    const users = IAM.getUsers();
    const auditLog = IAM.getAuditLog(50);
    const activeCount = users.filter(function(u) { return u.isActive && !u.isLocked; }).length;
    const lockedCount = users.filter(function(u) { return u.isLocked; }).length;
    const mfaCount = users.filter(function(u) { return u.mfaEnabled; }).length;

    function roleChip(role) {
      const map = { root: 'chip-root', admin: 'chip-admin', superviseur: 'chip-supervisor', operateur: 'chip-operator' };
      const lbl = { root: 'ROOT', admin: 'ADMIN', superviseur: 'SUPERVISEUR', operateur: 'OPÉRATEUR' };
      return '<span class="role-chip ' + (map[role] || '') + '">' + (lbl[role] || role) + '</span>';
    }

    function statusChip(user) {
      if (user.isLocked) return '<span class="status-chip locked">🔒 Verrouillé</span>';
      if (!user.isActive) return '<span class="status-chip inactive">Inactif</span>';
      return '<span class="status-chip active">' + (user.mfaEnabled ? '✅ Actif + MFA' : '✅ Actif') + '</span>';
    }

    const canCreate = IAM.hasPermission('users.create');
    const canDelete = IAM.hasPermission('users.delete');
    const canEditRole = IAM.hasPermission('roles.assign');
    const canLock = IAM.hasPermission('users.lock');
    const canGrantModules = IAM.hasPermission('modules.grant');
    const moduleAccessMap = IAM.getModuleAccessMap();

    const statsHtml = [
      '<div class="iam-grid" style="margin-bottom:1.5rem;">',
        '<div class="iam-stat-card"><div class="iam-stat-icon green">👥</div><div><div class="iam-stat-val">' + users.length + '</div><div class="iam-stat-label">Utilisateurs total</div></div></div>',
        '<div class="iam-stat-card"><div class="iam-stat-icon green">✅</div><div><div class="iam-stat-val">' + activeCount + '</div><div class="iam-stat-label">Comptes actifs</div></div></div>',
        '<div class="iam-stat-card"><div class="iam-stat-icon red">🔒</div><div><div class="iam-stat-val">' + lockedCount + '</div><div class="iam-stat-label">Comptes verrouillés</div></div></div>',
        '<div class="iam-stat-card"><div class="iam-stat-icon amber">🛡️</div><div><div class="iam-stat-val">' + mfaCount + '</div><div class="iam-stat-label">Avec MFA activé</div></div></div>',
        '<div class="iam-stat-card"><div class="iam-stat-icon purple">📋</div><div><div class="iam-stat-val">' + auditLog.length + '</div><div class="iam-stat-label">Entrées d\'audit</div></div></div>',
      '</div>'
    ].join('');

    const actionBtns = [
      '<div style="display:flex;gap:0.75rem;margin-bottom:1.25rem;flex-wrap:wrap;align-items:center;">',
        canCreate ? '<button class="btn btn-primary btn-sm" onclick="window.iamActions.openAddUser()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Créer un utilisateur</button>' : '',
        '<button class="btn btn-secondary btn-sm" onclick="window.iamActions.refreshPanel()">🔄 Actualiser</button>',
        '<span style="font-size:0.75rem;color:#64748b;margin-left:auto;">Politique : <strong style="color:#10b981;">DEFAULT DENY</strong> (refus d\'accès par défaut)</span>',
      '</div>'
    ].join('');

    const usersTableRows = users.map(function(u) {
      const isMe = me.id === u.id;
      const userModules = IAM.getUserModules(u.id);
      const moduleBadge = (u.role === 'root' || u.role === 'admin')
        ? '<span style="font-size:0.7rem;color:#10b981;background:rgba(16,185,129,0.12);padding:2px 7px;border-radius:4px;border:1px solid rgba(16,185,129,0.3);">Accès total</span>'
        : '<span style="font-size:0.7rem;color:#94a3b8;">' + userModules.length + '/' + MODULE_CATALOG.length + ' modules</span>';
      let actionCells = isMe ? '<span style="color:#64748b;font-size:0.75rem;">(vous)</span>' : [
        canLock ? '<button class="btn-iam-action" onclick="window.iamActions.toggleLock(\'' + u.id + '\')">' + (u.isLocked ? '🔓 Débloquer' : '🔒 Bloquer') + '</button>' : '',
        canEditRole ? '<button class="btn-iam-action promote" onclick="window.iamActions.openEditRole(\'' + u.id + '\',\'' + u.role + '\')">✏️ Rôle</button>' : '',
        canGrantModules && u.role !== 'root' ? '<button class="btn-iam-action" style="background:rgba(2,132,199,0.15);border-color:rgba(2,132,199,0.4);color:#60a5fa;" onclick="window.iamActions.manageModules(\'' + u.id + '\',\'' + u.username + '\')">🔑 Accès</button>' : '',
        canDelete ? '<button class="btn-iam-action danger" onclick="window.iamActions.deleteUser(\'' + u.id + '\',\'' + u.username + '\')">🗑️ Supprimer</button>' : ''
      ].join('');
      return '<tr>' +
        '<td style="font-size:1.1rem;text-align:center;">' + u.avatar + '</td>' +
        '<td style="font-family:monospace;color:#94a3b8;">' + u.username + '</td>' +
        '<td style="font-weight:600;color:#f8fafc;">' + u.displayName + '</td>' +
        '<td>' + roleChip(u.role) + '</td>' +
        '<td style="color:#64748b;font-size:0.78rem;">' + u.entity + '</td>' +
        '<td>' + statusChip(u) + '</td>' +
        '<td>' + moduleBadge + '</td>' +
        '<td style="color:#64748b;font-size:0.75rem;">' + (u.lastLogin || 'Jamais') + '</td>' +
        '<td style="text-align:center;font-size:0.8rem;color:' + (u.mfaEnabled ? '#10b981' : '#64748b') + ';">' + (u.mfaEnabled ? '✅' : '—') + '</td>' +
        '<td>' + actionCells + '</td>' +
        '</tr>';
    }).join('');

    const usersTable = [
      '<div class="card" style="margin-bottom:1.5rem;">',
        '<div class="card-header"><h3 class="card-title">Registre des Utilisateurs — Accès par Module (DEFAULT DENY)</h3></div>',
        '<div style="overflow-x:auto;">',
          '<table class="user-table">',
            '<thead><tr>',
              '<th>Av.</th><th>Identifiant</th><th>Nom d\'affichage</th><th>Rôle</th>',
              '<th>Entité</th><th>Statut</th><th>Modules</th><th>Dernière connexion</th><th>MFA</th><th>Actions</th>',
            '</tr></thead>',
            '<tbody>' + usersTableRows + '</tbody>',
          '</table>',
        '</div>',
      '</div>'
    ].join('');

    const auditHtml = IAM.hasPermission('logs.view') ? [
      '<div class="card" style="margin-bottom:1.5rem;">',
        '<div class="card-header"><h3 class="card-title">📋 Journal d\'Audit — 50 Dernières Actions</h3></div>',
        '<div style="max-height:320px;overflow-y:auto;padding:0 0.5rem;">',
          auditLog.length === 0 ? '<p style="color:#64748b;text-align:center;padding:2rem;">Aucune entrée.</p>' :
          auditLog.slice(0, 50).map(function(entry) {
            const dot = entry.result === 'SUCCÈS' ? 'green' : entry.result === 'ÉCHEC' ? 'red' : entry.result === 'BLOQUÉ' ? 'amber' : 'blue';
            return '<div class="audit-log-item">' +
              '<div class="audit-dot ' + dot + '"></div>' +
              '<div style="flex:1;"><div class="audit-log-action"><strong>' + entry.action + '</strong>' + (entry.detail ? ' — ' + entry.detail : '') + '</div>' +
              '<div class="audit-log-user">' + entry.userId + ' · ' + (entry.ip || '') + '</div></div>' +
              '<div class="audit-log-time">' + entry.ts + '</div></div>';
          }).join(''),
        '</div>',
      '</div>'
    ].join('') : '';

    const modalHtml = canCreate ? [
      '<div id="iam-modal" style="display:none;position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);align-items:center;justify-content:center;">',
        '<div style="background:rgba(17,24,39,0.97);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:2rem;width:90%;max-width:480px;box-shadow:0 24px 60px rgba(0,0,0,0.6);">',
          '<h3 style="font-family:Outfit,sans-serif;font-size:1.2rem;margin-bottom:1.5rem;">Créer un utilisateur</h3>',
          '<form id="iam-user-form">',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">',
              '<div><label style="font-size:0.75rem;color:#94a3b8;display:block;margin-bottom:4px;">Identifiant *</label><input type="text" id="iam-input-username" class="auth-input" required></div>',
              '<div><label style="font-size:0.75rem;color:#94a3b8;display:block;margin-bottom:4px;">Nom d\'affichage *</label><input type="text" id="iam-input-displayname" class="auth-input" required></div>',
            '</div>',
            '<div style="margin-bottom:1rem;"><label style="font-size:0.75rem;color:#94a3b8;display:block;margin-bottom:4px;">E-mail *</label><input type="email" id="iam-input-email" class="auth-input" required></div>',
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem;">',
              '<div><label style="font-size:0.75rem;color:#94a3b8;display:block;margin-bottom:4px;">Rôle</label><select id="iam-input-role" class="auth-input"><option value="operateur">OPÉRATEUR</option><option value="superviseur">SUPERVISEUR</option><option value="admin">ADMIN</option>' + (IAM.hasPermission('roles.assign_root') ? '<option value="root">ROOT</option>' : '') + '</select></div>',
              '<div><label style="font-size:0.75rem;color:#94a3b8;display:block;margin-bottom:4px;">Entité</label><select id="iam-input-entity" class="auth-input"><option value="consolidated">Consolidé</option><option value="ferme">Ferme Guilmey</option><option value="soratrad">SORATRAD Farcha</option></select></div>',
            '</div>',
            '<div style="margin-bottom:1rem;"><label style="font-size:0.75rem;color:#94a3b8;display:block;margin-bottom:4px;">Mot de passe initial *</label><input type="password" id="iam-input-password" class="auth-input" placeholder="Min. 10 car., maj., chiffre, spécial" required></div>',
            '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;"><input type="checkbox" id="iam-input-mfa"><label for="iam-input-mfa" style="font-size:0.82rem;color:#94a3b8;cursor:pointer;">Activer MFA à la connexion</label></div>',
            '<div id="iam-form-alert" style="display:none;margin-bottom:1rem;padding:0.6rem 1rem;border-radius:6px;font-size:0.8rem;background:rgba(239,68,68,0.12);border-left:3px solid #ef4444;color:#fca5a5;"></div>',
            '<div style="display:flex;gap:0.75rem;justify-content:flex-end;">',
              '<button type="button" class="btn btn-secondary btn-sm" onclick="window.iamActions.closeModal()">Annuler</button>',
              '<button type="submit" class="btn btn-primary btn-sm">Créer l\'utilisateur</button>',
            '</div>',
          '</form>',
        '</div>',
      '</div>'
    ].join('') : '';

    // Module access management modal
    const moduleModalHtml = canGrantModules ? [
      '<div id="iam-module-modal" style="display:none;position:fixed;inset:0;z-index:9100;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);align-items:flex-start;justify-content:center;padding-top:5vh;">',
        '<div style="background:rgba(15,23,42,0.98);border:1px solid rgba(255,255,255,0.1);border-radius:18px;padding:2rem;width:94%;max-width:640px;box-shadow:0 32px 80px rgba(0,0,0,0.7);max-height:88vh;overflow-y:auto;">',
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;">',
            '<h3 style="font-family:Outfit,sans-serif;font-size:1.15rem;">🔑 Gestion des Accès Modules</h3>',
            '<button onclick="window.iamActions.closeModuleModal()" style="background:none;border:none;color:#64748b;font-size:1.2rem;cursor:pointer;">✕</button>',
          '</div>',
          '<div id="iam-module-target-info" style="margin-bottom:1rem;padding:0.75rem 1rem;background:rgba(2,132,199,0.08);border:1px solid rgba(2,132,199,0.2);border-radius:8px;font-size:0.85rem;color:#94a3b8;"></div>',
          '<div style="margin-bottom:0.75rem;display:flex;gap:0.5rem;flex-wrap:wrap;">',
            '<button onclick="window.iamActions.selectAllModules(true)" style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#10b981;padding:4px 12px;border-radius:6px;font-size:0.78rem;cursor:pointer;">✓ Tout cocher</button>',
            '<button onclick="window.iamActions.selectAllModules(false)" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#ef4444;padding:4px 12px;border-radius:6px;font-size:0.78rem;cursor:pointer;">✗ Tout décocher</button>',
          '</div>',
          '<div id="iam-module-checkboxes" style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:1.5rem;"></div>',
          '<div style="display:flex;gap:0.75rem;justify-content:flex-end;">',
            '<button onclick="window.iamActions.closeModuleModal()" class="btn btn-secondary btn-sm">Annuler</button>',
            '<button onclick="window.iamActions.saveModuleAccess()" class="btn btn-primary btn-sm">💾 Enregistrer les accès</button>',
          '</div>',
        '</div>',
      '</div>'
    ].join('') : '';

    container.innerHTML = statsHtml + actionBtns + usersTable + auditHtml + modalHtml + moduleModalHtml;

    // Bind create user modal form
    const iamForm = document.getElementById('iam-user-form');
    if (iamForm) {
      iamForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const alertEl = document.getElementById('iam-form-alert');
        const data = {
          username:    (document.getElementById('iam-input-username') || {}).value.trim(),
          displayName: (document.getElementById('iam-input-displayname') || {}).value.trim(),
          email:       (document.getElementById('iam-input-email') || {}).value.trim(),
          role:        (document.getElementById('iam-input-role') || {}).value,
          entity:      (document.getElementById('iam-input-entity') || {}).value,
          password:    (document.getElementById('iam-input-password') || {}).value,
          mfaEnabled:  (document.getElementById('iam-input-mfa') || {}).checked,
          avatar:      '👤'
        };
        const result = IAM.createUser(data, me.id);
        if (!result.success) {
          if (alertEl) { alertEl.textContent = result.reason; alertEl.style.display = 'block'; }
          return;
        }
        window.iamActions.closeModal();
        renderIAMPanel();
      });
    }
  }

  // IAM actions namespace (for inline onclick)
  window.iamActions = {
    _moduleTargetUserId: null,

    openAddUser: function() {
      const modal = document.getElementById('iam-modal');
      if (modal) modal.style.display = 'flex';
    },
    closeModal: function() {
      const modal = document.getElementById('iam-modal');
      if (modal) modal.style.display = 'none';
    },
    toggleLock: function(userId) {
      const me = IAM.getCurrentUser();
      if (!me) return;
      const result = IAM.toggleLock(userId, me.id);
      if (!result.success) { alert('Erreur : ' + result.reason); return; }
      renderIAMPanel();
    },
    openEditRole: function(userId, currentRole) {
      const opts = ['operateur', 'superviseur', 'admin'];
      if (IAM.hasPermission('roles.assign_root')) opts.push('root');
      const newRole = prompt('Rôles disponibles: ' + opts.map(function(r) { return r.toUpperCase(); }).join(', ') + '\n\nNouveau rôle :', currentRole);
      if (!newRole || newRole.toLowerCase() === currentRole) return;
      const me = IAM.getCurrentUser();
      const result = IAM.assignRole(userId, newRole.toLowerCase(), me ? me.id : 'system');
      if (!result.success) { alert('Erreur : ' + result.reason); return; }
      renderIAMPanel();
    },
    deleteUser: function(userId, username) {
      if (!confirm('⚠️ Supprimer définitivement l\'utilisateur "' + username + '" ?\n\nCette action est irréversible.')) return;
      const me = IAM.getCurrentUser();
      const result = IAM.deleteUser(userId, me ? me.id : 'system');
      if (!result.success) { alert('Erreur : ' + result.reason); return; }
      renderIAMPanel();
    },
    manageModules: function(userId, username) {
      this._moduleTargetUserId = userId;
      const modal = document.getElementById('iam-module-modal');
      if (!modal) return;
      const info = document.getElementById('iam-module-target-info');
      const checkboxes = document.getElementById('iam-module-checkboxes');
      if (info) info.innerHTML = '👤 Gestion des modules pour : <strong style="color:#f8fafc;">' + username + '</strong><br><small style="color:#64748b;">Cochez les modules auxquels cet utilisateur doit avoir accès.</small>';
      const userModules = IAM.getUserModules(userId);
      if (checkboxes) {
        checkboxes.innerHTML = MODULE_CATALOG.map(function(mod) {
          const checked = userModules.includes(mod.id) ? 'checked' : '';
          const sectionColor = { PILOTAGE: '#10b981', FERME: '#f59e0b', 'DÉCHETS': '#a78bfa', GESTION: '#60a5fa' }[mod.section] || '#94a3b8';
          return '<label style="display:flex;align-items:center;gap:0.6rem;padding:0.55rem 0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:8px;cursor:pointer;transition:background 0.15s;">' +
            '<input type="checkbox" id="mod-cb-' + mod.id + '" data-module="' + mod.id + '" ' + checked + ' style="accent-color:#10b981;width:15px;height:15px;">' +
            '<span style="font-size:1rem;">' + mod.icon + '</span>' +
            '<span style="font-size:0.8rem;color:#e2e8f0;flex:1;">' + mod.label + '</span>' +
            '<span style="font-size:0.62rem;font-weight:700;padding:1px 6px;border-radius:3px;background:' + sectionColor + '22;color:' + sectionColor + ';border:1px solid ' + sectionColor + '44;">' + mod.section + '</span>' +
            '</label>';
        }).join('');
      }
      modal.style.display = 'flex';
    },
    closeModuleModal: function() {
      const modal = document.getElementById('iam-module-modal');
      if (modal) modal.style.display = 'none';
      this._moduleTargetUserId = null;
    },
    selectAllModules: function(checked) {
      document.querySelectorAll('#iam-module-checkboxes input[type="checkbox"]').forEach(function(cb) { cb.checked = checked; });
    },
    saveModuleAccess: function() {
      const userId = this._moduleTargetUserId;
      if (!userId) return;
      const me = IAM.getCurrentUser();
      if (!me) return;
      const checkedIds = [];
      const uncheckedIds = [];
      document.querySelectorAll('#iam-module-checkboxes input[data-module]').forEach(function(cb) {
        if (cb.checked) checkedIds.push(cb.getAttribute('data-module'));
        else uncheckedIds.push(cb.getAttribute('data-module'));
      });
      // Revoke all first, then grant checked ones
      if (uncheckedIds.length > 0) IAM.revokeModuleAccess(userId, uncheckedIds, me.id);
      if (checkedIds.length > 0) {
        const result = IAM.grantModuleAccess(userId, checkedIds, me.id);
        if (!result.success) { alert('Erreur : ' + result.reason); return; }
      }
      this.closeModuleModal();
      renderIAMPanel();
      // Also re-apply RBAC enforcement live if the target user is the current session
      // (they'll see changes on next login or page refresh)
    },
    refreshPanel: function() { renderIAMPanel(); }
  };

  // =========================================================================
  // 9. INITIALIZATION ROUTER
  // =========================================================================

  function init() {
    const onAuthPage = !!document.getElementById('screen-login');
    const onAppPage = !!document.querySelector('.app-header');

    if (onAuthPage) {
      initAuthPage();
    } else if (onAppPage) {
      initAppGuard();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API (auth.html uses this)
  window.authApp = {
    fillDemo: function(role) {
      const map = {
        root:        { u: 'root',        p: 'Root@2024!' },
        admin:       { u: 'admin',       p: 'Admin@2024!' },
        superviseur: { u: 'superviseur', p: 'Super@2024!' },
        operateur:   { u: 'operateur',   p: 'Oper@2024!' }
      };
      const creds = map[role];
      if (!creds) return;
      const uInp = document.getElementById('login-username');
      const pInp = document.getElementById('login-password');
      if (uInp) uInp.value = creds.u;
      if (pInp) pInp.value = creds.p;
    },
    IAM: IAM,
    renderIAMPanel: renderIAMPanel
  };

  // Expose unconditionally for global access
  window.agrocircularIAM = IAM;
  window.renderIAMPanel = renderIAMPanel;

})();
