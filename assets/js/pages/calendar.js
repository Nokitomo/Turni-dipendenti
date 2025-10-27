import { getEmployees, onEmployeesChange, offEmployeesChange } from '../utils/employees.js';
import {
  getSchedule,
  saveShift,
  onScheduleChange,
  offScheduleChange
} from '../utils/schedule.js';

const days = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

let currentWeekStart = null;
let flatpickrInstance = null;
let documentClickHandler = null;
let employeesChangeHandler = null;
let scheduleChangeHandler = null;

export function initPage() {
  currentWeekStart = getMonday(new Date());

  renderWeekLabel();
  setupWeekNavigation();
  setupExport();
  setupDatePicker();

  employeesChangeHandler = () => renderCalendar(currentWeekStart);
  scheduleChangeHandler = () => renderCalendar(currentWeekStart);

  onEmployeesChange(employeesChangeHandler);
  onScheduleChange(scheduleChangeHandler);
}

export function teardownPage() {
  if (flatpickrInstance) {
    flatpickrInstance.destroy();
    flatpickrInstance = null;
  }
  if (documentClickHandler) {
    document.removeEventListener('click', documentClickHandler);
    documentClickHandler = null;
  }
  if (employeesChangeHandler) {
    offEmployeesChange(employeesChangeHandler);
    employeesChangeHandler = null;
  }
  if (scheduleChangeHandler) {
    offScheduleChange(scheduleChangeHandler);
    scheduleChangeHandler = null;
  }
}

function setupWeekNavigation() {
  const prevButton = document.getElementById('prev-week');
  const nextButton = document.getElementById('next-week');
  const todayButton = document.getElementById('today');

  prevButton?.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderWeekLabel();
  });

  nextButton?.addEventListener('click', () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderWeekLabel();
  });

  todayButton?.addEventListener('click', () => {
    currentWeekStart = getMonday(new Date());
    renderWeekLabel();
    if (flatpickrInstance) {
      flatpickrInstance.setDate(new Date(), false);
    }
  });
}

function setupExport() {
  const exportButton = document.getElementById('export-pdf');
  exportButton?.addEventListener('click', () => {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      console.error('jsPDF non disponibile');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const schedule = getSchedule();
    const currentWeekDates = getCurrentWeekDates();

    const employeesSet = new Set();
    const dataMap = {};

    currentWeekDates.forEach(({ iso, label }) => {
      const shifts = schedule[iso] || {};
      Object.keys(shifts).forEach(shiftType => {
        const people = (shifts[shiftType] || []).filter(name => name !== 'chiuso');
        people.forEach(name => {
          employeesSet.add(name);
          if (!dataMap[name]) {
            dataMap[name] = {};
          }
          dataMap[name][label] = dataMap[name][label]
            ? `${dataMap[name][label]}, ${shiftType}`
            : shiftType;
        });
      });
    });

    const employees = Array.from(employeesSet);
    const tableData = employees.map(name => {
      const row = [name];
      days.forEach(day => {
        row.push(dataMap[name]?.[day] || '');
      });
      return row;
    });

    const weekLabel = document.getElementById('current-week-label')?.textContent || '';
    doc.text(`Turni: ${weekLabel}`, 14, 16);
    doc.autoTable({
      head: [['Dipendente', ...days]],
      body: tableData,
      startY: 20
    });
    doc.output('dataurlnewwindow');
  });
}

function setupDatePicker() {
  const calendarIcon = document.getElementById('calendar-icon');
  const calendarPopup = document.getElementById('calendar-popup');
  const calendarInput = document.getElementById('calendar-selector');

  if (!calendarIcon || !calendarPopup || !calendarInput || typeof flatpickr === 'undefined') {
    return;
  }

  calendarIcon.addEventListener('click', (event) => {
    event.stopPropagation();
    if (calendarPopup.classList.contains('hidden')) {
      calendarPopup.classList.remove('hidden');
      if (!flatpickrInstance) {
        flatpickrInstance = flatpickr(calendarInput, {
          inline: true,
          locale: Object.assign({}, flatpickr.l10ns?.it || {}, { firstDayOfWeek: 1 }),
          weekNumbers: true,
          defaultDate: new Date(),
          onChange(selectedDates) {
            if (selectedDates.length > 0) {
              currentWeekStart = getMonday(selectedDates[0]);
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

  if (documentClickHandler) {
    document.removeEventListener('click', documentClickHandler);
  }

  documentClickHandler = (event) => {
    if (!calendarPopup.contains(event.target) && !calendarIcon.contains(event.target)) {
      calendarPopup.classList.add('hidden');
    }
  };

  document.addEventListener('click', documentClickHandler);
}

function renderCalendar(startDate) {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) {
    return;
  }

  calendarEl.innerHTML = '';

  const employees = getEmployees();
  const dates = getWeekDates(startDate);
  const schedule = getSchedule();

  const table = document.createElement('table');
  table.classList.add('calendar-table');

  const headerRow = document.createElement('tr');
  headerRow.innerHTML = '<th>Giorno</th><th>Primo Turno</th><th>Secondo Turno</th>';
  table.appendChild(headerRow);

  dates.forEach((dateObj, index) => {
    const row = document.createElement('tr');

    const dayCell = document.createElement('td');
    dayCell.textContent = `${days[index]} (${dateObj.dateString})`;
    row.appendChild(dayCell);

    ['primo', 'secondo'].forEach(shiftType => {
      const cell = document.createElement('td');
      const select = document.createElement('select');
      select.multiple = true;
      select.dataset.date = dateObj.key;
      select.dataset.shift = shiftType;
      select.classList.add('shift-select');

      const closedOption = document.createElement('option');
      closedOption.value = 'chiuso';
      closedOption.textContent = 'Chiuso';
      select.appendChild(closedOption);

      employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp;
        option.textContent = emp;
        select.appendChild(option);
      });

      const savedValues = schedule[dateObj.key]?.[shiftType] || [];
      for (const option of select.options) {
        if (savedValues.includes(option.value)) {
          option.selected = true;
        }
      }

      select.addEventListener('change', () => {
        const selected = Array.from(select.selectedOptions).map(opt => opt.value);
        if (selected.includes('chiuso') && selected.length > 1) {
          for (const option of select.options) {
            if (option.value !== 'chiuso') {
              option.selected = false;
            }
          }
        }
        const finalSelected = Array.from(select.selectedOptions).map(opt => opt.value);
        saveShift(dateObj.key, shiftType, finalSelected);
      });

      cell.appendChild(select);
      row.appendChild(cell);
    });

    table.appendChild(row);
  });

  calendarEl.appendChild(table);
}

function renderWeekLabel() {
  const label = document.getElementById('current-week-label');
  if (!label) {
    return;
  }

  const endDate = new Date(currentWeekStart);
  endDate.setDate(currentWeekStart.getDate() + 6);
  label.textContent = `${formatDate(currentWeekStart)} - ${formatDate(endDate)}`;
  renderCalendar(currentWeekStart);
}

function getWeekDates(startDate) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + i);
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    const dateString = current.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    dates.push({ key, dateString });
  }
  return dates;
}

function getCurrentWeekDates() {
  const dates = [];
  const start = new Date(currentWeekStart);
  for (let i = 0; i < 7; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    const iso = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
    dates.push({ iso, label: days[i] });
  }
  return dates;
}

function formatDate(date) {
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function getMonday(date) {
  const temp = new Date(date);
  const day = temp.getDay();
  const diff = temp.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(temp.setDate(diff));
}
