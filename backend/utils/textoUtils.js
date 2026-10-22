function norm(texto) {
  return (texto || '').trim().toLowerCase();
}

function filtrarInventario(medicamentos, query, sugerenciasIA = []) {
  const q = norm(query);
  if (!q) return medicamentos;

  const terminos = new Set([q]);
  for (const s of sugerenciasIA) {
    const n = norm(s.nombre);
    if (n) terminos.add(n);
    n.split(/\s+/).slice(0, 2).forEach(p => { if (p.length > 2) terminos.add(p); });
  }

  return medicamentos.filter(m => {
    const campos = [
      norm(m.nombre),
      norm(m.codigo),
      norm(m.laboratorio),
      norm(m.categoria),
    ];
    for (const t of terminos) {
      if (campos.some(c => c.includes(t) || t.includes(c.split(' ')[0]))) return true;
    }
    return false;
  });
}

module.exports = { norm, filtrarInventario };
