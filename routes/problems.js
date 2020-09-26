const express = require('express');
const router = express.Router();
const methodOvverride = require('method-override');

//problems Model
const Problems = require('../models/Problem');
const { route } = require('.');
const { ensureAuthenticated, ensureProblemOwnerShip } = require('../config/auth');

//Get all problems
router.get('/problems', (req, res) => {
    Problems.find({}, (err, problems) => {
        if(err){
            console.log(err);
        }else{
            res.render('./problems/listProblems', {problems: problems});
        }
    })
});

//Add new Problem
router.get('/problems/new', ensureAuthenticated, (req, res)=>{
    res.render('./problems/newProblem');
});

//Create Problem
router.post('/problems/', ensureAuthenticated, (req, res)=>{
    const { title, solved } = req.body;
    const newProblem = new Problems({
        title: title,
        solved: solved,
        body: {
            description: req.body.description,
            example: req.body.example,
            limits: req.body.limits,
            difficulty: req.body.difficulty,
            year: req.body.year
        },
        author: {
            id: req.user._id,
            name: req.user.name
        }
    });
    newProblem.save()
        .then(Problem => {
            req.flash('success_msg', 'Successfully added a Problem');
            res.redirect('/problems');
        })
        .catch(err => console.log(err));
});

//Show Problem
router.get('/problems/:id', (req, res) => {
    Problems.findById(req.params.id, (err, foundProblem)=>{
        if(err){
            res.redirect("/problems");
        }else{
            res.render("./problems/showProblem", {problems: foundProblem});
        }
    })
});

//Edit Problem
router.get('/problems/:id/edit', ensureAuthenticated, ensureProblemOwnerShip, (req, res) => {
    Problems.findById(req.params.id, (err, foundProblem)=>{
        if(err){
            alert('Cannot find the Problem');
            res.redirect("/problems");
        }else{
            res.render("./problems/editProblem", {problems: foundProblem});
        }
    });
});

//Update Problem
router.put('/problems/:id', ensureAuthenticated, ensureProblemOwnerShip, (req, res) => {
    const data = req.body;
    const { title, solved } = req.body;
    Problems.findByIdAndUpdate(req.params.id, 
        {
            title: title,
            solved: solved,
            body: {
                description: req.body.description,
                example: req.body.example,
                limits: req.body.limits,
                difficulty: req.body.difficulty,
                year: req.body.year
            },
            author: {
                id: req.user._id,
                name: req.user.name
            }
        }, 
        (err, updatedProblem) => {
        if(err){
            req.flash('error_msg', 'There is an error processing your request.');
            res.redirect('/problems');
        }else{
            req.flash('success_msg', 'Succesfully edited the Problem');
            res.redirect('/problems/'+ req.params.id);
        }
    });
});

//Delete route
router.delete('/problems/:id', ensureAuthenticated, ensureProblemOwnerShip, (req, res) => {
    const data = req.body;
    Problems.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            req.flash('error_msg', 'There is an error processing your request.');
            res.redirect('/problems');
        }else{
            req.flash('success_msg', 'Succesfully deleted the Problem');
            res.redirect('/problems');
        }
    });
});

module.exports = router;