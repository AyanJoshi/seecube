const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth'); 
const Problem = require('../models/Problem')
const Solution = require('../models/Solution')

router.get('/', (req, res) => res.render('welcome.ejs'));

//Dasboard Handle
router.get('/home', async (req, res) => {
    if(req.user){
        let solved = 0;
        let numProblems = 0;
        let easy = 0;
        let medium = 0;
        let hard = 0;
        await Problem.find({}, async (err, problems) => {
            if (err) {
                console.log(err);
            } else {
                numProblems = problems.length;
                for(let i = 0; i < problems.length; i++){
                    for(let j = 0; j < problems[i].solutions.length; j++){
                        await Solution.find({_id: problems[i].solutions[j], status: 'pass'}, (err, foundSolutions)=>{
                            if(err){
                                console.log(err);
                            }else{
                                for(let k = 0; k < foundSolutions.length; k++){
                                    if((foundSolutions[k]._id+"") === (problems[i].solutions[j]+"")){
                                        if((foundSolutions[k].solution_owner.id+"") === (req.user._id+"")){
                                            solved = solved+1;
                                            if(problems[i].body.difficulty === 'Easy'){
                                                easy++;
                                            }else if(problems[i].body.difficulty === 'Medium'){
                                                medium++;
                                            }else{
                                                hard++;
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        })
                    }
                }
            }
        })
        var millisecondsToWait = 100;
        setTimeout(function() {
            res.render('home', {
                name: req.user.name,
                solved: solved,
                unsolved: numProblems-solved,
                easy: easy,
                medium: medium,
                hard: hard
            });
        }, millisecondsToWait);

    }else{
        res.render('home', {
            name: undefined,
            solved: undefined,
            unsolved: undefined,
            easy: undefined,
            medium: medium,
            hard: hard
        })
    }
});

module.exports = router;