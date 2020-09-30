const Post = require('../models/Post');
const Problem = require('../models/Problem')
const Comment = require('../models/Comment');

module.exports = {
    ensureAdmin: function(req, res, next){
        if(req.user.isAdmin){
            return next();
        }else{
            // req.flash('error_msg', req.body.title);
            req.flash('error_msg', 'You\'re not the admin!');
            res.redirect('/problems');
        }
    },
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }else{
            req.flash('error_msg', 'Oh oh! You need to login before doing that');
            res.redirect('/users/login');
        }
    },
    ensurePostOwnerShip: function(req, res, next){
        Post.findById(req.params.id, (err, foundPost) => {
            if(err){
                req.flash('error', 'Post is not found');
                res.redirect('/posts');
            }else{
                if(foundPost.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash('error_msg', 'You do not have permission to do that');
                    res.redirect('/posts');
                }
            }
        });
    },
    ensureProblemOwnerShip: function(req, res, next){
        Problem.findById(req.params.id, (err, foundProblem) => {
            if(err){
                req.flash('error', 'Problem is not found');
                res.redirect('/problems');
            }else{
                if(foundProblem.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash('error_msg', 'You do not have permission to do that');
                    res.redirect('/problems');
                }
            }
        });
    },
    ensureCommentOwnerShip: function(req, res, next){
        
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if(err){
                req.flash('error', 'Comment is not found');
                res.redirect('back');
            }else{
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash('error_msg', 'You do not have permission to do that');
                    res.redirect('back');
                }
            }
        });
    }
}