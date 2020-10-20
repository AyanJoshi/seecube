const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//User model
const User = require('../models/User');
const { route } = require('.');

//Loging page
router.get('/login', (req, res) => {
    if(req.user){
        res.send('Please logout to login from a different account');
    }else{
        res.render('login');
    }  
});

//Register page
router.get('/register', (req, res) => {
    if(req.user){
        res.send('Please logout to register for a new account');
    }else{
        res.render('register');
    }    
});

//Register Handle
router.post('/register', (req, res) => {
    const { name, email, password, password2, isAdmin} = req.body;
    let errors = [];

    //check required fields
    if(!name || !email || !password || !password2){
        errors.push({msg: 'Please fill in all fields'});
    }

    //check passwords match
    if(password != password2){
        errors.push({msg:'Passwords do not match'});
    }

    //Check pass length
    if(password.length < 6){
        errors.push({msg:'Password should be atleast 6 characters'});
    }

    if(errors.length > 0){
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    }else{
        //validaton passed
        User.findOne({ email: email})
            .then(user => {
                if(user){
                    //User exists
                    errors.push({msg:'Email is already registered'});
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    });
                }else{
                    const newUser = new User({
                        name: name,
                        email: email,
                        password: password,
                        isAdmin: isAdmin
                    });

                    //Hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;
                            
                            //set password to hashed password
                            newUser.password = hash;
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can login');
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        })
                    })
                }
            });
    }
});

//Login Handle
router.post('/login', (req, res, next)=>{
    passport.authenticate('local', {
        successRedirect: '/home',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//Logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
})

//User profile
router.get("/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err){
            console.log(err);
            req.flash('error_msg', 'Something went wrong');
            res.redirect('/');
        }else{
            res.render('users/show', {user: foundUser});
        }
    });
})

module.exports = router;