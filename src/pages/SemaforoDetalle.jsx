import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Box, AlertTriangle, Calendar, Search } from 'lucide-react';
import { api } from '../services/api';
import Loader from '../components/Loader';

function parseDateFromDDMMYYYY(fechaStr) {
  if (!fechaStr) return new Date(NaN);
  if (fechaStr.includes('/')) {
    const parts = fechaStr.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`);
    }
  }
  return new Date(fechaStr);
}

export default function SemaforoDetalle({ tipo }) {
  const navigate = useNavigate();
  const onBack = () => navigate(-1);
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getMedicamentos().then(data => {
      let filtrados = [];
      if (tipo === 'stock') {
        // Filtrar Críticos y Bajos
        filtrados = data.filter(m => m.stock <= (m.stockMin || 10));
      } else if (tipo === 'vencimiento') {
        // Filtrar próximos a vencer (30 días)
        const hoy = new Date();
        const limite = new Date();
        limite.setDate(hoy.getDate() + 30);
        filtrados = data.filter(m => {
          if (!m.vencimiento) return false;
          const v = parseDateFromDDMMYYYY(m.vencimiento);
          return v <= limite;
        });
      }
      setMedicamentos(filtrados);
      setLoading(false);
    });
  }, [tipo]);

  if (loading) return <Loader />;

  const titulo = tipo === 'stock' ? 'Semáforo de Stock' : 'Semáforo de Vencimientos';
  const descripcion = tipo === 'stock' 
    ? 'Medicamentos con stock crítico o bajo, requieren atención inmediata.'
    : 'Medicamentos próximos a vencer (en los próximos 30 días) o ya vencidos.';
  const Icono = tipo === 'stock' ? AlertTriangle : Calendar;
  const colorTema = tipo === 'stock' ? '#ef4444' : '#f59e0b';

  const mostrados = search.trim() 
    ? medicamentos.filter(m => m.nombre.toLowerCase().includes(search.toLowerCase()))
    : medicamentos;

  return (
    <>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Volver al Dashboard
      </button>

      <div className="section-header" style={{ alignItems: 'flex-start', borderLeft: `4px solid ${colorTema}`, paddingLeft: 16 }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icono size={28} color={colorTema} />
            {titulo}
          </h1>
          <p className="page-subtitle">{descripcion}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar en esta lista..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', maxWidth: 400 }}
          />
        </div>
      </div>

      <div className="table-container">
        {mostrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <Box size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
            No se encontraron medicamentos en esta categoría.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicamento</th>
                <th>Laboratorio</th>
                <th>Lote</th>
                <th>Stock</th>
                <th>Vencimiento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {mostrados.map((m) => {
                const stock = m.stock || 0;
                const stockMin = m.stockMin || 10;
                const isCritico = stock === 0;
                const isBajo = stock > 0 && stock <= stockMin;
                
                let estadoClase = 'status-normal';
                let estadoTexto = 'Normal';
                
                if (tipo === 'stock') {
                  estadoClase = isCritico ? 'status-critical' : isBajo ? 'status-warning' : 'status-normal';
                  estadoTexto = isCritico ? 'Crítico' : isBajo ? 'Bajo' : 'Normal';
                } else {
                  const v = parseDateFromDDMMYYYY(m.vencimiento);
                  const hoy = new Date();
                  if (v < hoy) {
                    estadoClase = 'status-critical';
                    estadoTexto = 'Vencido';
                  } else {
                    estadoClase = 'status-warning';
                    estadoTexto = 'Por vencer';
                  }
                }

                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{m.nombre}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.categoria || 'General'}</div>
                    </td>
                    <td>{m.laboratorio || 'N/A'}</td>
                    <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{m.lote || '-'}</td>
                    <td>
                      <div style={{ fontWeight: isCritico ? 'bold' : 'normal', color: isCritico ? '#ef4444' : 'inherit' }}>
                        {stock}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Min: {stockMin}</div>
                    </td>
                    <td>
                      {m.vencimiento ? (m.vencimiento.includes('/') ? m.vencimiento : new Date(m.vencimiento).toLocaleDateString()) : '-'}
                    </td>
                    <td>
                      <span className={`status-badge ${estadoClase}`}>
                        {estadoTexto}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
