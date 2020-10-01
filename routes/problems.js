const express = require('express');
const router = express.Router();
const methodOvverride = require('method-override');
const { exec } = require("child_process");

// const multer = require('multer');
// const storage = multer.diskStorage({
//     filename: (req, file, callback) =>{
//         callback(null, Date.now() + file.originalname);
//     }
// });

// const fileFilter = (req, file, cb) => {
//     if (!file.originalname.match(/\.(txt)$/i)) {
//         return cb(new Error('Only text files are allowed!'), false);
//     }
//     cb(null, true);
// }

// const upload = multer({ storage: storage, fileFilter: fileFilter})
// // const output = multer({ storage: storage, fileFilter: fileFilter})
// // const cpUpload = upload.fields([{ name: 'input', maxCount: 1}, { name: 'output', maxCount: 1}])
// // const cpUpload = upload.array('input', 2)

// const cloudinary = require('cloudinary');
// cloudinary.config({ 
//   cloud_name: 'dfqajn5ex', 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

//problems Model
const Problem = require('../models/Problem');
//solutions Model
const Solution = require('../models/Solution');

const { route } = require('.');
const { ensureAuthenticated, ensureProblemOwnerShip, ensureAdmin } = require('../config/auth');

//Get all problems
router.get('/problems', (req, res) => {
    Problem.find({}, (err, problems) => {
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

// //Create Problem
// router.post('/problems/', ensureAuthenticated, upload.fields([{
//             name: 'input', maxCount: 1
//             }, {
//             name: 'output', maxCount: 1
//             }]), (req, res)=>{

//     var inputUrl, inputId, outputUrl, outputId;
//     console.log(req.files);
//     cloudinary.v2.uploader.upload(req.files['input'][0].path, {resource_type: "raw"}, (err, result) => {
//         if(err){
//             console.log('error has occured')
//             req.flash('error_msg', err.message);
//             res.redirect('/problems');
//         }
//         inputUrl = result.secure_url;
//         inputId = result.public_id;
//         // createNewProblemAndSave(req, res, result.secure_url, result.public_id);
//     })
//     cloudinary.v2.uploader.upload(req.files['output'][0].path, {resource_type: "raw"}, (err, result) => {
//         if(err){
//             req.flash('error_msg', err.message);
//             res.redirect('back');
//         }
//         outputUrl = result.secure_url;
//         outputId = result.public_id;
//         // createNewProblemAndSave(req, res, result.secure_url, result.public_id);
//     })
//     createNewProblemAndSave(req, res, inputUrl, inputId, outputUrl, outputId)
// });

// function createNewProblemAndSave(req, res, inputUrl, inputId, outputUrl, outputId) {
//     const { title, solved } = req.body;
//     const newProblem = new Problem({
//         title: title,
//         solved: solved,
//         input: inputUrl,
//         output: outputUrl,
//         inputId: inputId,
//         outputId: outputId,
//         body: {
//             description: req.body.description,
//             example: req.body.example,
//             limits: req.body.limits,
//             difficulty: req.body.difficulty,
//             year: req.body.year
//         },
//         author: {
//             id: req.user._id,
//             name: req.user.name
//         }
//     });
//     newProblem.save()
//     .then(Problem => {
//         req.flash('success_msg', 'Thank you for submitting the problem, we\'re reviewing it now!');
//         res.redirect('/problems');
//     })
//     .catch(err => console.log(err));
// }

router.post('/problems/', ensureAuthenticated, (req, res)=>{
    const { title, solved } = req.body;
    const newProblem = new Problem({
        title: title,
        solved: solved,
        body: {
            description: req.body.description,
            example: req.body.example,
            limits: req.body.limits,
            difficulty: req.body.difficulty,
            year: req.body.year,
            input: req.body.input,
            output: req.body.output
        },
        author: {
            id: req.user._id,
            name: req.user.name
        },
        
    });
    newProblem.save()
        .then(Problem => {
            req.flash('success_msg', 'Thank you for submitting the problem, we\'re reviewing it now!');
            res.redirect('/problems');
        })
        .catch(err => console.log(err));
});

//Show Problem
router.get('/problems/:id', (req, res) => {
    Problem.findById(req.params.id).populate("comments").populate("solutions").exec((err, foundProblem)=>{
        if(err){
            res.redirect("/problems");
        }else{
            res.render("./problems/showProblem", {problem: foundProblem});
        }
    })
});

//Edit Problem
router.get('/problems/:id/edit', ensureAuthenticated, ensureProblemOwnerShip, (req, res) => {
    Problem.findById(req.params.id, (err, foundProblem)=>{
        if(err){
            alert('Cannot find the Problem');
            res.redirect("/problems");
        }else{
            res.render("./problems/editProblem", {problems: foundProblem});
        }
    });
});

//Update Problem
// router.put('/problems/:id', ensureAuthenticated, ensureProblemOwnerShip, upload.fields([{
//             name: 'input', maxCount: 1}, { name: 'output', maxCount: 1
//             }]), async (req, res) => {
//     const data = req.body;
//     const { title, solved } = req.body;
//     Problem.findById(req.params.id, async (err, foundProblem)=>{
//         if(err){
//             req.flash('error_msg', 'Cannot find the post');
//             res.redirect('back');
//         }else{
//             if(req.files){
//                 try{
//                     if(foundProblem.inputId) {
//                         await cloudinary.v2.uploader.destroy(foundProblem.inputId);
//                     }
//                     let result = await cloudinary.v2.uploader.upload(req.files['input'][0].path);
//                     foundProblem.inputId = result.public_id;
//                     foundProblem.input = result.secure_url;
//                 }catch(err){
//                     req.flash('error_msg', err.message);
//                     return res.redirect('/problems');
//                 }
//                 try{
//                     if(foundProblem.outputId) {
//                         await cloudinary.v2.uploader.destroy(foundProblem.outputId);
//                     }
//                     let result = await cloudinary.v2.uploader.upload(req.files['output'][0].path);
//                     foundProblem.outputId = result.public_id;
//                     foundProblem.output = result.secure_url;
//                 }catch(err){
//                     req.flash('error_msg', err.message);
//                     return res.redirect('/problems');
//                 }      
//             }
//             foundProblem.title = title;
//             foundProblem.solved = solved;
//             foundProblem.approved = false;
//             // foundProblem.body.description = {
//             foundProblem.body.description = req.body.description;
//             foundProblem.body.example = req.body.example;
//             foundProblem.body.limits = req.body.limits;
//             foundProblem.body.difficulty = req.body.difficulty;
//             foundProblem.body.year = req.body.year;
//             // };
//             // foundProblem.author = {
//             foundProblem.author.id = req.user._id;
//             foundProblem.author.name = req.user.name;
//             // };
//             foundProblem.save();
//             req.flash('success_msg', 'Succesfully edited the problem');
//             res.redirect('/problems/'+ req.params.id);
//         }
//     });
// });

router.put('/problems/:id', ensureAuthenticated, ensureProblemOwnerShip, (req, res) => {
    const data = req.body;
    const { title, solved, input, output } = req.body;
    Problem.findByIdAndUpdate(req.params.id, 
        {
            title: title,
            solved: solved,
            approved: false,
            input: input,
            output: output,
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
    Problem.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            req.flash('error_msg', 'There is an error processing your request.');
            res.redirect('/problems');
        }else{
            req.flash('success_msg', 'Succesfully deleted the Problem');
            res.redirect('/problems');
        }
    });
});

router.post('/problems/:id/approve', ensureAuthenticated, ensureAdmin, (req, res)=>{
    Problem.findByIdAndUpdate(req.params.id, 
        {
            approved: true
        }, 
        (err, updatedProblem) => {
            if(err){
                req.flash('error_msg', 'There is an error processing your request.');
                res.redirect('/problems');
            }else{
                req.flash('success_msg', 'Succesfully approved the Problem');
                res.redirect('/problems');
            }
    });
});

router.post('/problems/:id/solution', ensureAuthenticated, async (req, res)=>{
    const data = req.body;
    Problem.findById(req.params.id, (err, foundProblem) => {
        if(err){
            console.log(err);
        }else{
            const command = "cd solutions_java; unset JAVA_TOOL_OPTIONS; echo '"+req.body.solution+"' > Main.java; javac Main.java; java Main > output.txt; echo '"+foundProblem.body.output+"' > expected_output.txt; diff output.txt expected_output.txt > diff.txt; cat diff.txt";
            let differ = "false";
            exec(command, async (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    // console.log(error);
                    res.redirect('/problems');
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    // console.log(error);
                    res.redirect('/problems');
                }
                // console.log(`stdout: ${stdout}`);
                differ = `${stdout}`;
                console.log("something happened lol")
                // res.redirect('/problems/'+req.params.id);
                var status = "fail";
                if(differ === "") {
                    status = "pass"
                }
                console.log("diff value is: "+differ);

                const newSolution = new Solution({
                    language: req.body.language,
                    text: req.body.solution,
                    solution_owner: {
                        id: req.user._id,
                        name: req.user.name
                    },
                    status: status,
                    difference: differ
                });
                
                newSolution.save()
                .then(problem => {
                    foundProblem.solutions.push(newSolution);
                    foundProblem.save();
                    // req.flash('success_msg', 'Successfully added a solution');
                    res.redirect('/problems/'+req.params.id);
                })
                .catch(err => console.log(err));
            })
        }
    })
});

module.exports = router;