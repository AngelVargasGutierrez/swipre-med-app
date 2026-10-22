const router = require('express').Router();
const notificacionController = require('../controllers/notificacionController');

router.get('/',              notificacionController.getAll);
router.patch('/:id/leer',    notificacionController.marcarLeida);
router.patch('/leer-todas',  notificacionController.marcarTodas);

module.exports = router;
