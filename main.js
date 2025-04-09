import { initEmployeeModule } from './employees.js';
import { initCalendarModule, updateCalendarForWeek, getDaysOfWeek } from './calendar.js';
import { initShiftModule, getSchedule } from './shifts.js';

function getMonday(d) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

let currentWeekStart = getMonday(new Date());
let flatpickrInstance = null; // Istanza per il popup calendario

document.addEventListener('DOMContentLoaded', () => {
  initEmployeeModule();
  initCalendarModule();
  initShiftModule();
  renderWeekLabel();

  // Navigazione settimanale
  document.getElementById('prev-week').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderWeekLabel();
  });
  document.getElementById('next-week').addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderWeekLabel();
  });
  document.getElementById('today').addEventListener('click', () => {
    currentWeekStart = getMonday(new Date());
    renderWeekLabel();
    if (flatpickrInstance) {
      flatpickrInstance.setDate(new Date(), false);
    }
  });

  // Esportazione PDF
  document.getElementById('export-pdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const schedule = getSchedule();
    const days = getDaysOfWeek();
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
    const employeesSet = new Set();
    const dataMap = {};
    currentWeekDates.forEach((date, index) => {
      const dayLabel = days[index];
      const shifts = schedule[date] || {};
      for (const shiftType in shifts) {
        const names = shifts[shiftType] || [];
        names.forEach(name => {
          employeesSet.add(name);
          if (!dataMap[name]) dataMap[name] = {};
          dataMap[name][dayLabel] = dataMap[name][dayLabel]
            ? dataMap[name][dayLabel] + ', ' + shiftType
            : shiftType;
        });
      }
    });
    const employees = Array.from(employeesSet);
    const tableData = employees.map(name => {
      const row = [name];
      for (const day of days) {
        row.push(dataMap[name]?.[day] || '');
      }
      return row;
    });
    doc.text('Turni: ' + document.getElementById('current-week-label').textContent, 14, 16);
    doc.autoTable({
      head: [['Dipendente', ...days]],
      body: tableData,
      startY: 20
    });
    doc.output('dataurlnewwindow');
  });

  // Gestione del menu
  const menuBtn = document.getElementById('menu-button');
  const dropdown = document.getElementById('menu-dropdown');
  menuBtn.addEventListener('click', () => {
    dropdown.classList.toggle('hidden');
  });
  // Qui nascondiamo tutte le sezioni, incluso il dettaglio, prima di mostrare quella selezionata
  dropdown.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const sectionsToHide = [
        'employee-section',
        'hours-section',
        'cleanup-section',
        'calendar-section',
        'week-navigation',
        'export-section',
        'employee-detail' // Aggiunto per nascondere la sezione dettaglio
      ];
      sectionsToHide.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
      });
      if (targetId === 'calendar-section') {
        ['calendar-section', 'week-navigation', 'export-section'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.classList.remove('hidden');
        });
      } else {
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.classList.remove('hidden');
      }
      dropdown.classList.add('hidden');
    });
  });

  // Pulizia automatica dei dati
  const cleanupSelect = document.getElementById('cleanup-select');
  if (cleanupSelect) {
    const savedPolicy = localStorage.getItem('cleanup-policy');
    if (savedPolicy) {
      cleanupSelect.value = savedPolicy;
    }
    cleanupSelect.addEventListener('change', () => {
      const value = cleanupSelect.value;
      localStorage.setItem('cleanup-policy', value);
      cleanOldData();
    });
    cleanOldData();
  }

  // Gestione del popup del calendario
  const calendarIcon = document.getElementById('calendar-icon');
  const calendarPopup = document.getElementById('calendar-popup');
  const calendarInput = document.getElementById('calendar-selector');
  if (calendarIcon && calendarPopup && calendarInput) {
    calendarIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      if (calendarPopup.classList.contains('hidden')) {
        calendarPopup.classList.remove('hidden');
        if (!flatpickrInstance) {
          flatpickrInstance = flatpickr(calendarInput, {
            inline: true,
            locale: 'it',
            weekNumbers: true,
            defaultDate: new Date(),
            onChange: function (selectedDates) {
              if (selectedDates.length > 0) {
                const monday = getMonday(selectedDates[0]);
                currentWeekStart = new Date(monday);
                renderWeekLabel();
                calendarPopup.classList.add('hidden');
              }
            }
          });
        }
      } else {
        calendarPopup.classList.add('hidden');
      }
    });
    document.addEventListener('click', (event) => {
      if (!calendarPopup.contains(event.target) && !calendarIcon.contains(event.target)) {
        calendarPopup.classList.add('hidden');
      }
    });
  }

  // Funzione globale per mostrare il dettaglio di un dipendente
  window.showEmployeeDetail = function(employeeName) {
    // Quando mostriamo il dettaglio, l'utente proviene dalla pagina "Ore Dipendenti",
    // quindi il pulsante "Indietro" nella pagina dettaglio verrà visualizzato (gestito in employee-details.js)
    document.getElementById('calendar-section').classList.add('hidden');
    document.getElementById('employee-section').classList.add('hidden');
    // Nascondiamo anche la navigazione e l'export della pagina principale
    document.getElementById('week-navigation').classList.add('hidden');
    document.getElementById('export-section').classList.add('hidden');
    document.getElementById('hours-section').classList.remove('hidden');

    // Mostro la sezione dettaglio
    const detailSection = document.getElementById('employee-detail');
    detailSection.classList.remove('hidden');
    document.getElementById('detail-employee-name').textContent = `Dettaglio: ${employeeName}`;

    // Imposta di default l'input mese all'ultimo mese
    const monthInput = document.getElementById('month-selector');
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth(); // 0=gennaio
    if (month === 0) {
      month = 12;
      year--;
    }
    monthInput.value = `${year}-${month.toString().padStart(2, '0')}`;
    updateEmployeeDetail(employeeName, monthInput.value);
  };

  // Listener per cambio mese nel dettaglio
  const monthInput = document.getElementById('month-selector');
  monthInput.addEventListener('change', () => {
    const employeeName = document.getElementById('detail-employee-name').textContent.replace('Dettaglio: ', '');
    updateEmployeeDetail(employeeName, monthInput.value);
  });

  // Listener per il pulsante "Indietro" nella pagina del dettaglio
  document.getElementById('back-to-shifts').addEventListener('click', () => {
    // Nascondi la sezione dettaglio
    document.getElementById('employee-detail').classList.add('hidden');
    // Mostra solo la sezione "Ore Dipendenti"
    // Nascondiamo le altre sezioni della pagina principale
    document.getElementById('calendar-section').classList.add('hidden');
    document.getElementById('employee-section').classList.add('hidden');
    document.getElementById('cleanup-section').classList.add('hidden');
    document.getElementById('export-section').classList.add('hidden');
    document.getElementById('week-navigation').classList.add('hidden');
    document.getElementById('hours-section').classList.remove('hidden');
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

function cleanOldData() {
  const months = parseInt(localStorage.getItem('cleanup-policy'));
  if (isNaN(months)) return;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const cutoffKey = cutoff.toISOString().split('T')[0];
  let schedule = JSON.parse(localStorage.getItem('schedule')) || {};
  let modified = false;
  for (const date in schedule) {
    if (date < cutoffKey) {
      delete schedule[date];
      modified = true;
    }
  }
  if (modified) {
    localStorage.setItem('schedule', JSON.stringify(schedule));
    location.reload();
  }
}

function updateEmployeeDetail(employeeName, monthStr) {
  // monthStr è in formato "YYYY-MM"
  const schedule = JSON.parse(localStorage.getItem('schedule')) || {};
  const shiftHours = { primo: 6, secondo: 6 };
  let total = 0;
  let sundayTotal = 0;
  for (const dateStr in schedule) {
    if (dateStr.startsWith(monthStr)) {
      const dateObj = new Date(dateStr);
      for (const shift in schedule[dateStr]) {
        const empList = schedule[dateStr][shift];
        if (empList.includes(employeeName)) {
          total += shiftHours[shift] || 0;
          if (dateObj.getDay() === 0) {
            sundayTotal += shiftHours[shift] || 0;
          }
        }
      }
    }
  }
  const detailDiv = document.getElementById('detail-hours');
  detailDiv.innerHTML = `<p>Totale ore lavorate: ${total} ore</p>`;
  if (sundayTotal > 0) {
    detailDiv.innerHTML += `<p>Totale ore di domenica: ${sundayTotal} ore</p>`;
  }
}