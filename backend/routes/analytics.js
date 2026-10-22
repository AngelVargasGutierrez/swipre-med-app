const router = require('express').Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/', analyticsController.getAnalytics);

module.exports = router;
