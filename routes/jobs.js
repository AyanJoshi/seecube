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

//Job Model
const Job = require('../models/Job');
const { route } = require('.');
const { ensureAuthenticated, ensureJobOwnerShip, ensureEmployer } = require('../config/auth');

//Get all Jobs
router.get('/jobs', (req, res) => {
    Job.find({}, (err, jobs) => {
        if(err){
            console.log(err);
        }else{
            res.render('./jobs/listJobs', {jobs: jobs});
        }
    })
});

//Add new job
router.get('/jobs/new', ensureAuthenticated, ensureEmployer, (req, res)=>{
    res.render('./jobs/newJob');
});

//Create Job
router.post('/jobs/', ensureAuthenticated, ensureEmployer, upload.single('image'), (req, res)=>{
    if(!req.file){
        createNewJobAndSave(req, res, undefined, undefined);
    }else{
        cloudinary.v2.uploader.upload(req.file.path, (err, result) => {
            if(err){
                req.flash('error_msg', err.message);
                res.redirect('back');
            }
            createNewJobAndSave(req, res, result.secure_url, result.public_id);
        })
    }
});

function createNewJobAndSave(req, res, imageUrl, imageId){
    const newJob = new Job({
        company: req.body.company,
        position: req.body.position,
        location: req.body.location,
        role_type: req.body.role_type,
        body: (req.body).body,
        image: imageUrl,
        imageId: imageId,
        author: {
            id: req.user._id,
            name: req.user.name
        }
    });
    newJob.save()
    .then(job => {
        req.flash('success_msg', 'Successfully added a job');
        res.redirect('/jobs');
    })
    .catch(err => console.log(err));
}

//Show Job
router.get('/jobs/:id', (req, res) => {
    Job.findById(req.params.id).exec((err, foundJob)=>{
        if(err){
            res.redirect("/jobs");
        }else{
            res.render("./jobs/showJob", {job: foundJob});
        }
    })
});

//Edit Job
router.get('/jobs/:id/edit', ensureAuthenticated, ensureJobOwnerShip, ensureEmployer, (req, res) => {
    Job.findById(req.params.id, (err, foundJob)=>{
        if(err){
            alert('Cannot find the job');
            res.redirect("/jobs");
        }else{
            res.render("./jobs/editJob", {job: foundJob});
        }
    });
});

//Update Job
router.put('/jobs/:id', ensureAuthenticated, ensureJobOwnerShip, ensureEmployer, upload.single('image'), async (req, res) => {

    Job.findById(req.params.id, async (err, foundJob)=>{
        if(err){
            req.flash('error_msg', 'Cannot find the job');
            res.redirect('back');
        }else{
            if(req.file){
                try{
                    if(foundJob.imageId){
                        await cloudinary.v2.uploader.destroy(foundJob.imageId);
                    }
                    let result = await cloudinary.v2.uploader.upload(req.file.path);
                    foundJob.imageId = result.public_id;
                    foundJob.image = result.secure_url;
                }catch(err){
                    req.flash('error_msg', err.message);
                    return res.redirect('back');
                }    
            }
            foundJob.company = req.body.company;
            foundJob.position = req.body.position;
            foundJob.location = req.body.location;
            foundJob.role_type = req.body.role_type;
            foundJob.body = (req.body).body;
            foundJob.save();
            req.flash('success_msg', 'Succesfully edited the job');
            res.redirect('/jobs/'+ req.params.id);
        }
    });
});

//Delete route
router.delete('/jobs/:id', ensureAuthenticated, ensureJobOwnerShip, ensureEmployer, (req, res) => {
    Job.findById(req.params.id, async (err, foundJob)=>{
        if(err){
            req.flash('error_msg', 'Cannot find the job');
            return res.redirect('back');
        }
        if(foundJob.imageId){
            try{
                await cloudinary.v2.uploader.destroy(foundJob.imageId);
                foundJob.remove();
                req.flash('success_msg', 'Succesfully deleted the job');
                res.redirect('/jobs');
            }catch(err){
                req.flash('error_msg', 'There is an error processing your request.');
                res.redirect('/jobs');
            }
        }else{
            try{
                foundJob.remove();
                req.flash('success_msg', 'Succesfully deleted the job');
                res.redirect('/jobs')
            }catch(err){
                req.flash('error_msg', 'There is an error processing your request.');
                res.redirect('/jobs');
            }
        }
    });
});

module.exports = router;