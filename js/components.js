// ===== KESF COMPONENTS =====

const COMPONENTS = (() => {

  function getCategoryLabel(catId) {
    const cats = { restaurant:'Restaurant', teahouse:'Tea House', sports:'Sports', hotel:'Hotel', nightlife:'Nightlife', kids:'Kids & Family', cinema:'Cinema', carwash:'Car Wash', activity:'Activity' };
    return cats[catId] || catId;
  }

  function starRating(rating, interactive = false) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let html = '<span class="stars">';
    for (let i = 1; i <= 5; i++) {
      const filled = i <= full;
      const isHalf = !filled && i === full + 1 && half;
      if (interactive) {
        html += `<span class="star star-interactive" data-val="${i}" onclick="COMPONENTS._onStarClick(${i},this)">★</span>`;
      } else {
        html += `<span class="star ${filled ? 'filled' : isHalf ? 'half' : ''}">★</span>`;
      }
    }
    html += '</span>';
    return html;
  }

  let _selectedRating = 0;
  function _onStarClick(val, el) {
    _selectedRating = val;
    const container = el.parentElement;
    container.querySelectorAll('.star').forEach((s, idx) => {
      s.classList.toggle('filled', idx < val);
    });
  }
  function getSelectedRating() { return _selectedRating; }
  function resetRating() { _selectedRating = 0; }

  function placeCard(place, compact = false) {
    const bookmarked = AUTH.isBookmarked(place.id);
    const img = place.photos && place.photos[0]
      ? `<img src="${place.photos[0]}" alt="${place.name}" onerror="this.parentElement.innerHTML='<div class=\\'card-img-placeholder\\'>${place.image}</div>'">`
      : `<div class="card-img-placeholder">${place.image}</div>`;

    if (compact) {
      return `
        <div class="place-card compact" onclick="ROUTER.navigate('/place/${place.id}')" data-id="${place.id}">
          <div class="card-img-wrap">${img}</div>
          <div class="card-body">
            <div class="card-top">
              <span class="category-badge">${getCategoryLabel(place.category)}</span>
              ${place.verified ? '<span class="verified-dot" title="Verified">✓</span>' : ''}
            </div>
            <h3 class="card-name">${place.name}</h3>
            <div class="card-meta">
              ${starRating(place.rating)}
              <span class="rating-num">${place.rating}</span>
              <span class="review-count">(${place.reviews})</span>
              <span class="price">${place.price}</span>
            </div>
            <p class="card-city">${place.city.charAt(0).toUpperCase() + place.city.slice(1)}</p>
          </div>
        </div>`;
    }

    return `
      <div class="place-card" onclick="ROUTER.navigate('/place/${place.id}')" data-id="${place.id}">
        <div class="card-img-wrap">
          ${img}
          <button class="bookmark-btn ${bookmarked ? 'active' : ''}" onclick="event.stopPropagation();APP.toggleBookmark(${place.id},this)" title="Save">
            ${bookmarked ? '♥' : '♡'}
          </button>
          ${place.popular ? '<span class="popular-tag">Popular</span>' : ''}
        </div>
        <div class="card-body">
          <div class="card-top">
            <span class="category-badge">${getCategoryLabel(place.category)}</span>
            ${place.verified ? '<span class="verified-dot" title="Verified">✓</span>' : ''}
          </div>
          <h3 class="card-name">${place.name}</h3>
          <div class="card-meta">
            ${starRating(place.rating)}
            <span class="rating-num">${place.rating}</span>
            <span class="review-count">(${place.reviews} reviews)</span>
          </div>
          <p class="card-desc">${place.description.substring(0, 100)}...</p>
          <div class="card-footer">
            <span class="price-tag">${place.price}</span>
            <span class="hours-tag">${place.hours}</span>
          </div>
        </div>
      </div>`;
  }

  function toast(message, type = 'success', duration = 3000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('toast-show'), 10);
    setTimeout(() => { t.classList.remove('toast-show'); setTimeout(() => t.remove(), 300); }, duration);
  }

  function modal(title, content, actions = '') {
    closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box" role="dialog" aria-modal="true">
        ${title ? `<div class="modal-header"><h2 class="modal-title">${title}</h2><button class="modal-close" onclick="COMPONENTS.closeModal()" aria-label="Close">✕</button></div>` : `<div class="modal-header modal-header-slim"><button class="modal-close" onclick="COMPONENTS.closeModal()" aria-label="Close">✕</button></div>`}
        <div class="modal-body">${content}</div>
        ${actions ? `<div class="modal-actions">${actions}</div>` : ''}
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    setTimeout(() => overlay.classList.add('modal-open'), 10);
    return overlay;
  }

  function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
      overlay.classList.remove('modal-open');
      setTimeout(() => { overlay.remove(); document.body.style.overflow = ''; }, 300);
    }
  }

  function loadingSpinner() {
    return `<div class="loading-wrap"><div class="spinner"></div><p>Loading...</p></div>`;
  }

  function emptyState(icon, title, subtitle, action = '') {
    return `<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${title}</h3><p>${subtitle}</p>${action}</div>`;
  }

  function reviewCard(review) {
    const date = new Date(review.date).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
    return `
      <div class="review-card">
        <div class="review-header">
          <div class="reviewer-avatar">${review.userName.charAt(0).toUpperCase()}</div>
          <div class="reviewer-info">
            <strong>${review.userName}</strong>
            <span class="review-date">${date}</span>
          </div>
          <div class="review-rating">${starRating(review.rating)}</div>
        </div>
        <p class="review-text">${review.text}</p>
      </div>`;
  }

  function navBar() {
    const user = AUTH.getCurrentUser();
    return `
      <nav class="nav-bar" id="main-nav">
        <div class="nav-inner">
          <a href="/" data-route class="nav-logo">
            <span class="logo-mark">◈</span>
            <span class="logo-text">KESF</span>
          </a>
          <div class="nav-search-wrap">
            <div class="nav-search">
              <span class="search-icon">⌕</span>
              <input type="text" id="nav-search-input" placeholder="Search restaurants, hotels, activities..." onkeydown="if(event.key==='Enter')APP.doSearch(this.value)">
            </div>
          </div>
          <div class="nav-links">
            <a href="/explore" data-route class="nav-link">Explore</a>
            <a href="/cities" data-route class="nav-link">Cities</a>
            ${user ? `
              <a href="/saved" data-route class="nav-link">Saved</a>
              <div class="nav-user-menu" onclick="APP.toggleUserMenu(event)">
                <img src="${user.avatar}" alt="${user.name}" class="nav-avatar">
                <div class="user-dropdown" id="user-dropdown">
                  <a href="/profile" data-route class="dropdown-item">My Profile</a>
                  ${user.userType === 'business' ? `<a href="/dashboard" data-route class="dropdown-item">Business Dashboard</a>` : ''}
                  <a href="/saved" data-route class="dropdown-item">Saved Places</a>
                  <div class="dropdown-divider"></div>
                  <button class="dropdown-item" onclick="AUTH.logout();ROUTER.navigate('/')">Sign Out</button>
                </div>
              </div>` : `
              <button class="nav-btn-outline" onclick="APP.showLogin()">LOG IN</button>
              <button class="nav-btn-filled" onclick="APP.showRegister()">SIGN UP</button>`}
          </div>
          <button class="nav-mobile-menu" onclick="APP.toggleMobileMenu()" aria-label="Menu">☰</button>
        </div>
        <div class="mobile-menu" id="mobile-menu">
          <a href="/explore" data-route class="mobile-link" onclick="APP.closeMobileMenu()">Explore</a>
          <a href="/cities" data-route class="mobile-link" onclick="APP.closeMobileMenu()">Cities</a>
          ${user ? `
            <a href="/saved" data-route class="mobile-link" onclick="APP.closeMobileMenu()">Saved</a>
            <a href="/profile" data-route class="mobile-link" onclick="APP.closeMobileMenu()">Profile</a>
            ${user.userType === 'business' ? `<a href="/dashboard" data-route class="mobile-link" onclick="APP.closeMobileMenu()">Dashboard</a>` : ''}
            <button class="mobile-link" onclick="AUTH.logout();ROUTER.navigate('/')">Sign Out</button>` : `
            <button class="mobile-link" onclick="COMPONENTS.closeModal();APP.showLogin()">Log In</button>
            <button class="mobile-link" onclick="COMPONENTS.closeModal();APP.showRegister()">Sign Up</button>`}
        </div>
      </nav>`;
  }

  function footer() {
    return `
      <footer class="site-footer">
        <div class="footer-inner">
          <div class="footer-brand">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
              <span class="logo-mark" style="color:var(--color-signal-orange)">◈</span>
              <span class="logo-text" style="color:#fff">KESF</span>
            </div>
            <p>Discover the best of Azerbaijan</p>
          </div>
          <div class="footer-links">
            <div class="footer-col">
              <h4>EXPLORE</h4>
              <a href="/cities" data-route>All Cities</a>
              <a href="/explore" data-route>All Places</a>
              <a href="/explore?category=restaurant" data-route>Restaurants</a>
              <a href="/explore?category=hotel" data-route>Hotels</a>
              <a href="/explore?category=activity" data-route>Activities</a>
            </div>
            <div class="footer-col">
              <h4>CITIES</h4>
              <a href="/city/baku" data-route>Baku</a>
              <a href="/city/ganja" data-route>Ganja</a>
              <a href="/city/sheki" data-route>Sheki</a>
              <a href="/city/quba" data-route>Quba</a>
            </div>
            <div class="footer-col">
              <h4>BUSINESS</h4>
              <a href="/business/register" data-route>Add Your Business</a>
              <a href="/dashboard" data-route>Business Dashboard</a>
            </div>
            <div class="footer-col">
              <h4>ACCOUNT</h4>
              <a href="/profile" data-route>My Profile</a>
              <a href="/saved" data-route>Saved Places</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2024 Kesf · Azerbaijan's Discovery Platform</span>
          <span class="footer-tagline">Built with ❤️ for Azerbaijan</span>
        </div>
      </footer>`;
  }

  return {
    getCategoryLabel, starRating, _onStarClick, getSelectedRating, resetRating,
    placeCard, toast, modal, closeModal, loadingSpinner, emptyState, reviewCard, navBar, footer
  };
})();
