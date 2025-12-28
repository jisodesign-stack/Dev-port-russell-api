const User = require('../models/User');

const isApiRequest = (req) => req.headers.accept?.includes('application/json');

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        if (isApiRequest(req)) {
            return res.json({ success: true, count: users.length, data: users });
        }
        res.render('users/index', { title: 'Gestion des Utilisateurs', users });
    } catch (error) {
        console.error('Erreur getAllUsers:', error);
        if (isApiRequest(req)) {
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        req.flash('error', 'Erreur de récupération');
        res.redirect('/dashboard');
    }
};

/**
 * @swagger
 * /users/{email}:
 *   get:
 *     summary: Récupérer un utilisateur par email
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *       404:
 *         description: Utilisateur non trouvé
 */
const getUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email }).select('-password');

        if (!user) {
            if (isApiRequest(req)) {
                return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
            }
            req.flash('error', 'Utilisateur non trouvé');
            return res.redirect('/users');
        }

        if (isApiRequest(req)) {
            return res.json({ success: true, data: user });
        }
        res.render('users/show', { title: `Utilisateur - ${user.username}`, userDetails: user });
    } catch (error) {
        console.error('Erreur getUserByEmail:', error);
        if (isApiRequest(req)) {
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        req.flash('error', 'Erreur de récupération');
        res.redirect('/users');
    }
};

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Créer un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Données invalides
 */
const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            if (isApiRequest(req)) {
                return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
            }
            req.flash('error', 'Cet email existe déjà');
            return res.redirect('/users/new');
        }

        const user = await User.create({ username, email, password });

        if (isApiRequest(req)) {
            return res.status(201).json({ 
                success: true, 
                data: { id: user._id, username: user.username, email: user.email }
            });
        }
        req.flash('success', 'Utilisateur créé');
        res.redirect('/users');
    } catch (error) {
        console.error('Erreur createUser:', error);
        if (isApiRequest(req)) {
            return res.status(400).json({ success: false, message: error.message });
        }
        req.flash('error', error.message);
        res.redirect('/users/new');
    }
};

/**
 * @swagger
 * /users/{email}:
 *   put:
 *     summary: Modifier un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur modifié
 *       404:
 *         description: Utilisateur non trouvé
 */
const updateUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ email: req.params.email });

        if (!user) {
            if (isApiRequest(req)) {
                return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
            }
            req.flash('error', 'Utilisateur non trouvé');
            return res.redirect('/users');
        }

        if (username) user.username = username;
        if (password) user.password = password;
        await user.save();

        if (isApiRequest(req)) {
            return res.json({ success: true, data: { id: user._id, username: user.username, email: user.email } });
        }
        req.flash('success', 'Utilisateur modifié');
        res.redirect(`/users/${user.email}`);
    } catch (error) {
        console.error('Erreur updateUser:', error);
        if (isApiRequest(req)) {
            return res.status(400).json({ success: false, message: error.message });
        }
        req.flash('error', error.message);
        res.redirect('/users');
    }
};

/**
 * @swagger
 * /users/{email}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *       404:
 *         description: Utilisateur non trouvé
 */
const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ email: req.params.email });

        if (!user) {
            if (isApiRequest(req)) {
                return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
            }
            req.flash('error', 'Utilisateur non trouvé');
            return res.redirect('/users');
        }

        if (isApiRequest(req)) {
            return res.json({ success: true, message: 'Utilisateur supprimé' });
        }
        req.flash('success', 'Utilisateur supprimé');
        res.redirect('/users');
    } catch (error) {
        console.error('Erreur deleteUser:', error);
        if (isApiRequest(req)) {
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        req.flash('error', 'Erreur de suppression');
        res.redirect('/users');
    }
};

const showNewForm = (req, res) => {
    res.render('users/new', { title: 'Nouvel Utilisateur' });
};

const showEditForm = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email }).select('-password');
        if (!user) {
            req.flash('error', 'Utilisateur non trouvé');
            return res.redirect('/users');
        }
        res.render('users/edit', { title: `Modifier - ${user.username}`, userDetails: user });
    } catch (error) {
        req.flash('error', 'Erreur de chargement');
        res.redirect('/users');
    }
};

module.exports = {
    getAllUsers,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    showNewForm,
    showEditForm
};
