const Reservation = require('../models/Reservation');
const Catway = require('../models/Catway');

const isApiRequest = (req) => req.headers.accept?.includes('application/json');

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Récupérer toutes les réservations
 *     tags: [Réservations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réservations
 */
const getAllReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ startDate: -1 });

        if (isApiRequest(req)) {
            return res.json({ success: true, count: reservations.length, data: reservations });
        }
        res.render('reservations/all', { title: 'Toutes les Réservations', reservations });
    } catch (error) {
        console.error('Erreur getAllReservations:', error);
        if (isApiRequest(req)) {
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        req.flash('error', 'Erreur de récupération');
        res.redirect('/dashboard');
    }
};

/**
 * @swagger
 * /catways/{id}/reservations:
 *   get:
 *     summary: Récupérer les réservations d'un catway
 *     tags: [Réservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des réservations
 */
const getReservationsByCatway = async (req, res) => {
    try {
        const catwayNumber = parseInt(req.params.id);
        const catway = await Catway.findOne({ catwayNumber });
        
        if (!catway) {
            if (isApiRequest(req)) {
                return res.status(404).json({ success: false, message: 'Catway non trouvé' });
            }
            req.flash('error', 'Catway non trouvé');
            return res.redirect('/catways');
        }

        const reservations = await Reservation.find({ catwayNumber }).sort({ startDate: -1 });

        if (isApiRequest(req)) {
            return res.json({ success: true, count: reservations.length, data: reservations });
        }
        res.render('reservations/index', { title: `Réservations - Catway ${catwayNumber}`, reservations, catway, catways: null });
    } catch (error) {
        console.error('Erreur getReservationsByCatway:', error);
        if (isApiRequest(req)) {
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        req.flash('error', 'Erreur de récupération');
        res.redirect('/catways');
    }
};

/**
 * @swagger
 * /catways/{id}/reservations/{idReservation}:
 *   get:
 *     summary: Récupérer une réservation spécifique
 *     tags: [Réservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idReservation
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la réservation
 *       404:
 *         description: Réservation non trouvée
 */
const getReservationById = async (req, res) => {
    try {
        const catwayNumber = parseInt(req.params.id);
        const reservation = await Reservation.findOne({ _id: req.params.idReservation, catwayNumber });

        if (!reservation) {
            if (isApiRequest(req)) {
                return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
            }
            req.flash('error', 'Réservation non trouvée');
            return res.redirect(`/catways/${catwayNumber}/reservations`);
        }

        const catway = await Catway.findOne({ catwayNumber });

        if (isApiRequest(req)) {
            return res.json({ success: true, data: reservation });
        }
        res.render('reservations/show', { title: `Réservation - ${reservation.clientName}`, reservation, catway });
    } catch (error) {
        console.error('Erreur getReservationById:', error);
        if (isApiRequest(req)) {
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        req.flash('error', 'Erreur de récupération');
        res.redirect('/catways');
    }
};

/**
 * @swagger
 * /catways/{id}/reservations:
 *   post:
 *     summary: Créer une réservation
 *     tags: [Réservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       201:
 *         description: Réservation créée
 *       400:
 *         description: Données invalides
 */
const createReservation = async (req, res) => {
    try {
        const catwayNumber = parseInt(req.params.id);
        const { clientName, boatName, startDate, endDate } = req.body;

        const catway = await Catway.findOne({ catwayNumber });
        if (!catway) {
            if (isApiRequest(req)) {
                return res.status(404).json({ success: false, message: 'Catway non trouvé' });
            }
            req.flash('error', 'Catway non trouvé');
            return res.redirect('/catways');
        }

        const conflict = await Reservation.findOne({
            catwayNumber,
            $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }]
        });

        if (conflict) {
            if (isApiRequest(req)) {
                return res.status(400).json({ success: false, message: 'Conflit de dates' });
            }
            req.flash('error', 'Ce catway est déjà réservé pour cette période');
            return res.redirect(`/catways/${catwayNumber}/reservations/new`);
        }

        const reservation = await Reservation.create({ catwayNumber, clientName, boatName, startDate, endDate });

        if (isApiRequest(req)) {
            return res.status(201).json({ success: true, data: reservation });
        }
        req.flash('success', 'Réservation créée');
        res.redirect(`/catways/${catwayNumber}/reservations`);
    } catch (error) {
        console.error('Erreur createReservation:', error);
        if (isApiRequest(req)) {
            return res.status(400).json({ success: false, message: error.message });
        }
        req.flash('error', error.message);
        res.redirect(`/catways/${req.params.id}/reservations/new`);
    }
};

