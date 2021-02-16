const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    company: String,
    position: String,
    location: String,
    role_type: String,
    image: {type: String, default:undefined},
    imageId: String,
    body: String,
    created: {type: Date, default: Date.now},
    author: {
        id: mongoose.Schema.Types.ObjectId,
        name: String
    },
    apply: String
});

const Job = mongoose.model('Job', JobSchema);
module.exports = Job;