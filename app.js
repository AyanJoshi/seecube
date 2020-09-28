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

//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/user'));
app.use('', require('./routes/post'));
app.use('', require('./routes/problems'));
app.use('', require('./routes/comment'));

app.listen(PORT, console.log(`Server started on port ${PORT}`));