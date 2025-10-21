const routes = {
  '#home': {
    template: 'partials/home.html',
    loader: () => import('./pages/home.js')
  },
  '#calendar': {
    template: 'partials/calendar.html',
    loader: () => import('./pages/calendar.js')
  },
  '#employees': {
    template: 'partials/employees.html',
    loader: () => import('./pages/employees.js')
  },
  '#hours': {
    template: 'partials/hours.html',
    loader: () => import('./pages/hours.js')
  },
  '#cleanup': {
    template: 'partials/cleanup.html',
    loader: () => import('./pages/cleanup.js')
  },
  '#employee-details': {
    template: 'partials/employee-details.html',
    loader: () => import('./pages/employee-details.js')
  }
};

const DEFAULT_ROUTE = '#calendar';

export function initRouter() {
  const app = document.getElementById('app');
  if (!app) {
    throw new Error('Elemento con id "app" non trovato in index.html');
  }

  let activeModule = null;
  let isNavigating = false;

  const routerApi = {
    navigate(route, params = {}) {
      const normalized = route.startsWith('#') ? route : `#${route}`;
      const queryEntries = Object.entries(params).filter(([, value]) => value != null && value !== '');
      const queryString = new URLSearchParams(queryEntries).toString();
      const targetHash = queryString ? `${normalized}?${queryString}` : normalized;

      if (window.location.hash === targetHash) {
        // Ricarica manuale del contenuto
        handleHashChange();
      } else {
        window.location.hash = targetHash;
      }
    },
    start() {
      window.addEventListener('hashchange', handleHashChange);
      handleHashChange();
    }
  };

  async function handleHashChange() {
    if (isNavigating) {
      return;
    }
    isNavigating = true;
    try {
      const { route, params } = parseHash(window.location.hash);
      const config = routes[route];
      if (!config) {
        if (route !== DEFAULT_ROUTE) {
          routerApi.navigate(DEFAULT_ROUTE);
        }
        return;
      }

      if (activeModule && typeof activeModule.teardownPage === 'function') {
        try {
          activeModule.teardownPage();
        } catch (error) {
          console.error('Errore durante il teardown della pagina precedente', error);
        }
      }

      const response = await fetch(config.template);
      if (!response.ok) {
        throw new Error(`Impossibile caricare il template ${config.template}`);
      }
      const html = await response.text();
      app.innerHTML = html;

      const module = await config.loader();
      activeModule = module;

      if (typeof module.initPage === 'function') {
        await module.initPage({ router: routerApi, params });
      }
    } catch (error) {
      console.error('Errore durante il caricamento della rotta', error);
      app.innerHTML = '<p>Si è verificato un errore durante il caricamento della pagina.</p>';
    } finally {
      isNavigating = false;
    }
  }

  return routerApi;
}

function parseHash(hash) {
  if (!hash) {
    return { route: DEFAULT_ROUTE, params: new URLSearchParams() };
  }
  const [route, queryString] = hash.split('?');
  const normalizedRoute = route || DEFAULT_ROUTE;
  const params = new URLSearchParams(queryString || '');
  return { route: normalizedRoute, params };
}
