const pool = require('../db/connection');
const { autoCategorizar } = require('../services/categoriaService');

async function getAllMedData() {
  const [rows] = await pool.execute('SELECT * FROM medicamentos');
  return rows;
}

async function getStats() {
  const rows = await getAllMedData();
  const hoy = new Date();
  const en30Dias = new Date();
  en30Dias.setDate(hoy.getDate() + 30);

  let critico = 0, bajo = 0, porVencer = 0, valor = 0;
  for (const m of rows) {
    if (m.stock <= m.stock_min * 0.5) critico++;
    else if (m.stock < m.stock_min) bajo++;

    if (m.vencimiento) {
      const vDate = new Date(m.vencimiento);
      if (vDate <= en30Dias) porVencer++;
    }

    valor += (m.stock * parseFloat(m.costo_unit || 0));
  }

  return {
    total_medicamentos: rows.length,
    stock_critico: critico,
    stock_bajo: bajo,
    por_vencer: porVencer,
    valor_inventario: valor
  };
}

async function getStockPorCategoria() {
  const rows = await getAllMedData();
  const map = {};
  for (const m of rows) {
    let cat = (m.categoria || '').trim();
    const catLow = cat.toLowerCase();
    if (!cat || catLow === 'desconocido' || catLow === 'sin categoría' || catLow === 'general') {
      cat = autoCategorizar(m.nombre);
    }
    map[cat] = (map[cat] || 0) + (parseInt(m.stock) || 0);
  }
  return Object.entries(map)
    .map(([categoria, stock]) => ({ categoria, stock }))
    .sort((a, b) => b.stock - a.stock);
}

async function getEstadoStock() {
  const rows = await getAllMedData();
  const map = { Crítico: 0, Bajo: 0, Normal: 0 };
  for (const m of rows) {
    if (m.stock <= m.stock_min * 0.5) map.Crítico++;
    else if (m.stock < m.stock_min) map.Bajo++;
    else map.Normal++;
  }
  return Object.entries(map).map(([estado, total]) => ({ estado, total }));
}

async function getMovimientosSemana() {
  const [rows] = await pool.execute('SELECT dia, entradas, salidas FROM movimientos_semana');
  return rows;
}

async function getTop5Valor() {
  const [rows] = await pool.execute(
    'SELECT nombre, stock, precio_venta, (stock*precio_venta) AS valor FROM medicamentos ORDER BY valor DESC LIMIT 5'
  );
  return rows;
}

async function getAlertas() {
  const [rows] = await pool.execute(
    "SELECT titulo, descripcion, fecha, color FROM notificaciones WHERE leida = 0 AND prioridad = 'High' ORDER BY id DESC LIMIT 5"
  );
  return rows;
}

module.exports = { getStats, getStockPorCategoria, getEstadoStock, getMovimientosSemana, getTop5Valor, getAlertas };
