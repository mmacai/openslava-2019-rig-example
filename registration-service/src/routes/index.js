const express = require('express');
const register = require('./register');

const router = express.Router();

router.use('/register', register);

module.exports = router;
