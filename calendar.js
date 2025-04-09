import { getEmployees } from './employees.js';
import { saveShift } from './shifts.js';

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

  const table = document.createElement('table');
  table.classList.add('calendar-table');

  const headerRow = document.createElement('tr');
  headerRow.innerHTML = `<th>Giorno</th><th>Primo Turno</th><th>Secondo Turno</th>`;
  table.appendChild(headerRow);

  // Recupera lo schedule salvato in localStorage
  const savedSchedule = JSON.parse(localStorage.getItem('schedule')) || {};

  dates.forEach((dateObj, index) => {
    const row = document.createElement('tr');

    const dayCell = document.createElement('td');
    dayCell.textContent = `${days[index]} (${dateObj.dateString})`;
    row.appendChild(dayCell);

    ['primo', 'secondo'].forEach(turno => {
      const cell = document.createElement('td');

      const select = document.createElement('select');
      select.multiple = true;
      select.dataset.date = dateObj.key;
      select.dataset.shift = turno;
      select.classList.add('shift-select');

      // Aggiungi l'opzione "Chiuso"
      const chiusoOption = document.createElement('option');
      chiusoOption.value = "chiuso";
      chiusoOption.textContent = "Chiuso";
      select.appendChild(chiusoOption);

      // Aggiungi le opzioni per gli impiegati
      employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp;
        option.textContent = emp;
        select.appendChild(option);
      });

      // Se esistono dati salvati per questa data e turno, imposta le opzioni selezionate
      const savedValues = savedSchedule[dateObj.key] ? savedSchedule[dateObj.key][turno] : null;
      if (savedValues) {
        for (let i = 0; i < select.options.length; i++) {
          if (savedValues.includes(select.options[i].value)) {
            select.options[i].selected = true;
          }
        }
      }

      // Gestione del cambio selezione: se "Chiuso" è selezionato, deseleziona le altre opzioni
      select.addEventListener('change', () => {
        const selected = Array.from(select.selectedOptions).map(opt => opt.value);
        if (selected.includes("chiuso") && selected.length > 1) {
          for (const option of select.options) {
            if (option.value !== "chiuso") {
              option.selected = false;
            }
          }
        }
        const finalSelected = Array.from(select.selectedOptions).map(opt => opt.value);
        saveShift(dateObj.key, turno, finalSelected);
      });

      cell.appendChild(select);
      row.appendChild(cell);
    });

    table.appendChild(row);
  });

  calendarEl.appendChild(table);
}

// Aggiornata per formattare la data in locale (senza usare toISOString())
function getWeekDates(startDate) {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    // Formattazione della chiave usando metodi locali
    const key = d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
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