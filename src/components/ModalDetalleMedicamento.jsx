import React from 'react';
import { X, Pill, Building2, Package, Tag, Calendar, AlertTriangle } from 'lucide-react';

export default function ModalDetalleMedicamento({ medicamento, onClose }) {
  if (!medicamento) return null;

  // Lógica del semáforo para el stock
  const isBajo = medicamento.stock <= (medicamento.stockMin || 10) && medicamento.stock > 0;
  const isCritico = medicamento.stock === 0;

  let stockColor = '#10b981'; // Verde (Normal)
  let stockBg = '#d1fae5';
  let estadoText = 'Normal';

  if (isCritico) {
    stockColor = '#ef4444'; // Rojo
    stockBg = '#fee2e2';
    estadoText = 'Crítico';
  } else if (isBajo) {
    stockColor = '#f59e0b'; // Amarillo
    stockBg = '#fef3c7';
    estadoText = 'Bajo';
  }

  // Formateo de fechas
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    // Si ya viene formateado desde el backend (DD/MM/YYYY), lo devolvemos tal cual
    if (fechaStr.includes('/')) return fechaStr;
    
    // Fallback por si viene en ISO
    const d = new Date(fechaStr);
    if (isNaN(d.getTime())) return fechaStr;

    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: '1rem'
    }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#eff6ff', color: '#3b82f6',
              display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
              <Pill size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 'bold' }}>
                {medicamento.nombre}
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Tag size={12} /> {medicamento.categoria || 'General'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
            padding: '4px', display: 'flex'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          
          {/* Alerta si no hay stock */}
          {isCritico && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px',
              padding: '12px', marginBottom: '24px', display: 'flex', alignItems: 'flex-start', gap: '10px',
              color: '#991b1b'
            }}>
              <AlertTriangle size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>Stock agotado</strong>
                <span style={{ fontSize: '0.85rem' }}>No hay unidades disponibles en inventario. Considere un sustituto equivalente.</span>
              </div>
            </div>
          )}

          {/* Destacado: Precio de Venta */}
          <div style={{
            textAlign: 'center', marginBottom: '24px', padding: '16px',
            backgroundColor: '#f0fdf4', border: '2px dashed #bbf7d0', borderRadius: '12px'
          }}>
            <p style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: '#166534', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Precio Venta al Público
            </p>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span style={{ fontSize: '1.5rem', alignSelf: 'flex-start', marginTop: '6px' }}>S/</span>
              {Number(medicamento.precioVenta || 0).toFixed(2)}
            </div>
          </div>

          {/* Grid de detalles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Disponibilidad */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Disponibilidad</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#0f172a' }}>{medicamento.stock} und.</span>
                <span style={{
                  fontSize: '0.7rem', padding: '2px 8px', borderRadius: '999px',
                  fontWeight: '600', backgroundColor: stockBg, color: stockColor
                }}>
                  {estadoText}
                </span>
              </div>
            </div>

            {/* Lote */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>N° de Lote</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', color: '#0f172a', fontWeight: '500', fontFamily: 'monospace' }}>
                <Package size={14} color="#64748b" />
                {medicamento.lote || 'No registrado'}
              </div>
            </div>

            {/* Laboratorio */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Laboratorio</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', color: '#0f172a', fontWeight: '500' }}>
                <Building2 size={14} color="#64748b" />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={medicamento.laboratorio}>
                  {medicamento.laboratorio || 'N/A'}
                </span>
              </div>
            </div>

            {/* Vencimiento */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Vencimiento</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', color: '#0f172a', fontWeight: '500' }}>
                <Calendar size={14} color="#64748b" />
                {formatFecha(medicamento.vencimiento)}
              </div>
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #f1f5f9', backgroundColor: '#f8fafc',
          display: 'flex', justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} style={{
            padding: '8px 24px', backgroundColor: '#e2e8f0', color: '#475569',
            border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer',
            fontSize: '0.9rem'
          }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
