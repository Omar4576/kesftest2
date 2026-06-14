// ===== KESF PAGES =====

const PAGES = (() => {

  function initNavBehavior() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('nav-scrolled', window.scrollY > 20);
    window.removeEventListener('scroll', window._kNavScroll);
    window._kNavScroll = onScroll;
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ===== HOME =====
  function renderHome() {
    const allPlaces = Object.values(PLACES_DATA).flat();
    const popular = allPlaces.filter(p => p.popular).slice(0, 8);
    const topRated = [...allPlaces].sort((a, b) => b.rating - a.rating).slice(0, 6);

    document.getElementById('app').innerHTML = `
      ${COMPONENTS.navBar()}
      <main>
        <section class="hero-section">
          <div class="hero-inner">
            <div class="hero-left">
              <div class="version-dot"><span class="dot-orange"></span><span class="dot-label">DISCOVER AZERBAIJAN</span></div>
              <h1 class="hero-headline">Find the best<br>places in<br><em>Azerbaijan</em></h1>
              <p class="hero-sub">Restaurants, tea houses, hotels, nightlife, activities — Kesf is your guide to the finest spots across Baku, Ganja, Sheki, and Quba.</p>
              <div class="hero-search-box">
                <div class="search-row">
                  <span class="search-icon-big">⌕</span>
                  <input type="text" id="hero-search" placeholder="Try 'restaurants in Baku' or 'hotels Sheki'..." onkeydown="if(event.key==='Enter')APP.doSearch(this.value)">
                  <button onclick="APP.doSearch(document.getElementById('hero-search').value)" class="search-btn">SEARCH</button>
                </div>
                <div class="quick-cats">
                  ${CATEGORIES.map(c => `<button class="quick-cat" onclick="ROUTER.navigate('/explore?category=${c.id}')">${c.icon} ${c.label}</button>`).join('')}
                </div>
              </div>
            </div>
            <div class="hero-right">
              <div class="hero-visual">
                <div class="terminal-window">
                  <div class="terminal-header">
                    <span class="traffic-dot red"></span>
                    <span class="traffic-dot yellow"></span>
                    <span class="traffic-dot green"></span>
                    <span class="terminal-title">kesf@azerbaijan: ~</span>
                  </div>
                  <div class="terminal-body">
                    <div class="terminal-line"><span class="t-prompt">›</span> <span class="t-cmd">searching</span> <span class="t-arg">"best restaurants baku"</span></div>
                    <div class="terminal-line t-result">✓ Found ${PLACES_DATA.baku.length} places in Baku</div>
                    <div class="terminal-line t-result">✓ 4 cities covered</div>
                    <div class="terminal-line t-result">✓ ${Object.values(PLACES_DATA).flat().length} verified listings</div>
                    <div class="terminal-line"><span class="t-prompt">›</span> <span class="t-cmd">top result:</span></div>
                    <div class="terminal-block">
                      <div class="t-name">Çay Evi Old City</div>
                      <div class="t-rating">★★★★★ 4.9 · Tea House</div>
                      <div class="t-addr">İçərişəhər, Baku</div>
                    </div>
                    <div class="terminal-cursor">▊</div>
                  </div>
                </div>
                <div class="dot-constellation">
                  ${Array.from({length:16},(_,i)=>`<span class="constellation-dot ${i%3===0?'dot-orange':''}" style="--d:${i*0.15}s"></span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="cities-band">
          <div class="section-inner">
            <div class="version-dot"><span class="dot-orange"></span><span class="dot-label">CITIES</span></div>
            <h2 class="section-heading">Explore by city</h2>
            <div class="cities-grid">
              ${CITIES.map(city => {
                const count = PLACES_DATA[city.id] ? PLACES_DATA[city.id].length : 0;
                return `<div class="city-card" onclick="ROUTER.navigate('/city/${city.id}')">
                  <div class="city-card-icon">${city.icon}</div>
                  <div class="city-card-info">
                    <h3>${city.name}</h3>
                    <p class="city-az">${city.nameAz}</p>
                    <p class="city-desc">${city.description}</p>
                    <span class="city-count">${count} places</span>
                  </div>
                  <span class="city-arrow">→</span>
                </div>`;
              }).join('')}
            </div>
          </div>
        </section>

        <section class="categories-section">
          <div class="section-inner">
            <div class="version-dot"><span class="dot-orange"></span><span class="dot-label">CATEGORIES</span></div>
            <h2 class="section-heading">What are you looking for?</h2>
            <div class="categories-grid">
              ${CATEGORIES.map(c => `
                <div class="category-tile" onclick="ROUTER.navigate('/explore?category=${c.id}')">
                  <div class="cat-icon">${c.icon}</div>
                  <span class="cat-label">${c.label}</span>
                  <span class="cat-count">${Object.values(PLACES_DATA).flat().filter(p=>p.category===c.id).length} places</span>
                </div>`).join('')}
            </div>
          </div>
        </section>

        <section class="places-section">
          <div class="section-inner">
            <div class="section-header-row">
              <div>
                <div class="version-dot"><span class="dot-orange"></span><span class="dot-label">POPULAR</span></div>
                <h2 class="section-heading">Popular right now</h2>
              </div>
              <a href="/explore" data-route class="see-all-link">SEE ALL →</a>
            </div>
            <div class="places-grid">${popular.map(p=>COMPONENTS.placeCard(p)).join('')}</div>
          </div>
        </section>

        <section class="places-section alt-bg">
          <div class="section-inner">
            <div class="section-header-row">
              <div>
                <div class="version-dot"><span class="dot-orange"></span><span class="dot-label">TOP RATED</span></div>
                <h2 class="section-heading">Highest rated places</h2>
              </div>
              <a href="/explore?sort=rating" data-route class="see-all-link">SEE ALL →</a>
            </div>
            <div class="places-grid">${topRated.map(p=>COMPONENTS.placeCard(p)).join('')}</div>
          </div>
        </section>

        <section class="cta-band">
          <div class="section-inner cta-inner">
            <div>
              <div class="version-dot"><span class="dot-orange"></span><span class="dot-label">BUSINESS OWNERS</span></div>
              <h2 class="cta-heading">List your business on Kesf</h2>
              <p>Reach thousands of locals and visitors exploring Azerbaijan. Free to list.</p>
            </div>
            <button onclick="ROUTER.navigate('/business/register')" class="cta-btn-filled">ADD YOUR BUSINESS →</button>
          </div>
        </section>
      </main>
      ${COMPONENTS.footer()}`;
    initNavBehavior();
  }

  // ===== EXPLORE =====
  function renderExplore(params = {}) {
    const allPlaces = Object.values(PLACES_DATA).flat();
    let filtered = [...allPlaces];
    if (params.category) filtered = filtered.filter(p => p.category === params.category);
    if (params.city) filtered = filtered.filter(p => p.city === params.city);
    if (params.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (params.sort === 'rating') filtered.sort((a,b) => b.rating - a.rating);
    if (params.sort === 'reviews') filtered.sort((a,b) => b.reviews - a.reviews);
    if (params.price) filtered = filtered.filter(p => p.price === params.price);

    document.getElementById('app').innerHTML = `
      ${COMPONENTS.navBar()}
      <main>
        <div class="explore-layout">
          <aside class="filters-sidebar" id="filters-sidebar">
            <div class="filters-header">
              <h2>Filters</h2>
              <button onclick="APP.clearFilters()" class="clear-btn">Clear all</button>
            </div>
            <div class="filter-group">
              <h3>City</h3>
              <label class="filter-option"><input type="radio" name="city-filter" value="" ${!params.city?'checked':''} onchange="APP.applyFilter('city','')"><span>All Cities</span></label>
              ${CITIES.map(c=>`<label class="filter-option"><input type="radio" name="city-filter" value="${c.id}" ${params.city===c.id?'checked':''} onchange="APP.applyFilter('city','${c.id}')"><span>${c.icon} ${c.name}</span></label>`).join('')}
            </div>
            <div class="filter-group">
              <h3>Category</h3>
              <label class="filter-option"><input type="radio" name="cat-filter" value="" ${!params.category?'checked':''} onchange="APP.applyFilter('category','')"><span>All Categories</span></label>
              ${CATEGORIES.map(c=>`<label class="filter-option"><input type="radio" name="cat-filter" value="${c.id}" ${params.category===c.id?'checked':''} onchange="APP.applyFilter('category','${c.id}')"><span>${c.icon} ${c.label}</span></label>`).join('')}
            </div>
            <div class="filter-group">
              <h3>Price</h3>
              <label class="filter-option"><input type="radio" name="price-filter" value="" ${!params.price?'checked':''} onchange="APP.applyFilter('price','')"><span>Any price</span></label>
              ${['$','$$','$$$','$$$$'].map(p=>`<label class="filter-option"><input type="radio" name="price-filter" value="${p}" ${params.price===p?'checked':''} onchange="APP.applyFilter('price','${p}')"><span>${p}</span></label>`).join('')}
            </div>
            <div class="filter-group">
              <h3>Sort by</h3>
              <label class="filter-option"><input type="radio" name="sort-filter" value="" ${!params.sort?'checked':''} onchange="APP.applyFilter('sort','')"><span>Default</span></label>
              <label class="filter-option"><input type="radio" name="sort-filter" value="rating" ${params.sort==='rating'?'checked':''} onchange="APP.applyFilter('sort','rating')"><span>Highest Rated</span></label>
              <label class="filter-option"><input type="radio" name="sort-filter" value="reviews" ${params.sort==='reviews'?'checked':''} onchange="APP.applyFilter('sort','reviews')"><span>Most Reviewed</span></label>
            </div>
          </aside>
          <div class="explore-main">
            <div class="explore-topbar">
              <div class="explore-count">
                <strong>${filtered.length}</strong> places found
                ${params.q ? `for <em>"${params.q}"</em>` : ''}
                ${params.city ? `in <em>${params.city.charAt(0).toUpperCase()+params.city.slice(1)}</em>` : ''}
                ${params.category ? `· <em>${COMPONENTS.getCategoryLabel(params.category)}</em>` : ''}
              </div>
              <button class="filter-mobile-toggle" onclick="APP.toggleFilters()">⚙ Filters</button>
            </div>
            ${filtered.length === 0
              ? COMPONENTS.emptyState('🔍','No places found','Try adjusting your filters or search terms.',`<button onclick="APP.clearFilters()" class="btn-primary">Clear Filters</button>`)
              : `<div class="places-grid explore-grid">${filtered.map(p=>COMPONENTS.placeCard(p)).join('')}</div>`}
          </div>
        </div>
      </main>
      ${COMPONENTS.footer()}`;
    initNavBehavior();
    if (params.q) { const el = document.getElementById('nav-search-input'); if(el) el.value = params.q; }
  }

  // ===== CITY PAGE =====
  function renderCity(params) {
    const city = CITIES.find(c => c.id === params.id);
    if (!city) { ROUTER.navigate('/cities'); return; }
    const places = PLACES_DATA[params.id] || [];
    const byCategory = {};
    places.forEach(p => { if(!byCategory[p.category]) byCategory[p.category]=[]; byCategory[p.category].push(p); });

    document.getElementById('app').innerHTML = `
      ${COMPONENTS.navBar()}
      <main>
        <div class="city-hero" style="background:linear-gradient(135deg,#1f1d1c 0%,#3d3a39 100%)">
          <div class="city-hero-inner">
            <div class="version-dot light"><span class="dot-orange"></span><span class="dot-label" style="color:#fafafa">CITY GUIDE</span></div>
            <h1 class="city-hero-title">${city.icon} ${city.name}<span class="city-az-hero">${city.nameAz}</span></h1>
            <p class="city-hero-sub">${city.description} · ${city.population} residents · ${places.length} listed places</p>
            <div class="city-hero-cats">
              ${Object.keys(byCategory).map(cat=>`<button class="hero-cat-pill" onclick="ROUTER.navigate('/explore?city=${params.id}&category=${cat}')">${COMPONENTS.getCategoryLabel(cat)} (${byCategory[cat].length})</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="section-inner">
          ${Object.entries(byCategory).map(([cat,items])=>`
            <section class="city-category-section">
              <div class="section-header-row">
                <div>
                  <div class="version-dot"><span class="dot-orange"></span><span class="dot-label">${COMPONENTS.getCategoryLabel(cat).toUpperCase()}</span></div>
                  <h2 class="section-heading">${COMPONENTS.getCategoryLabel(cat)} in ${city.name}</h2>
                </div>
                <a href="/explore?city=${params.id}&category=${cat}" data-route class="see-all-link">SEE ALL →</a>
              </div>
              <div class="places-grid">${items.slice(0,4).map(p=>COMPONENTS.placeCard(p)).join('')}</div>
            </section>`).join('')}
        </div>
      </main>
      ${COMPONENTS.footer()}`;
    initNavBehavior();
  }

  // ===== CITIES LIST =====
  function renderCities() {
    document.getElementById('app').innerHTML = `
      ${COMPONENTS.navBar()}
      <main>
        <div class="page-header">
          <div class="section-inner">
            <div class="version-dot"><span class="dot-orange"></span><span class="dot-label">EXPLORE</span></div>
            <h1 class="page-title">Cities in Azerbaijan</h1>
            <p class="page-sub">Explore ${CITIES.length} cities and discover hundreds of local places.</p>
          </div>
        </div>
        <div class="section-inner">
          <div class="cities-list">
            ${CITIES.map(city => {
              const places = PLACES_DATA[city.id] || [];
              const cats = [...new Set(places.map(p=>p.category))];
              return `<div class="city-list-card" onclick="ROUTER.navigate('/city/${city.id}')">
                <div class="city-list-icon">${city.icon}</div>
                <div class="city-list-body">
                  <h2>${city.name} <span class="city-list-az">${city.nameAz}</span></h2>
                  <p>${city.description} · ${city.population} residents</p>
                  <div class="city-list-cats">${cats.map(c=>`<span class="mini-badge">${COMPONENTS.getCategoryLabel(c)}</span>`).join('')}</div>
                </div>
                <div class="city-list-stat">
                  <span class="city-list-count">${places.length}</span>
                  <span>places</span>
                </div>
                <span class="city-arrow">→</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </main>
      ${COMPONENTS.footer()}`;
    initNavBehavior();
  }

  // ===== PLACE DETAIL =====
  function renderPlace(params) {
    const allPlaces = Object.values(PLACES_DATA).flat();
    const place = allPlaces.find(p => p.id == params.id);
    if (!place) { ROUTER.navigate('/explore'); return; }

    const reviews = AUTH.getReviewsForPlace(place.id);
    const bookmarked = AUTH.isBookmarked(place.id);
    const session = AUTH.getSession();
    const userReview = session ? reviews.find(r => r.userId === session.userId) : null;
    const similar = allPlaces.filter(p => p.category===place.category && p.id!==place.id && p.city===place.city).slice(0,3);

    const priceLabel = {'$':'Budget-friendly','$$':'Moderate','$$$':'Upscale','$$$$':'Luxury'}[place.price]||'Varies';
    const totalReviews = reviews.length + place.reviews;

    document.getElementById('app').innerHTML = `
      ${COMPONENTS.navBar()}
      <main>
        <div class="place-hero">
          <div class="place-photos">
            ${place.photos && place.photos[0]
              ? `<div class="place-photo-main"><img src="${place.photos[0]}" alt="${place.name}" onerror="this.parentElement.innerHTML='<div class=\\'photo-placeholder\\'>${place.image}</div>'"></div>`
              : `<div class="place-photo-main photo-placeholder" style="display:flex;align-items:center;justify-content:center;font-size:80px">${place.image}</div>`}
          </div>
        </div>

        <div class="place-detail-layout">
          <div class="place-detail-main">
            <div class="place-detail-header">
              <div class="place-badges-row">
                <span class="category-badge large">${COMPONENTS.getCategoryLabel(place.category)}</span>
                ${place.verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                ${place.popular ? '<span class="popular-badge">🔥 Popular</span>' : ''}
              </div>
              <div class="place-title-row">
                <h1 class="place-title">${place.name}</h1>
                <button class="bookmark-btn-large ${bookmarked?'active':''}" id="detail-bookmark" onclick="APP.toggleBookmark(${place.id},this)">
                  ${bookmarked ? '♥ Saved' : '♡ Save'}
                </button>
              </div>
              <div class="place-rating-row">
                ${COMPONENTS.starRating(place.rating)}
                <span class="rating-big">${place.rating}</span>
                <span class="review-count-big">${totalReviews} reviews</span>
                <span class="price-big">${place.price}</span>
              </div>
              <div class="place-tags">
                ${place.tags.map(t=>`<span class="tag-pill">${t}</span>`).join('')}
              </div>
            </div>

            <div class="place-description">
              <h2>About</h2>
              <p>${place.description}</p>
            </div>

            <div class="reviews-section">
              <div class="reviews-header">
                <h2>Reviews <span class="review-count-label">${totalReviews}</span></h2>
                ${!userReview && session ? `<button class="btn-primary" onclick="APP.showReviewModal(${place.id})">Write a Review</button>` : ''}
                ${!session ? `<button class="btn-outline" onclick="APP.showLogin()">Log In to Review</button>` : ''}
              </div>
              ${reviews.length === 0
                ? `<div class="no-reviews"><p>No community reviews yet. Be the first to share your experience!</p></div>`
                : reviews.map(r=>COMPONENTS.reviewCard(r)).join('')}
            </div>

            ${similar.length > 0 ? `
              <div class="similar-section">
                <h2>Similar places nearby</h2>
                <div class="similar-grid">${similar.map(p=>COMPONENTS.placeCard(p,true)).join('')}</div>
              </div>` : ''}
          </div>

          <aside class="place-info-sidebar">
            <div class="info-card">
              <h3>DETAILS</h3>
              <div class="info-row"><span class="info-icon">📍</span><span>${place.address}</span></div>
              ${place.phone ? `<div class="info-row"><span class="info-icon">📞</span><a href="tel:${place.phone}" class="info-link">${place.phone}</a></div>` : ''}
              <div class="info-row"><span class="info-icon">🕐</span><span>${place.hours}</span></div>
              <div class="info-row"><span class="info-icon">💰</span><span>${place.price} — ${priceLabel}</span></div>
              <div class="info-row"><span class="info-icon">🏙️</span><a href="/city/${place.city}" data-route class="info-link">${place.city.charAt(0).toUpperCase()+place.city.slice(1)}, Azerbaijan</a></div>
            </div>
            <div class="info-card">
              <h3>LOCATION</h3>
              <div class="map-placeholder" onclick="APP.openMaps(${place.lat},${place.lng},'${place.name.replace(/'/g,"\\'")}')">
                <div class="map-dot"></div>
                <p>${place.name}</p>
                <span class="map-btn">Open in Maps →</span>
              </div>
            </div>
            <div class="share-card">
              <h3>SHARE</h3>
              <div class="share-btns">
                <button onclick="APP.copyLink()" class="share-btn">🔗 Copy Link</button>
                <button onclick="APP.shareWhatsApp('${place.name.replace(/'/g,"\\'")}');" class="share-btn">📱 WhatsApp</button>
              </div>
            </div>
            <div class="info-card">
              <h3>EXPLORE MORE</h3>
              <a href="/city/${place.city}" data-route class="explore-more-link">More in ${place.city.charAt(0).toUpperCase()+place.city.slice(1)} →</a>
              <a href="/explore?category=${place.category}" data-route class="explore-more-link">More ${COMPONENTS.getCategoryLabel(place.category)} →</a>
            </div>
          </aside>
        </div>
      </main>
      ${COMPONENTS.footer()}`;
    initNavBehavior();
  }

  // ===== PROFILE =====
  function renderProfile() {
    const user = AUTH.getCurrentUser();
    if (!user) { APP.showLogin(); return; }
    const bookmarks = AUTH.getBookmarks();
    const allPlaces = Object.values(PLACES_DATA).flat();
    const savedPlaces = allPlaces.filter(p => bookmarks.includes(p.id));
    const userReviews = AUTH.getReviews().filter(r => r.userId === user.id);

    document.getElementById('app').innerHTML = `
      ${COMPONENTS.navBar()}
      <main>
        <div class="section-inner profile-page">
          <div class="profile-header">
            <img src="${user.avatar}" alt="${user.name}" class="profile-avatar">
            <div class="profile-info">
              <h1>${user.name}</h1>
              <p class="profile-email">${user.email}</p>
              <div class="profile-stats">
                <span><strong>${userReviews.length}</strong> reviews</span>
                <span><strong>${savedPlaces.length}</strong> saved</span>
                ${user.userType==='business' ? `<span class="business-badge">Business Account</span>` : ''}
              </div>
            </div>
          </div>

          <div class="profile-tabs">
            <button class="profile-tab active" onclick="APP.switchProfileTab('saved',this)">Saved Places</button>
            <button class="profile-tab" onclick="APP.switchProfileTab('reviews',this)">My Reviews</button>
            <button class="profile-tab" onclick="APP.switchProfileTab('account',this)">Account Settings</button>
          </div>

          <div id="profile-tab-saved" class="profile-tab-content">
            ${savedPlaces.length===0
              ? COMPONENTS.emptyState('♡','No saved places yet','Tap the heart on any listing to save it.',`<button onclick="ROUTER.navigate('/explore')" class="btn-primary">Explore Places</button>`)
              : `<div class="places-grid">${savedPlaces.map(p=>COMPONENTS.placeCard(p)).join('')}</div>`}
          </div>

          <div id="profile-tab-reviews" class="profile-tab-content hidden">
            ${userReviews.length===0
              ? COMPONENTS.emptyState('⭐','No reviews yet','Share your experiences at places you\'ve visited.',`<button onclick="ROUTER.navigate('/explore')" class="btn-primary">Find Places</button>`)
              : userReviews.map(r => {
                  const place = allPlaces.find(p=>p.id===r.placeId);
                  return place ? `<div class="review-with-place">
                    <div class="review-place-link" onclick="ROUTER.navigate('/place/${place.id}')">
                      <span class="review-place-icon">${place.image}</span>
                      <strong>${place.name}</strong>
                      <span class="mini-badge">${place.city}</span>
                    </div>
                    ${COMPONENTS.reviewCard(r)}
                  </div>` : '';
                }).join('')}
          </div>

          <div id="profile-tab-account" class="profile-tab-content hidden">
            <div class="settings-card">
              <h3>Account Details</h3>
              <div class="settings-row"><label>Name</label><input type="text" id="settings-name" value="${user.name}" class="settings-input"></div>
              <div class="settings-row"><label>Email</label><input type="text" value="${user.email}" class="settings-input" disabled></div>
              <div id="settings-error" class="form-error hidden"></div>
              <button onclick="APP.updateProfile()" class="btn-primary">Save Changes</button>
            </div>
            <div class="settings-card danger-card">
              <h3>Sign Out</h3>
              <p>You will be signed out from this device.</p>
              <button onclick="AUTH.logout();ROUTER.navigate('/')" class="btn-danger">Sign Out</button>
            </div>
          </div>
        </div>
      </main>
      ${COMPONENTS.footer()}`;
    initNavBehavior();
  }

  // ===== SAVED =====
  function renderSaved() {
    const user = AUTH.getCurrentUser();
    if (!user) { APP.showLogin(); return; }
    const bookmarks = AUTH.getBookmarks();
    const allPlaces = Object.values(PLACES_DATA).flat();
    const savedPlaces = allPlaces.filter(p => bookmarks.includes(p.id));

    document.getElementById('app').innerHTML = `
      ${COMPONENTS.navBar()}
      <main>
        <div class="page-header">
          <div class="section-inner">
            <div class="version-dot"><span class="dot-orange"></span><span class="dot-label">YOUR LIST</span></div>
            <h1 class="page-title">Saved Places</h1>
            <p class="page-sub">${savedPlaces.length} places saved</p>
          </div>
        </div>
        <div class="section-inner" style="padding-top:40px;padding-bottom:80px">
          ${savedPlaces.length===0
            ? COMPONENTS.emptyState('♡','Nothing saved yet','Save places you love to find them quickly later.',`<button onclick="ROUTER.navigate('/explore')" class="btn-primary">Explore Places</button>`)
            : `<div class="places-grid">${savedPlaces.map(p=>COMPONENTS.placeCard(p)).join('')}</div>`}
        </div>
      </main>
      ${COMPONENTS.footer()}`;
    initNavBehavior();
  }

  // ===== BUSINESS DASHBOARD =====
  function renderDashboard() {
    const user = AUTH.getCurrentUser();
    if (!user || user.userType !== 'business') { ROUTER.navigate('/business/register'); return; }

    document.getElementById('app').innerHTML = `
      ${COMPONENTS.navBar()}
      <main>
        <div class="section-inner dashboard-page">
          <div class="dashboard-header">
            <div>
              <div class="version-dot"><span class="dot-orange"></span><span class="dot-label">BUSINESS</span></div>
              <h1>Business Dashboard</h1>
              <p>${user.businessName} · ${user.businessCity}</p>
            </div>
            <div class="dashboard-actions">
              ${!user.verified ? '<span class="pending-badge">⏳ Pending Verification</span>' : '<span class="verified-badge">✓ Verified</span>'}
            </div>
          </div>

          <div class="dashboard-stats">
            <div class="stat-card"><span class="stat-num">0</span><span class="stat-label">Profile Views</span></div>
            <div class="stat-card"><span class="stat-num">0</span><span class="stat-label">Reviews</span></div>
            <div class="stat-card"><span class="stat-num">0</span><span class="stat-label">Saves</span></div>
            <div class="stat-card"><span class="stat-num">—</span><span class="stat-label">Avg Rating</span></div>
          </div>

          <div class="dashboard-sections">
            <div class="dash-card">
              <h3>Business Info</h3>
              <div class="settings-row"><label>Business Name</label><input type="text" value="${user.businessName||''}" class="settings-input" id="dash-bname"></div>
              <div class="settings-row"><label>Category</label>
                <select class="settings-input" id="dash-bcat">
                  ${CATEGORIES.map(c=>`<option value="${c.id}" ${user.businessCategory===c.id?'selected':''}>${c.label}</option>`).join('')}
                </select>
              </div>
              <div class="settings-row"><label>City</label>
                <select class="settings-input" id="dash-bcity">
                  ${CITIES.map(c=>`<option value="${c.id}" ${user.businessCity===c.id?'selected':''}>${c.name}</option>`).join('')}
                </select>
              </div>
              <div class="settings-row"><label>Address</label><input type="text" value="${user.businessAddress||''}" placeholder="Your business address" class="settings-input" id="dash-baddr"></div>
              <div class="settings-row"><label>Phone</label><input type="text" value="${user.businessPhone||''}" placeholder="+994 XX XXX XXXX" class="settings-input" id="dash-bphone"></div>
              <div class="settings-row"><label>Description</label><textarea class="settings-input settings-textarea" id="dash-bdesc" placeholder="Tell customers about your business...">${user.businessDescription||''}</textarea></div>
              <div id="dash-error" class="form-error hidden"></div>
              <button onclick="APP.saveBusiness()" class="btn-primary">Save Changes</button>
            </div>
            <div class="dash-card">
              <h3>Getting Started</h3>
              <div class="onboarding-steps">
                <div class="onboard-step done"><span class="onboard-icon">✓</span><div><strong>Account created</strong><p>Your business account is live</p></div></div>
                <div class="onboard-step ${user.businessAddress?'done':''}"><span class="onboard-icon">${user.businessAddress?'✓':'2'}</span><div><strong>Add your address</strong><p>Help customers find you</p></div></div>
                <div class="onboard-step ${user.businessPhone?'done':''}"><span class="onboard-icon">${user.businessPhone?'✓':'3'}</span><div><strong>Add phone number</strong><p>Let customers contact you</p></div></div>
                <div class="onboard-step"><span class="onboard-icon">4</span><div><strong>Verification</strong><p>Our team will review and verify your listing</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </main>
      ${COMPONENTS.footer()}`;
    initNavBehavior();
  }

  // ===== BUSINESS REGISTER =====
  function renderBusinessRegister() {
    document.getElementById('app').innerHTML = `
      ${COMPONENTS.navBar()}
      <main>
        <div class="auth-page">
          <div class="auth-card">
            <div class="auth-logo"><span class="logo-mark">◈</span> KESF</div>
            <div class="version-dot" style="justify-content:center;margin-bottom:8px"><span class="dot-orange"></span><span class="dot-label">FOR BUSINESSES</span></div>
            <h1 class="auth-title">List your business</h1>
            <p class="auth-sub">Join hundreds of Azerbaijan businesses on Kesf. Free to list.</p>
            <div class="form-group"><label>Your Name</label><input type="text" id="biz-name" placeholder="Your full name" class="form-input"></div>
            <div class="form-group"><label>Email Address</label><input type="email" id="biz-email" placeholder="you@business.com" class="form-input"></div>
            <div class="form-group"><label>Password</label><input type="password" id="biz-password" placeholder="Min. 8 characters with numbers" class="form-input"></div>
            <div class="form-group"><label>Business Name</label><input type="text" id="biz-bname" placeholder="Your restaurant / hotel / etc." class="form-input"></div>
            <div class="form-group"><label>Business Type</label>
              <select id="biz-bcat" class="form-input">
                ${CATEGORIES.map(c=>`<option value="${c.id}">${c.icon} ${c.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>City</label>
              <select id="biz-bcity" class="form-input">
                ${CITIES.map(c=>`<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
              </select>
            </div>
            <div id="biz-error" class="form-error hidden"></div>
            <button onclick="APP.registerBusiness()" class="btn-primary btn-block">CREATE BUSINESS ACCOUNT →</button>
            <p class="auth-switch">Already have an account? <button onclick="APP.showLogin()" class="link-btn">Log in</button></p>
          </div>
        </div>
      </main>
      ${COMPONENTS.footer()}`;
    initNavBehavior();
  }

  return {
    renderHome, renderExplore, renderCity, renderCities,
    renderPlace, renderProfile, renderSaved,
    renderDashboard, renderBusinessRegister,
  };
})();
