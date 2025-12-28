const Catway = require('../models/Catway');
const Reservation = require('../models/Reservation');

const isApiRequest = (req) => req.headers.accept?.includes('application/json');

/**
 * @swagger
 * /catways:
 *   get:
 *     summary: Récupérer tous les catways
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des catways
 */
const getAllCatways = async (req, res) => {
    try {
        const catways = await Catway.find().sort({ catwayNumber: 1 });
        
        if (isApiRequest(req)) {
            return res.json({ success: true, count: catways.length, data: catways });
        }
        res.render('catways/index', { title: 'Gestion des Catways', catways });
    } catch (error) {
        console.error('Erreur getAllCatways:', error);
        if (isApiRequest(req)) {
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        req.flash('error', 'Erreur de récupération');
        res.redirect('/dashboard');
    }
};

/**
 * @swagger
 * /catways/{id}:
 *   get:
 *     summary: Récupérer un catway par son numéro
 *     tags: [Catways]
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
 *         description: Détails du catway
 *       404:
 *         description: Catway non trouvé
 */
const getCatwayById = async (req, res) => {
    try {
        const catway = await Catway.findOne({ catwayNumber: req.params.id });

        if (!catway) {
            if (isApiRequest(req)) {
                return res.status(404).json({ success: false, message: 'Catway non trouvé' });
            }
            req.flash('error', 'Catway non trouvé');
            return res.redirect('/catways');
        }

        const reservations = await Reservation.find({ catwayNumber: catway.catwayNumber });

        if (isApiRequest(req)) {
            return res.json({ success: true, data: catway });
        }
        res.render('catways/show', { title: `Catway ${catway.catwayNumber}`, catway, reservations });
    } catch (error) {
        console.error('Erreur getCatwayById:', error);
        if (isApiRequest(req)) {
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        req.flash('error', 'Erreur de récupération');
        res.redirect('/catways');
    }
};

/**
 * @swagger
 * /catways:
 *   post:
 *     summary: Créer un nouveau catway
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Catway'
 *     responses:
 *       201:
 *         description: Catway créé
 *       400:
 *         description: Données invalides
 */
const createCatway = async (req, res) => {
    try {
        const { catwayNumber, catwayType, catwayState } = req.body;

        const existing = await Catway.findOne({ catwayNumber });
        if (existing) {
            if (isApiRequest(req)) {
                return res.status(400).json({ success: false, message: 'Numéro déjà utilisé' });
            }
            req.flash('error', 'Ce numéro existe déjà');
            return res.redirect('/catways/new');
        }

        const catway = await Catway.create({ catwayNumber, catwayType, catwayState: catwayState || 'bon état' });

        if (isApiRequest(req)) {
            return res.status(201).json({ success: true, data: catway });
        }
        req.flash('success', 'Catway créé');
        res.redirect('/catways');
    } catch (error) {
        console.error('Erreur createCatway:', error);
        if (isApiRequest(req)) {
            return res.status(400).json({ success: false, message: error.message });
        }
        req.flash('error', error.message);
        res.redirect('/catways/new');
    }
};

/**
 * @swagger
 * /catways/{id}:
 *   put:
 *     summary: Modifier l'état d'un catway
 *     tags: [Catways]
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
 *             type: object
 *             properties:
 *               catwayState:
 *                 type: string
 *     responses:
 *       200:
 *         description: Catway modifié
 *       404:
 *         description: Catway non trouvé
 */
const updateCatway = async (req, res) => {
    try {
        const { catwayState } = req.body;
        const catway = await Catway.findOneAndUpdate(
            { catwayNumber: req.params.id },
            { catwayState },
            { new: true, runValidators: true }
        );

        if (!catway) {
            if (isApiRequest(req)) {
                return res.status(404).json({ success: false, message: 'Catway non trouvé' });
            }
            req.flash('error', 'Catway non trouvé');
            return res.redirect('/catways');
        }

        if (isApiRequest(req)) {
            return res.json({ success: true, data: catway });
        }
        req.flash('success', 'Catway modifié');
        res.redirect(`/catways/${catway.catwayNumber}`);
    } catch (error) {
        console.error('Erreur updateCatway:', error);
        if (isApiRequest(req)) {
            return res.status(400).json({ success: false, message: error.message });
        }
        req.flash('error', error.message);
        res.redirect('/catways');
    }
};

/**
 * @swagger
 * /catways/{id}:
 *   delete:
 *     summary: Supprimer un catway
 *     tags: [Catways]
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
 *         description: Catway supprimé
 *       404:
 *         description: Catway non trouvé
 */
const deleteCatway = async (req, res) => {
    try {
        const catway = await Catway.findOneAndDelete({ catwayNumber: req.params.id });

        if (!catway) {
            if (isApiRequest(req)) {
                return res.status(404).json({ success: false, message: 'Catway non trouvé' });
            }
            req.flash('error', 'Catway non trouvé');
            return res.redirect('/catways');
        }

        await Reservation.deleteMany({ catwayNumber: catway.catwayNumber });

        if (isApiRequest(req)) {
            return res.json({ success: true, message: 'Catway supprimé' });
        }
        req.flash('success', 'Catway supprimé');
        res.redirect('/catways');
    } catch (error) {
        console.error('Erreur deleteCatway:', error);
        if (isApiRequest(req)) {
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        req.flash('error', 'Erreur de suppression');
        res.redirect('/catways');
    }
};

const showNewForm = (req, res) => {
    res.render('catways/new', { title: 'Nouveau Catway' });
};

const showEditForm = async (req, res) => {
    try {
        const catway = await Catway.findOne({ catwayNumber: req.params.id });
        if (!catway) {
            req.flash('error', 'Catway non trouvé');
            return res.redirect('/catways');
        }
        res.render('catways/edit', { title: `Modifier Catway ${catway.catwayNumber}`, catway });
    } catch (error) {
        req.flash('error', 'Erreur de chargement');
        res.redirect('/catways');
    }
};

module.exports = {
    getAllCatways,
    getCatwayById,
    createCatway,
    updateCatway,
    deleteCatway,
    showNewForm,
    showEditForm
};
