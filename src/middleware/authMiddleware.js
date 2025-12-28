/**
 * @fileoverview Middleware d'authentification
 * @module middleware/authMiddleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Vérifie le token JWT (Bearer ou cookie)
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const verifyToken = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.token) {
            token = req.cookies.token;
        } else if (req.session?.token) {
            token = req.session.token;
        }

        if (!token) {
            if (req.headers.accept?.includes('application/json')) {
                return res.status(401).json({ success: false, message: 'Token manquant' });
            }
            req.flash('error', 'Veuillez vous connecter');
            return res.redirect('/');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            if (req.headers.accept?.includes('application/json')) {
                return res.status(401).json({ success: false, message: 'Utilisateur non trouvé' });
            }
            req.flash('error', 'Session invalide');
            return res.redirect('/');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Erreur auth:', error.message);
        if (req.headers.accept?.includes('application/json')) {
            return res.status(401).json({ success: false, message: 'Token invalide' });
        }
        req.flash('error', 'Session expirée');
        return res.redirect('/');
    }
};

/**
 * Vérifie que l'utilisateur est connecté via session
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const requireAuth = async (req, res, next) => {
    try {
        if (!req.session?.user) {
            req.flash('error', 'Veuillez vous connecter');
            return res.redirect('/');
        }

        const user = await User.findById(req.session.user.id);
        if (!user) {
            req.session.destroy();
            req.flash('error', 'Session invalide');
            return res.redirect('/');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Erreur requireAuth:', error);
        req.flash('error', 'Erreur d\'authentification');
        return res.redirect('/');
    }
};

/**
 * Définit les variables locales pour les vues EJS
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction suivante
 */
const setLocals = (req, res, next) => {
    res.locals.user = req.session?.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentDate = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    next();
};

/**
 * Génère un token JWT pour l'utilisateur
 * @param {Object} user - Utilisateur MongoDB
 * @returns {string} Token JWT
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
};

module.exports = { verifyToken, requireAuth, setLocals, generateToken };
