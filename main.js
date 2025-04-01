import { initEmployeeModule } from './employees.js';
import { initCalendarModule, updateCalendarForWeek, getDaysOfWeek } from './calendar.js';
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

  // Esportazione PDF in una nuova scheda
  document.getElementById('export-pdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const schedule = getSchedule();
    const days = getDaysOfWeek();

    // Calcola le date effettive della settimana corrente (YYYY-MM-DD)
    const currentWeekDates = (() => {
      const result = [];
      const start = new Date(currentWeekStart);
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        result.push(d.toISOString().split('T')[0]);
      }
      return result;
    })();

    // Crea la tabella dati: per ogni dipendente, turno per ciascun giorno
    const data = Object.entries(schedule).map(([emp, shifts]) => {
      return [emp, ...currentWeekDates.map(date => shifts[date] || '')];
    });

    doc.text('Turni: ' + document.getElementById('current-week-label').textContent, 14, 16);
    doc.autoTable({
      head: [['Dipendente', ...days]],
      body: data,
      startY: 20
    });

    // Mostra il PDF in una nuova scheda (non scarica direttamente)
    doc.output('dataurlnewwindow');
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