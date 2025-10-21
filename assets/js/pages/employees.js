import {
  addEmployee,
  getEmployees,
  removeEmployee,
  onEmployeesChange,
  offEmployeesChange
} from '../utils/employees.js';
import { clearEmployeeData } from '../utils/schedule.js';

let employeesChangeHandler = null;

export function initPage() {
  renderEmployeeList();
  setupForm();

  employeesChangeHandler = () => renderEmployeeList();
  onEmployeesChange(employeesChangeHandler);
}

export function teardownPage() {
  if (employeesChangeHandler) {
    offEmployeesChange(employeesChangeHandler);
    employeesChangeHandler = null;
  }
}

function setupForm() {
  const input = document.getElementById('employee-name');
  const addButton = document.getElementById('add-employee');

  addButton?.addEventListener('click', () => {
    const name = input?.value.trim();
    if (name && addEmployee(name)) {
      input.value = '';
    }
  });

  input?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addButton?.click();
    }
  });
}

function renderEmployeeList() {
  const list = document.getElementById('employee-list');
  if (!list) {
    return;
  }

  list.innerHTML = '';
  const employees = getEmployees();

  if (employees.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'Nessun dipendente registrato.';
    list.appendChild(empty);
    return;
  }

  employees.forEach(employee => {
    const item = document.createElement('li');
    item.textContent = employee;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Rimuovi';
    removeBtn.addEventListener('click', () => {
      if (removeEmployee(employee)) {
        clearEmployeeData(employee);
      }
    });

    item.appendChild(removeBtn);
    list.appendChild(item);
  });
}
