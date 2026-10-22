const router = require('express').Router();
const userController = require('../controllers/userController');

router.get('/',             userController.getAll);
router.post('/',            userController.createUser);
router.put('/:id',          userController.updateUser);
router.patch('/:id/toggle', userController.toggleEstado);
router.delete('/:id',       userController.deleteUser);

module.exports = router;
