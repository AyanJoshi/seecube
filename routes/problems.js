const express = require('express');
const router = express.Router();
const methodOvverride = require('method-override');
const { exec } = require("child_process");

//problems Model
const Problem = require('../models/Problem');
//solutions Model
const Solution = require('../models/Solution');
//user Model
const User = require('../models/User');

const { route } = require('.');
const { ensureAuthenticated, ensureProblemOwnerShip, ensureAdmin, ensureStudent } = require('../config/auth');

//Get all problems
router.get('/problems', (req, res) => {
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Problem.find({title: regex}, (err, problems) => {
            if (err) {
                console.log(err);
            } else {
                res.render('./problems/listProblems', { problems: problems });
            }
        })
    }else{
        Problem.find({}, (err, problems) => {
            if (err) {
                console.log(err);
            } else {
                res.render('./problems/listProblems', { problems: problems });
            }
        })
    }
});

//Add new Problem
router.get('/problems/new', ensureAuthenticated, ensureStudent, (req, res) => {
    res.render('./problems/newProblem');
});

router.post('/problems/', ensureAuthenticated, ensureStudent, async (req, res) => {
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
    Problem.findById(req.params.id).populate("comments").populate("solutions").exec((err, foundProblem) => {
        if (err) {
            res.redirect("/problems");
        } else {
            res.render("./problems/showProblem", { problem: foundProblem });
        }
    })
});

//Edit Problem
router.get('/problems/:id/edit', ensureAuthenticated, ensureProblemOwnerShip, ensureStudent, (req, res) => {
    Problem.findById(req.params.id, (err, foundProblem) => {
        if (err) {
            alert('Cannot find the Problem');
            res.redirect("/problems");
        } else {
            res.render("./problems/editProblem", { problems: foundProblem });
        }
    });
});

router.put('/problems/:id', ensureAuthenticated, ensureProblemOwnerShip, ensureStudent, (req, res) => {
    const data = req.body;
    const { title, solved } = req.body;
    Problem.findByIdAndUpdate(req.params.id,
        {
            title: title,
            solved: solved,
            approved: false,
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
            }
        },
        (err, updatedProblem) => {
            if (err) {
                req.flash('error_msg', 'There is an error processing your request.');
                res.redirect('/problems');
            } else {
                req.flash('success_msg', 'Succesfully edited the Problem');
                res.redirect('/problems/' + req.params.id);
            }
        });
});

//Delete route
router.delete('/problems/:id', ensureAuthenticated, ensureProblemOwnerShip, ensureStudent, (req, res) => {
    const data = req.body;
    Problem.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            req.flash('error_msg', 'There is an error processing your request.');
            res.redirect('/problems');
        } else {
            req.flash('success_msg', 'Succesfully deleted the Problem');
            res.redirect('/problems');
        }
    });
});

router.post('/problems/:id/approve', ensureAuthenticated, ensureAdmin, ensureStudent, (req, res) => {
    Problem.findByIdAndUpdate(req.params.id,
        {
            approved: true
        },
        (err, updatedProblem) => {
            if (err) {
                req.flash('error_msg', 'There is an error processing your request.');
                res.redirect('/problems');
            } else {
                req.flash('success_msg', 'Succesfully approved the Problem');
                res.redirect('/problems');
            }
        });
});

router.post('/problems/:id/solution', ensureAuthenticated, ensureStudent, async (req, res) => {
    const data = req.body;
    Problem.findById(req.params.id, (err, foundProblem) => {
        if (err) {
            console.log(err);
        } else {
            const command = "cd solutions_java; unset JAVA_TOOL_OPTIONS; echo '" + req.body.editor + "' > Main.java; echo '"+foundProblem.body.input+"' > input.txt ; javac Main.java; java Main < input.txt > output.txt; echo '"+foundProblem.body.output+"' > expected_output.txt; diff --strip-trailing-cr expected_output.txt output.txt > diff.txt; java Script < diff.txt > difference.txt; cat difference.txt";
            let differ = "false";
            exec(command, async (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    res.redirect('/problems/' + req.params.id);
                }
                else if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    var stderror = `${stderr}`;
                    var status_error = "Compilation Error";
                    const newSolution = new Solution({
                        language: req.body.language,
                        text: req.body.editor,
                        solution_owner: {
                            id: req.user._id,
                            name: req.user.name
                        },
                        status: status_error,
                        difference: stderror
                    });

                    newSolution.save()
                        .then(problem => {
                            foundProblem.solutions.push(newSolution);
                            foundProblem.save();
                            res.redirect('/problems/' + req.params.id);
                        })
                        .catch(err => console.log(err));
                }
                else {
                    differ = `${stdout}`;
                    console.log("something happened lol")
                    
                    var status = "fail";
                    if (differ === "") {
                        status = "pass"
                    }
                    console.log("diff value is: " + differ);

                    const newSolution = new Solution({
                        language: req.body.language,
                        text: req.body.editor,
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
                            res.redirect('/problems/' + req.params.id);
                        })
                        .catch(err => console.log(err));
                }
            })
        }
    })
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;