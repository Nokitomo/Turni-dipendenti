const STORAGE_KEY = 'schedule';
const EVENT_NAME = 'schedule-updated';

const SHIFT_HOURS = Object.freeze({
  primo: 6,
  secondo: 6
});

let schedule = loadSchedule();

function loadSchedule() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Impossibile caricare i turni da localStorage', error);
    return {};
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
  document.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: getSchedule() }));
}

export function getSchedule() {
  return { ...schedule };
}

export function getShiftHours() {
  return SHIFT_HOURS;
}

export function saveShift(date, shiftType, employeeList) {
  if (!schedule[date]) {
    schedule[date] = {};
  }
  schedule[date][shiftType] = employeeList;
  persist();
}

export function clearEmployeeData(employeeName) {
  let modified = false;
  for (const date in schedule) {
    const shifts = schedule[date];
    for (const shift in shifts) {
      const originalLength = shifts[shift].length;
      shifts[shift] = shifts[shift].filter(emp => emp !== employeeName);
      if (shifts[shift].length !== originalLength) {
        modified = true;
      }
    }
  }
  if (modified) {
    persist();
  }
  return modified;
}

export function calculateEmployeeTotals(employees) {
  const totals = {};
  employees.forEach(emp => {
    totals[emp] = 0;
  });

  for (const date in schedule) {
    const shifts = schedule[date];
    for (const shift in shifts) {
      const people = shifts[shift];
      people.forEach(person => {
        if (totals[person] != null) {
          totals[person] += SHIFT_HOURS[shift] || 0;
        }
      });
    }
  }

  return totals;
}

export function calculateMonthlyHours(employeeName, monthStr) {
  const [yearStr, monthStrValue] = monthStr.split('-');
  const targetYear = Number(yearStr);
  const targetMonth = Number(monthStrValue);

  let totalHours = 0;
  let sundayHours = 0;

  for (const dateStr in schedule) {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      continue;
    }
    if (date.getFullYear() !== targetYear || date.getMonth() + 1 !== targetMonth) {
      continue;
    }
    const shifts = schedule[dateStr] || {};
    for (const shift in shifts) {
      const employeesList = shifts[shift];
      if (employeesList.includes(employeeName)) {
        totalHours += SHIFT_HOURS[shift] || 0;
        if (date.getDay() === 0) {
          sundayHours += SHIFT_HOURS[shift] || 0;
        }
      }
    }
  }

  return { totalHours, sundayHours };
}

export function cleanOldEntries(months) {
  if (!Number.isInteger(months) || months <= 0) {
    return false;
  }

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setMonth(cutoff.getMonth() - months);

  const cutoffKey = cutoff.toISOString().split('T')[0];
  let modified = false;

  for (const date in schedule) {
    if (date < cutoffKey) {
      delete schedule[date];
      modified = true;
    }
  }

  if (modified) {
    persist();
  }

  return modified;
}

export function onScheduleChange(callback) {
  document.addEventListener(EVENT_NAME, callback);
}

export function offScheduleChange(callback) {
  document.removeEventListener(EVENT_NAME, callback);
}
