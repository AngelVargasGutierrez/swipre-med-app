const medicamentoModel = require('../models/medicamentoModel');
const reporteModel    = require('../models/reporteModel');
const geminiService   = require('../services/geminiService');
const catalogoFallback = require('../data/catalogoFallback');
const { norm, filtrarInventario } = require('../utils/textoUtils');

// Roles autorizados a crear/modificar/eliminar medicamentos y a registrar lotes.
const ROLES_CON_EDICION = ['admin', 'almacen', 'logistica'];
// Bajo este número de caracteres no se consulta a la IA (evita quemar cuota con 1 letra).
const LONGITUD_MINIMA_BUSQUEDA = 2;

async function getAll(req, res) {
  try {
    const categoria = req.query.categoria;
    if (categoria !== undefined && typeof categoria !== 'string') {
      return res.status(400).json({ error: 'El parámetro categoria debe ser texto.' });
    }
    const filterParams = categoria ? { categoria } : {};
    res.json(await medicamentoModel.findAll(filterParams));
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function getOne(req, res) {
  try {
    const med = await medicamentoModel.findById(req.params.id);
    if (!med) return res.status(404).json({ error: 'No encontrado' });
    res.json(med);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function create(req, res) {
  try {
    const { role } = req.body;
    if (!ROLES_CON_EDICION.includes(role)) {
      return res.status(403).json({ error: 'No tienes permiso para registrar medicamentos.' });
    }
    const nuevo = await medicamentoModel.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function update(req, res) {
  try {
    const { role, usuario } = req.body;
    if (!ROLES_CON_EDICION.includes(role)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar medicamentos.' });
    }
    const actualizado = await medicamentoModel.update(req.params.id, req.body);
    await reporteModel.registrarAccion(
      usuario || 'Sistema',
      'Modificó medicamento',
      'Medicamentos',
      `Actualizó la ficha de ${actualizado.nombre} (lote ${actualizado.lote})`
    );
    res.json(actualizado);
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function remove(req, res) {
  try {
    const role = req.headers['x-user-role'] || req.body.role;
    if (!ROLES_CON_EDICION.includes(role)) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar medicamentos.' });
    }
    await medicamentoModel.remove(req.params.id);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function getLaboratorios(req, res) {
  try {
    res.json(await medicamentoModel.getLaboratorios());
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function getCategorias(req, res) {
  try {
    res.json(await medicamentoModel.getCategorias());
  } catch (err) { res.status(500).json({ error: err.message }); }
}

async function getSugerenciasIA(req, res) {
  const q = (req.query.q || '').trim();
  try {
    if (q.length < LONGITUD_MINIMA_BUSQUEDA) return res.json([]);

    const sugerencias = await geminiService.generarSugerenciasFarmaceuticas(q);
    res.json(sugerencias);
  } catch (err) {
    console.error('[Gemini sugerencias-ia]', err.message);
    const fallback = catalogoFallback.buscarLocal(q, 6);
    if (fallback.length) return res.json(fallback);
    res.status(502).json({
      error: 'Gemini no disponible. Revise cuota o GEMINI_API_KEY en backend/.env',
      detalle: err.message,
    });
  }
}

async function getVariantesIA(req, res) {
  try {
    const base = (req.query.base || req.query.q || '').trim();
    const lab = (req.query.laboratorio || '').trim();
    if (base.length < LONGITUD_MINIMA_BUSQUEDA) return res.json({ nombreBase: base, variantes: [], laboratorios: [] });

    let geminiList = [];
    try {
      geminiList = await geminiService.generarVariantesFarmaceuticas(base);
    } catch (err) {
      console.error('[Gemini variantes-ia]', err.message);
      return res.status(502).json({ error: 'API Gemini inactiva o suspendida: ' + err.message });
    }

    const variantesFiltradas = lab
      ? geminiList.filter(v => norm(v.laboratorio) === norm(lab))
      : geminiList;
    const laboratorios = [...new Set(geminiList.map(v => v.laboratorio).filter(Boolean))].sort();

    res.json({
      nombreBase: base,
      variantes: variantesFiltradas,
      laboratorios,
      motor: 'gemini',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function buscarConIA(req, res) {
  try {
    const q = (req.query.q || '').trim();
    const lab = (req.query.laboratorio || '').trim();
    const todos = await medicamentoModel.findAll();

    if (q.length < LONGITUD_MINIMA_BUSQUEDA) {
      const resultados = lab
        ? todos.filter(m => norm(m.laboratorio) === norm(lab))
        : todos;
      return res.json({ sugerenciasIA: [], resultados, motor: 'local' });
    }

    let sugerenciasIA = [];
    let motor = 'local';

    try {
      sugerenciasIA = await geminiService.generarSugerenciasFarmaceuticas(q);
      motor = 'gemini';
    } catch (err) {
      console.error('[Gemini buscar-ia]', err.message);
      sugerenciasIA = catalogoFallback.buscarLocal(q, 6);
      motor = sugerenciasIA.length ? 'catalogo-local' : 'local-fallback';
    }

    let resultados = filtrarInventario(todos, q, sugerenciasIA);
    if (lab) {
      resultados = resultados.filter(m => norm(m.laboratorio) === norm(lab));
    }

    res.json({ sugerenciasIA, resultados, motor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function registrarLote(req, res) {
  try {
    const { usuario, role, ...loteData } = req.body;
    if (!ROLES_CON_EDICION.includes(role)) {
      return res.status(403).json({ error: 'No tienes permiso para ingresar stock.' });
    }
    const actualizado = await medicamentoModel.registrarLote(req.params.id, loteData);
    await reporteModel.registrarAccion(
      usuario || 'Sistema',
      'Registró nuevo lote',
      'Medicamentos',
      `Lote ${loteData.lote} de ${actualizado.nombre} (stock añadido: ${loteData.stockInicial})`
    );
    res.json(actualizado);
  } catch (err) {
    if (err.message === 'Medicamento no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAll, getOne, create, update, remove, getLaboratorios, getCategorias,
  getSugerenciasIA, getVariantesIA, buscarConIA, registrarLote,
};
