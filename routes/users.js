const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const formidable = require('formidable');



const router = express.Router();

// Map global promise - get rid of warnings
mongoose.Promise = global.Promise;

require('../models/User');
const User = mongoose.model('users');

// -------------------------------------------------------

// midware for upload image
router.use(bodyParser({uploadDir:'/photo-images'}));

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
router.get('/bio-photo/:id', ensureAuthenticated, (req, res) => {

    User.findOne({_id: req.params.id})
    .catch(err => {
        console.log("err found, reason:", err);
    })
    .then(user => {
        user.compareID = req.user.id;
        res.render('./bio/bio-photo', {
            user: user
        });
    });
})

// render clien biography page
router.get('/bio-client/:id', ensureAuthenticated, (req,res) => {
    User.findOne({_id: req.params.id})
    .catch(err => {
        console.log("err found, reason:", err);
    })
    .then(user => {
        res.render('./bio/bio-client', {
            user: user
        });
    });
})






// upload an image
router.post('/uploads/:id', ensureAuthenticated, function(req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        // `file` is the name of the <input> field of type `file`
        var old_path = files.file.path,
            file_size = files.file.size,
            file_ext = files.file.name.split('.').pop(),
            index = old_path.lastIndexOf('\\') + 1,
            file_name = old_path.substr(index),
            // file_name = "image";
            mid_path = path.join('\\users\\uploads\\', file_name + '.' + file_ext),
            front_path = path.join('\\uploads\\', file_name + '.' + file_ext),
            new_path=replaceAll(front_path),
            absolute_path = 'D:\\Dropbox\\Thinkful\\photo-App\\public' + mid_path;
        function replaceAll(str) {
            return str.replace(/\\/g, '/');
        };
        console.log('index:', index);
        console.log('old path:', old_path);
        console.log('new path:', new_path);
        console.log('file name:', file_name);
        console.log('absolute path:', absolute_path);

        fs.readFile(old_path, function(err, data) {
            fs.writeFile(absolute_path, data, function(err) {
                fs.unlink(old_path, function(err) {
                    if (err) {
                        res.status(500);
                        res.json({'success': false});
                    } else {
                            // find the user in database using the req.user.email
                            User.findOne({email: req.user.email})
                            .then(user => {
                                // check if this string is already in the portfolio
                                if(!user.portfolio) {
                                    user.portfolio = [];
                                }
                                let arrayContainsPath = (user['portfolio'].indexOf(new_path) > -1);
                                if (!arrayContainsPath) {
                                    user.portfolio.push(new_path);
                                    user.save()
                                    .then(
                                       
                                        user =>
                                        {req.flash('success_msg', 'Image uploaded succesfully');
                                        res.redirect(`../bio-photo/${req.params.id}`);
                                    })

                                }
                                else {
                                    req.flash('error_msg', 'Image already uploaded');
                                    res.redirect(`../bio-photo/${req.params.id}`);
                                }
                            })
                    }
                });
            });
        });


        

    });
});

// Delete an image
router.delete('/:id', ensureAuthenticated, function(req, res) {

    //Find the user in database, and then update the portfolio -- remove the current string from the array portfolio. 
    User.findOne({id: req.user.id})
    .then(user => {
        // loop through the portfolio to find the specific string that equals to the param id. And remove it from the array.

        for (let i = 0; i < user.portfolio.length; i++) {
            if (portfolio[i] == req.params.id) {
                user.portfolio.splice(i, 1);
            }
        }
        // remove the photo from the directory
        fs.unlink('path/file.txt', (err) => {
            if (err) throw err;
            console.log('path/file.txt was deleted');
          });
        user.save()
        .catch(err => {
            console.log("err found, reason:", err);
        })
        .then(
            user =>
            {req.flash('success_msg', 'Image deleted succesfully');
            res.redirect(`/${req.user.id}`);            


        })

    })





})









// -------------------------------------------------------
// export router

module.exports = router;