import { calculateMonthlyHours } from '../utils/schedule.js';

export function initPage({ router, params }) {
  const employeeName = params.get('employee');
  const title = document.getElementById('detail-employee-name');
  const monthSelect = document.getElementById('month-selector');
  const detailContainer = document.getElementById('detail-hours');
  const backButton = document.getElementById('back-to-shifts');

  if (!title || !monthSelect || !detailContainer) {
    console.error('Template dettaglio dipendente incompleto');
    return;
  }

  backButton?.addEventListener('click', () => router.navigate('#hours'));

  if (!employeeName) {
    title.textContent = 'Dipendente non trovato';
    detailContainer.innerHTML = '<p>Seleziona un dipendente dalla pagina "Ore Dipendenti".</p>';
    return;
  }

  title.textContent = `Dettaglio: ${employeeName}`;

  populateMonthOptions(monthSelect);
  const defaultMonth = monthSelect.value;
  updateHours(detailContainer, employeeName, defaultMonth);

  monthSelect.addEventListener('change', () => {
    updateHours(detailContainer, employeeName, monthSelect.value);
  });
}

export function teardownPage() {}

function populateMonthOptions(select) {
  if (!select) {
    return;
  }
  const now = new Date();
  select.innerHTML = '';

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const option = document.createElement('option');
    option.value = value;
    option.textContent = date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
    select.appendChild(option);
  }

  const defaultDate = new Date(now.getFullYear(), now.getMonth(), 1);
  select.value = `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, '0')}`;
}

function updateHours(container, employeeName, month) {
  if (!container) {
    return;
  }
  const { totalHours, sundayHours } = calculateMonthlyHours(employeeName, month);
  container.innerHTML = '';

  const total = document.createElement('p');
  total.textContent = `Totale ore lavorate: ${totalHours} ore`;
  container.appendChild(total);

  const sunday = document.createElement('p');
  sunday.textContent = `Totale ore di domenica: ${sundayHours} ore`;
  container.appendChild(sunday);
}
