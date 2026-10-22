const userModel    = require('../models/userModel');
const reporteModel = require('../models/reporteModel');

const ROLE_LABELS = { 
  admin: 'Administrador', 
  farmacia: 'Farmacia', 
  jefatura: 'Jefatura',
  almacen: 'Almacén',
  logistica: 'Logística'
};

async function createUser(req, res) {
  try {
    const { username, password, role, name, email, operador } = req.body;
    if (!username || !password || !role || !name)
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    if (!ROLE_LABELS[role])
      return res.status(400).json({ error: 'Rol inválido' });
    const existe = await userModel.findByUsername(username);
    if (existe) return res.status(409).json({ error: 'El nombre de usuario ya existe' });
    const id = await userModel.create({ username, password, role, name, role_label: ROLE_LABELS[role], email });
    await reporteModel.registrarAccion(operador || 'Sistema', 'Creó usuario', 'Usuarios', name).catch(() => {});
    res.status(201).json({ id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateUser(req, res) {
  try {
    const { username, password, role, name, email, operador } = req.body;
    if (!username || !role || !name)
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    if (!ROLE_LABELS[role])
      return res.status(400).json({ error: 'Rol inválido' });
    const existe = await userModel.findByUsername(username);
    if (existe && existe.id !== Number(req.params.id))
      return res.status(409).json({ error: 'El nombre de usuario ya existe' });
    await userModel.update(req.params.id, { username, password, role, name, role_label: ROLE_LABELS[role], email });
    await reporteModel.registrarAccion(operador || 'Sistema', 'Actualizó usuario', 'Usuarios', name).catch(() => {});
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAll(req, res) {
  try {
    const [usersRaw, historial] = await Promise.all([
      userModel.findAll(),
      reporteModel.getHistorial(),
    ]);
    const users = usersRaw.map(u => ({
      id:        u.id,
      username:  u.username,
      role:      u.role,
      name:      u.name,
      roleLabel: u.role_label,
      email:     u.email,
      estado:    u.estado,
      createdAt: u.created_at,
    }));
    res.json({ users, historial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    const row = await userModel.getEstado(req.params.id);
    if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (row.role === 'admin' && (await userModel.countAdmins()) <= 1)
      return res.status(409).json({ error: 'No se puede eliminar al único administrador' });
    await userModel.remove(req.params.id);
    const operador = req.body?.operador || 'Sistema';
    await reporteModel.registrarAccion(operador, 'Eliminó usuario', 'Usuarios', row.name).catch(() => {});
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function toggleEstado(req, res) {
  try {
    const row = await userModel.getEstado(req.params.id);
    if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });
    const nuevo = row.estado === 'Activo' ? 'Inactivo' : 'Activo';
    await userModel.updateEstado(req.params.id, nuevo);
    const accion = nuevo === 'Activo' ? 'Activó usuario' : 'Desactivó usuario';
    const operador = req.body?.operador || 'Sistema';
    await reporteModel.registrarAccion(operador, accion, 'Usuarios', row.name).catch(() => {});
    res.json({ estado: nuevo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAll, toggleEstado, createUser, updateUser, deleteUser };
