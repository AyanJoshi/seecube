const mongoose = require('mongoose');
const EmployerSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    userType: String,
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    current_company:{
        type: String,
        required: true
    },
    position:{
        type: String,
        required: true
    },
    experience: [
        {
            company: String,
            years_worked: Number,
            position: String
        }
    ]
});

const Employer = mongoose.model('Employer', EmployerSchema);
module.exports = Employer;