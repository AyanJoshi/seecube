const mongoose = require('mongoose');

const ProblemsSchema = new mongoose.Schema({
    title: String,
    solved: Boolean,
    approved: {
        type: Boolean,
        default: false
    },
    body: {
        description: String,            
        example: String,
        limits: String,
        difficulty: String,
        year: String,
        input: String,
        output: String
    },
    created: {
        type: Date, 
        default: Date.now
    },
    author: {
        id: mongoose.Schema.Types.ObjectId,
        name: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    solutions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Solution"
        }
    ]
});

const Problem = mongoose.model('Problem', ProblemsSchema);
module.exports = Problem;