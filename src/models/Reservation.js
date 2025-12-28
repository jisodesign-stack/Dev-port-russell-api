/**
 * @fileoverview Modèle Reservation - Réservations de catways
 * @module models/Reservation
 */

const mongoose = require('mongoose');

/**
 * Schéma réservation
 * @typedef {Object} Reservation
 * @property {number} catwayNumber - Numéro du catway réservé
 * @property {string} clientName - Nom du client
 * @property {string} boatName - Nom du bateau
 * @property {Date} startDate - Date de début
 * @property {Date} endDate - Date de fin
 */
const reservationSchema = new mongoose.Schema({
    catwayNumber: {
        type: Number,
        required: [true, 'Le numéro de catway est requis'],
        ref: 'Catway'
    },
    clientName: {
        type: String,
        required: [true, 'Le nom du client est requis'],
        trim: true,
        minlength: [2, 'Minimum 2 caractères'],
        maxlength: [100, 'Maximum 100 caractères']
    },
    boatName: {
        type: String,
        required: [true, 'Le nom du bateau est requis'],
        trim: true,
        minlength: [2, 'Minimum 2 caractères'],
        maxlength: [100, 'Maximum 100 caractères']
    },
    startDate: {
        type: Date,
        required: [true, 'La date de début est requise']
    },
    endDate: {
        type: Date,
        required: [true, 'La date de fin est requise']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reservationSchema.pre('save', function(next) {
    if (this.endDate <= this.startDate) {
        next(new Error('La date de fin doit être postérieure à la date de début'));
    }
    next();
});

reservationSchema.methods.isActive = function() {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
};

reservationSchema.statics.findActive = function() {
    const now = new Date();
    return this.find({
        startDate: { $lte: now },
        endDate: { $gte: now }
    });
};

reservationSchema.index({ catwayNumber: 1 });
reservationSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
