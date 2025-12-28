/**
 * @fileoverview Modèle Catway - Appontements du port
 * @module models/Catway
 */

const mongoose = require('mongoose');

/**
 * Schéma catway
 * @typedef {Object} Catway
 * @property {number} catwayNumber - Numéro unique du catway
 * @property {string} catwayType - Type: 'long' ou 'short'
 * @property {string} catwayState - État descriptif du catway
 */
const catwaySchema = new mongoose.Schema({
    catwayNumber: {
        type: Number,
        required: [true, 'Le numéro de catway est requis'],
        unique: true,
        min: [1, 'Le numéro doit être supérieur à 0']
    },
    catwayType: {
        type: String,
        required: [true, 'Le type de catway est requis'],
        enum: {
            values: ['long', 'short'],
            message: 'Le type doit être "long" ou "short"'
        }
    },
    catwayState: {
        type: String,
        required: [true, 'L\'état du catway est requis'],
        default: 'bon état',
        maxlength: [500, 'Maximum 500 caractères']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

catwaySchema.virtual('reservations', {
    ref: 'Reservation',
    localField: 'catwayNumber',
    foreignField: 'catwayNumber'
});

module.exports = mongoose.model('Catway', catwaySchema);
