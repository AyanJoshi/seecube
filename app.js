//dot env config
require('dotenv').config();

const socket = require("socket.io");
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { mongoose } = require('./db.js');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
const app = express();
const PORT = process.env.PORT || 5000;
const Problem = require('./models/Problem');

//Passport config
require('./config/passport')(passport);

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(express.static("public"));

//Bodyparser
app.use(bodyParser.urlencoded({ extended: false }));

//method-override
app.use(methodOverride('_method'));

// parse application/json
app.use(bodyParser.json());

//Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Connect flash
app.use(flash());

//Global variables
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', require('./routes/index'));
app.use('', require('./routes/user'));
app.use('', require('./routes/post'));
app.use('', require('./routes/problems'));
app.use('', require('./routes/comment'));
app.use('', require('./routes/jobs'));
app.use('', require('./routes/employer'));

//Versus route
app.get('/versus', (req, res) => {
    //res.sendFile(__dirname + '/views/versus/index.html');
    res.render('./versus/showVersus')
});

const server = app.listen(PORT, console.log(`Server started on port ${PORT}`));

//Socket.io
var io = require('socket.io').listen(server);

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
    });
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


//--------------------------------------------------------
// var loopLimit = 0;
// var gameCollection = new function () {

//     this.totalGameCount = 0,
//     this.gameList = []

// };

// function buildGame(socket) {


//     var gameObject = {};
//     gameObject.id = (Math.random() + 1).toString(36).slice(2, 18);
//     gameObject.playerOne = socket.username;
//     gameObject.playerTwo = null;
//     gameCollection.totalGameCount++;
//     gameCollection.gameList.push({ gameObject });

//     console.log("Game Created by " + socket.username + " w/ " + gameObject.id);
//     io.emit('gameCreated', {
//         username: socket.username,
//         gameId: gameObject.id
//     });


// }

// function killGame(socket) {

//     var notInGame = true;
//     for (var i = 0; i < gameCollection.totalGameCount; i++) {

//         var gameId = gameCollection.gameList[i]['gameObject']['id']
//         var plyr1Tmp = gameCollection.gameList[i]['gameObject']['playerOne'];
//         var plyr2Tmp = gameCollection.gameList[i]['gameObject']['playerTwo'];

//         if (plyr1Tmp == socket.username) {
//             --gameCollection.totalGameCount;
//             console.log("Destroy Game " + gameId + "!");
//             gameCollection.gameList.splice(i, 1);
//             console.log(gameCollection.gameList);
//             socket.emit('leftGame', { gameId: gameId });
//             io.emit('gameDestroyed', { gameId: gameId, gameOwner: socket.username });
//             notInGame = false;
//         }
//         else if (plyr2Tmp == socket.username) {
//             gameCollection.gameList[i]['gameObject']['playerTwo'] = null;
//             console.log(socket.username + " has left " + gameId);
//             socket.emit('leftGame', { gameId: gameId });
//             console.log(gameCollection.gameList[i]['gameObject']);
//             notInGame = false;

//         }

//     }

//     if (notInGame == true) {
//         socket.emit('notInGame');
//     }


// }

// function gameSeeker(socket) {
//     ++loopLimit;
//     if ((gameCollection.totalGameCount == 0) || (loopLimit >= 20)) {

//         buildGame(socket);
//         loopLimit = 0;

//     } else {
//         var rndPick = Math.floor(Math.random() * gameCollection.totalGameCount);
//         if (gameCollection.gameList[rndPick]['gameObject']['playerTwo'] == null) {
//             gameCollection.gameList[rndPick]['gameObject']['playerTwo'] = socket.username;
//             socket.emit('joinSuccess', {
//                 gameId: gameCollection.gameList[rndPick]['gameObject']['id']
//             });

//             console.log(socket.username + " has been added to: " + gameCollection.gameList[rndPick]['gameObject']['id']);

//         } else {

//             gameSeeker(socket);
//         }
//     }
// }


// // Chatroom

// var numUsers = 0;

// io.on('connection', (socket) => {
//     var addedUser = false;
//     // console.log('a user connected');
//     // when the client emits 'new message', this listens and executes
//     socket.on('new message', function (data) {
//         // we tell the client to execute 'new message'
//         socket.broadcast.emit('new message', {
//             username: socket.username,
//             message: data
//         });
//     });

//     // when the client emits 'add user', this listens and executes
//     socket.on('add user', function (username) {
//         if (addedUser) return;

//         // we store the username in the socket session for this client
//         socket.username = username;
//         ++numUsers;
//         addedUser = true;
//         socket.emit('login', {
//             numUsers: numUsers
//         });
//         // echo globally (all clients) that a person has connected
//         socket.broadcast.emit('user joined', {
//             username: socket.username,
//             numUsers: numUsers
//         });
//     });

//     // when the client emits 'typing', we broadcast it to others
//     socket.on('typing', function () {
//         socket.broadcast.emit('typing', {
//             username: socket.username
//         });
//     });

//     // when the client emits 'stop typing', we broadcast it to others
//     socket.on('stop typing', function () {
//         socket.broadcast.emit('stop typing', {
//             username: socket.username
//         });
//     });

//     // when the user disconnects.. perform this
//     socket.on('disconnect', function () {
//         if (addedUser) {
//             --numUsers;
//             killGame(socket);

//             // echo globally that this client has left
//             socket.broadcast.emit('user left', {
//                 username: socket.username,
//                 numUsers: numUsers
//             });
//         }
//     });


//     socket.on('joinGame', function () {
//         console.log(socket.username + " wants to join a game");

//         var alreadyInGame = false;

//         for (var i = 0; i < gameCollection.totalGameCount; i++) {
//             var plyr1Tmp = gameCollection.gameList[i]['gameObject']['playerOne'];
//             var plyr2Tmp = gameCollection.gameList[i]['gameObject']['playerTwo'];
//             if (plyr1Tmp == socket.username || plyr2Tmp == socket.username) {
//                 alreadyInGame = true;
//                 console.log(socket.username + " already has a Game!");

//                 socket.emit('alreadyJoined', {
//                     gameId: gameCollection.gameList[i]['gameObject']['id']
//                 });

//             }

//         }
//         if (alreadyInGame == false) {


//             gameSeeker(socket);

//         }

//     });


//     socket.on('leaveGame', function () {


//         if (gameCollection.totalGameCount == 0) {
//             socket.emit('notInGame');

//         }

//         else {
//             killGame(socket);
//         }

//     });

// });
// //--------------------------------------------------------