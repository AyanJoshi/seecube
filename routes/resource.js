const express = require('express');
const router = express.Router();
const methodOvverride = require('method-override');
const { exec } = require("child_process");

//user Model
const User = require('../models/User');
//resource Model
const Resource = require('../models/Resource')

const { route } = require('.');
const { ensureAuthenticated, ensureAdmin, ensureStudent } = require('../config/auth');

router.get('/resources', ensureAuthenticated, ensureStudent, (req, res) => {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Resource.find({ title: regex }, (err, resources) => {
            if (err) {
                console.log(err);
            } else {
                res.render('./resources/listResources', { resources: resources });
            }
        })
    } else {
        Resource.find({}, (err, resources) => {
            if (err) {
                console.log(err);
            } else {
                res.render('./resources/listResources', { resources: resources });
            }
        })
    }
});

//Add new Resource
router.get('/resources/new', ensureAuthenticated, ensureAdmin, (req, res) => {
    res.render('./resources/newResource');
});

router.post('/resources/', ensureAuthenticated, ensureAdmin, async (req, res) => {
    const { title, instructors, videos } = req.body;
    const newResource = new Resource({
        title: title,
        instructors: instructors,
        videos: videos,
        author: {
            id: req.user._id,
            name: req.user.name
        }
    });
    newResource.save()
        .then(Resource => {
            req.flash('success_msg', 'Thank you for submitting the resource');
            res.redirect('/resources');
        })
        .catch(err => console.log(err));
});

//Show Resource
router.get('/resources/:id', (req, res) => {
    Resource.findById(req.params.id).exec((err, foundResource)=>{
        if(err){
            res.redirect("/resources");
        }else{
            res.render("./resources/showResource", {resources: foundResource});
        }
    })
});

//Edit Resource
router.get('/resources/:id/edit', ensureAuthenticated, ensureAdmin, (req, res) => {
    Resource.findById(req.params.id, (err, foundResource) => {
        if (err) {
            alert('Cannot find the Resource');
            res.redirect("/resources");
        } else {
            res.render("./resources/editResource", { resources: foundResource });
        }
    });
});

router.put('/resources/:id', ensureAuthenticated, ensureAdmin, (req, res) => {
    const { title, instructors, videos } = req.body;
    Resource.findByIdAndUpdate(req.params.id,
        {
            title: title,
            instructors: instructors,
            videos: videos,
            author: {
                id: req.user._id,
                name: req.user.name
            }
        },
        (err, updatedResource) => {
            if (err) {
                req.flash('error_msg', 'There is an error processing your request.');
                res.redirect('/resources');
            } else {
                req.flash('success_msg', 'Succesfully edited the Resource');
                res.redirect('/resources/' + req.params.id);
            }
        });
});

//Delete route
router.delete('/resources/:id', ensureAuthenticated, ensureAdmin, (req, res) => {
    // const data = req.body;
    Resource.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            req.flash('error_msg', 'There is an error processing your request.');
            res.redirect('/resources');
        } else {
            req.flash('success_msg', 'Succesfully deleted the Resource');
            res.redirect('/resources');
        }
    });
});

module.exports = router;