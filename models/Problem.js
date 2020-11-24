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
    ],
    course: {
        type: String,
        enum: ['CSE100', 'CSE110', 'CSE120', 'CSE205', 'CSE240', 'CSE494', 'CSE310', 'CSE325', 'CSE330'
            , 'CSE340', 'CSE355', 'CSE360', 'CSE412', 'CSE365', 'CSE230', 'CSE471']
    }

});

const Problem = mongoose.model('Problem', ProblemsSchema);
module.exports = Problem;