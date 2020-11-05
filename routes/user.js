const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Post = require('../models/Post');
const { ensureAuthenticated } = require('../config/auth');
const multer = require('multer');
const storage = multer.diskStorage({
    filename: (req, file, callback) =>{
        callback(null, Date.now() + file.originalname);
    }
});

const imageFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(null, false);
    }
    cb(null, true);
}

const upload = multer({ storage: storage, fileFilter: imageFilter})

const cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dfqajn5ex', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


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
            req.flash('error_msg', 'Something went wrong');
            res.redirect('/');
        }else{
            Post.find().where('author.id').equals(foundUser.id).exec((err, my_posts) => {
                if(err){
                    req.flash('error_msg', 'Something went wrong');
                    res.redirect('/');
                }
                res.render('users/show', {user: foundUser, posts: my_posts});
            });
        }
    });
})

//Submit display picture
router.put('/:id/submitDisplayPicture', ensureAuthenticated, upload.single('display_picture'), async(req, res)=>{
    
    if(!req.file){
        req.flash('error_msg', 'Unsuccessful: Either file is not uploaded or uploaded but of type other than jpg or png');
        res.redirect('back');
    }else{
        User.findById(req.params.id, async(err, foundUser) => {
            if(req.user && req.user._id.equals(foundUser._id)){                
                try{
                    if(foundUser.display_picture_id && foundUser.display_picture_id.length > 0){
                        await cloudinary.v2.uploader.destroy(foundUser.display_picture_id);
                    }
                    let result = await cloudinary.v2.uploader.upload(req.file.path, (err, data) => {
                        if(err){
                            req.flash('error_msg', err.message);
                            res.redirect('back');
                        }else{
                            foundUser.display_picture_id = data.public_id;
                            foundUser.display_picture = data.secure_url;
                            foundUser.save()
                            .then(user => {
                                req.flash('success_msg', 'Successfully added a display picture');
                                res.redirect('/users/'+req.params.id);
                            })
                            .catch(err => console.log(err));
                        }        
                    });
                }catch(err){
                    req.flash('error_msg', err.message);
                    return res.redirect('back');
                }    

            }else{
                req.flash('error_msg', err.message);
                res.redirect('back');
            }
        })
    }
});

module.exports = router;