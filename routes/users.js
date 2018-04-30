const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');


const router = express.Router();

// Map global promise - get rid of warnings
mongoose.Promise = global.Promise;

require('../models/User');
const User = mongoose.model('users');

// -------------------------------------------------------



// -------------------------------------------------------

router.get('/login', (req, res) => {
    res.render("./users/login");
});

router.get('/register', (req, res, next) => {
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
                            userType: req.body.userType
                        });

                        console.log(req.body);
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
      successRedirect:'/jobs',
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
});


// -------------------------------------------------------
const {ensureAuthenticated} = require('./helpers/auth');

// import Job Schema
const { Job } = require('../models/Job');


// render photo grapher biography page
router.get('/bio-photo', ensureAuthenticated, (req, res) => {
    Job.find({taker: req.user.id})
    .then(jobs => {
        res.render('./bio/bio-photo', {
            jobs: jobs
        });
    });
})

// render clien biography page
router.get('/bio-client', ensureAuthenticated, (req,res) => {
    Job.find({creator: req.user.id})
    .then(jobs => {
        res.render('./bio/bio-client', {
            jobs: jobs
        });
    });
})


// -------------------------------------------------------
// export router

module.exports = router;