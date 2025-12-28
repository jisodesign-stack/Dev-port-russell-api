/**
 * @fileoverview Modèle User - Utilisateurs de la capitainerie
 * @module models/User
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schéma utilisateur
 * @typedef {Object} User
 * @property {string} username - Nom d'utilisateur (3-50 caractères)
 * @property {string} email - Email unique
 * @property {string} password - Mot de passe hashé (min 6 caractères)
 */
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Le nom d\'utilisateur est requis'],
        trim: true,
        minlength: [3, 'Minimum 3 caractères'],
        maxlength: [50, 'Maximum 50 caractères']
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: [6, 'Minimum 6 caractères'],
        select: false
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function() {
    return {
        id: this._id,
        username: this.username,
        email: this.email,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

module.exports = mongoose.model('User', userSchema);
