// calendar.js aggiornato per gestire le date dinamiche della settimana

import { getEmployees } from './employees.js';

const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

let currentStartDate = null;

export function initCalendarModule() {
  currentStartDate = getMonday(new Date());
  renderCalendar(currentStartDate);
}

export function updateCalendarForWeek(startDate) {
  currentStartDate = new Date(startDate);
  renderCalendar(currentStartDate);
}

function renderCalendar(startDate) {
  const calendarEl = document.getElementById('calendar');
  calendarEl.innerHTML = '';

  const employees = getEmployees();
  const dates = getWeekDates(startDate);

  employees.forEach(emp => {
    const section = document.createElement('div');
    section.classList.add('employee-calendar');

    const title = document.createElement('h3');
    title.textContent = emp;
    section.appendChild(title);

    const weekRow = document.createElement('div');
    weekRow.classList.add('calendar-row');

    dates.forEach((dateObj, index) => {
      const dayBox = document.createElement('div');
      dayBox.classList.add('calendar-day');

      const label = document.createElement('div');
      label.classList.add('day-label');
      label.textContent = `${days[index]} (${dateObj.dateString})`;

      const shiftSelect = document.createElement('select');
      shiftSelect.dataset.employee = emp;
      shiftSelect.dataset.day = days[index];
      shiftSelect.dataset.date = dateObj.key;
      shiftSelect.innerHTML = `
        <option value="">-- Assegna turno --</option>
        <option value="primo">Primo Turno (08:00-14:00)</option>
        <option value="secondo">Secondo Turno (14:00-20:00)</option>
        <option value="doppio">Doppio Turno (08:00-20:00)</option>
        <option value="ferie">Ferie</option>
        <option value="riposo">Riposo</option>
        <option value="festivo">Festivo</option>
        <option value="malattia">Malattia</option>
      `;

      dayBox.appendChild(label);
      dayBox.appendChild(shiftSelect);
      weekRow.appendChild(dayBox);
    });

    section.appendChild(weekRow);
    calendarEl.appendChild(section);
  });
}

function getWeekDates(startDate) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = d.toISOString().split('T')[0];
    const dateString = d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    dates.push({ key, dateString });
  }
  return dates;
}

function getMonday(d) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function getDaysOfWeek() {
  return days;
}
