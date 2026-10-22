import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, FlaskConical, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LOTE_EMPTY = {
  lote: '', vencimiento: '', costoUnit: '',
  precioVenta: '', stockMin: '', stockInicial: '', rSanitario: '',
};

const norm = (s) => (s || '').trim().toLowerCase();

export default function NuevoMedicamento() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const onBack = () => navigate(-1);

  const [modo, setModo] = useState('existente'); // 'existente' | 'nuevo'

  // ==========================================
  // ESTADO: MODO EXISTENTE
  // ==========================================
  const [laboratorios, setLaboratorios] = useState([]);
  const [existentes,   setExistentes]   = useState([]);
  const [labSelected, setLabSelected] = useState('');
  const [medSearch,    setMedSearch]    = useState('');
  const [suggestions,  setSuggestions]  = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [noResults,    setNoResults]    = useState(false);
  const [medSelected,  setMedSelected]  = useState(null);
  const [loteExistente, setLoteExistente] = useState(LOTE_EMPTY);

  // ==========================================
  // ESTADO: MODO NUEVO CON IA
  // ==========================================
  const [medNuevo, setMedNuevo] = useState({ nombre: '', categoria: '', laboratorio: '' });
  const [loteNuevo, setLoteNuevo] = useState(LOTE_EMPTY);
  const [buscandoIA, setBuscandoIA] = useState(false);
  const [iaMessage, setIaMessage] = useState('');

  // ==========================================
  // ESTADO: GENERAL
  // ==========================================
  const [saving, setSaving] = useState(false);
  const [ok,     setOk]       = useState(false);

  useEffect(() => {
    Promise.all([api.getLaboratorios(), api.getMedicamentos()])
      .then(([labs, meds]) => {
        setLaboratorios(labs);
        setExistentes(meds);
      })
      .catch(console.error);
  }, []);

  // ====== LOGICA: MODO EXISTENTE ======
  const getMatches = useCallback((query) => {
    if (!labSelected) return [];
    const q = query.trim().toLowerCase();
    return existentes
      .filter(m =>
        norm(m.laboratorio) === norm(labSelected) &&
        (!q || m.nombre.toLowerCase().includes(q))
      ).slice(0, 6);
  }, [labSelected, existentes]);

  const showSuggestions = useCallback((matches, query = '') => {
    setSuggestions(matches);
    setShowDropdown(matches.length > 0);
    setNoResults(matches.length === 0 && !!labSelected && query.trim().length > 0);
  }, [labSelected]);

  function handleLabChange(e) {
    const lab = e.target.value.trim();
    setLabSelected(lab);
    setMedSearch('');
    setSuggestions([]);
    setShowDropdown(false);
    setNoResults(false);
    setMedSelected(null);
  }

  function handleMedSearch(e) {
    const val = e.target.value;
    setMedSearch(val);
    setMedSelected(null);
    if (!labSelected) {
      setSuggestions([]); setShowDropdown(false); setNoResults(false); return;
    }
    const matches = getMatches(val);
    showSuggestions(matches, val);
  }

  function selectSuggestion(m) {
    setMedSelected(m);
    setMedSearch(m.nombre);
    setSuggestions([]);
    setShowDropdown(false);
    setNoResults(false);
  }

  async function submitExistente(e) {
    e.preventDefault();
    if (!medSelected) return alert('Selecciona un medicamento de las sugerencias.');
    const { costoUnit, precioVenta, stockMin, stockInicial, lote, vencimiento } = loteExistente;
    if (!lote || !vencimiento) return alert('Lote y vencimiento obligatorios.');
    if (Number(stockInicial) <= 0) return alert('Stock inicial debe ser mayor a 0.');
    
    setSaving(true);
    try {
      const vencFmt = vencimiento.split('-').reverse().join('/');
      await api.registrarLote(medSelected.id, {
        lote, vencimiento: vencFmt,
        costoUnit: parseFloat(costoUnit),
        precioVenta: parseFloat(precioVenta) || 0,
        stockMin: parseInt(stockMin, 10) || 0,
        stockInicial: parseInt(stockInicial, 10),
        rSanitario: loteExistente.rSanitario,
        usuario: user?.name || user?.username || 'Sistema',
      });
      setOk(true);
      setTimeout(() => onBack(), 1800);
    } catch (err) { alert(`Error: ${err.message}`); setSaving(false); }
  }

  // ====== LOGICA: MODO NUEVO CON IA ======
  async function handleSugerirIA() {
    if (!medNuevo.nombre.trim()) return alert('Escribe al menos una palabra para buscar con IA');
    setBuscandoIA(true);
    setIaMessage('Consultando a Gemini IA...');
    try {
      const sugs = await api.getSugerenciasIA(medNuevo.nombre);
      if (sugs && sugs.length > 0) {
        const top = sugs[0];
        setMedNuevo(prev => ({
          ...prev,
          nombre: top.nombre,
          categoria: top.categoria,
          laboratorio: top.laboratorio || prev.laboratorio
        }));
        setLoteNuevo(prev => ({
          ...prev,
          stockMin: top.stock_minimo || 20
        }));
        setIaMessage('✨ ¡Datos autocompletados por IA con éxito!');
      } else {
        setIaMessage('⚠️ La IA no encontró sugerencias claras. Por favor ingresa los datos manualmente.');
      }
    } catch (error) {
      console.error(error);
      setIaMessage('❌ Error conectando con la IA: ' + error.message);
    } finally {
      setBuscandoIA(false);
    }
  }

  async function submitNuevo(e) {
    e.preventDefault();
    if (!medNuevo.nombre || !medNuevo.categoria || !medNuevo.laboratorio) {
      return alert('Completa nombre, categoría y laboratorio.');
    }
    const { costoUnit, precioVenta, stockMin, stockInicial, lote, vencimiento, rSanitario } = loteNuevo;
    if (!lote || !vencimiento) return alert('Lote y vencimiento obligatorios.');
    if (Number(stockInicial) <= 0) return alert('Stock inicial debe ser mayor a 0.');

    setSaving(true);
    try {
      const vencFmt = vencimiento.split('-').reverse().join('/');
      const payload = {
        codigo: 'GEN-' + Date.now().toString().slice(-6),
        nombre: medNuevo.nombre,
        categoria: medNuevo.categoria,
        laboratorio: medNuevo.laboratorio,
        rSanitario,
        lote,
        vencimiento: vencFmt,
        costoUnit: parseFloat(costoUnit),
        precioVenta: parseFloat(precioVenta) || 0,
        stockMin: parseInt(stockMin, 10) || 0,
        stock: parseInt(stockInicial, 10),
        role: user?.role || 'logistica'
      };

      await api.createMedicamento(payload);
      
      setOk(true);
      setTimeout(() => onBack(), 1800);
    } catch (err) { alert(`Error: ${err.message}`); setSaving(false); }
  }


  if (ok) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 340, gap: 18 }}>
        <CheckCircle size={64} color="#22c55e" />
        <h2 style={{ color: '#22c55e', margin: 0 }}>Guardado correctamente.</h2>
        <p style={{ color: '#64748b' }}>Stock actualizado. Redirigiendo al listado…</p>
      </div>
    );
  }

  return (
    <>
      <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Volver a Medicamentos
      </button>

      <h1 className="page-title">Registrar Inventario</h1>
      
      {/* TABS CONTROLS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        <button 
          type="button"
          onClick={() => setModo('existente')}
          style={{ 
            padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
            background: modo === 'existente' ? '#3b82f6' : '#f1f5f9',
            color: modo === 'existente' ? '#fff' : '#64748b'
          }}
        >
          Lote de Producto Existente
        </button>
        <button 
          type="button"
          onClick={() => setModo('nuevo')}
          style={{ 
            padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
            background: modo === 'nuevo' ? '#8b5cf6' : '#f1f5f9',
            color: modo === 'nuevo' ? '#fff' : '#64748b',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}
        >
          <Sparkles size={16} /> Producto Nuevo (IA)
        </button>
      </div>

      {modo === 'existente' ? (
        <form onSubmit={submitExistente} autoComplete="off">
          <p className="page-subtitle">Busca un medicamento ya catalogado y registra los datos del nuevo lote físico.</p>
          
          <div className="form-section">
            <div className="search-card" style={{ marginBottom: 0 }}>
              <div className="search-card-title"><Search size={18} /> Buscar medicamento en catálogo</div>
              <div className="form-group">
                <label className="form-label">Laboratorio fabricante *</label>
                <select className="form-select" value={labSelected} onChange={handleLabChange}>
                  <option value="">-- Seleccionar laboratorio --</option>
                  {laboratorios.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Buscar medicamento *</label>
                {!labSelected ? (
                  <div className="search-placeholder">Primero selecciona un laboratorio</div>
                ) : (
                  <div className="med-search-wrap">
                    <Search size={15} className="med-search-icon" />
                    <input
                      className="form-input med-search-input"
                      placeholder="Escribe el nombre…"
                      value={medSearch}
                      onChange={handleMedSearch}
                      onFocus={() => { if (!medSelected) showSuggestions(getMatches(medSearch), medSearch) }}
                      onBlur={() => setTimeout(() => setShowDropdown(false), 220)}
                      disabled={!!medSelected}
                    />
                    {medSelected && (
                      <button type="button" className="med-search-clear" onClick={() => {
                        setMedSelected(null); setMedSearch('');
                      }}>Cambiar</button>
                    )}
                    {showDropdown && suggestions.length > 0 && (
                      <ul className="med-autocomplete-dropdown">
                        {suggestions.map((m) => (
                          <li key={m.id} className="med-autocomplete-item" onMouseDown={(e) => { e.preventDefault(); selectSuggestion(m); }}>
                            <FlaskConical size={15} color="#6366f1" />
                            <div><div className="med-autocomplete-name">{m.nombre}</div></div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="manual-section">
            <div className="manual-section-title">Datos del nuevo lote físico</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Número de lote *</label>
                <input className="form-input" value={loteExistente.lote} onChange={e => setLoteExistente(f => ({ ...f, lote: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Vencimiento *</label>
                <input className="form-input" type="date" value={loteExistente.vencimiento} onChange={e => setLoteExistente(f => ({ ...f, vencimiento: e.target.value }))} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Costo unitario *</label>
                <input className="form-input" type="number" step="0.01" value={loteExistente.costoUnit} onChange={e => setLoteExistente(f => ({ ...f, costoUnit: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Precio de venta *</label>
                <input className="form-input" type="number" step="0.01" value={loteExistente.precioVenta} onChange={e => setLoteExistente(f => ({ ...f, precioVenta: e.target.value }))} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Stock Mínimo *</label>
                <input className="form-input" type="number" value={loteExistente.stockMin} onChange={e => setLoteExistente(f => ({ ...f, stockMin: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Inicial *</label>
                <input className="form-input" type="number" value={loteExistente.stockInicial} onChange={e => setLoteExistente(f => ({ ...f, stockInicial: e.target.value }))} required />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={saving || !medSelected}>
            {saving ? 'Guardando…' : 'Registrar lote'}
          </button>
        </form>
      ) : (
        <form onSubmit={submitNuevo} autoComplete="off">
          <p className="page-subtitle">Registra un fármaco completamente nuevo en el catálogo usando el Asistente de IA.</p>
          
          <div className="form-section" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div className="form-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#8b5cf6" /> Autocompletado con Inteligencia Artificial
            </div>
            <div className="form-row" style={{ alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Escribe el nombre comercial o principio activo</label>
                <input 
                  className="form-input" 
                  placeholder="Ej: Amoxicilina 500mg Cápsula..." 
                  value={medNuevo.nombre}
                  onChange={e => setMedNuevo(f => ({ ...f, nombre: e.target.value }))}
                />
              </div>
              <button 
                type="button" 
                onClick={handleSugerirIA}
                disabled={buscandoIA}
                style={{
                  background: '#8b5cf6', color: '#fff', border: 'none', padding: '11px 20px',
                  borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  marginBottom: '1px'
                }}
              >
                {buscandoIA ? 'Consultando...' : 'Autocompletar ✨'}
              </button>
            </div>
            {iaMessage && <div style={{ marginTop: '12px', fontSize: '14px', color: '#6d28d9', background: '#f5f3ff', padding: '10px', borderRadius: '6px' }}>{iaMessage}</div>}
            
            <div className="form-row" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Nombre Estandarizado *</label>
                <input className="form-input" value={medNuevo.nombre} onChange={e => setMedNuevo(f => ({ ...f, nombre: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Categoría Terapéutica *</label>
                <input className="form-input" value={medNuevo.categoria} onChange={e => setMedNuevo(f => ({ ...f, categoria: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Laboratorio *</label>
                <input className="form-input" value={medNuevo.laboratorio} onChange={e => setMedNuevo(f => ({ ...f, laboratorio: e.target.value }))} required />
              </div>
            </div>
          </div>

          <div className="manual-section">
            <div className="manual-section-title">Datos del primer lote físico</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Número de lote *</label>
                <input className="form-input" value={loteNuevo.lote} onChange={e => setLoteNuevo(f => ({ ...f, lote: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Vencimiento *</label>
                <input className="form-input" type="date" value={loteNuevo.vencimiento} onChange={e => setLoteNuevo(f => ({ ...f, vencimiento: e.target.value }))} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Costo unitario *</label>
                <input className="form-input" type="number" step="0.01" value={loteNuevo.costoUnit} onChange={e => setLoteNuevo(f => ({ ...f, costoUnit: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Precio de venta *</label>
                <input className="form-input" type="number" step="0.01" value={loteNuevo.precioVenta} onChange={e => setLoteNuevo(f => ({ ...f, precioVenta: e.target.value }))} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Stock Mínimo (IA Sugiere) *</label>
                <input className="form-input" type="number" value={loteNuevo.stockMin} onChange={e => setLoteNuevo(f => ({ ...f, stockMin: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Inicial *</label>
                <input className="form-input" type="number" value={loteNuevo.stockInicial} onChange={e => setLoteNuevo(f => ({ ...f, stockInicial: e.target.value }))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Registro Sanitario</label>
              <input className="form-input" value={loteNuevo.rSanitario} onChange={e => setLoteNuevo(f => ({ ...f, rSanitario: e.target.value }))} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', background: '#8b5cf6', borderColor: '#7c3aed' }} disabled={saving}>
            {saving ? 'Guardando Nuevo Medicamento…' : 'Registrar Nuevo Medicamento'}
          </button>
        </form>
      )}
    </>
  );
}
