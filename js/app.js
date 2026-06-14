// ===== KESF APP CONTROLLER =====

const APP = (() => {

  function init() {
    ROUTER.register('/', () => PAGES.renderHome());
    ROUTER.register('/explore', params => PAGES.renderExplore(params));
    ROUTER.register('/cities', () => PAGES.renderCities());
    ROUTER.register('/city/:id', params => PAGES.renderCity(params));
    ROUTER.register('/place/:id', params => PAGES.renderPlace(params));
    ROUTER.register('/profile', () => PAGES.renderProfile());
    ROUTER.register('/saved', () => PAGES.renderSaved());
    ROUTER.register('/dashboard', () => PAGES.renderDashboard());
    ROUTER.register('/business/register', () => PAGES.renderBusinessRegister());

    ROUTER.init();
    const redirectPath = sessionStorage.getItem('kesf_redirect_path');
    if (redirectPath) {
      sessionStorage.removeItem('kesf_redirect_path');
      ROUTER.navigate(redirectPath, true);
    } else {
      ROUTER.navigate(location.pathname + location.search, false);
    }

    window.addEventListener('kesf:logout', () => ROUTER.navigate('/'));

    document.addEventListener('click', e => {
      const menu = document.getElementById('user-dropdown');
      if (menu && !e.target.closest('.nav-user-menu')) menu.classList.remove('open');
    });
  }

  // ===== SEARCH =====
  function doSearch(query) {
    if (!query || !query.trim()) return;
    const q = query.trim();
    const cityMatch = CITIES.find(c =>
      q.toLowerCase().includes(c.name.toLowerCase()) ||
      q.toLowerCase().includes(c.nameAz.toLowerCase())
    );
    const catMatch = CATEGORIES.find(c =>
      q.toLowerCase().includes(c.label.toLowerCase()) ||
      q.toLowerCase().includes(c.id.toLowerCase())
    );
    let path = `/explore?q=${encodeURIComponent(q)}`;
    if (cityMatch) path += `&city=${cityMatch.id}`;
    if (catMatch) path += `&category=${catMatch.id}`;
    ROUTER.navigate(path);
  }

  // ===== FILTERS =====
  function applyFilter(key, value) {
    const route = ROUTER.getCurrentRoute();
    const params = { ...(route ? route.params : {}) };
    if (value) { params[key] = value; } else { delete params[key]; }
    delete params.q;
    const query = Object.entries(params).filter(([,v])=>v).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    ROUTER.navigate(`/explore${query ? '?'+query : ''}`);
  }

  function clearFilters() { ROUTER.navigate('/explore'); }

  function toggleFilters() {
    const sidebar = document.getElementById('filters-sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  }

  // ===== BOOKMARKS =====
  function toggleBookmark(placeId, btn) {
    const result = AUTH.toggleBookmark(placeId);
    if (result.error) {
      COMPONENTS.toast('Please log in to save places', 'info');
      showLogin();
      return;
    }
    if (btn) {
      const isDetail = btn.classList.contains('bookmark-btn-large');
      if (isDetail) {
        btn.textContent = result.bookmarked ? '♥ Saved' : '♡ Save';
      } else {
        btn.textContent = result.bookmarked ? '♥' : '♡';
      }
      btn.classList.toggle('active', result.bookmarked);
    }
    COMPONENTS.toast(result.bookmarked ? 'Place saved! ♥' : 'Removed from saved', result.bookmarked ? 'success' : 'info');
  }

  // ===== REVIEWS =====
  function showReviewModal(placeId) {
    if (!AUTH.getSession()) { showLogin(); return; }
    COMPONENTS.resetRating();
    COMPONENTS.modal(
      'Write a Review',
      `<div class="review-form">
        <label>Your Rating</label>
        <div class="star-selector">${COMPONENTS.starRating(0, true)}</div>
        <label>Your Review</label>
        <textarea id="review-text" placeholder="Share your experience..." class="form-input review-textarea" maxlength="500"></textarea>
        <span class="char-count" id="char-count">0 / 500</span>
        <div id="review-error" class="form-error hidden"></div>
      </div>`,
      `<button onclick="APP.submitReview(${placeId})" class="btn-primary">SUBMIT REVIEW</button>
       <button onclick="COMPONENTS.closeModal()" class="btn-outline">Cancel</button>`
    );
    const ta = document.getElementById('review-text');
    if (ta) ta.addEventListener('input', () => {
      document.getElementById('char-count').textContent = `${ta.value.length} / 500`;
    });
  }

  function submitReview(placeId) {
    const rating = COMPONENTS.getSelectedRating();
    const text = document.getElementById('review-text')?.value || '';
    const user = AUTH.getCurrentUser();
    const errEl = document.getElementById('review-error');
    if (!rating) { errEl.textContent='Please select a star rating'; errEl.classList.remove('hidden'); return; }
    if (!text || text.trim().length < 10) { errEl.textContent='Review must be at least 10 characters'; errEl.classList.remove('hidden'); return; }
    const result = AUTH.addReview(placeId, rating, text, user.name);
    if (result.error) { errEl.textContent=result.error; errEl.classList.remove('hidden'); return; }
    COMPONENTS.closeModal();
    COMPONENTS.toast('Review submitted! Thank you.', 'success');
    setTimeout(() => PAGES.renderPlace({ id: placeId }), 300);
  }

  // ===== AUTH MODALS =====
  function showLogin() {
    COMPONENTS.modal('', `
      <div class="auth-modal">
        <div class="auth-logo-sm"><span class="logo-mark">◈</span> KESF</div>
        <h2 class="auth-modal-title">Welcome back</h2>
        <p class="auth-modal-sub">Log in to save places and write reviews.</p>
        <div class="form-group"><label>Email</label><input type="email" id="login-email" placeholder="you@example.com" class="form-input" onkeydown="if(event.key==='Enter')APP.doLogin()"></div>
        <div class="form-group"><label>Password</label><input type="password" id="login-password" placeholder="Your password" class="form-input" onkeydown="if(event.key==='Enter')APP.doLogin()"></div>
        <div id="login-error" class="form-error hidden"></div>
        <button onclick="APP.doLogin()" class="btn-primary btn-block">LOG IN →</button>
        <p class="auth-switch">Don't have an account? <button onclick="COMPONENTS.closeModal();APP.showRegister()" class="link-btn">Sign up free</button></p>
        <div class="auth-divider"><span>OR</span></div>
        <p class="auth-switch">Own a business? <button onclick="COMPONENTS.closeModal();ROUTER.navigate('/business/register')" class="link-btn">Register as a business →</button></p>
      </div>`
    );
    setTimeout(() => document.getElementById('login-email')?.focus(), 150);
  }

  function doLogin() {
    const email = document.getElementById('login-email')?.value || '';
    const password = document.getElementById('login-password')?.value || '';
    const errEl = document.getElementById('login-error');
    const result = AUTH.loginUser(email, password);
    if (result.error) { errEl.textContent=result.error; errEl.classList.remove('hidden'); return; }
    COMPONENTS.closeModal();
    COMPONENTS.toast(`Welcome back, ${result.user.name}!`, 'success');
    const route = ROUTER.getCurrentRoute();
    if (route) ROUTER.navigate(route.path, false);
    else ROUTER.navigate('/');
  }

  function showRegister() {
    COMPONENTS.modal('', `
      <div class="auth-modal">
        <div class="auth-logo-sm"><span class="logo-mark">◈</span> KESF</div>
        <h2 class="auth-modal-title">Join Kesf</h2>
        <p class="auth-modal-sub">Discover and review the best places in Azerbaijan.</p>
        <div class="form-group"><label>Your Name</label><input type="text" id="reg-name" placeholder="Your full name" class="form-input"></div>
        <div class="form-group"><label>Email</label><input type="email" id="reg-email" placeholder="you@example.com" class="form-input"></div>
        <div class="form-group"><label>Password</label><input type="password" id="reg-password" placeholder="Min. 8 characters with numbers" class="form-input" onkeydown="if(event.key==='Enter')APP.doRegister()"></div>
        <div id="reg-error" class="form-error hidden"></div>
        <button onclick="APP.doRegister()" class="btn-primary btn-block">CREATE ACCOUNT →</button>
        <p class="auth-switch">Already have an account? <button onclick="COMPONENTS.closeModal();APP.showLogin()" class="link-btn">Log in</button></p>
        <div class="auth-divider"><span>OR</span></div>
        <p class="auth-switch">Own a business? <button onclick="COMPONENTS.closeModal();ROUTER.navigate('/business/register')" class="link-btn">Register as a business →</button></p>
      </div>`
    );
    setTimeout(() => document.getElementById('reg-name')?.focus(), 150);
  }

  function doRegister() {
    const name = document.getElementById('reg-name')?.value || '';
    const email = document.getElementById('reg-email')?.value || '';
    const password = document.getElementById('reg-password')?.value || '';
    const errEl = document.getElementById('reg-error');
    const result = AUTH.registerUser({ name, email, password, userType:'user' });
    if (result.error) { errEl.textContent=result.error; errEl.classList.remove('hidden'); return; }
    COMPONENTS.closeModal();
    COMPONENTS.toast(`Welcome to Kesf, ${result.user.name}! 🎉`, 'success');
    const route = ROUTER.getCurrentRoute();
    if (route) ROUTER.navigate(route.path, false);
    else ROUTER.navigate('/');
  }

  function registerBusiness() {
    const name = document.getElementById('biz-name')?.value || '';
    const email = document.getElementById('biz-email')?.value || '';
    const password = document.getElementById('biz-password')?.value || '';
    const businessName = document.getElementById('biz-bname')?.value || '';
    const businessCategory = document.getElementById('biz-bcat')?.value || '';
    const businessCity = document.getElementById('biz-bcity')?.value || '';
    const errEl = document.getElementById('biz-error');
    const result = AUTH.registerUser({ name, email, password, userType:'business', businessName, businessCategory, businessCity });
    if (result.error) { errEl.textContent=result.error; errEl.classList.remove('hidden'); return; }
    COMPONENTS.toast('Business account created! 🎉', 'success');
    ROUTER.navigate('/dashboard');
  }

  // ===== USER MENU =====
  function toggleUserMenu(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) dropdown.classList.toggle('open');
  }

  function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('open');
  }

  function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.remove('open');
  }

  // ===== PROFILE =====
  function switchProfileTab(tab, btn) {
    document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.add('hidden'));
    if (btn) btn.classList.add('active');
    document.getElementById(`profile-tab-${tab}`)?.classList.remove('hidden');
  }

  function updateProfile() {
    const name = document.getElementById('settings-name')?.value || '';
    const errEl = document.getElementById('settings-error');
    const result = AUTH.updateUserName(name);
    if (result.error) { errEl.textContent=result.error; errEl.classList.remove('hidden'); return; }
    errEl.classList.add('hidden');
    COMPONENTS.toast('Profile updated!', 'success');
    PAGES.renderProfile();
  }

  function saveBusiness() {
    const errEl = document.getElementById('dash-error');
    const result = AUTH.updateBusinessInfo({
      businessName: document.getElementById('dash-bname')?.value,
      businessCategory: document.getElementById('dash-bcat')?.value,
      businessCity: document.getElementById('dash-bcity')?.value,
      businessAddress: document.getElementById('dash-baddr')?.value,
      businessPhone: document.getElementById('dash-bphone')?.value,
      businessDescription: document.getElementById('dash-bdesc')?.value,
    });
    if (result.error) { errEl.textContent=result.error; errEl.classList.remove('hidden'); return; }
    errEl.classList.add('hidden');
    COMPONENTS.toast('Business info saved!', 'success');
    PAGES.renderDashboard();
  }

  // ===== UTILITIES =====
  function openMaps(lat, lng, name) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  }

  function copyLink() {
    navigator.clipboard.writeText(location.href).then(() => COMPONENTS.toast('Link copied!', 'success')).catch(() => COMPONENTS.toast('Could not copy link', 'error'));
  }

  function shareWhatsApp(name) {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check out ${name} on Kesf: ${location.href}`)}`, '_blank');
  }

  return {
    init, doSearch, applyFilter, clearFilters, toggleFilters,
    toggleBookmark, showReviewModal, submitReview,
    showLogin, doLogin, showRegister, doRegister, registerBusiness,
    toggleUserMenu, toggleMobileMenu, closeMobileMenu,
    switchProfileTab, updateProfile, saveBusiness,
    openMaps, copyLink, shareWhatsApp,
  };
})();
