const Post = require('../models/Post');
const Problem = require('../models/Problems')

module.exports = {
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
                if(foundPost.author.id.equals(req.user._id) /*|| req.user.isAdmin*/){
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
                if(foundProblem.author.id.equals(req.user._id) /*|| req.user.isAdmin*/){
                    next();
                }else{
                    req.flash('error_msg', 'You do not have permission to do that');
                    res.redirect('/problems');
                }
            }
        });
    }
}