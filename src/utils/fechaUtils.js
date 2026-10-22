// Convierte una fecha en DD/MM/YYYY o ISO a YYYY-MM-DD (formato que exige <input type="date">).
export function formatearFechaParaInput(dateStr) {
  if (!dateStr) return '';
  if (dateStr.includes('T')) return dateStr.split('T')[0];
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      if (parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD/MM/YYYY
      if (parts[0].length === 4) return `${parts[0]}-${parts[1]}-${parts[2]}`; // YYYY/MM/DD
    }
  }
  return dateStr;
}
