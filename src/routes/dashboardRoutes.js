const express = require('express');
const router = express.Router();
const { showDashboard } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, showDashboard);

module.exports = router;
