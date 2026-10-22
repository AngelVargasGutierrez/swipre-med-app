const router = require('express').Router();
const medicamentoController = require('../controllers/medicamentoController');

router.get('/',          medicamentoController.getLaboratorios);
router.get('/categorias', medicamentoController.getCategorias);

module.exports = router;
