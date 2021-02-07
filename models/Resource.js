const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: String,
    body: {
        description: String,            
        example: String,
        limits: String,
        difficulty: String,
        year: String,
        input: String,
        output: String
    },
    videos: [{
        type: String,
        default: undefined,
        videoId: String
    }],
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