const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: String,
    image: {type: String, default:"default.jpg"},
    body: String,
    created: {type: Date, default: Date.now},
    author: {
        id: mongoose.Schema.Types.ObjectId,
        name: String
    },
    comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;