var mongoose = require("mongoose");
 
var SolutionSchema = new mongoose.Schema({
    language: String,
    text: String,
    createdAt: { 
        type: Date,
        default: Date.now 
    },
    solution_owner: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        name: String
    },
    status: String,     //pass or fail
    difference: String
});
 
const Solution = mongoose.model('Solution', SolutionSchema);
module.exports = Solution;