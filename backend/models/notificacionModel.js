const pool = require('../db/connection');

async function findAll() {
  const [rows] = await pool.execute('SELECT * FROM notificaciones ORDER BY id DESC');
  return rows.map(n => ({ ...n, leida: !!n.leida }));
}

async function marcarLeida(id) {
  await pool.execute('UPDATE notificaciones SET leida = 1 WHERE id = ?', [id]);
}

async function marcarTodas() {
  await pool.execute('UPDATE notificaciones SET leida = 1');
}

module.exports = { findAll, marcarLeida, marcarTodas };
