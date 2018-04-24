const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const {ensureAuthenticated} = require('./helpers/auth');

// Map global promise - get rid of warnings
mongoose.Promise = global.Promise;

// import Job Schema
const { Job } = require('../models/Job');

// -------------------------------------------------------

// Jobs Route
router.get('/', ensureAuthenticated, (req, res) => {
    console.log("successful connect to /jobs route.");
    Job.find({})
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
    console.log("request body is", req.user);
    let errors = [];
    const requiredFields = ['title', 'details', 'location', 'startdate','starttime', 'duration'];

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
            newUser[field] = req.body[field];
        }
        newUser["creator"] = req.user.id;
        console.log(newUser);
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
        if(job.creator != req.user.id){
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
    Job.findOne({
        _id: req.params.id
    })
    .then(job => {
        if(job.creator != req.user.id){
            req.flash('error_msg', 'Not Authorized');
            res.redirect('/jobs');
        } else {
            job.title = req.body.title;
            job.details = req.body.details;
            job.startdate = req.body.startdate;
            job.starttime = req.body.starttime;
            job.location = req.body.location;
            job.duration = req.body.duration;
            console.log(job);
            job.save()
            .then(job => {
                req.flash('success_msg', 'Job edited succesfully');
                res.redirect('/jobs');
            })
        }
    });
});

// Delete an Job
router.delete('/:id', ensureAuthenticated, (req, res) => {
    console.log("Job number", req.params.id, "got deleted");
    Job.findOne({_id: req.params.id})
    .then( job => {
        if(job.creator != req.user.id) {
            req.flash('error_msg', 'Not Authorized');
        }
    })
    // Can I have two promise here? Should I chain them?  
    Job.remove({_id: req.params.id})
    .then(() => {
        req.flash('success_msg', 'Job deleted succesfully');
        res.redirect('/jobs');
    });
    
})


module.exports = router;