/**
 * @swagger
 * /catways/{id}/reservations/{idReservation}:
 *   delete:
 *     summary: Supprimer une réservation
 *     tags: [Réservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idReservation
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Réservation supprimée
 *       404:
 *         description: Réservation non trouvée
 */
const deleteReservation = async (req, res) => {
    try {
        const catwayNumber = parseInt(req.params.id);
        const reservation = await Reservation.findOneAndDelete({ _id: req.params.idReservation, catwayNumber });

        if (!reservation) {
            if (isApiRequest(req)) {
                return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
            }
            req.flash('error', 'Réservation non trouvée');
            return res.redirect(`/catways/${catwayNumber}/reservations`);
        }

        if (isApiRequest(req)) {
            return res.json({ success: true, message: 'Réservation supprimée' });
        }
        req.flash('success', 'Réservation supprimée');
        res.redirect(`/catways/${catwayNumber}/reservations`);
    } catch (error) {
        console.error('Erreur deleteReservation:', error);
        if (isApiRequest(req)) {
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        req.flash('error', 'Erreur de suppression');
        res.redirect('/catways');
    }
};

/**
 * @swagger
 * /catways/{id}/reservations/{idReservation}:
 *   put:
 *     summary: Modifier une réservation
 *     tags: [Réservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idReservation
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       200:
 *         description: Réservation modifiée
 *       404:
 *         description: Réservation non trouvée
 */
const updateReservation = async (req, res) => {
    try {
        const catwayNumber = parseInt(req.params.id);
        const { clientName, boatName, startDate, endDate } = req.body;

        const reservation = await Reservation.findOne({ _id: req.params.idReservation, catwayNumber });

        if (!reservation) {
            if (isApiRequest(req)) {
                return res.status(404).json({ success: false, message: 'Réservation non trouvée' });
            }
            req.flash('error', 'Réservation non trouvée');
            return res.redirect(`/catways/${catwayNumber}/reservations`);
        }

        const conflict = await Reservation.findOne({
            _id: { $ne: req.params.idReservation },
            catwayNumber,
            $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }]
        });

        if (conflict) {
            if (isApiRequest(req)) {
                return res.status(400).json({ success: false, message: 'Conflit de dates avec une autre réservation' });
            }
            req.flash('error', 'Conflit de dates avec une autre réservation');
            return res.redirect(`/catways/${catwayNumber}/reservations/${req.params.idReservation}/edit`);
        }

        reservation.clientName = clientName;
        reservation.boatName = boatName;
        reservation.startDate = startDate;
        reservation.endDate = endDate;
        await reservation.save();

        if (isApiRequest(req)) {
            return res.json({ success: true, data: reservation });
        }
        req.flash('success', 'Réservation modifiée');
        res.redirect(`/catways/${catwayNumber}/reservations/${reservation._id}`);
    } catch (error) {
        console.error('Erreur updateReservation:', error);
        if (isApiRequest(req)) {
            return res.status(400).json({ success: false, message: error.message });
        }
        req.flash('error', error.message);
        res.redirect(`/catways/${req.params.id}/reservations`);
    }
};

const showNewForm = async (req, res) => {
    try {
        const catwayNumber = parseInt(req.params.id);
        const catway = await Catway.findOne({ catwayNumber });
        
        if (!catway) {
            req.flash('error', 'Catway non trouvé');
            return res.redirect('/catways');
        }
        res.render('reservations/new', { title: 'Nouvelle Réservation', catway });
    } catch (error) {
        req.flash('error', 'Erreur de chargement');
        res.redirect('/catways');
    }
};

const showEditForm = async (req, res) => {
    try {
        const catwayNumber = parseInt(req.params.id);
        const catway = await Catway.findOne({ catwayNumber });
        const reservation = await Reservation.findOne({ _id: req.params.idReservation, catwayNumber });
        
        if (!catway || !reservation) {
            req.flash('error', 'Réservation non trouvée');
            return res.redirect('/catways');
        }
        res.render('reservations/edit', { title: 'Modifier Réservation', catway, reservation });
    } catch (error) {
        req.flash('error', 'Erreur de chargement');
        res.redirect('/catways');
    }
};

module.exports = {
    getAllReservations,
    getReservationsByCatway,
    getReservationById,
    createReservation,
    updateReservation,
    deleteReservation,
    showNewForm,
    showEditForm
};
