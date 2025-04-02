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

  const menuBtn = document.getElementById('menu-button');
  const dropdown = document.getElementById('menu-dropdown');

  menuBtn.addEventListener('click', () => {
    dropdown.classList.toggle('hidden');
  });

  dropdown.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;

      [
        'employee-section',
        'hours-section',
        'cleanup-section',
        'calendar-section',
        'week-navigation',
        'export-section'
      ].forEach(id => {
        document.getElementById(id).classList.add('hidden');
      });

      if (targetId === 'calendar-section') {
        ['calendar-section', 'week-navigation', 'export-section'].forEach(id => {
          document.getElementById(id).classList.remove('hidden');
        });
      } else {
        document.getElementById(targetId).classList.remove('hidden');
      }

      dropdown.classList.add('hidden');
    });
  });

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

  // === Calendario popup con flatpickr ===
  const calendarIcon = document.getElementById('calendar-icon');
  const calendarPopup = document.getElementById('calendar-popup');
  const calendarInput = document.getElementById('calendar-selector');

  if (calendarIcon && calendarPopup && calendarInput) {
    flatpickr(calendarInput, {
      inline: true,
      locale: 'it',
      weekNumbers: true,
      onChange: function (selectedDates) {
        if (selectedDates.length > 0) {
          const monday = getMonday(selectedDates[0]);
          currentWeekStart = new Date(monday);
          renderWeekLabel();
          calendarPopup.classList.add('hidden');
        }
      }
    });

    calendarIcon.addEventListener('click', () => {
      calendarPopup.classList.toggle('hidden');
    });

    document.addEventListener('click', (event) => {
      if (
        !calendarPopup.contains(event.target) &&
        !calendarIcon.contains(event.target)
      ) {
        calendarPopup.classList.add('hidden');
      }
    });
  }
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