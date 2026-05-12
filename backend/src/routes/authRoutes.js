const express = require('express');
const { login, updateProfile } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.put('/profile', updateProfile);

module.exports = router;