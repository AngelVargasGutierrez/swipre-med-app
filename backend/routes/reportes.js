const router = require('express').Router();
const reporteController = require('../controllers/reporteController');

router.get('/resumen', reporteController.getResumen);
router.get('/movimientos', reporteController.getMovimientos);
router.get('/rotacion', reporteController.getRotacion);

module.exports = router;
