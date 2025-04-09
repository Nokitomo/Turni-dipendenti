// employee-details.js

// Recupera il nome del dipendente dalla query string, ad es. ?employee=Marco
const params = new URLSearchParams(window.location.search);
const employeeName = params.get('employee') || 'Dipendente sconosciuto';
document.getElementById('employee-name-display').textContent = employeeName;

// Recupera la provenienza dalla sessionStorage (deve essere impostata nella pagina "Ore Dipendenti")
const previousPage = sessionStorage.getItem('previousPage') || '';

// Se l'utente non proviene da "ore-dipendenti", nascondi il pulsante "Indietro"
if (previousPage !== 'ore-dipendenti') {
  document.getElementById('back-btn').style.display = 'none';
}

// Imposta il campo mese (selettore con id "month-select") al mese corrente
const monthInput = document.getElementById('month-select');
const now = new Date();
const defaultMonth = now.getFullYear() + '-' + ((now.getMonth() + 1).toString().padStart(2, '0'));
monthInput.value = defaultMonth;

// Popola il selettore dei mesi con gli ultimi 12 mesi
for (let i = 0; i < 12; i++) {
  let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
  let optionText = d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  let option = document.createElement('option');
  option.value = d.getFullYear() + '-' + ((d.getMonth() + 1).toString().padStart(2, '0'));
  option.textContent = optionText;
  monthInput.appendChild(option);
}

// Funzione per calcolare le ore lavorate per un dipendente in un mese
function calculateHoursForEmployee(employee, monthStr) {
  // Recupera il schedule da localStorage
  const schedule = JSON.parse(localStorage.getItem('schedule')) || {};
  let totalHours = 0;
  let sundayHours = 0;
  // Definiamo le ore per ogni turno, come in shifts.js
  const shiftHours = { primo: 6, secondo: 6 };

  // Estrai anno e mese dal formato "YYYY-MM"
  const [year, month] = monthStr.split('-').map(Number);

  // Per ogni data presente nello schedule
  for (const dateStr in schedule) {
    const date = new Date(dateStr);
    // Controlla se la data corrisponde all'anno e al mese selezionato
    if (date.getFullYear() === year && (date.getMonth() + 1) === month) {
      // Per ogni turno di quella data
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
  const monthStr = monthInput.value;
  const { totalHours, sundayHours } = calculateHoursForEmployee(employeeName, monthStr);
  document.getElementById('total-hours').textContent = `Totale ore lavorate: ${totalHours} ore`;
  document.getElementById('sunday-hours').textContent = `Totale ore di domenica: ${sundayHours} ore`;
}

// Aggiungi un listener per aggiornare il riepilogo ogni volta che l'utente cambia il mese
monthInput.addEventListener('change', updateHours);

// Aggiorna subito il riepilogo al caricamento della pagina
updateHours();

// Gestione del pulsante "Indietro":
// Se l'utente proviene da "ore-dipendenti", torna alla sezione "Ore Dipendenti" (es. index.html#hours-section)
// Altrimenti, usa history.back()
document.getElementById('back-btn').addEventListener('click', () => {
  if (previousPage === 'ore-dipendenti') {
    window.location.href = 'index.html#hours-section';
  } else {
    window.history.back();
  }
});