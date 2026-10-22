import React, { useState, useEffect } from 'react';
import { X, Save, Edit2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatearFechaParaInput } from '../utils/fechaUtils';

// Valida los datos del formulario de edición antes de llamar a la API.
// Devuelve el primer mensaje de error encontrado, o null si es válido.
function validarFormularioEdicion(datos) {
  if (!datos.nombre?.trim() || !datos.categoria?.trim()) {
    return 'El nombre del medicamento y la categoría son obligatorios.';
  }
  if (!datos.lote?.trim()) return 'Ingrese el número de lote.';
  if (!datos.vencimiento) return 'Ingrese la fecha de vencimiento.';

  const stock = Number(datos.stock);
  const stockMin = Number(datos.stockMin);
  const costoUnit = Number(datos.costoUnit);
  const precioVenta = Number(datos.precioVenta);

  if (!Number.isFinite(stock) || stock < 0) return 'El stock actual debe ser un número válido.';
  if (!Number.isFinite(stockMin) || stockMin <= 0) return 'El stock mínimo debe ser un valor positivo mayor a cero.';
  if (!Number.isFinite(costoUnit) || costoUnit <= 0) return 'El costo unitario debe ser un valor positivo mayor a cero.';
  if (!Number.isFinite(precioVenta) || precioVenta <= 0) return 'El precio de venta debe ser un valor positivo mayor a cero.';
  return null;
}

export default function ModalEditarMedicamento({ medicamento, onClose, onUpdated }) {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    laboratorio: '',
    lote: '',
    stock: '',
    stockMin: '',
    costoUnit: '',
    precioVenta: '',
    vencimiento: ''
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (medicamento) {
      setFormData({
        ...medicamento,
        vencimiento: formatearFechaParaInput(medicamento.vencimiento)
      });
      setErrorMsg('');
    }
  }, [medicamento]);

  if (!medicamento) return null;

  const actualizarCampo = (campo) => (e) =>
    setFormData(f => ({ ...f, [campo]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    const error = validarFormularioEdicion(formData);
    if (error) {
      setErrorMsg(error);
      return;
    }
    try {
      setSaving(true);
      await api.updateMedicamento(medicamento.id, {
        ...formData,
        role: user?.role,
        usuario: user?.name
      });
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel modal-panel-wide" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit2 size={20} color="#3b82f6" /> Editar Medicamento
          </h2>
          <button type="button" onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        {errorMsg && <div className="modal-error">{errorMsg}</div>}

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Nombre del medicamento</label>
              <input required className="form-input" value={formData.nombre} onChange={actualizarCampo('nombre')} />
            </div>

            <div className="form-group">
              <label className="form-label">Laboratorio</label>
              <input className="form-input" value={formData.laboratorio || ''} onChange={actualizarCampo('laboratorio')} />
            </div>

            <div className="form-group">
              <label className="form-label">Categoría</label>
              <input required className="form-input" value={formData.categoria || ''} onChange={actualizarCampo('categoria')} />
            </div>

            <div className="form-group">
              <label className="form-label">N° de Lote</label>
              <input required className="form-input" value={formData.lote || ''} onChange={actualizarCampo('lote')} />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha Vencimiento</label>
              <input required type="date" className="form-input" value={formData.vencimiento} onChange={actualizarCampo('vencimiento')} />
            </div>

            <div className="form-group">
              <label className="form-label">Stock Actual</label>
              <input required type="number" className="form-input" value={formData.stock || ''} onChange={actualizarCampo('stock')} />
            </div>

            <div className="form-group">
              <label className="form-label">Stock Mínimo</label>
              <input required type="number" className="form-input" value={formData.stockMin || ''} onChange={actualizarCampo('stockMin')} />
            </div>

            <div className="form-group">
              <label className="form-label">Costo Unitario (S/)</label>
              <input required type="number" step="0.01" className="form-input" value={formData.costoUnit || ''} onChange={actualizarCampo('costoUnit')} />
            </div>

            <div className="form-group">
              <label className="form-label">Precio Venta (S/)</label>
              <input required type="number" step="0.01" className="form-input" value={formData.precioVenta || ''} onChange={actualizarCampo('precioVenta')} />
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={16} /> {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
