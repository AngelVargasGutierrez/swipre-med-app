const pool = require('../db/connection');
const { autoCategorizar } = require('../services/categoriaService');

function fmtFecha(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
}

function mapRow(m) {
  let lab = (m.laboratorio || '').trim();
  if (!lab || lab.toLowerCase().includes('genérico') || lab.toLowerCase().includes('generico')) {
    if (m.nombre && m.nombre.includes('-')) {
      lab = m.nombre.split('-').pop().trim();
    }
  }

  const cleanStr = (s) => (s && s.toLowerCase().trim() === 'desconocido') ? '' : s;
  let cat = cleanStr(m.categoria);
  const catLow = cat.toLowerCase();
  if (!cat || catLow === 'general' || catLow === 'sin categoría') {
    cat = autoCategorizar(m.nombre);
  }

  const stockNum = parseInt(m.stock) || 0;
  const minNum = parseInt(m.stock_min) || 0;
  let estadoVivo = 'Normal';
  if (stockNum <= minNum * 0.5) estadoVivo = 'Crítico';
  else if (stockNum < minNum) estadoVivo = 'Bajo';

  return {
    id:          m.id,
    codigo:      m.codigo,
    nombre:      m.nombre,
    laboratorio: cleanStr(lab),
    lote:        cleanStr(m.lote),
    stock:       stockNum,
    stockMin:    minNum,
    costoUnit:   parseFloat(m.costo_unit),
    precioVenta: parseFloat(m.precio_venta),
    vencimiento: fmtFecha(m.vencimiento),
    rSanitario:  cleanStr(m.r_sanitario),
    estado:      estadoVivo,
    categoria:   cat,
  };
}

async function findAll() {
  const [rows] = await pool.execute('SELECT * FROM medicamentos ORDER BY nombre');
  return rows.map(mapRow);
}

async function getTotales() {
  const [rows] = await pool.execute('SELECT * FROM medicamentos');
  const hoy = new Date();
  const en30Dias = new Date();
  en30Dias.setDate(hoy.getDate() + 30);

  let criticos = 0, bajos = 0, porVencer = 0;
  for (const m of rows) {
    if (m.stock <= m.stock_min * 0.5) criticos++;
    else if (m.stock < m.stock_min) bajos++;

    if (m.vencimiento) {
      const vDate = new Date(m.vencimiento);
      if (vDate <= en30Dias) porVencer++;
    }
  }

  return {
    total: rows.length,
    criticos,
    bajos,
    por_vencer: porVencer
  };
}

module.exports = { findAll, getTotales };
