/** Respaldo local si Gemini no está disponible (cuota, red, clave). */
const CATALOGO = [
  { nombre: 'Paracetamol 500 mg Tableta', categoria: 'Analgésicos', presentacion: 'Tableta 500 mg', fuente: 'Catálogo local' },
  { nombre: 'Paracetamol 750 mg Tableta', categoria: 'Analgésicos', presentacion: 'Tableta 750 mg', fuente: 'Catálogo local' },
  { nombre: 'Paracetamol 100 mg/5 mL Jarabe', categoria: 'Analgésicos', presentacion: 'Jarabe pediátrico', fuente: 'Catálogo local' },
  { nombre: 'Ibuprofeno 400 mg Tableta', categoria: 'Analgésicos', presentacion: 'Tableta 400 mg', fuente: 'Catálogo local' },
  { nombre: 'Amoxicilina 500 mg Cápsula', categoria: 'Antibióticos', presentacion: 'Cápsula 500 mg', fuente: 'Catálogo local' },
  { nombre: 'Omeprazol 20 mg Cápsula', categoria: 'Antiácidos', presentacion: 'Cápsula 20 mg', fuente: 'Catálogo local' },
  { nombre: 'Losartán 50 mg Tableta', categoria: 'Cardiovascular', presentacion: 'Tableta 50 mg', fuente: 'Catálogo local' },
  { nombre: 'Metformina 500 mg Tableta', categoria: 'Antidiabéticos', presentacion: 'Tableta 500 mg', fuente: 'Catálogo local' },
  { nombre: 'Salbutamol 100 mcg Inhalador', categoria: 'Broncodilatadores', presentacion: 'Inhalador 100 mcg', fuente: 'Catálogo local' },
  { nombre: 'Loratadina 10 mg Tableta', categoria: 'Antihistamínicos', presentacion: 'Tableta 10 mg', fuente: 'Catálogo local' },
  { nombre: 'Acetaminofén 500 mg Jarabe', categoria: 'Analgésicos', presentacion: 'Jarabe 500 mg', fuente: 'Catálogo local' },
];

function buscarLocal(query, limit = 6) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  return CATALOGO.filter(x => x.nombre.toLowerCase().includes(q)).slice(0, limit);
}

function buscarVariantes(nombreBase, limit = 8) {
  const base = (nombreBase || '').trim().toLowerCase();
  const palabra = base.split(/\s+/)[0];
  if (!palabra || palabra.length < 2) return [];

  return CATALOGO
    .filter(x => {
      const n = x.nombre.toLowerCase();
      return n.includes(palabra) || palabra.includes(n.split(' ')[0]);
    })
    .slice(0, limit);
}

module.exports = { buscarLocal, buscarVariantes, CATALOGO };
