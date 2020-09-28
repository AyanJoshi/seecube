var mongoose = require("mongoose");
 
var CommentSchema = new mongoose.Schema({
    text: String,
    createdAt: { 
        type: Date,
        default: Date.now 
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        name: String
    },
    
});
 
const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;