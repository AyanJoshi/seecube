const mongoose = require('mongoose');
const ProfessorSchema = new mongoose.Schema({
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
            tyoe: String,
            enum : ['CSE100','CSE110','CSE120','CSE205','CSE240','CSE494','CSE310','CSE325','CSE330'
        ,'CSE340','CSE355','CSE360','CSE412','CSE365','CSE230','CSE471']
        }
    ]
});

const Professor = mongoose.model('Professor', ProfessorSchema);
module.exports = Professor;