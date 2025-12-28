const Catway = require('../models/Catway');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

const showDashboard = async (req, res) => {
    try {
        const [catwaysCount, reservationsCount, usersCount] = await Promise.all([
            Catway.countDocuments(),
            Reservation.countDocuments(),
            User.countDocuments()
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [currentReservations, upcomingReservations] = await Promise.all([
            Reservation.find({
                startDate: { $lte: today },
                endDate: { $gte: today }
            }).sort({ endDate: 1 }),
            Reservation.find({
                startDate: { $gt: today }
            }).sort({ startDate: 1 }).limit(5)
        ]);

        const formattedDate = today.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        res.render('dashboard/index', {
            title: 'Tableau de Bord',
            stats: { catways: catwaysCount, reservations: reservationsCount, users: usersCount },
            currentReservations,
            upcomingReservations,
            currentDate: formattedDate
        });
    } catch (error) {
        console.error('Erreur dashboard:', error);
        req.flash('error', 'Erreur de chargement');
        res.redirect('/');
    }
};

module.exports = { showDashboard };
