const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');
const multer = require('multer');
const storage = multer.diskStorage({
    filename: (req, file, callback) =>{
        callback(null, Date.now() + file.originalname);
    }
});

const imageFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
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

//Post Model
const Post = require('../models/Post');
const { route } = require('.');
const { ensureAuthenticated, ensurePostOwnerShip, ensureStudent } = require('../config/auth');

//Get all Posts
router.get('/posts', (req, res) => {
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Post.find({title: regex}, (err, posts) => {
            if(err){
                console.log(err);
            }else{
                res.render('./posts/listPosts', {posts: posts});
            }
        })
    }
    else if(req.query.older){
        Post.find({}, (err, posts) => {
            if(err){
                console.log(err);
            }else{
                const pageCount = Math.ceil(posts.length / 5);
                let p = parseInt(req.query.older);
                if(posts.length-5*(p+1) >= 0 && (p+1)<pageCount) {
                    p = p+1;
                    res.render('./posts/listPosts', {posts: posts.slice(posts.length-5*p, posts.length-5*(p-1)), page: p});
                }
                else {
                    res.render('./posts/listPosts', {posts: posts.slice(0, posts.length-5*(pageCount-1)), page: pageCount});
                }
                
            }
        })
    }
    else if(req.query.newer){
        Post.find({}, (err, posts) => {
            if(err){
                console.log(err);
            }else{
                const pageCount = Math.ceil(posts.length / 5);
                let p = parseInt(req.query.newer);
                if(p-1>0) {
                    p = p-1;
                }
                else {
                    p=1;
                }
                res.render('./posts/listPosts', {posts: posts.slice(posts.length-5*p, posts.length-5*(p-1)), page: p});
            }
        })
    }
    else{
        Post.find({}, (err, posts) => {
            if(err){
                console.log(err);
            }else{
                if(posts.length >=5) {
                    res.render('./posts/listPosts', {posts: posts.slice(posts.length-5, posts.length), page: 1});
                }
                else {
                    res.render('./posts/listPosts', {posts: posts, page: 1});
                }
            }
        })
    }
});

//Add new post
router.get('/posts/new', ensureAuthenticated, ensureStudent, (req, res)=>{
    res.render('./posts/newPost');
});

//Create Post
router.post('/posts/', ensureAuthenticated, ensureStudent, upload.single('image'), (req, res)=>{
    if(!req.file){
        createNewPostAndSave(req, res, undefined, undefined);
    }else{
        cloudinary.v2.uploader.upload(req.file.path, (err, result) => {
            if(err){
                req.flash('error_msg', err.message);
                res.redirect('back');
            }
            createNewPostAndSave(req, res, result.secure_url, result.public_id);
        })
    }
});

function createNewPostAndSave(req, res, imageUrl, imageId){
    
    const newPost = new Post({
        title: req.body.title,
        body: (req.body).body,
        image: imageUrl,
        imageId: imageId,
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
}

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
router.get('/posts/:id/edit', ensureAuthenticated, ensurePostOwnerShip, ensureStudent, (req, res) => {
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
router.put('/posts/:id', ensureAuthenticated, ensurePostOwnerShip, ensureStudent, upload.single('image'), async (req, res) => {

    Post.findById(req.params.id, async (err, foundPost)=>{
        if(err){
            req.flash('error_msg', 'Cannot find the post');
            res.redirect('back');
        }else{
            if(req.file){
                try{
                    if(foundPost.imageId){
                        await cloudinary.v2.uploader.destroy(foundPost.imageId);
                    }
                    let result = await cloudinary.v2.uploader.upload(req.file.path);
                    foundPost.imageId = result.public_id;
                    foundPost.image = result.secure_url;
                }catch(err){
                    req.flash('error_msg', err.message);
                    return res.redirect('back');
                }    
            }
            foundPost.title = req.body.title;
            foundPost.body = (req.body).body;
            foundPost.save();
            req.flash('success_msg', 'Succesfully edited the post');
            res.redirect('/posts/'+ req.params.id);
        }
    });
});

//Delete route
router.delete('/posts/:id', ensureAuthenticated, ensurePostOwnerShip, ensureStudent, (req, res) => {
    Post.findById(req.params.id, async (err, foundPost)=>{
        if(err){
            req.flash('error_msg', 'Cannot find the post');
            return res.redirect('back');
        }
        if(foundPost.imageId){
            try{
                await cloudinary.v2.uploader.destroy(foundPost.imageId);
                foundPost.remove();
                req.flash('success_msg', 'Succesfully deleted the post');
                res.redirect('/posts');
            }catch(err){
                req.flash('error_msg', 'There is an error processing your request.');
                res.redirect('/posts');
            }
        }else{
            try{
                foundPost.remove();
                req.flash('success_msg', 'Succesfully deleted the post');
                res.redirect('/posts')
            }catch(err){
                req.flash('error_msg', 'There is an error processing your request.');
                res.redirect('/posts');
            }

        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;