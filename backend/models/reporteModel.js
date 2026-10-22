const pool = require('../db/connection');

async function getResumen() {
  const [[row]] = await pool.execute(`
    SELECT
      COUNT(*)                                         AS total_productos,
      SUM(stock * costo_unit)                          AS valor_inventario,
      SUM(stock * precio_venta)                        AS valor_venta,
      SUM(stock * (precio_venta - costo_unit))         AS ganancia_estimada,
      SUM(CASE WHEN estado='Crítico' THEN 1 ELSE 0 END) AS productos_criticos,
      SUM(CASE WHEN estado='Bajo'    THEN 1 ELSE 0 END) AS productos_bajo,
      SUM(CASE WHEN vencimiento IS NOT NULL
               AND vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS por_vencer
    FROM medicamentos
  `);
  return row;
}

async function getPorCategoria() {
  const [rows] = await pool.execute(
    'SELECT categoria, COUNT(*) AS cantidad, SUM(stock) AS stock_total FROM medicamentos GROUP BY categoria ORDER BY stock_total DESC'
  );
  return rows;
}

async function getHistorial() {
  const [rows] = await pool.execute(
    'SELECT fecha, usuario, accion, modulo, detalle FROM historial_acciones ORDER BY id DESC LIMIT 20'
  );
  return rows;
}

async function registrarAccion(usuario, accion, modulo, detalle) {
  const fecha = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
  await pool.execute(
    'INSERT INTO historial_acciones (fecha, usuario, accion, modulo, detalle) VALUES (?,?,?,?,?)',
    [fecha, usuario, accion, modulo, detalle]
  );
}

module.exports = { getResumen, getPorCategoria, getHistorial, registrarAccion };
