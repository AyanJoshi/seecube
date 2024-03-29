const Post = require('../models/Post');
const Problem = require('../models/Problem')
const Comment = require('../models/Comment');
const Job = require('../models/Job');

module.exports = {
    ensureAdmin: function (req, res, next) {
        if (req.user.isAdmin) {
            return next();
        } else {
            // req.flash('error_msg', req.body.title);
            req.flash('error_msg', 'You\'re not the admin!');
            res.redirect('/home');
        }
    },
    ensureStudent: function (req, res, next) {
        if (req.user && req.user.userType.localeCompare("employer") != 0) {
            return next();
        } else {
            // req.flash('error_msg', req.body.title);
            req.flash('error_msg', 'Sorry but you\'re not a student!');
            res.redirect('/home');
        }
    },
    ensureEmployer: function (req, res, next) {
        if (req.user && req.user.userType.localeCompare("employer") == 0) {
            return next();
        } else {
            // req.flash('error_msg', req.body.title);
            req.flash('error_msg', 'Sorry but you\'re not an employer!');
            res.redirect('/home');
        }
    },
    ensureProfessor: function (req, res, next) {
        if (req.user && req.user.userType.localeCompare("professor") == 0) {
            return next();
        } else {
            // req.flash('error_msg', req.body.title);
            req.flash('error_msg', 'Sorry but you\'re not a professor!');
            res.redirect('/home');
        }
    },
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            req.flash('error_msg', 'Oh oh! You need to login before doing that');
            res.redirect('/login');
        }
    },
    ensurePostOwnerShip: function (req, res, next) {
        Post.findById(req.params.id, (err, foundPost) => {
            if (err) {
                req.flash('error', 'Post is not found');
                res.redirect('/posts');
            } else {
                if (foundPost.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash('error_msg', 'You do not have permission to do that');
                    res.redirect('/posts');
                }
            }
        });
    },
    ensureProblemOwnerShip: function (req, res, next) {
        Problem.findById(req.params.id, (err, foundProblem) => {
            if (err) {
                req.flash('error', 'Problem is not found');
                res.redirect('/problems');
            } else {
                if (foundProblem.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash('error_msg', 'You do not have permission to do that');
                    res.redirect('/problems');
                }
            }
        });
    },
    ensureCommentOwnerShip: function (req, res, next) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                req.flash('error', 'Comment is not found');
                res.redirect('back');
            } else {
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash('error_msg', 'You do not have permission to do that');
                    res.redirect('back');
                }
            }
        });
    },
    ensureJobOwnerShip: function (req, res, next) {
        Job.findById(req.params.id, (err, foundJob) => {
            if (err) {
                req.flash('error', 'Job is not found');
                res.redirect('/jobs');
            } else {
                if (foundJob.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash('error_msg', 'You do not have permission to do that');
                    res.redirect('/jobs');
                }
            }
        });
    }
}