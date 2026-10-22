import { useState, useEffect } from 'react';
import { Plus, Edit, UserX, Trash2, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const ROL_STYLE = {
  'Administrador': 'admin',
  'Farmacia':      'farmacia',
  'Jefatura':      'jefatura',
  'Almacén':       'almacen',
  'Logística':     'logistica'
};

const MOD_COLORS = {
  'Medicamentos': '#dbeafe',
  'Inventario':   '#d1fae5',
  'Reportes':     '#ede9fe',
};

const ROLES = [
  { value: 'admin',    label: 'Administrador' },
  { value: 'farmacia', label: 'Farmacia' },
  { value: 'jefatura', label: 'Jefatura' },
  { value: 'almacen',  label: 'Almacén' },
  { value: 'logistica',label: 'Logística' }
];

const FORM_VACIO = { username: '', password: '', role: 'farmacia', name: '', email: '' };

export default function Usuarios() {
  const { user: currentUser } = useAuth();
  const [users,     setUsers]     = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [editando,  setEditando]  = useState(null); // null = crear, objeto = editar
  const [form,      setForm]      = useState(FORM_VACIO);
  const [error,     setError]     = useState('');
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  function cargar() {
    setLoading(true);
    api.getUsers()
      .then(data => { setUsers(data.users); setHistorial(data.historial); })
      .finally(() => setLoading(false));
  }

  function abrirCrear() {
    setEditando(null);
    setForm(FORM_VACIO);
    setError('');
    setModal(true);
  }

  function abrirEditar(u) {
    setEditando(u);
    setForm({ username: u.username, password: '', role: u.role, name: u.name, email: u.email || '' });
    setError('');
    setModal(true);
  }

  function cerrarModal() {
    setModal(false);
    setError('');
  }

  function handleChange(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    setError('');
  }

  async function handleGuardar(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.username.trim())
      return setError('Nombre y usuario son obligatorios.');
    if (!editando && !form.password.trim())
      return setError('La contraseña es obligatoria al crear un usuario.');

    setSaving(true);
    setError('');
    try {
      const payload = { ...form, operador: currentUser?.name || 'Sistema' };
      if (editando) {
        await api.updateUser(editando.id, payload);
      } else {
        await api.createUser(payload);
      }
      cerrarModal();
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleEstado(id) {
    const { estado } = await api.toggleUserEstado(id, currentUser?.name || 'Sistema');
    setUsers(prev => prev.map(u => u.id === id ? { ...u, estado } : u));
  }

  async function eliminarUsuario(u) {
    if (!window.confirm(`¿Eliminar al usuario "${u.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.deleteUser(u.id, currentUser?.name || 'Sistema');
      setUsers(prev => prev.filter(x => x.id !== u.id));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <Loader />;

  return (
    <>
      {/* ── Header ────────────────────────────────────── */}
      <div className="section-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">Administración de usuarios y permisos del sistema</p>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 4 }} onClick={abrirCrear}>
          <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      {/* ── Users table ──────────────────────────────── */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{u.username}</div>
                  </td>
                  <td style={{ fontSize: 13, color: '#475569' }}>{u.email || '—'}</td>
                  <td>
                    <span className={`rol-badge ${ROL_STYLE[u.roleLabel] || 'farmacia'}`}>
                      {u.roleLabel}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${u.estado === 'Activo' ? 'green' : ''}`}
                      style={u.estado !== 'Activo' ? { background: '#f3f4f6', color: '#6b7280' } : {}}
                    >
                      {u.estado}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="icon-btn edit" title="Editar usuario" onClick={() => abrirEditar(u)}>
                        <Edit size={14} />
                      </button>
                      <button
                        className="icon-btn"
                        title={u.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                        onClick={() => toggleEstado(u.id)}
                        style={{
                          background: u.estado === 'Activo' ? '#fee2e2' : '#d1fae5',
                          color:      u.estado === 'Activo' ? '#ef4444' : '#059669',
                        }}
                      >
                        <UserX size={14} />
                      </button>
                      <button
                        className="icon-btn"
                        title={u.id === currentUser?.id ? 'No puedes eliminar tu propio usuario' : 'Eliminar usuario'}
                        disabled={u.id === currentUser?.id}
                        onClick={() => eliminarUsuario(u)}
                        style={{
                          background: '#fee2e2',
                          color: '#ef4444',
                          opacity: u.id === currentUser?.id ? 0.4 : 1,
                          cursor: u.id === currentUser?.id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Activity log ─────────────────────────────── */}
      <div className="card">
        <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          ↗ Historial de Acciones
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fecha / Hora</th>
                <th>Usuario</th>
                <th>Acción</th>
                <th>Módulo</th>
                <th>Detalles</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 12, color: '#64748b' }}>{h.fecha}</td>
                  <td style={{ fontWeight: 600 }}>{h.usuario}</td>
                  <td style={{ fontSize: 13 }}>{h.accion}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: MOD_COLORS[h.modulo] || '#f3f4f6',
                      color: '#1e293b',
                    }}>
                      {h.modulo}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: '#64748b' }}>{h.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal crear / editar ──────────────────────── */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 32, width: 460,
            maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            {/* Cabecera modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1e293b' }}>
                {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button onClick={cerrarModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{
                background: '#fee2e2', color: '#b91c1c', borderRadius: 8,
                padding: '10px 14px', marginBottom: 16, fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleGuardar}>
              {/* Nombre completo */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Nombre completo *</label>
                <input
                  className="form-input"
                  placeholder="Ej. María González"
                  value={form.name}
                  onChange={e => handleChange('name', e.target.value)}
                />
              </div>

              {/* Usuario */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Nombre de usuario *</label>
                <input
                  className="form-input"
                  placeholder="Ej. maria.gonzalez"
                  value={form.username}
                  onChange={e => handleChange('username', e.target.value)}
                />
              </div>

              {/* Contraseña */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">
                  Contraseña {editando ? '(dejar vacío para no cambiar)' : '*'}
                </label>
                <input
                  className="form-input"
                  type="password"
                  placeholder={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                />
              </div>

              {/* Rol — RF-003 */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Rol *</label>
                <select
                  className="form-input"
                  value={form.role}
                  onChange={e => handleChange('role', e.target.value)}
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={cerrarModal}
                  style={{ background: '#f1f5f9', color: '#475569' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
