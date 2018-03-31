const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const {ensureAuthenticated} = require('./helpers/auth');

// Map global promise - get rid of warnings
mongoose.Promise = global.Promise;

// // Connect to mongoose
mongoose.connect('mongodb://localhost/secret-idea', {
    useMongoClient: true
})
    .then(() => {console.log("MongoDB is connected!")})
    .catch((err) => {console.log(`error message: ${err}`)}) 

// import Job Schema
const { Job } = require('../models/Job');

// -------------------------------------------------------

// Jobs Route
router.get('/', ensureAuthenticated, (req, res) => {
    console.log("successful connect to /ideas route.");
    Job.find({user: req.user.id})
    .sort({date:'desc'})
    .then( jobs => {
        res.render( './ideas/index', {
            jobs: jobs 
        })       
    });
});



// Add Job Form Route
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('./jobs/add');
});

// Edit Job Form Route
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    })
    .catch(err => {
        console.log("err found, reason:", err);
    })
    .then(idea => {
        if(idea.user != req.user.id){
            req.flash('error_msg', 'Not Authorized');
            res.redirect('/ideas');
        } else {
            res.render('./ideas/edit', {
                idea: idea
            });
        }
    })

});


// Post an Job - Process Form
router.post('/', ensureAuthenticated, (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({text: 'Please add a title'});

    }

    if (!req.body.details) {
        errors.push({text: "text: Please add some details"});
    }

    if(errors.length > 0) {
        res.render('ideas/add', {
            // we have access to errros
            errors: errors,
            title: req.body.title,
            details: req.body.details
        });
    } else {
        // console.log(req.body);
        // res.send('successfully sent.');
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            user: req.user.id
        }

        new Job(newUser)
        .save()
        .then(Job => {
            req.flash('success_msg', 'Idea added succesfully');
            res.redirect('/ideas');
        })
    }
});

// Edit an Job
router.put('/:id', ensureAuthenticated, (req, res) => {
    console.log("req.params are:", req.params);
    Idea.findOne({
        _id: req.params.id
    })
    .then(idea => {
        if(idea.user != req.user.id){
            req.flash('error_msg', 'Not Authorized');
            res.redirect('/ideas');
        } else {
            idea.title = req.body.title;
            idea.details = req.body.details;
            idea.date = Date.now();
    
            idea.save()
            .then(idea => {
                req.flash('success_msg', 'Idea edited succesfully');
                res.redirect('/ideas');
            })
        }
    });
});

// Delete an Job
router.delete('/:id', ensureAuthenticated, (req, res) => {
    if(idea.user != req.user.id){
        req.flash('error_msg', 'Not Authorized');
        res.redirect('/ideas');
    } else {
        console.log("Idea number", req.params.id, "got deleted");
        Idea.remove({_id: req.params.id})
        .then(() => {
            req.flash('success_msg', 'Idea deleted succesfully');
            res.redirect('/ideas');
        });
    }
})


module.exports = router;