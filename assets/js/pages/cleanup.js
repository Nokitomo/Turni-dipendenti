import {
  applyCleanupPolicy,
  getCleanupPolicy,
  setCleanupPolicy
} from '../utils/cleanup.js';

export function initPage() {
  const select = document.getElementById('cleanup-select');
  if (!select) {
    return;
  }

  const savedPolicy = getCleanupPolicy();
  select.value = savedPolicy;

  applyCleanupPolicy();

  select.addEventListener('change', () => {
    const value = select.value;
    setCleanupPolicy(value);
    applyCleanupPolicy();
  });
}

export function teardownPage() {}
