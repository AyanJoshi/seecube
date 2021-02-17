const express = require('express');
const router = express.Router();
const methodOvverride = require('method-override');
const { exec } = require("child_process");

//user Model
const User = require('../models/User');
const Inbox = require('../models/Inbox');

const { route } = require('.');
const { ensureAuthenticated, ensureProblemOwnerShip, ensureAdmin, ensureStudent } = require('../config/auth');

//Get all messages
router.get('/users/:id/inbox', ensureAuthenticated, (req, res) => {
    User.findById(req.params.id).populate("incoming_message").populate("outgoing_message").exec((err, foundUser) => {
        if (err) {
            res.redirect("/home");
        } else {
            res.render("./inbox/showInbox", { user: foundUser });
        }
    })
});

router.post("/users/:id/sendMessage/:id1", ensureAuthenticated, (req, res) => {
    //id = Sender, id1 = Receiver
    const text = req.body.text;
    // console.log(text);
    User.findById(req.params.id1, (err, foundSender) => {
        if (err) {
            req.flash('error_msg', 'Something went wrong');
            res.redirect('/');
        } else {
            User.findById(req.params.id, (err, foundReceiver) => {
                if (err) {
                    req.flash('error_msg', 'Something went wrong');
                    res.redirect('/');
                } else {
                    // console.log(req.text);
                    const newInbox = new Inbox({
                        text: text,
                        author: {
                            id: foundSender._id,
                            name: foundSender.name,
                            display_picture: foundSender.display_picture,
                            display_picture_id: foundSender.display_picture_id
                        },
                        receiver: {
                            id: foundReceiver._id,
                            name: foundReceiver.name,
                            display_picture: foundReceiver.display_picture,
                            display_picture_id: foundReceiver.display_picture_id
                        }
                    });
                    newInbox.save()
                        .then(user => {
                            foundReceiver.incoming_message.push(newInbox);
                            foundReceiver.save();
                            foundSender.outgoing_message.push(newInbox);
                            foundSender.save();
                            req.flash('success_msg', 'Successfully sent a message');
                            res.redirect('back');
                        })
                        .catch(err => console.log(err));
                }
            })
        }
    })
});

router.get("/users/:id/sendMessage/:id1", ensureAuthenticated, (req, res) => {

    User.findById(req.params.id1, (err, foundSender) => {
        if (err) {
            req.flash('error_msg', 'The account you are trying to send message from does not exist');
            res.redirect('/');
        } else {
            User.findById(req.params.id, (err, foundReceiver) => {
                if (err) {
                    req.flash('error_msg', 'The account you are trying to send message to does not exist');
                    res.redirect('/');
                } else {
                    res.render('./inbox/newMessage', { userSender: foundSender, userReceiver: foundReceiver });
                }
            })
        }
    })
})

module.exports = router;