// Recupera il nome del dipendente dalla query string, ad es. ?employee=Marco
const params = new URLSearchParams(window.location.search);
const employeeName = params.get('employee') || 'Dipendente sconosciuto';
document.getElementById('employee-name-display').textContent = employeeName;

// Recupera la provenienza dalla sessionStorage (dovrà essere impostata nella pagina "Ore Dipendenti")
const previousPage = sessionStorage.getItem('previousPage') || '';

// Se l'utente non proviene da "ore-dipendenti", nascondi il pulsante "Indietro"
if (previousPage !== 'ore-dipendenti') {
  document.getElementById('back-btn').style.display = 'none';
}

// Popola il selettore dei mesi (usando ad es. gli ultimi 12 mesi)
const monthSelect = document.getElementById('month-select');
const now = new Date();
// Definisce l'ultimo mese completo: se siamo a metà mese, considera il mese precedente
const lastCompleteMonth = (now.getDate() < 15)
  ? new Date(now.getFullYear(), now.getMonth() - 1, 1)
  : new Date(now.getFullYear(), now.getMonth(), 1);
for (let i = 0; i < 12; i++) {
  let d = new Date(lastCompleteMonth.getFullYear(), lastCompleteMonth.getMonth() - i, 1);
  // Formatta il mese (es. "Febbraio 2023")
  let optionText = d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  let option = document.createElement('option');
  option.value = d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0');
  option.textContent = optionText;
  monthSelect.appendChild(option);
}
// Imposta il mese predefinito come il primo dell'elenco
monthSelect.value = lastCompleteMonth.getFullYear() + '-' + (lastCompleteMonth.getMonth() + 1).toString().padStart(2, '0');

// Funzione per calcolare le ore lavorate per un dipendente in un mese
function calculateHoursForEmployee(employee, monthStr) {
  // Recupera il schedule da localStorage
  const schedule = JSON.parse(localStorage.getItem('schedule')) || {};
  let totalHours = 0;
  let sundayHours = 0;
  // Supponiamo che le ore di ciascun turno siano fisse, come nel file shifts.js:
  const shiftHours = { primo: 6, secondo: 6 };

  // Estrai anno e mese
  const [year, month] = monthStr.split('-').map(Number);

  // Per ogni data nel schedule
  for (const dateStr in schedule) {
    const date = new Date(dateStr);
    if (date.getFullYear() === year && (date.getMonth() + 1) === month) {
      // Per ogni turno in quella data
      for (const turno in schedule[dateStr]) {
        const empList = schedule[dateStr][turno];
        if (empList.includes(employee)) {
          totalHours += shiftHours[turno] || 0;
          // Se il giorno è domenica (0 in JavaScript)
          if (date.getDay() === 0) {
            sundayHours += shiftHours[turno] || 0;
          }
        }
      }
    }
  }
  return { totalHours, sundayHours };
}

// Funzione per aggiornare il riepilogo ore in base al mese selezionato
function updateHours() {
  const monthStr = monthSelect.value;
  const { totalHours, sundayHours } = calculateHoursForEmployee(employeeName, monthStr);
  document.getElementById('total-hours').textContent = `Totale ore lavorate: ${totalHours} ore`;
  document.getElementById('sunday-hours').textContent = `Totale ore di domenica: ${sundayHours} ore`;
}

// Aggiorna il riepilogo quando si cambia il mese
monthSelect.addEventListener('change', updateHours);

// Aggiorna subito il riepilogo
updateHours();

// Pulsante "Indietro": se l'utente proviene da "ore-dipendenti", torna a quella pagina; altrimenti usa history.back()
document.getElementById('back-btn').addEventListener('click', () => {
  if (previousPage === 'ore-dipendenti') {
    window.location.href = 'ore-dipendenti.html';
  } else {
    window.history.back();
  }
});