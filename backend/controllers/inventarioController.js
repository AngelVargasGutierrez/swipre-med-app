const inventarioModel = require('../models/inventarioModel');

async function getInventario(req, res) {
  try {
    const [medicamentos, totalesRaw] = await Promise.all([
      inventarioModel.findAll(),
      inventarioModel.getTotales(),
    ]);

    res.json({
      medicamentos,
      totals: {
        total:     totalesRaw.total,
        criticos:  totalesRaw.criticos,
        bajos:     totalesRaw.bajos,
        porVencer: totalesRaw.por_vencer,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getInventario };
