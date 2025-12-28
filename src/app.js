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
