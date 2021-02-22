const mongoose = require('mongoose');
const ProfessorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    userType: String,
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    department: {
        type: String,
        required: true
    }




});

const Professor = mongoose.model('Professor', ProfessorSchema);
module.exports = Professor;
