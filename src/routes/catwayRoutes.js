const express = require('express');
const router = express.Router();
const catwayController = require('../controllers/catwayController');
const reservationController = require('../controllers/reservationController');
const { requireAuth } = require('../middleware/authMiddleware');

// Routes web
router.get('/new', requireAuth, catwayController.showNewForm);
router.get('/:id/edit', requireAuth, catwayController.showEditForm);

// Routes CRUD catways
router.get('/', requireAuth, catwayController.getAllCatways);
router.get('/:id', requireAuth, catwayController.getCatwayById);
router.post('/', requireAuth, catwayController.createCatway);
router.put('/:id', requireAuth, catwayController.updateCatway);
router.delete('/:id', requireAuth, catwayController.deleteCatway);

// Routes réservations
router.get('/:id/reservations/new', requireAuth, reservationController.showNewForm);
router.get('/:id/reservations/:idReservation/edit', requireAuth, reservationController.showEditForm);
router.get('/:id/reservations', requireAuth, reservationController.getReservationsByCatway);
router.get('/:id/reservations/:idReservation', requireAuth, reservationController.getReservationById);
router.post('/:id/reservations', requireAuth, reservationController.createReservation);
router.put('/:id/reservations/:idReservation', requireAuth, reservationController.updateReservation);
router.delete('/:id/reservations/:idReservation', requireAuth, reservationController.deleteReservation);

module.exports = router;
