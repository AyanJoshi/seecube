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
    }
});

const Problems = mongoose.model('Problems', ProblemsSchema);
module.exports = Problems;