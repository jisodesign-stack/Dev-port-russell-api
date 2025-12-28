const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, reservationController.getAllReservations);

module.exports = router;
