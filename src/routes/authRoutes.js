const express = require('express');
const router = express.Router();
const { login, logout, showHomePage } = require('../controllers/authController');

router.get('/', showHomePage);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
