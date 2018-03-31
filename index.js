const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require("connect-flash");
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');


const app = express();

// Load Routes

const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport);




// --------------------------------------------------------
// Handlebars Middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');


//  Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));


// method override middleware
app.use(methodOverride("_method"));

// express-session middleware
app.use(session({
    secret: "bao",
    resave: true,
    saveUninitialized: true
}));



// After express-session!!!!!! IMPORTANT
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());



// Flash middleware
app.use(flash());




// Global Variables
app.use(function(req, res, next){
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
})




// --------------------------------------------------------
function baobao(req, res, next) {
    console.log("I love my baobao at", Date.now());
    next();
};

function gougou(req, res, next) {
    console.log("Baobao love me at", Date.now());
    next();
};


// index.html route
app.get('/', baobao, (req, res) => {
    const welcome = "Welcome to Gougou baobao's page!";
    res.render("index", {
        title: welcome
    });
});

// about route
app.get('/about', gougou, (req, res) => {
    const baobao = "I am a baobao";
    res.render("about", {
        about: baobao
    });
});


// use routes --------------------------------

app.use('/ideas', ideas);
app.use('/users', users);




// -------------------------------------------
const port = 5000;

app.listen(port, ()=> {
    console.log(`Server started on port ${port}`);
    console.log("Hello Node.js!");
});