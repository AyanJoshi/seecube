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
    lab:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lab"
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
    ],
    classes: [
        {
            name: String
        }
    ]
});

const Employer = mongoose.model('Employer', EmployerSchema);
module.exports = Employer;