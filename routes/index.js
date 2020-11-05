const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth'); 
router.get('/', (req, res) => res.render('welcome.ejs'));

//Dasboard Handle
router.get('/home', (req, res) => {
    if(req.user){
        res.render('home', {
            name: req.user.name
        });
    }else{
        res.render('home', {
            name: undefined
        })
    }
});

module.exports = router;