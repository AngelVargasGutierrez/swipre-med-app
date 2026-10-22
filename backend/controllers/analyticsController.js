const analyticsModel = require('../models/analyticsModel');

async function getAnalytics(req, res) {
  try {
    const [prediccionDemanda, comparativaMensual, tendencias, prediccionesCriticas, valorPorCategoria] = await Promise.all([
      analyticsModel.getPrediccionDemanda(),
      analyticsModel.getComparativaMensual(),
      analyticsModel.getTendencias(),
      analyticsModel.getPrediccionesCriticas(),
      analyticsModel.getValorPorCategoria(),
    ]);

    res.json({ prediccionDemanda, comparativaMensual, tendencias, prediccionesCriticas, valorPorCategoria });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAnalytics };
