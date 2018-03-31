const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');



const router = express.Router();

// Map global promise - get rid of warnings
mongoose.Promise = global.Promise;

// // Connect to mongoose
// mongoose.connect('mongodb://localhost/secret-idea', {
//     useMongoClient: true
// })
//     .then(() => {console.log("MongoDB is connected!")})
//     .catch((err) => {console.log(`error message: ${err}`)}) 

// import Idea Schema
require('../models/User');
const User = mongoose.model('users');

// -------------------------------------------------------

router.get('/login', (req, res) => {
    res.render("./users/login");
});

router.get('/register', (req, res) => {
    res.render("./users/register");
});

// Register Form POST
router.post('/register', (req, res) => {
    console.log('register ran!');
    let errors = [];
    if(req.body.password !== req.body.password2) {
        errors.push({text: "Passwords do not match!"});
    }

    if(req.body.password.length < 8 || req.body.password > 20) {
        errors.push({text: "Invalid password length!"})
    }

    if(errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            email: req.body.email,
            password: "",
            password2: ""
        })
    } else {
        User.findOne({email: req.body.email})
            .then(user => {
                if(user){
                    req.flash('error_msg', "User already exist.")
                    res.redirect('/users/register')
                } else {
                        let newUser = new User({
                            name: req.body.name,
                            email: req.body.email,
                            password: req.body.password,
                        });
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                if(err) throw err;
                                newUser.password = hash;
                                newUser.save()
                                    .then(newUser => {
                                        req.flash('success_msg', "You are now registered and can log in");
                                        res.redirect('/users/login');
                                    })
                                    .catch(err => {
                                        res.status(500, "Internal Error.");
                                    });
                            });
                        });
                }
            })
    }

});



// Login Form POST
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect:'/ideas',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
  });


// -------------------------------------------------------

// Logout User
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
})


// -------------------------------------------------------
// export router

module.exports = router;