import { initRouter } from './router.js';
import { initMenu } from './components/menu.js';
import { applyCleanupPolicy } from './utils/cleanup.js';

document.addEventListener('DOMContentLoaded', () => {
  applyCleanupPolicy();

  const router = initRouter();
  initMenu(router);
  router.start();
});
