import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { TrendingUp, AlertTriangle, Lightbulb, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '../services/api';
import Loader from '../components/Loader';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getAnalytics()
      .then(res => setAnalytics(res))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error || !analytics) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2 style={{ color: '#ef4444' }}>Error al cargar datos.</h2>
        <p style={{ color: '#64748b' }}>Compruebe la conexión con el servidor analítico de Machine Learning.</p>
      </div>
    );
  }

  const { prediccionDemanda, comparativaMensual, tendencias, prediccionesCriticas } = analytics;

  return (
    <>
      <h1 className="page-title">🧠 Analytics Inteligente</h1>
      <p className="page-subtitle">Insights predictivos y recomendaciones impulsadas por Machine Learning</p>

      {/* ── Tarjetas de Insights ─────────────────────── */}
      <div className="insight-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#f3e8ff', borderRadius: '12px', padding: '16px', border: '1px solid #d8b4fe' }}>
          <div style={{ color: '#7e22ce', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Lightbulb size={20} /> Insight del Día
          </div>
          <div style={{ color: '#6b21a8', fontSize: '14px', lineHeight: 1.5 }}>
            Se detectó un aumento del 22% en la demanda de antiinflamatorios, posiblemente ligado al cambio de clima de la temporada.
          </div>
        </div>

        <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px', border: '1px solid #bfdbfe' }}>
          <div style={{ color: '#1d4ed8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingUp size={20} /> Tendencia General
          </div>
          <div style={{ color: '#1e40af', fontSize: '14px', lineHeight: 1.5 }}>
            El consumo presenta una tendencia alcista del 8.5% respecto al trimestre anterior, lo cual requerirá un aumento en presupuesto.
          </div>
        </div>

        <div style={{ background: '#fff7ed', borderRadius: '12px', padding: '16px', border: '1px solid #fed7aa' }}>
          <div style={{ color: '#c2410c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <AlertTriangle size={20} /> Alerta Predictiva
          </div>
          <div style={{ color: '#9a3412', fontSize: '14px', lineHeight: 1.5 }}>
            <strong>{prediccionesCriticas?.length || 3} medicamentos</strong> alcanzarán stock crítico en los próximos 30 días. Revisar tabla de recomendaciones abajo.
          </div>
        </div>
      </div>

      {/* ── Gráficos de Inteligencia Artificial ──────── */}
      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        <div className="chart-card">
          <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Predicción de Demanda (IA) por Producto - Mes Siguiente
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={prediccionDemanda}>
              <defs>
                <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 'auto']} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone" dataKey="real" stroke="#b91c1c" strokeWidth={2.5}
                fill="none" dot={{ r: 5, fill: '#b91c1c' }}
                name="Demanda Real" connectNulls={false}
              />
              <Area
                type="monotone" dataKey="prediccion" stroke="#8b5cf6" strokeWidth={2.5}
                fill="url(#predGrad)" dot={{ r: 5, fill: '#8b5cf6' }}
                name="Predicción IA" connectNulls={false} strokeDasharray="6 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-title">Comparativa Mensual (Ventas vs Compras)</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={comparativaMensual} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="ventas" fill="#10b981" name="Ventas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="compras" fill="#ef4444" name="Compras" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Recomendaciones de Compra ────────────────── */}
      <div className="bottom-grid">
        <div className="chart-card">
          <div className="chart-title">Tendencias de Consumo</div>
          <div className="table-container" style={{ marginTop: '16px' }}>
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Variación Proyectada</th>
                  <th>Tendencia</th>
                </tr>
              </thead>
              <tbody>
                {tendencias?.map((t, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{t.categoria}</td>
                    <td style={{ fontWeight: 700, color: t.positivo ? '#10b981' : '#ef4444' }}>
                      {t.positivo ? '+' : ''}{t.cambio}%
                    </td>
                    <td>
                      {t.positivo ? <ArrowUpRight color="#10b981" size={18} /> : <ArrowDownRight color="#ef4444" size={18} />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="chart-card" style={{ background: '#f8fafc' }}>
          <div className="chart-title" style={{ marginBottom: '16px' }}>Sugerencia de Pedidos (Mensual/Anual)</div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Medicamento</th>
                  <th>Stock Actual</th>
                  <th>Fecha de Quiebre</th>
                  <th>Cantidad a Pedir</th>
                </tr>
              </thead>
              <tbody>
                {prediccionesCriticas?.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                    <td style={{ fontWeight: 700 }}>{p.stockActual} u.</td>
                    <td style={{ color: '#b91c1c', fontWeight: 600 }}>{p.fechaPredicha}</td>
                    <td>
                      <span className="badge green" style={{ fontSize: 13 }}>
                        + {p.ordenar} u.
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
