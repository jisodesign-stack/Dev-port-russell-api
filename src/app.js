require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const authRoutes = require('./routes/authRoutes');
const catwayRoutes = require('./routes/catwayRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const { setLocals } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connexion à MongoDB réussie'))
    .catch(err => console.error('❌ Erreur MongoDB:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(flash());
app.use(express.static(path.join(__dirname, '../public')));
app.use(setLocals);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Port Russell API'
}));

// Route temporaire pour initialiser les données
const Catway = require('./models/Catway');
const Reservation = require('./models/Reservation');
const User = require('./models/User');

app.get('/setup', async (req, res) => {
    try {
        // Vérifier d'abord la connexion MongoDB
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ error: 'MongoDB non connecté', state: mongoose.connection.readyState });
        }

        // Nettoyer les données existantes
        await Catway.deleteMany({});
        await Reservation.deleteMany({});
        await User.deleteMany({});

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

        await Catway.insertMany(catways);
        await Reservation.insertMany(reservations);
        await User.create({ username: 'admin', email: 'admin@port-russell.fr', password: 'admin123' });

        res.json({ 
            message: '✅ Données initialisées avec succès !',
            catways: catways.length,
            reservations: reservations.length,
            login: { email: 'admin@port-russell.fr', password: 'admin123' }
        });
    } catch (error) {
        console.error('Setup error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/catways', catwayRoutes);
app.use('/reservations', reservationRoutes);
app.use('/users', userRoutes);

app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Page non trouvée',
        message: 'La page que vous recherchez n\'existe pas.',
        error: { status: 404 }
    });
});

app.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(err.status || 500).render('error', {
        title: 'Erreur',
        message: err.message || 'Une erreur est survenue',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

app.listen(PORT, () => {
    console.log(`🚢 Serveur Port Russell démarré sur http://localhost:${PORT}`);
    console.log(`📚 Documentation API: http://localhost:${PORT}/api-docs`);
});

module.exports = app;
