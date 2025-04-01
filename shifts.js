// shifts.js aggiornato con reset e modifica ore + gestione per data

import { getEmployees } from './employees.js';
import { getDaysOfWeek } from './calendar.js';

const shiftHours = {
  primo: 6,
  secondo: 6,
  doppio: 12,
  ferie: 0,
  riposo: 0,
  festivo: 0,
  malattia: 0
};

let schedule = {}; // { nomeDipendente: { data: turno } }
let manualHours = {}; // { nomeDipendente: numero }

export function initShiftModule() {
  document.getElementById('calendar').addEventListener('change', saveShift);
  updateWorkedHours();
}

function saveShift(e) {
  const select = e.target;
  if (select.tagName !== 'SELECT') return;

  const emp = select.dataset.employee;
  const date = select.dataset.date;
  const value = select.value;

  if (!schedule[emp]) schedule[emp] = {};
  schedule[emp][date] = value;

  updateWorkedHours();
}

function updateWorkedHours() {
  const hoursDiv = document.getElementById('worked-hours');
  hoursDiv.innerHTML = '';
  const employees = getEmployees();

  employees.forEach(emp => {
    let total = 0;
    if (manualHours[emp] != null) {
      total = manualHours[emp];
    } else if (schedule[emp]) {
      for (let date in schedule[emp]) {
        const shift = schedule[emp][date];
        total += shiftHours[shift] || 0;
      }
    }

    const container = document.createElement('div');
    container.style.marginBottom = '1rem';

    const p = document.createElement('p');
    p.textContent = `${emp}: ${total} ore lavorate nel periodo`;
    container.appendChild(p);

    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = 'Modifica ore';
    input.style.marginRight = '0.5rem';
    input.value = manualHours[emp] ?? '';
    input.addEventListener('change', () => {
      const val = parseFloat(input.value);
      if (!isNaN(val)) {
        manualHours[emp] = val;
      } else {
        delete manualHours[emp];
      }
      updateWorkedHours();
    });
    container.appendChild(input);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset';
    resetBtn.style.backgroundColor = '#e67e22';
    resetBtn.addEventListener('click', () => {
      delete manualHours[emp];
      delete schedule[emp];
      updateWorkedHours();
      document.querySelectorAll(`select[data-employee='${emp}']`).forEach(s => s.value = '');
    });
    container.appendChild(resetBtn);

    hoursDiv.appendChild(container);
  });
}

export function getSchedule() {
  return schedule;
}

export function clearEmployeeData(emp) {
  delete schedule[emp];
  delete manualHours[emp];
}