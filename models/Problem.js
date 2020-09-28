const mongoose = require('mongoose');

const ProblemsSchema = new mongoose.Schema({
    title: String,
    solved: Boolean,
    body: {
        description: String,            
        example: String,
        limits: String,
        difficulty: String,
        year: String
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
    ]
});

const Problem = mongoose.model('Problem', ProblemsSchema);
module.exports = Problem;