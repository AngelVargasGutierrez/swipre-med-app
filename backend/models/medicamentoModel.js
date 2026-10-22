const pool = require('../db/connection');

function fmtFecha(dateVal) {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  return `${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/${d.getUTCFullYear()}`;
}

const { autoCategorizar, getTodasCategorias } = require('../services/categoriaService');

// Umbral del semáforo de inventario: a partir de este porcentaje del stock
// mínimo (o menos), el medicamento se considera "Crítico" en vez de "Bajo".
const UMBRAL_CRITICO_PORCENTAJE = 0.5;

function calcEstado(stock, stockMin) {
  if (stock <= stockMin * UMBRAL_CRITICO_PORCENTAJE) return 'Crítico';
  if (stock < stockMin)                              return 'Bajo';
  return 'Normal';
}

// El alta de medicamento (NuevoMedicamento) envía la fecha ya convertida a
// DD/MM/YYYY, mientras que la edición (ModalEditarMedicamento) reenvía el
// valor del <input type="date"> tal cual, en ISO (YYYY-MM-DD). Esta función
// normaliza ambos casos al formato YYYY-MM-DD que espera la columna DATE.
function normalizarFechaParaBD(vencimiento) {
  if (!vencimiento) return null;
  return vencimiento.includes('/') ? vencimiento.split('/').reverse().join('-') : vencimiento;
}

function mapRow(fila) {
  let lab = (fila.laboratorio || '').trim();
  if (!lab || lab.toLowerCase().includes('genérico') || lab.toLowerCase().includes('generico')) {
    if (fila.nombre && fila.nombre.includes('-')) {
      lab = fila.nombre.split('-').pop().trim();
    }
  }

  const cleanStr = (s) => (s && s.toLowerCase().trim() === 'desconocido') ? '' : s;
  let cat = cleanStr(fila.categoria);
  if (!cat || cat.toLowerCase().includes('general') || cat.toLowerCase().includes('otros')) {
    cat = autoCategorizar(fila.nombre);
  }

  const stockNum = parseInt(fila.stock) || 0;
  const minNum = parseInt(fila.stock_min) || 0;

  return {
    id:          fila.id,
    codigo:      fila.codigo,
    nombre:      fila.nombre,
    laboratorio: cleanStr(lab),
    lote:        cleanStr(fila.lote),
    stock:       stockNum,
    stockMin:    minNum,
    costoUnit:   parseFloat(fila.costo_unit),
    precioVenta: parseFloat(fila.precio_venta),
    vencimiento: fmtFecha(fila.vencimiento),
    rSanitario:  cleanStr(fila.r_sanitario),
    estado:      calcEstado(stockNum, minNum),
    categoria:   cat,
  };
}

async function findAll(filterParams = {}) {
  const [rows] = await pool.execute('SELECT * FROM medicamentos ORDER BY nombre');
  let mapped = rows.map(mapRow);

  if (filterParams.categoria) {
    mapped = mapped.filter(m => m.categoria === filterParams.categoria);
  }

  return mapped;
}

async function findById(id) {
  const [rows] = await pool.execute('SELECT * FROM medicamentos WHERE id = ?', [id]);
  return rows[0] ? mapRow(rows[0]) : null;
}

async function create(data) {
  const { codigo, nombre, laboratorio, lote, stock, stockMin, costoUnit, precioVenta, vencimiento, rSanitario, categoria } = data;
  const stockNum = parseInt(stock) || 0;
  const minNum   = parseInt(stockMin) || 0;
  const estado   = calcEstado(stockNum, minNum);
  const vencDB   = normalizarFechaParaBD(vencimiento);

  const [result] = await pool.execute(
    `INSERT INTO medicamentos (codigo,nombre,laboratorio,lote,stock,stock_min,costo_unit,precio_venta,vencimiento,r_sanitario,estado,categoria)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [codigo, nombre, laboratorio, lote, stockNum, minNum, costoUnit||0, precioVenta||0, vencDB, rSanitario, estado, categoria]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const { nombre, laboratorio, lote, stock, stockMin, costoUnit, precioVenta, vencimiento, rSanitario, categoria } = data;
  const stockNum = parseInt(stock) || 0;
  const minNum   = parseInt(stockMin) || 0;
  const estado   = calcEstado(stockNum, minNum);
  const vencDB   = normalizarFechaParaBD(vencimiento);

  await pool.execute(
    `UPDATE medicamentos SET nombre=?,laboratorio=?,lote=?,stock=?,stock_min=?,costo_unit=?,precio_venta=?,vencimiento=?,r_sanitario=?,estado=?,categoria=? WHERE id=?`,
    [nombre, laboratorio, lote, stockNum, minNum, costoUnit||0, precioVenta||0, vencDB, rSanitario, estado, categoria, id]
  );
  return findById(id);
}

async function remove(id) {
  await pool.execute('DELETE FROM medicamentos WHERE id = ?', [id]);
}

async function getLaboratorios() {
  const [rows] = await pool.execute(
    'SELECT DISTINCT laboratorio FROM medicamentos WHERE laboratorio IS NOT NULL ORDER BY laboratorio'
  );
  return rows.map(r => r.laboratorio);
}

async function getCategorias() {
  const [rows] = await pool.execute(
    'SELECT DISTINCT categoria FROM medicamentos WHERE categoria IS NOT NULL ORDER BY categoria'
  );
  const dbCats = rows.map(r => r.categoria);
  const todas = new Set([...getTodasCategorias(), ...dbCats]);
  return [...todas].sort();
}

async function registrarLote(id, data) {
  const { lote, costoUnit, precioVenta, stockMin, stockInicial, vencimiento, rSanitario } = data;
  const existing = await findById(id);
  if (!existing) throw new Error('Medicamento no encontrado');

  const newStock  = (parseInt(existing.stock) || 0) + (parseInt(stockInicial) || 0);
  const minNum    = parseInt(stockMin) || parseInt(existing.stockMin) || 0;
  const estado    = calcEstado(newStock, minNum);
  const vencDB    = normalizarFechaParaBD(vencimiento);

  await pool.execute(
    `UPDATE medicamentos
       SET lote=?, stock=?, stock_min=?, costo_unit=?, precio_venta=?,
           vencimiento=?, r_sanitario=?, estado=?
     WHERE id=?`,
    [
      lote || existing.lote,
      newStock,
      minNum,
      costoUnit  !== undefined ? costoUnit  : existing.costoUnit,
      precioVenta !== undefined ? precioVenta : existing.precioVenta,
      vencDB,
      rSanitario || existing.rSanitario,
      estado,
      id,
    ]
  );
  return findById(id);
}

module.exports = { findAll, findById, create, update, remove, getLaboratorios, getCategorias, registrarLote };
