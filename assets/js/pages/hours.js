import {
  getEmployees,
  onEmployeesChange,
  offEmployeesChange
} from '../utils/employees.js';
import {
  calculateEmployeeTotals,
  onScheduleChange,
  offScheduleChange
} from '../utils/schedule.js';

let scheduleHandler = null;
let employeesHandler = null;
let currentRouter = null;

export function initPage({ router }) {
  currentRouter = router;
  renderWorkedHours();

  scheduleHandler = () => renderWorkedHours();
  employeesHandler = () => renderWorkedHours();

  onScheduleChange(scheduleHandler);
  onEmployeesChange(employeesHandler);
}

export function teardownPage() {
  if (scheduleHandler) {
    offScheduleChange(scheduleHandler);
    scheduleHandler = null;
  }
  if (employeesHandler) {
    offEmployeesChange(employeesHandler);
    employeesHandler = null;
  }
  currentRouter = null;
}

function renderWorkedHours() {
  const container = document.getElementById('worked-hours');
  if (!container) {
    return;
  }

  container.innerHTML = '';
  const employees = getEmployees();

  if (employees.length === 0) {
    container.textContent = 'Aggiungi almeno un dipendente per visualizzare le ore.';
    return;
  }

  const totals = calculateEmployeeTotals(employees);

  const hasHours = Object.values(totals).some(total => total > 0);
  if (!hasHours) {
    container.textContent = 'Nessuna ora registrata per i dipendenti.';
    return;
  }

  employees.forEach(employee => {
    const total = totals[employee] || 0;
    if (total === 0) {
      return;
    }
    const item = document.createElement('p');
    item.textContent = `${employee}: ${total} ore lavorate`;
    item.classList.add('employee-item');
    item.addEventListener('click', () => {
      currentRouter?.navigate('#employee-details', { employee });
    });
    container.appendChild(item);
  });
}
