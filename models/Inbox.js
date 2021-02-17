var mongoose = require("mongoose");
 
var InboxSchema = new mongoose.Schema({
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
        name: String,
        display_picture: {
            type: String,
            default: "https://i.pinimg.com/originals/19/b8/d6/19b8d6e9b13eef23ec9c746968bb88b1.jpg"
        },
        display_picture_id: String
    },
    receiver: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        name: String,
        display_picture: {
            type: String,
            default: "https://i.pinimg.com/originals/19/b8/d6/19b8d6e9b13eef23ec9c746968bb88b1.jpg"
        },
        display_picture_id: String
    }
});
 
const Inbox = mongoose.model('Inbox', InboxSchema);
module.exports = Inbox;