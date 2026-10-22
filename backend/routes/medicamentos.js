const router = require('express').Router();
const medicamentoController = require('../controllers/medicamentoController');

router.get('/buscar-ia',       medicamentoController.buscarConIA);
router.get('/sugerencias-ia',  medicamentoController.getSugerenciasIA);
router.get('/variantes-ia',    medicamentoController.getVariantesIA);
router.get('/',             medicamentoController.getAll);
router.get('/:id',          medicamentoController.getOne);
router.post('/',         medicamentoController.create);
router.post('/lote/:id', medicamentoController.registrarLote);
router.post('/:id/lote', medicamentoController.registrarLote);
router.put('/:id',       medicamentoController.update);
router.delete('/:id',    medicamentoController.remove);

module.exports = router;
