import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Package, CheckCircle, Bell } from 'lucide-react';
import { api } from '../services/api';
import Loader from '../components/Loader';

const ICON_MAP = {
  'stock-critico': AlertTriangle,
  'vencimiento':   Clock,
  'stock-bajo':    AlertTriangle,
  'nuevo-lote':    Package,
  'inventario':    CheckCircle,
};

export default function Notificaciones() {
  const [items,   setItems]   = useState([]);
  const [filter,  setFilter]  = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNotificaciones().then(setItems).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const noLeidas = items.filter(n => !n.leida);
  const altaPrio = items.filter(n => n.prioridad === 'High');

  const filtered = items.filter(n => {
    if (filter === 'noLeidas') return !n.leida;
    if (filter === 'alta')     return n.prioridad === 'High';
    return true;
  });

  async function marcarLeida(id) {
    await api.marcarLeida(id);
    setItems(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  }

  async function marcarTodas() {
    await api.marcarTodas();
    setItems(prev => prev.map(n => ({ ...n, leida: true })));
  }

  const tabs = [
    { key:'all',      label:`Todas (${items.length})` },
    { key:'noLeidas', label:`No Leídas (${noLeidas.length})` },
    { key:'alta',     label:`Alta Prioridad (${altaPrio.length})` },
  ];

  return (
    <>
      {/* ── Header ──────────────────────────────────── */}
      <div className="section-header" style={{ alignItems:'flex-start' }}>
        <div>
          <h1 className="page-title">Notificaciones</h1>
          <p className="page-subtitle">Centro de alertas y notificaciones del sistema</p>
        </div>
        {noLeidas.length > 0 && (
          <button className="btn btn-primary" onClick={marcarTodas} style={{ marginTop:4 }}>
            ✓ Marcar todas como leídas
          </button>
        )}
      </div>

      {/* ── 3 Stat cards ─────────────────────────────── */}
      <div className="notif-stats">
        <div className="notif-stat-card blue">
          <div>
            <div className="notif-stat-label">Total Notificaciones</div>
            <div className="notif-stat-value">{items.length}</div>
          </div>
          <div className="notif-stat-icon blue"><Bell size={26} /></div>
        </div>
        <div className="notif-stat-card orange">
          <div>
            <div className="notif-stat-label">No Leídas</div>
            <div className="notif-stat-value">{noLeidas.length}</div>
          </div>
          <div className="notif-stat-icon orange"><Bell size={26} /></div>
        </div>
        <div className="notif-stat-card red">
          <div>
            <div className="notif-stat-label">Alta Prioridad</div>
            <div className="notif-stat-value">{altaPrio.length}</div>
          </div>
          <div className="notif-stat-icon red"><AlertTriangle size={26} /></div>
        </div>
      </div>

      {/* ── Filter tabs ──────────────────────────────── */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ color:'#64748b' }}>▽</span>
          {tabs.map(t => (
            <button
              key={t.key}
              className={`tab-btn blue${filter === t.key ? ' active' : ''}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Notification list ────────────────────────── */}
      {filtered.length === 0 && (
        <div style={{
          textAlign:'center', padding:'48px', color:'#94a3b8',
          background:'white', borderRadius:16, boxShadow:'0 4px 20px rgba(30,64,175,0.08)',
        }}>
          <Bell size={40} style={{ margin:'0 auto 12px', display:'block', opacity:0.3 }} />
          No hay notificaciones en esta categoría.
        </div>
      )}

      {filtered.map(n => {
        const Icon = ICON_MAP[n.tipo] || Bell;
        return (
          <div key={n.id} className={`notif-item ${n.color}`} style={{ opacity: n.leida ? 0.7 : 1 }}>
            <div className={`notif-icon ${n.color}`}>
              <Icon size={22} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <div className="notif-title">{n.titulo}</div>
                {!n.leida && (
                  <div style={{ width:8, height:8, borderRadius:'50%', background:'#3b82f6', flexShrink:0 }} />
                )}
              </div>
              <div className="notif-desc">{n.descripcion}</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:6 }}>
                <div className="notif-date">
                  {n.fecha}
                  {n.prioridad === 'High' && (
                    <span style={{ marginLeft:10, color:'#ef4444', fontWeight:600 }}>· Prioridad: High</span>
                  )}
                </div>
                {!n.leida && (
                  <button className="mark-read-btn" onClick={() => marcarLeida(n.id)}>
                    Marcar como leída
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
