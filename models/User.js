const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    userType: String,
    password:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    display_picture: {type: String, 
        default: "https://i.pinimg.com/originals/19/b8/d6/19b8d6e9b13eef23ec9c746968bb88b1.jpg"
    },
    display_picture_id: String,
    resume: String,
    resume_id: String
});

const User = mongoose.model('User', UserSchema);
module.exports = User;