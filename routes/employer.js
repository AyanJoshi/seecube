const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { ensureAuthenticated } = require('../config/auth');

const { route } = require('.');
const Employer = require('../models/Employer');

//Login Page
router.get('/employer/login', (req, res) => {
    if(req.employer){
        res.send('Please logout to login from a different account');
    }else{
        res.render('login_employer');
    }  
});

//Register page
router.get('/employer/register', (req, res) => {
    if(req.employer){
        res.send('Please logout to register for a new account');
    }else{
        res.render('register_employer');
    }    
});

//Register Handle
router.post('/employer/register', (req, res) => {
    const { name, email, password, password2, current_company, position} = req.body;
    let errors = [];

    //check required fields
    if(!name || !email || !password || !password2 || !current_company || !position){
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
        res.render('register_employer', {
            errors,
            name,
            email,
            password,
            password2,
            current_company,
            position
        });
    }else{
        //validaton passed
        Employer.findOne({ email: email})
            .then(employer => {
                if(employer){
                    //User exists
                    errors.push({msg:'Email is already registered'});
                    res.render('register_employer', {
                        errors,
                        name,
                        email,
                        password,
                        password2,
                        current_company,
                        position
                    });
                }else{
                    const newEmployer = new Employer({
                        name: name,
                        email: email,
                        password: password,
                        current_company: current_company,
                        position: position,
                        userType: "employer"
                    });

                    //Hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newEmployer.password, salt, (err, hash) => {
                            if(err) throw err;
                            
                            //set password to hashed password
                            newEmployer.password = hash;
                            newEmployer.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered and can login');
                                    res.redirect('/employer/login');
                                })
                                .catch(err => console.log(err));
                        })
                    })
                }
            });
    }
});

//Login Handle
router.post('/employer/login', (req, res, next)=>{
    passport.authenticate('employer-signup', {
        successRedirect: '/home',
        failureRedirect: '/employer/login',
        failureFlash: true
    })(req, res, next);
});

//Logout handle
router.get('/employer/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/employer/login');
})


module.exports = router;