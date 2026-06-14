// ===== KESF ROUTER =====

const ROUTER = (() => {
  let routes = {};
  let currentRoute = null;

  function register(path, handler) {
    routes[path] = handler;
  }

  function navigate(path, pushState = true) {
    if (pushState) history.pushState({ path }, '', path);
    const [pathname, queryString] = path.split('?');
    const params = {};
    if (queryString) {
      queryString.split('&').forEach(pair => {
        const [key, val] = pair.split('=');
        if (key) params[decodeURIComponent(key)] = decodeURIComponent(val || '');
      });
    }

    let handler = null;
    let routeParams = {};
    for (const [routePath, routeHandler] of Object.entries(routes)) {
      const routeParts = routePath.split('/');
      const pathParts = pathname.split('/');
      if (routeParts.length !== pathParts.length) continue;
      let match = true;
      const tempParams = {};
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          tempParams[routeParts[i].slice(1)] = pathParts[i];
        } else if (routeParts[i] !== pathParts[i]) {
          match = false;
          break;
        }
      }
      if (match) { handler = routeHandler; routeParams = tempParams; break; }
    }

    if (handler) {
      currentRoute = { path: pathname, params: { ...routeParams, ...params } };
      handler(currentRoute.params);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      render404();
    }
  }

  function init() {
    window.addEventListener('popstate', () => {
      navigate(location.pathname + location.search, false);
    });
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-route]');
      if (link) {
        e.preventDefault();
        navigate(link.getAttribute('href'));
      }
    });
  }

  function render404() {
    document.getElementById('app').innerHTML = `
      <div style="min-height:80vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:var(--font-primary);color:var(--color-ink);text-align:center;padding:40px">
        <div style="font-size:64px;margin-bottom:16px">🔍</div>
        <h1 style="font-size:28px;font-weight:400;letter-spacing:-0.03em;margin:0 0 8px">Page not found</h1>
        <p style="color:var(--color-iron-caption);margin:0 0 28px;font-size:15px">That page doesn't exist in Kesf.</p>
        <button onclick="ROUTER.navigate('/')" style="background:var(--color-ink);color:#fff;border:none;padding:10px 24px;border-radius:4px;font-family:var(--font-mono);font-size:11px;cursor:pointer;letter-spacing:-0.02em;text-transform:uppercase">GO HOME</button>
      </div>
    `;
  }

  function getCurrentRoute() { return currentRoute; }

  return { register, navigate, init, getCurrentRoute };
})();
