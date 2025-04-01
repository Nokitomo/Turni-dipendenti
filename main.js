// main.js aggiornato con gestione settimana e esportazione PDF

import { initEmployeeModule } from './employees.js';
import { initCalendarModule, updateCalendarForWeek } from './calendar.js';
import { initShiftModule, getSchedule } from './shifts.js';
import { calculateMonthlyHours } from './utils.js';

function getMonday(d) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

let currentWeekStart = getMonday(new Date());

document.addEventListener('DOMContentLoaded', () => {
  initEmployeeModule();
  initCalendarModule();
  initShiftModule();
  renderWeekLabel();

  document.getElementById('prev-week').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderWeekLabel();
  });

  document.getElementById('next-week').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderWeekLabel();
  });

  // Esportazione PDF
  document.getElementById('export-pdf').addEventListener('click', () => {
    const doc = new jsPDF();
    const schedule = getSchedule();
    const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

    const data = Object.entries(schedule).map(([emp, shifts]) => {
      return [emp, ...days.map(day => shifts[day] || '')];
    });

    doc.text('Turni: ' + document.getElementById('current-week-label').textContent, 14, 16);
    doc.autoTable({
      head: [['Dipendente', ...days]],
      body: data,
      startY: 20
    });
    doc.save('turni_settimana.pdf');
  });
});

function formatDate(date) {
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function renderWeekLabel() {
  const endDate = new Date(currentWeekStart);
  endDate.setDate(currentWeekStart.getDate() + 6);
  document.getElementById('current-week-label').textContent =
    formatDate(currentWeekStart) + ' - ' + formatDate(endDate);

  updateCalendarForWeek(currentWeekStart);
}