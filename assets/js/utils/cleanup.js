import { cleanOldEntries } from './schedule.js';

const POLICY_KEY = 'cleanup-policy';

export function getCleanupPolicy() {
  return localStorage.getItem(POLICY_KEY) || 'off';
}

export function setCleanupPolicy(value) {
  if (typeof value !== 'string') {
    return;
  }
  localStorage.setItem(POLICY_KEY, value);
}

export function applyCleanupPolicy() {
  const policy = getCleanupPolicy();
  if (policy === 'off') {
    return false;
  }
  const months = parseInt(policy, 10);
  if (Number.isNaN(months)) {
    return false;
  }
  return cleanOldEntries(months);
}
