/**
 * @fileoverview Configuration de la connexion à la base de données MongoDB
 * @module config/database
 */

const mongoose = require('mongoose');

/**
 * Établit la connexion à MongoDB
 * @async
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Options de connexion modernes
        });
        console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
