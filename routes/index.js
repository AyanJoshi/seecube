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
        var millisecondsToWait = 200;
        setTimeout(function() {
            res.render('home', {
                name: req.user.name,
                solved: solved,
                unsolved: numProblems-solved
            });
        }, millisecondsToWait);

    }else{
        res.render('home', {
            name: undefined,
            solved: undefined,
            unsolved: undefined
        })
    }
});

module.exports = router;