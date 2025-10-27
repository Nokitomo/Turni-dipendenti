const STORAGE_KEY = 'employees';
const EVENT_NAME = 'employees-updated';

let employees = loadEmployees();

function loadEmployees() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Impossibile caricare i dipendenti da localStorage', error);
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  document.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: getEmployees() }));
}

export function getEmployees() {
  return [...employees];
}

export function addEmployee(name) {
  if (!name || employees.includes(name)) {
    return false;
  }
  employees.push(name);
  persist();
  return true;
}

export function removeEmployee(name) {
  const initialLength = employees.length;
  employees = employees.filter(emp => emp !== name);
  if (employees.length !== initialLength) {
    persist();
    return true;
  }
  return false;
}

export function onEmployeesChange(callback) {
  document.addEventListener(EVENT_NAME, callback);
}

export function offEmployeesChange(callback) {
  document.removeEventListener(EVENT_NAME, callback);
}
