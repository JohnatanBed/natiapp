const express = require('express');
const { createFirstAdmin } = require('../controllers/setupController');

const router = express.Router();

// Public route to create the first admin (for setup only)
router.post('/create-admin', createFirstAdmin);

module.exports = router;
