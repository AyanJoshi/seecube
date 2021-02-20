const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');

const { route } = require('.');
const Professor = require('../models/Professor');

//Login Page
router.get('/professor/login', (req, res) => {
    if (req.user) {
        res.send('Please logout to login from a different account');
    } else {
        res.render('login_professor');
    }
});

//Register page
router.get('/professor/register', (req, res) => {
    if (req.user) {
        res.send('Please logout to register for a new account');
    } else {
        res.render('register_professor');
    }
});

//Register Handle
router.post('/professor/register', (req, res) => {
    const { name, email, password, password2, department } = req.body;
    let errors = [];

    //check required fields
    if (!name || !email || !password || !password2 || !department) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    //check passwords match
    if (password != password2) {
        errors.push({ msg: 'Passwords do not match' });
    }

    //Check pass length
    if (password.length < 6) {
        errors.push({ msg: 'Password should be atleast 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register_professor', {
            errors,
            name,
            email,
            password,
            password2,
            department
        });
    } else {
        //validaton passed
        Professor.findOne({ email: email })
            .then(professor => {
                if (professor) {
                    //User exists
                    errors.push({ msg: 'Email is already registered' });
                    res.render('register_professor', {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                        department
                    });
                } else {
                    const newProfessor = new Professor({
                        name: name,
                        email: email,
                        password: password,
                        department: department,
                        userType: "professor"
                    });

                    //Hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newProfessor.password, salt, (err, hash) => {
                            if (err) throw err;

                            //set password to hashed password
                            newProfessor.password = hash;
                            newProfessor.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can login');
                                    res.redirect('/professor/login');
                                })
                                .catch(err => console.log(err));
                        })
                    })
                }
            });
    }
});

//Login Handle
router.post('/professor/login', (req, res, next) => {
    passport.authenticate('professor-signup', {
        successRedirect: '/home',
        failureRedirect: '/professor/login',
        failureFlash: true
    })(req, res, next);
});

//Logout handle
router.get('/professor/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/professor/login');
})


module.exports = router;