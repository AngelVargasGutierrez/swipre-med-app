const BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

async function req(path, options = {}) {
  const { timeoutMs, ...fetchOptions } = options;
  const controller = timeoutMs ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : null;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...fetchOptions,
      signal: controller?.signal,
    });
  } catch (err) {
    if (timer) clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('El servidor tardó demasiado en responder. Intente de nuevo.');
    }
    throw err;
  }
  if (timer) clearTimeout(timer);
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        res.ok
          ? 'Respuesta inválida del servidor'
          : `Error ${res.status}: reinicia el backend (puerto 3001) y vuelve a intentar`
      );
    }
  }
  if (!res.ok) throw new Error(data.error || `Error ${res.status} en la solicitud`);
  return data;
}

export const api = {
  /* Auth */
  login: (username, password) =>
    req('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  /* Dashboard */
  getDashboard: () => req('/dashboard'),

  /* Medicamentos */
  getMedicamentos:    (categoria) => {
    const params = new URLSearchParams();
    if (categoria) params.set('categoria', categoria);
    return req(`/medicamentos${params.toString() ? '?' + params.toString() : ''}`);
  },
  buscarMedicamentosIA: (q, laboratorio = '') => {
    const params = new URLSearchParams({ q });
    if (laboratorio) params.set('laboratorio', laboratorio);
    return req(`/medicamentos/buscar-ia?${params}`);
  },
  getSugerenciasIA:   (q) => req(`/medicamentos/sugerencias-ia?q=${encodeURIComponent(q)}`),
  getVariantesIA:     (base, laboratorio = '') => {
    const params = new URLSearchParams({ q: base });
    if (laboratorio) params.set('laboratorio', laboratorio);
    return req(`/medicamentos/variantes-ia?${params}`, { timeoutMs: 12000 });
  },
  getMedicamento:     (id)   => req(`/medicamentos/${id}`),
  createMedicamento:  (data) => req('/medicamentos', { method: 'POST', body: JSON.stringify(data) }),
  registrarLote:      (id, data) => req(`/medicamentos/lote/${id}`, { method: 'POST', body: JSON.stringify(data) }),
  updateMedicamento:  (id, data) => req(`/medicamentos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMedicamento:  (id)   => req(`/medicamentos/${id}`, { method: 'DELETE' }),

  /* Laboratorios / Categorías */
  getLaboratorios: () => req('/laboratorios'),
  getCategorias:   () => req('/laboratorios/categorias'),

  /* Inventario */
  getInventario: () => req('/inventario'),

  /* Notificaciones */
  getNotificaciones: () => req('/notificaciones'),
  marcarLeida:       (id) => req(`/notificaciones/${id}/leer`, { method: 'PATCH' }),
  marcarTodas:       ()   => req('/notificaciones/leer-todas', { method: 'PATCH' }),

  /* Analytics */
  getAnalytics: () => req('/analytics'),

  /* Reportes */
  getReporteResumen: () => req('/reportes/resumen'),
  getMovimientos:    () => req('/reportes/movimientos'),
  getReporteRotacion:() => req('/reportes/rotacion'),

  /* Usuarios */
  getUsers:         ()              => req('/users'),
  createUser:       (data)          => req('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser:       (id, data)      => req(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleUserEstado: (id, operador)  => req(`/users/${id}/toggle`, { method: 'PATCH', body: JSON.stringify({ operador }) }),
  deleteUser:       (id, operador)  => req(`/users/${id}`, { method: 'DELETE', body: JSON.stringify({ operador }) }),
};
