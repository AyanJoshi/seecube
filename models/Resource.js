const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: String,
    instructors: String,
    videos: String,
    created: {
        type: Date, 
        default: Date.now
    },
    author: {
        id: mongoose.Schema.Types.ObjectId,
        name: String
    }
});

const Resource = mongoose.model('Resource', ResourceSchema);
module.exports = Resource;