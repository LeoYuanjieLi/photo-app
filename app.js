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

const jobs = require('./routes/jobs');
const users = require('./routes/users');





// Passport Config
require('./config/passport')(passport);

// DB Config
const db = require('./config/database');

// use public
app.use(express.static('public'));


// Connect to mongoose
mongoose.connect(db.mongoURI, {
    useMongoClient: true
})
    .then(() => {console.log("MongoDB is connected!")})
    .catch((err) => {console.log(`error message: ${err}`)}) 






// Handlebars Helpers
const {
    isclient,
    isCreator,
    isTaker,
    isCurrentUser
} = require('./helpers/hbs');





// --------------------------------------------------------
// Handlebars Middleware
app.engine('handlebars', exphbs({

    helpers: {
        isclient: isclient,
        isCreator: isCreator,
        isTaker: isTaker,
        isCurrentUser: isCurrentUser
    }, 

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



// index.html route
app.get('/', (req, res) => {
    const welcome = "Welcome to Photesy, the platform that connects decent photographers and people looking for great photos.";
    res.render("index", {
        title: welcome
    });
});

// about route
app.get('/about', (req, res) => {
    const baobao = "I am a baobao";
    res.render("about", {
        about: baobao
    });
});


// use routes --------------------------------

app.use('/jobs', jobs);
app.use('/users', users);




// -------------------------------------------
const port = process.env.PORT || 5000;

app.listen(port, ()=> {
    console.log(`Server started on port ${port}`);
    console.log("Hello Node.js!");
});




