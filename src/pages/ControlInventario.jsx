import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AlertTriangle, Package, Calendar } from 'lucide-react';
import Loader from '../components/Loader';

const TODAY = new Date();

function parseFecha(str) {
  if (!str) return null;
  const [d, m, y] = str.split('/').map(Number);
  return new Date(y, m - 1, d);
}

function diasRestantes(vencimiento) {
  const fecha = parseFecha(vencimiento);
  if (!fecha) return 9999;
  return Math.round((fecha - TODAY) / 86400000);
}

export default function ControlInventario() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [totals,       setTotals]       = useState({});
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('all');

  useEffect(() => {
    api.getInventario()
      .then(data => { setMedicamentos(data.medicamentos); setTotals(data.totals); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const criticos  = medicamentos.filter(m => m.estado === 'Crítico');
  const bajos     = medicamentos.filter(m => m.estado === 'Bajo');
  const vencidos  = medicamentos.filter(m => diasRestantes(m.vencimiento) < 0);
  const porVencer = medicamentos.filter(m => {
    const dias = diasRestantes(m.vencimiento);
    return dias >= 0 && dias <= 90;
  });

  const filtered = medicamentos.filter(m => {
    if (activeTab === 'critico') return m.estado === 'Crítico' || diasRestantes(m.vencimiento) < 0;
    if (activeTab === 'bajo')    return m.estado === 'Bajo';
    if (activeTab === 'vencer')  return diasRestantes(m.vencimiento) >= 0 && diasRestantes(m.vencimiento) <= 90;
    return true;
  });

  const tabs = [
    { key:'all',    label:`Todos (${medicamentos.length})`, style:'blue'   },
    { key:'critico',label:`Críticos/Vencidos (${criticos.length + vencidos.length})`,  style:'red'    },
    { key:'bajo',   label:`Stock Bajo (${bajos.length})`,   style:'yellow' },
    { key:'vencer', label:`Por Vencer (${porVencer.length})`,style:'orange'},
  ];

  return (
    <>
      <h1 className="page-title">Control de Inventario</h1>
      <p className="page-subtitle">Monitoreo de stock y vencimientos</p>

      {/* ── 3 Stat cards ─────────────────────────────── */}
      <div className="inv-stats-3">
        <div className="inv-stat-card red">
          <div className="inv-stat-card-left">
            <div className="label">Stock Crítico/Vencido</div>
            <div className="value">{criticos.length + vencidos.length}</div>
            <div className="sub">Requieren atención inmediata</div>
          </div>
          <div className="card-icon"><AlertTriangle size={28} /></div>
        </div>

        <div className="inv-stat-card yellow">
          <div className="inv-stat-card-left">
            <div className="label">Stock Bajo</div>
            <div className="value">{bajos.length}</div>
            <div className="sub">Por debajo del mínimo</div>
          </div>
          <div className="card-icon"><Package size={28} /></div>
        </div>

        <div className="inv-stat-card orange">
          <div className="inv-stat-card-left">
            <div className="label">Próximos a Vencer (90 días)</div>
            <div className="value">{porVencer.length}</div>
            <div className="sub">Monitoreo activo</div>
          </div>
          <div className="card-icon"><Calendar size={28} /></div>
        </div>
      </div>

      {/* ── Tab filters ───────────────────────────────── */}
      <div className="card" style={{ marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <span style={{ color:'#64748b' }}>▽</span>
          {tabs.map(t => (
            <button
              key={t.key}
              className={`tab-btn ${t.style}${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────── */}
      <div style={{ fontSize:13, color:'#64748b', marginBottom:12 }}>
        Mostrando <strong>{filtered.length}</strong> medicamentos
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Stock</th>
                <th>Estado Stock</th>
                <th>Fecha Vencimiento</th>
                <th>Estado Venc.</th>
                <th>Días Restantes</th>
                <th>Lote</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const dias = diasRestantes(m.vencimiento);
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight:700 }}>{m.nombre}</div>
                      <div style={{ fontSize:11, color:'#94a3b8' }}>{m.laboratorio}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight:800 }}>{m.stock.toLocaleString()}</div>
                      <div style={{ fontSize:11, color:'#94a3b8' }}>Min: {m.stockMin}</div>
                    </td>
                    <td>
                      <span className={`badge ${m.estado === 'Normal' ? 'green' : m.estado === 'Bajo' ? 'yellow' : 'red'}`}>
                        {m.estado}
                      </span>
                    </td>
                    <td style={{ fontSize:13 }}>{m.vencimiento}</td>
                    <td>
                      <span className={`badge ${dias < 0 ? 'red' : dias <= 90 ? 'yellow' : 'green'}`}>
                        {dias < 0 ? 'Vencido' : dias <= 90 ? 'Por Vencer' : 'Vigente'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize:13, color:'#64748b' }}>
                        {dias < 0 ? '—' : `${dias} días`}
                      </span>
                    </td>
                    <td style={{ fontFamily:'monospace', fontSize:12, color:'#475569' }}>{m.lote}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
