const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const {ensureAuthenticated} = require('./helpers/auth');

// Map global promise - get rid of warnings
mongoose.Promise = global.Promise;

// // Connect to mongoose
mongoose.connect('mongodb://localhost/photo-app', {
    useMongoClient: true
})
    .then(() => {console.log("MongoDB is connected!")})
    .catch((err) => {console.log(`error message: ${err}`)}) 

// import Job Schema
const { Job } = require('../models/Job');

// -------------------------------------------------------

// Jobs Route
router.get('/', ensureAuthenticated, (req, res) => {
    console.log("successful connect to /jobs route.");
    Job.find({user: req.user.id})
    .sort({date:'desc'})
    .then( jobs => {
        res.render( './jobs/index', {
            jobs: jobs 
        })       
    });
});



// Add Job Form Route
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('./jobs/add');
});

// Post a Job - Process Form
router.post('/', ensureAuthenticated, (req, res) => {
    // check if the user is authorized
    Job.find({user: req.user.id})
    
    let errors = [];
    const requiredFields = ['title', 'details', 'creator', 'location', 'starttime', 'duration'];

    // check if all required fields are here
    for(let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if(!field in req.body) {
            errors.push({text: `missing ${field}, please add`});
        }
    }

    // handle error and then if no errors add the new job to our DB
    if(errors.length > 0) {
        res.render('jobs/add', {
            // we have access to errors, we send user back to the add job page
            errors: errors,
            title: req.body.title,
            details: req.body.details,
            location: req.body.location
        });
    } else {
        const newUser = {};
        for (let i = 0; i < requiredFields.length; i++) {
            let field = requiredFields[i];
            newUser.field = req.body.field;
        }

        new Job(newUser)
        .save()
        .then(Job => {
            req.flash('success_msg', 'Job added succesfully');
            res.redirect('/jobs');
        })
    }
});


// Edit Job Form Route
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Job.findOne({
        _id: req.params.id
    })
    .catch(err => {
        console.log("err found, reason:", err);
    })
    .then(job => {
        if(job.user != req.user.id){
            req.flash('error_msg', 'Not Authorized');
            res.redirect('/jobs');
        } else {
            res.render('./jobs/edit', {
                job: job
            });
        }
    })

});


// Edit a Job
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
    console.log("Job number", req.params.id, "got deleted");
    Idea.findOne({_id: req.params.id})
    .then( job => {
        if(job.creator != req.user.id) {
            req.flash('error_msg', 'Not Authorized');
        }
    })
    // Can I have two promise here? Should I chain them?  
    Idea.remove({_id: req.params.id})
    .then(() => {
        req.flash('success_msg', 'Idea deleted succesfully');
        res.redirect('/ideas');
    });
    
})


module.exports = router;