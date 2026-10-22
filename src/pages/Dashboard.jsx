import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { Package, AlertTriangle, Calendar, DollarSign, Activity, Box, TrendingDown, Clock, Eye, X } from 'lucide-react';
import { api } from '../services/api';
import Loader from '../components/Loader';

const ESTADO_COLORS = { Normal: '#10b981', Bajo: '#f59e0b', Crítico: '#ef4444' };

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.08) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getDashboard()
      .then(resDash => {
        setData(resDash);
        const hasCriticalAlerts = resDash.alertas && resDash.alertas.length > 0;
        if (hasCriticalAlerts && !sessionStorage.getItem('popups_vistos_v3')) {
          setShowPopup(true);
          sessionStorage.setItem('popups_vistos_v3', 'true');
        }
      }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!data) return <p style={{ color:'#ef4444' }}>Error al cargar datos.</p>;

  const { stats, stockPorCategoria, estadoStock, movimientosSemana, top5Valor, alertas } = data;
  
  const pieData = estadoStock.map(e => ({
    name:  e.estado,
    value: e.total,
    color: ESTADO_COLORS[e.estado] || '#94a3b8',
  }));

  const barData = stockPorCategoria.map(c => ({ name: c.categoria, value: c.stock }));

  const entradas = movimientosSemana.reduce((s, m) => s + m.entradas, 0);
  const salidas  = movimientosSemana.reduce((s, m) => s + m.salidas, 0);

  return (
    <>
      <h1 className="page-title">Dashboard Operativo</h1>
      <p className="page-subtitle">Visión general del inventario y estado en tiempo real</p>

      {/* ── Stat cards ─────────────────────────────────────── */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue"><Package size={24} /></div>
          <div>
            <div className="stat-value">{stats.totalMedicamentos}</div>
            <div className="stat-label">Total Medicamentos</div>
            <div className="stat-sub">Activos en inventario</div>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon red"><AlertTriangle size={24} /></div>
          <div>
            <div className="stat-value red">{stats.stockCritico}</div>
            <div className="stat-label">Stock Crítico</div>
            <div className="stat-sub">Requieren atención</div>
          </div>
        </div>

        <div className="stat-card yellow">
          <div className="stat-icon yellow"><Calendar size={24} /></div>
          <div>
            <div className="stat-value yellow">{stats.porVencer}</div>
            <div className="stat-label">Por Vencer (30 días)</div>
            <div className="stat-sub">Próximos a vencer</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon green"><DollarSign size={24} /></div>
          <div>
            <div className="stat-value green">S/ {parseFloat(stats.valorInventario).toLocaleString('en',{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
            <div className="stat-label">Valor Total</div>
            <div className="stat-sub">Inventario valorizado</div>
          </div>
        </div>
      </div>

      {/* ── Charts row ─────────────────────────────────────── */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Stock por Categoría</div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={barData} margin={{ top:0, right:0, left:-20, bottom:50 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize:10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="url(#barGrad)" radius={[5,5,0,0]} name="Unidades" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Estado del Stock</div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip />
              <Legend
                formatter={(v, entry) => (
                  <span style={{ fontSize:13, color:'#334155' }}>
                    {v}: <strong>{entry.payload.value}</strong>
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom charts ──────────────────────────────────── */}
      <div className="bottom-grid">
        <div className="chart-card">
          <div className="chart-title">Movimientos de la Semana</div>
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={movimientosSemana}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dia" tick={{ fontSize:12 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2.5} dot={{ r:5, fill:'#10b981' }} name="entradas" />
              <Line type="monotone" dataKey="salidas"  stroke="#ef4444" strokeWidth={2.5} dot={{ r:5, fill:'#ef4444' }} name="salidas"  />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Top 5 Medicamentos por Valor</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={top5Valor} layout="vertical" margin={{ left:0, right:20, top:0, bottom:0 }}>
              <defs>
                <linearGradient id="hBarGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"   stopColor="#b91c1c" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize:11 }} />
              <YAxis dataKey="nombre" type="category" tick={{ fontSize:10 }} width={140} />
              <Tooltip formatter={v => `S/ ${v}`} />
              <Bar dataKey="valor" fill="url(#hBarGrad)" radius={[0,5,5,0]} name="Valor S/" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Alerts + Quick stats ───────────────────────────── */}
      <div className="bottom-grid" style={{ marginTop: 24 }}>
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Semáforo de Stock */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#fef2f2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} color="#ef4444" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#991b1b', fontWeight: 'bold' }}>Semáforo de Stock</h3>
              </div>
              <span className="badge-count" style={{ background: '#ef4444', color: '#fff' }}>
                {alertas.filter(a => a.color === 'red' || a.titulo.includes('Stock')).length}
              </span>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#7f1d1d' }}>Medicamentos con stock crítico o bajo.</p>
            
            <div style={{ marginBottom: '16px' }}>
              {alertas.filter(a => a.color === 'red' || a.titulo.includes('Stock')).slice(0, 3).map((a, i) => (
                <div key={i} className={`alert-item ${a.color}`} style={{ marginBottom: '8px', padding: '8px', background: '#fff', borderRadius: '8px' }}>
                  <div style={{ paddingTop:2 }}><AlertTriangle size={16} color="#ef4444" /></div>
                  <div>
                    <div className="alert-title" style={{ fontSize: '0.85rem' }}>{a.titulo}</div>
                    <div className="alert-desc" style={{ fontSize: '0.75rem' }}>{a.descripcion}</div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: '#ef4444', borderColor: '#ef4444' }}
              onClick={() => navigate('/semaforo/stock')}
            >
              <Eye size={16} /> Ver Detalles
            </button>
          </div>

          {/* Semáforo de Vencimientos */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', background: '#fffbeb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#b45309', fontWeight: 'bold' }}>Semáforo de Vencimientos</h3>
              </div>
              <span className="badge-count" style={{ background: '#f59e0b', color: '#fff' }}>
                {alertas.filter(a => a.color !== 'red' && a.titulo.includes('Vencimiento')).length}
              </span>
            </div>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#92400e' }}>Medicamentos próximos a vencer o vencidos.</p>
            
            <div style={{ marginBottom: '16px' }}>
              {alertas.filter(a => a.color !== 'red' && a.titulo.includes('Vencimiento')).slice(0, 3).map((a, i) => (
                <div key={i} className={`alert-item ${a.color}`} style={{ marginBottom: '8px', padding: '8px', background: '#fff', borderRadius: '8px' }}>
                  <div style={{ paddingTop:2 }}><Calendar size={16} color="#f59e0b" /></div>
                  <div>
                    <div className="alert-title" style={{ fontSize: '0.85rem' }}>{a.titulo}</div>
                    <div className="alert-desc" style={{ fontSize: '0.75rem' }}>{a.descripcion}</div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: '#f59e0b', borderColor: '#f59e0b', color: '#fff' }}
              onClick={() => navigate('/semaforo/vencimiento')}
            >
              <Eye size={16} /> Ver Detalles
            </button>
          </div>

        </div>

        <div className="chart-card">
          <div className="chart-title">Estadísticas Rápidas</div>
          {[
            { icon: <Activity size={16} color="#b91c1c" />, label:'Movimientos Hoy',       value: entradas + salidas },
            { icon: <Box      size={16} color="#10b981" />, label:'Entradas esta semana',   value: entradas },
            { icon: <TrendingDown size={16} color="#ef4444" />, label:'Salidas esta semana',value: salidas  },
            { icon: <Clock    size={16} color="#f59e0b" />, label:'Vencimientos próximos',  value: stats.porVencer },
          ].map(({ icon, label, value }) => (
            <div key={label} className="quick-stat">
              <div className="quick-stat-label">{icon}{label}</div>
              <div className="quick-stat-value">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pop-up de Alertas Críticas */}
      {showPopup && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          padding: '1rem'
        }}>
          <div className="modal-content" style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '450px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden'
          }}>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', 
                display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 16px auto'
              }}>
                <AlertTriangle size={32} color="#ef4444" />
              </div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: 'bold' }}>
                ¡Atención Requerida!
              </h2>
              <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '1rem', lineHeight: '1.5' }}>
                Se han detectado <strong>{alertas.length} alertas críticas</strong> en el inventario (stock bajo o medicamentos próximos a vencer). 
                Por favor, revise los semáforos.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowPopup(false)}
                  style={{ flex: 1, padding: '12px' }}
                >
                  <X size={16} style={{ marginRight: '8px' }} /> Ok, cerrar
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setShowPopup(false);
                    navigate('/semaforo/stock');
                  }}
                  style={{ flex: 1, padding: '12px', background: '#ef4444', borderColor: '#ef4444' }}
                >
                  <Eye size={16} style={{ marginRight: '8px' }} /> Ver Medicamentos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
