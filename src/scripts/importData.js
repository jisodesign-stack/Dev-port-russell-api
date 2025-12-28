require('dotenv').config();

const mongoose = require('mongoose');
const Catway = require('../models/Catway');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

const catways = [
    { catwayNumber: 1, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 2, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 3, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 4, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 5, catwayType: "long", catwayState: "bon état" },
    { catwayNumber: 6, catwayType: "short", catwayState: "En cours de réparation" },
    { catwayNumber: 7, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 8, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 9, catwayType: "long", catwayState: "Tâches de peinture bleue" },
    { catwayNumber: 10, catwayType: "long", catwayState: "bon état" },
    { catwayNumber: 11, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 12, catwayType: "short", catwayState: "Tâche d'huile et trou" },
    { catwayNumber: 13, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 14, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 15, catwayType: "long", catwayState: "bon état" },
    { catwayNumber: 16, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 17, catwayType: "short", catwayState: "Planches instables" },
    { catwayNumber: 18, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 19, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 20, catwayType: "long", catwayState: "bon état" },
    { catwayNumber: 21, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 22, catwayType: "short", catwayState: "bon état" },
    { catwayNumber: 23, catwayType: "short", catwayState: "Bite d'amarrage à vérifier" },
    { catwayNumber: 24, catwayType: "short", catwayState: "bon état" }
];

const reservations = [
    { catwayNumber: 1, clientName: "Thomas Martin", boatName: "Carolina", startDate: "2024-05-21", endDate: "2024-10-27" },
    { catwayNumber: 2, clientName: "John Doe", boatName: "Groeland", startDate: "2024-05-18", endDate: "2024-11-30" },
    { catwayNumber: 3, clientName: "Margareth Wurtz", boatName: "Sirène", startDate: "2024-06-20", endDate: "2024-08-27" },
    { catwayNumber: 7, clientName: "Ralph Laurent", boatName: "Surcouf", startDate: "2024-07-01", endDate: "2024-10-13" },
    { catwayNumber: 11, clientName: "Jack Sparrow", boatName: "Black Pearl", startDate: "2024-08-13", endDate: "2024-09-13" },
    { catwayNumber: 13, clientName: "Jacky Snow", boatName: "Léandra", startDate: "2024-09-18", endDate: "2024-12-23" },
    { catwayNumber: 5, clientName: "Marie Dupont", boatName: "L'Étoile", startDate: "2025-12-01", endDate: "2026-03-15" },
    { catwayNumber: 10, clientName: "Pierre Bernard", boatName: "Neptune", startDate: "2025-12-15", endDate: "2026-02-28" },
    { catwayNumber: 15, clientName: "Sophie Martin", boatName: "Océane", startDate: "2026-01-05", endDate: "2026-04-20" }
];

const defaultUser = { username: 'admin', email: 'admin@port-russell.fr', password: 'admin123' };

const importData = async () => {
    try {
        console.log('🔄 Connexion à MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connecté');

        console.log('🗑️  Nettoyage...');
        await Promise.all([
            Catway.deleteMany({}),
            Reservation.deleteMany({}),
            User.deleteMany({})
        ]);

        console.log('📥 Import des données...');
        await Promise.all([
            Catway.insertMany(catways),
            Reservation.insertMany(reservations),
            User.create(defaultUser)
        ]);

        console.log(`✅ ${catways.length} catways, ${reservations.length} réservations, 1 utilisateur`);
        console.log(`\n📌 Connexion: ${defaultUser.email} / ${defaultUser.password}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
};

importData();
