const pool = require('../db/connection');

const ROLE_MENUS = {
  admin:     ['dashboard','medicamentos','inventario','reportes','analytics','usuarios'],
  almacen:   ['medicamentos','reportes'],
  farmacia:  ['medicamentos'],
  jefatura:  ['dashboard','medicamentos','inventario','reportes'],
  logistica: ['dashboard','medicamentos','inventario','reportes'],
};

async function findByCredentials(username, password) {
  const [rows] = await pool.execute(
    'SELECT * FROM users WHERE username = ? AND password = ? AND estado = "Activo"',
    [username, password]
  );
  return rows[0] || null;
}

async function findAll() {
  const [rows] = await pool.execute(
    'SELECT id, username, role, name, role_label, email, estado, created_at FROM users ORDER BY id'
  );
  return rows;
}

async function getEstado(id) {
  const [[row]] = await pool.execute('SELECT estado, name, role FROM users WHERE id = ?', [id]);
  return row || null;
}

async function updateEstado(id, nuevoEstado) {
  await pool.execute('UPDATE users SET estado = ? WHERE id = ?', [nuevoEstado, id]);
}

async function create({ username, password, role, name, role_label, email }) {
  const today = new Date().toISOString().slice(0, 10);
  const [result] = await pool.execute(
    'INSERT INTO users (username, password, role, name, role_label, email, estado, created_at) VALUES (?,?,?,?,?,?,?,?)',
    [username, password, role, name, role_label, email || null, 'Activo', today]
  );
  return result.insertId;
}

async function update(id, { username, password, role, name, role_label, email }) {
  const fields = ['username=?', 'role=?', 'name=?', 'role_label=?', 'email=?'];
  const values = [username, role, name, role_label, email || null];
  if (password) { fields.push('password=?'); values.push(password); }
  values.push(id);
  await pool.execute(`UPDATE users SET ${fields.join(',')} WHERE id=?`, values);
}

async function findByUsername(username) {
  const [[row]] = await pool.execute('SELECT id FROM users WHERE username=?', [username]);
  return row || null;
}

async function remove(id) {
  await pool.execute('DELETE FROM users WHERE id = ?', [id]);
}

async function countAdmins() {
  const [[row]] = await pool.execute("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'");
  return row.n;
}

module.exports = { findByCredentials, findAll, getEstado, updateEstado, create, update, findByUsername, remove, countAdmins, ROLE_MENUS };
