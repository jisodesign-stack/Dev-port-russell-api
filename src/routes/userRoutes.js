const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

// Routes web
router.get('/new', requireAuth, userController.showNewForm);
router.get('/:email/edit', requireAuth, userController.showEditForm);

// Routes CRUD
router.get('/', requireAuth, userController.getAllUsers);
router.get('/:email', requireAuth, userController.getUserByEmail);
router.post('/', requireAuth, userController.createUser);
router.put('/:email', requireAuth, userController.updateUser);
router.delete('/:email', requireAuth, userController.deleteUser);

module.exports = router;
