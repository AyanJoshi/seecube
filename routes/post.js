const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');

//Post Model
const Post = require('../models/Post');
const { route } = require('.');
const { ensureAuthenticated, ensurePostOwnerShip } = require('../config/auth');

//Get all Posts
router.get('/posts', (req, res) => {
    Post.find({}, (err, posts) => {
        if(err){
            console.log(err);
        }else{
            res.render('./posts/listPosts', {posts: posts});
        }
    })
});

//Add new post
router.get('/posts/new', ensureAuthenticated, (req, res)=>{
    res.render('./posts/newPost');
});

//Create Post
router.post('/posts/', ensureAuthenticated, (req, res)=>{
    const { title, body, image} = req.body;
    const newPost = new Post({
        title: title,
        body: body,
        image: image,
        author: {
            id: req.user._id,
            name: req.user.name
        }
    });
    newPost.save()
        .then(post => {
            req.flash('success_msg', 'Successfully added a post');
            res.redirect('/posts');
        })
        .catch(err => console.log(err));
});

//Show post
router.get('/posts/:id', (req, res) => {
    Post.findById(req.params.id).populate("comments").exec((err, foundPost)=>{
        if(err){
            res.redirect("/posts");
        }else{
            res.render("./posts/show", {post: foundPost});
        }
    })
});

//Edit Post
router.get('/posts/:id/edit', ensureAuthenticated, ensurePostOwnerShip, (req, res) => {
    Post.findById(req.params.id, (err, foundPost)=>{
        if(err){
            alert('cannot find the post');
            res.redirect("/posts");
        }else{
            res.render("./posts/edit", {post: foundPost});
        }
    });
});

//Update Post
router.put('/posts/:id', ensureAuthenticated, ensurePostOwnerShip, (req, res) => {
    const data = req.body;
    Post.findByIdAndUpdate(req.params.id, data, (err, updatedPost) => {
        if(err){
            req.flash('error_msg', 'There is an error processing your request.');
            res.redirect('/posts');
        }else{
            req.flash('success_msg', 'Succesfully edited the post');
            res.redirect('/posts/'+ req.params.id);
        }
    });
});

//Delete route
router.delete('/posts/:id', ensureAuthenticated, ensurePostOwnerShip, (req, res) => {
    const data = req.body;
    Post.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            req.flash('error_msg', 'There is an error processing your request.');
            res.redirect('/posts');
        }else{
            req.flash('success_msg', 'Succesfully deleted the post');
            res.redirect('/posts');
        }
    });
});

module.exports = router;