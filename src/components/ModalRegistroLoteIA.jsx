import { useState, useEffect } from 'react';
import { X, Package, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LOTE_EMPTY = {
  lote: '', vencimiento: '', costoUnit: '',
  precioVenta: '', stockMin: '', stockInicial: '', rSanitario: '',
};

export default function ModalRegistroLoteIA({ nombreBase, onClose, onSuccess }) {
  const { user } = useAuth();
  const [paso, setPaso] = useState('variantes');
  const [variantes, setVariantes] = useState([]);
  const [loadingVar, setLoadingVar] = useState(true);
  const [errorVar, setErrorVar] = useState('');
  const [seleccion, setSeleccion] = useState(null);
  const [lote, setLote] = useState(LOTE_EMPTY);
  const [saving, setSaving] = useState(false);
  const [errorLote, setErrorLote] = useState('');

  useEffect(() => {
    setLoadingVar(true);
    setErrorVar('');
    api.getVariantesIA(nombreBase)
      .then(data => setVariantes(data.variantes || []))
      .catch(err => setErrorVar(err.message))
      .finally(() => setLoadingVar(false));
  }, [nombreBase]);

  function setField(field, value) {
    setLote(f => ({ ...f, [field]: value }));
  }

  function elegirVariante(v) {
    if (!v.enInventario || !v.medicamentoId) {
      setErrorVar(
        'Esta presentación no está en el catálogo. Use "Nuevo Medicamento" para darla de alta primero.'
      );
      return;
    }
    setErrorVar('');
    setSeleccion(v);
    const m = v.medicamento;
    setLote({
      ...LOTE_EMPTY,
      stockMin: m?.stockMin != null ? String(m.stockMin) : '',
      precioVenta: m?.precioVenta != null ? String(m.precioVenta) : '',
      costoUnit: m?.costoUnit != null ? String(m.costoUnit) : '',
      rSanitario: m?.rSanitario || '',
    });
    setPaso('lote');
  }

  async function handleRegistrarLote(e) {
    e.preventDefault();
    if (!seleccion?.medicamentoId) return;

    const { costoUnit, precioVenta, stockMin, stockInicial, lote: loteNum, vencimiento } = lote;
    if (!loteNum || !vencimiento) {
      setErrorLote('Número de lote y vencimiento son obligatorios.');
      return;
    }
    if (Number(costoUnit) <= 0) {
      setErrorLote('El costo unitario debe ser mayor a 0.');
      return;
    }
    if (Number(stockInicial) <= 0) {
      setErrorLote('El stock inicial del lote debe ser mayor a 0.');
      return;
    }

    setSaving(true);
    setErrorLote('');
    try {
      const vencFmt = vencimiento.split('-').reverse().join('/');
      await api.registrarLote(seleccion.medicamentoId, {
        lote: loteNum,
        vencimiento: vencFmt,
        costoUnit: parseFloat(costoUnit),
        precioVenta: parseFloat(precioVenta) || 0,
        stockMin: parseInt(stockMin, 10) || 0,
        stockInicial: parseInt(stockInicial, 10),
        rSanitario: lote.rSanitario,
        usuario: user?.name || user?.username || 'Sistema',
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setErrorLote(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel modal-panel-wide"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
            {paso === 'variantes'
              ? `Seleccione presentación — ${nombreBase}`
              : 'Registrar lote del medicamento'}
          </h2>
          <button type="button" onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>

        {paso === 'variantes' && (
          <>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>
              Elija la concentración y forma exacta (tableta, jarabe, etc.). Luego solo completará los datos del lote.
            </p>

            {errorVar && <div className="modal-error">{errorVar}</div>}

            {loadingVar ? (
              <p style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>Cargando presentaciones…</p>
            ) : (
              <div className="variantes-grid">
                {variantes.map((v, i) => (
                  <button
                    key={`${v.nombre}-${i}`}
                    type="button"
                    className={`variante-card ${v.enInventario ? 'en-inventario' : 'solo-ia'}`}
                    onClick={() => elegirVariante(v)}
                  >
                    <div className="variante-card-title">{v.nombre}</div>
                    <div className="variante-card-meta">{v.presentacion}</div>
                    <div className="variante-card-tags">
                      <span className="variante-tag">{v.categoria}</span>
                      {v.enInventario ? (
                        <span className="variante-tag green">En catálogo · Stock {v.stockActual}</span>
                      ) : (
                        <span className="variante-tag gray">No en catálogo</span>
                      )}
                    </div>
                  </button>
                ))}
                {variantes.length === 0 && (
                  <p style={{ color: '#94a3b8', fontSize: 13 }}>No se encontraron presentaciones para este medicamento.</p>
                )}
              </div>
            )}
          </>
        )}

        {paso === 'lote' && seleccion && (
          <form onSubmit={handleRegistrarLote}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginBottom: 16, fontSize: 12 }}
              onClick={() => { setPaso('variantes'); setSeleccion(null); setErrorLote(''); }}
            >
              ← Cambiar presentación
            </button>

            <div className="modal-med-readonly">
              <div><strong>Nombre:</strong> {seleccion.nombre}</div>
              <div><strong>Laboratorio:</strong> {seleccion.laboratorio}</div>
              <div><strong>Categoría:</strong> {seleccion.categoria}</div>
              <div><strong>Código:</strong> {seleccion.codigo}</div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Número de lote *</label>
                <input className="form-input" value={lote.lote}
                  onChange={e => setField('lote', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de vencimiento *</label>
                <input className="form-input" type="date" value={lote.vencimiento}
                  onChange={e => setField('vencimiento', e.target.value)} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Costo unitario ($) *</label>
                <input className="form-input" type="number" min="0.01" step="0.01"
                  value={lote.costoUnit} onChange={e => setField('costoUnit', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Precio de venta ($) *</label>
                <input className="form-input" type="number" min="0" step="0.01"
                  value={lote.precioVenta} onChange={e => setField('precioVenta', e.target.value)} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Stock mínimo de seguridad *</label>
                <input className="form-input" type="number" min="0"
                  value={lote.stockMin} onChange={e => setField('stockMin', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Stock inicial de este lote *</label>
                <input className="form-input" type="number" min="1"
                  value={lote.stockInicial} onChange={e => setField('stockInicial', e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Registro sanitario (opcional)</label>
              <input className="form-input" value={lote.rSanitario}
                onChange={e => setField('rSanitario', e.target.value)} />
            </div>

            {errorLote && <div className="modal-error">{errorLote}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                <CheckCircle size={16} />
                {saving ? 'Guardando…' : 'Registrar lote'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
