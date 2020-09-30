var express = require('express');
var router = express.Router({mergeParama:true});
var Post = require("../models/Post.js");
var Problem = require("../models/Problem.js");
var Comment = require("../models/Comment.js");

const { ensureAuthenticated, ensureOwnerShip, ensureCommentOwnerShip } = require('../config/auth');

router.post("/posts/:id/comments", ensureAuthenticated, (req,res) => {
    Post.findById(req.params.id, (err, foundPost) => {
        if(err){
            console.log(err);
        }else{
            
            const newComment = new Comment({
               text: req.body.text,
               author: {
                    id: req.user._id,
                    name: req.user.name
                } 
            });
            newComment.save()
            .then(post => {
                foundPost.comments.push(newComment);
                foundPost.save();
                //req.flash('success_msg', 'Successfully added a comment');
                res.redirect('/posts/'+req.params.id);
            })
            .catch(err => console.log(err));
        }
    })
});

router.post("/problems/:id/comments", ensureAuthenticated, (req,res) => {
    Problem.findById(req.params.id, (err, foundProblem) => {
        if(err){
            console.log(err);
        }else{
            
            const newComment = new Comment({
               text: req.body.text,
               author: {
                    id: req.user._id,
                    name: req.user.name
                } 
            });
            newComment.save()
            .then(problem => {
                foundProblem.comments.push(newComment);
                foundProblem.save();
                //req.flash('success_msg', 'Successfully added a comment');
                res.redirect('/problems/'+req.params.id);
            })
            .catch(err => console.log(err));
        }
    })
});

router.put("/posts/:id/comments/:comment_id", ensureAuthenticated, ensureCommentOwnerShip, function(req,res){

    Comment.findByIdAndUpdate(req.params.comment_id, req.body, function(err,updatedComment){
        if(err){
            console.log(err);
            res.redirect("back");
        }else{
            res.redirect("/posts/"+req.params.id);
        }
    }); 
});

router.put("/problems/:id/comments/:comment_id", ensureAuthenticated, ensureCommentOwnerShip, function(req,res){

    Comment.findByIdAndUpdate(req.params.comment_id, req.body, function(err, updatedComment){
        if(err){
            console.log(err);
            res.redirect("back");
        }else{
            res.redirect("/problems/"+req.params.id);
        }
    }); 
});

router.delete("/posts/:id/comments/:comment_id",  ensureAuthenticated, ensureCommentOwnerShip, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            console.log(err);
        }else{
            req.flash("success_msg","Comment successfully deleted!");
            res.redirect("/posts/"+req.params.id);
        }
    });
});

router.delete("/problems/:id/comments/:comment_id",  ensureAuthenticated, ensureCommentOwnerShip, function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            console.log(err);
        }else{
            req.flash("success_msg","Comment successfully deleted!");
            res.redirect("/problems/"+req.params.id);
        }
    });
});


module.exports = router;