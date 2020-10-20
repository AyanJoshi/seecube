const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth'); 
router.get('/', (req, res) => res.render('welcome.ejs'));

//Dasboard Handle
router.get('/home', (req, res) => {
    res.render('home', {
        name: req.user.name
    });
});

module.exports = router;