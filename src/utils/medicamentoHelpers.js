function normalizar(texto) {
  return String(texto || '').trim().toLowerCase();
}

export function hoyMasMeses(meses) {
  const fecha = new Date();
  fecha.setMonth(fecha.getMonth() + meses);
  return fecha.toISOString().slice(0, 10);
}

export function coincideConBusqueda(medicamento, textoBusqueda) {
  const query = normalizar(textoBusqueda);
  if (!query) return true;
  const campos = [
    medicamento.nombre,
    medicamento.codigo,
    medicamento.laboratorio,
    medicamento.categoria,
  ].map(normalizar);
  return campos.some(campo => campo.includes(query));
}

export function etiquetaMotor(motor) {
  if (motor === 'gemini') return { texto: 'Gemini IA', clase: 'ia-motor-gemini' };
  if (motor === 'base-de-datos') return { texto: 'Base de datos', clase: 'ia-motor-bd' };
  if (motor === 'catalogo-local') return { texto: 'Catálogo local', clase: 'ia-motor-catalogo' };
  return null;
}
