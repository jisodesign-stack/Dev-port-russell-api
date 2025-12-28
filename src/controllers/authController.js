const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
};

const isApiRequest = (req) => req.headers.accept?.includes('application/json');

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            if (isApiRequest(req)) {
                return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
            }
            req.flash('error', 'Email et mot de passe requis');
            return res.redirect('/');
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            if (isApiRequest(req)) {
                return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
            }
            req.flash('error', 'Email ou mot de passe incorrect');
            return res.redirect('/');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            if (isApiRequest(req)) {
                return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
            }
            req.flash('error', 'Email ou mot de passe incorrect');
            return res.redirect('/');
        }

        const token = generateToken(user._id);

        if (isApiRequest(req)) {
            return res.status(200).json({
                success: true,
                message: 'Connexion réussie',
                token,
                user: { id: user._id, username: user.username, email: user.email }
            });
        }

        req.session.user = { id: user._id, username: user.username, email: user.email };
        req.session.token = token;

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        req.session.save((err) => {
            if (err) {
                console.error('Erreur session:', err);
                req.flash('error', 'Erreur de connexion');
                return res.redirect('/');
            }
            req.flash('success', `Bienvenue ${user.username} !`);
            res.redirect('/dashboard');
        });

    } catch (error) {
        console.error('Erreur login:', error);
        if (isApiRequest(req)) {
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        req.flash('error', 'Erreur de connexion');
        res.redirect('/');
    }
};

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Déconnexion utilisateur
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
const logout = (req, res) => {
    if (isApiRequest(req)) {
        res.clearCookie('token');
        return res.status(200).json({ success: true, message: 'Déconnexion réussie' });
    }

    req.session.destroy((err) => {
        if (err) console.error('Erreur logout:', err);
        res.clearCookie('token');
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};

const showHomePage = (req, res) => {
    if (req.session?.user) {
        return res.redirect('/dashboard');
    }
    res.render('home', { title: 'Port de Plaisance Russell', user: null });
};

module.exports = { login, logout, showHomePage, generateToken };
