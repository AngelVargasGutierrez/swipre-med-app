const router = require('express').Router();
const inventarioController = require('../controllers/inventarioController');

router.get('/', inventarioController.getInventario);

module.exports = router;
