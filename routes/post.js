const express = require('express');
const router = express.Router();

//Post Model
const Post = require('../models/Post');
const { route } = require('.');
const { ensureAuthenticated } = require('../config/auth');

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
        image: image
    });
    newPost.save()
        .then(post => {
            req.flash('success_msg', 'Successfully added a post');
            res.redirect('/posts');
        })
        .catch(err => console.log(err));
});

module.exports = router;