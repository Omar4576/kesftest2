// ===== KESF AUTH SYSTEM =====

const AUTH = (() => {
  const STORAGE_KEYS = {
    USERS: 'kesf_users',
    SESSION: 'kesf_session',
    REVIEWS: 'kesf_reviews',
    BOOKMARKS: 'kesf_bookmarks',
    RATE_LIMIT: 'kesf_rate_limit',
  };

  function hashPassword(password) {
    let hash = 0;
    const salt = 'kesf_salt_2024_az';
    const str = password + salt;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0') + str.length.toString(16);
  }

  function checkRateLimit(identifier) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RATE_LIMIT) || '{}';
      const limits = JSON.parse(raw);
      const now = Date.now();
      const window = 15 * 60 * 1000;
      if (!limits[identifier]) limits[identifier] = { attempts: 0, firstAttempt: now };
      if (now - limits[identifier].firstAttempt > window) {
        limits[identifier] = { attempts: 0, firstAttempt: now };
      }
      limits[identifier].attempts++;
      localStorage.setItem(STORAGE_KEYS.RATE_LIMIT, JSON.stringify(limits));
      return limits[identifier].attempts <= 5;
    } catch(e) { return true; }
  }

  function resetRateLimit(identifier) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.RATE_LIMIT) || '{}';
      const limits = JSON.parse(raw);
      delete limits[identifier];
      localStorage.setItem(STORAGE_KEYS.RATE_LIMIT, JSON.stringify(limits));
    } catch(e) {}
  }

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'); } catch(e) { return []; }
  }

  function saveUsers(users) {
    try { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); } catch(e) {}
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>"']/g, '').substring(0, 200);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(password) {
    if (!password || password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Za-z]/.test(password)) return 'Password must contain letters';
    if (!/[0-9]/.test(password)) return 'Password must contain numbers';
    return null;
  }

  // ===== SESSION =====
  function createSession(userId, userType) {
    const session = {
      userId,
      userType,
      token: generateId() + generateId(),
      created: Date.now(),
      expires: Date.now() + (7 * 24 * 60 * 60 * 1000),
    };
    try { localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session)); } catch(e) {}
    return session;
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (Date.now() > session.expires) { logout(); return null; }
      return session;
    } catch(e) { return null; }
  }

  function getCurrentUser() {
    const session = getSession();
    if (!session) return null;
    const users = getUsers();
    return users.find(u => u.id === session.userId) || null;
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function logout() {
    try { localStorage.removeItem(STORAGE_KEYS.SESSION); } catch(e) {}
    window.dispatchEvent(new CustomEvent('kesf:logout'));
  }

  // ===== REGISTER =====
  function registerUser(data) {
    const { name, email, password, userType = 'user', businessName, businessCategory, businessCity } = data;
    if (!name || sanitize(name).length < 2) return { error: 'Name must be at least 2 characters' };
    if (!validateEmail(email)) return { error: 'Invalid email address' };
    const pwError = validatePassword(password);
    if (pwError) return { error: pwError };

    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'Email already registered' };
    }

    const user = {
      id: generateId(),
      name: sanitize(name),
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      userType,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ef6f2e&color=fff&size=128`,
      created: Date.now(),
      reviewCount: 0,
    };

    if (userType === 'business') {
      if (!businessName || businessName.length < 2) return { error: 'Business name required' };
      user.businessName = sanitize(businessName);
      user.businessCategory = businessCategory || 'restaurant';
      user.businessCity = businessCity || 'baku';
      user.businessId = generateId();
      user.businessAddress = '';
      user.businessPhone = '';
      user.businessDescription = '';
      user.verified = false;
    }

    users.push(user);
    saveUsers(users);
    const session = createSession(user.id, userType);
    window.dispatchEvent(new CustomEvent('kesf:login', { detail: { user, session } }));
    return { success: true, user, session };
  }

  // ===== LOGIN =====
  function loginUser(email, password) {
    if (!checkRateLimit(email)) {
      return { error: 'Too many attempts. Please wait 15 minutes.' };
    }
    if (!validateEmail(email)) return { error: 'Invalid email address' };
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordHash !== hashPassword(password)) {
      return { error: 'Invalid email or password' };
    }
    resetRateLimit(email);
    const session = createSession(user.id, user.userType);
    window.dispatchEvent(new CustomEvent('kesf:login', { detail: { user, session } }));
    return { success: true, user, session };
  }

  // ===== REVIEWS =====
  function getReviews() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]'); } catch(e) { return []; }
  }

  function addReview(placeId, rating, text, userName) {
    const session = getSession();
    if (!session) return { error: 'Must be logged in' };
    const reviews = getReviews();
    if (reviews.find(r => r.placeId == placeId && r.userId === session.userId)) {
      return { error: 'You already reviewed this place' };
    }
    const review = {
      id: generateId(),
      placeId: parseInt(placeId),
      userId: session.userId,
      userName: sanitize(userName),
      rating: Math.max(1, Math.min(5, parseInt(rating))),
      text: sanitize(text).substring(0, 500),
      date: Date.now(),
      helpful: 0,
    };
    reviews.push(review);
    try { localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews)); } catch(e) {}
    const users = getUsers();
    const user = users.find(u => u.id === session.userId);
    if (user) { user.reviewCount = (user.reviewCount || 0) + 1; saveUsers(users); }
    return { success: true, review };
  }

  function getReviewsForPlace(placeId) {
    return getReviews().filter(r => r.placeId == placeId).sort((a, b) => b.date - a.date);
  }

  // ===== BOOKMARKS =====
  function getBookmarks() {
    const session = getSession();
    if (!session) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || '{}';
      const all = JSON.parse(raw);
      return all[session.userId] || [];
    } catch(e) { return []; }
  }

  function isBookmarked(placeId) {
    return getBookmarks().includes(parseInt(placeId));
  }

  function toggleBookmark(placeId) {
    const session = getSession();
    if (!session) return { error: 'Must be logged in' };
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS) || '{}';
      const all = JSON.parse(raw);
      if (!all[session.userId]) all[session.userId] = [];
      const idx = all[session.userId].indexOf(parseInt(placeId));
      let bookmarked;
      if (idx === -1) {
        all[session.userId].push(parseInt(placeId));
        bookmarked = true;
      } else {
        all[session.userId].splice(idx, 1);
        bookmarked = false;
      }
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(all));
      return { success: true, bookmarked };
    } catch(e) { return { error: 'Storage error' }; }
  }

  // ===== BUSINESS UPDATE =====
  function updateBusinessInfo(data) {
    const session = getSession();
    if (!session) return { error: 'Not logged in' };
    const users = getUsers();
    const user = users.find(u => u.id === session.userId);
    if (!user) return { error: 'User not found' };
    if (data.businessName) user.businessName = sanitize(data.businessName);
    if (data.businessCategory) user.businessCategory = data.businessCategory;
    if (data.businessCity) user.businessCity = data.businessCity;
    if (data.businessAddress !== undefined) user.businessAddress = sanitize(data.businessAddress);
    if (data.businessPhone !== undefined) user.businessPhone = sanitize(data.businessPhone);
    if (data.businessDescription !== undefined) user.businessDescription = sanitize(data.businessDescription).substring(0, 500);
    saveUsers(users);
    return { success: true };
  }

  function updateUserName(name) {
    const session = getSession();
    if (!session) return { error: 'Not logged in' };
    const users = getUsers();
    const user = users.find(u => u.id === session.userId);
    if (!user) return { error: 'User not found' };
    const cleaned = sanitize(name);
    if (cleaned.length < 2) return { error: 'Name too short' };
    user.name = cleaned;
    user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleaned)}&background=ef6f2e&color=fff&size=128`;
    saveUsers(users);
    return { success: true };
  }

  return {
    getSession, getCurrentUser, isLoggedIn, logout,
    registerUser, loginUser,
    getReviews, addReview, getReviewsForPlace,
    getBookmarks, isBookmarked, toggleBookmark,
    updateBusinessInfo, updateUserName,
    sanitize,
  };
})();
