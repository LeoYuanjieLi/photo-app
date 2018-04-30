const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const {ensureAuthenticated} = require('./helpers/auth');

// Map global promise - get rid of warnings
mongoose.Promise = global.Promise;

// import Job Schema
const { Job } = require('../models/Job');
// import User Schema
require('../models/User');
const User = mongoose.model('users');

// -------------------------------------------------------



// Jobs Route
router.get('/', ensureAuthenticated, (req, res) => {
    console.log("successful connect to /jobs route.");
    // photographer will have their dashboard with the function - take this job;
    if(req.user.userType === "photographer"){
        Job.find({})
        .sort({date:'desc'})
        .then( jobs => {
            // create a new attribute for each job object, called creatorName
            for (let i = 0; i < jobs.length; i++) {
                jobs[i]["currentUser"] = req.user.id;
                User.findOne({_id: jobs[i].creator}).then(creator => {
                    jobs[i]["creatorName"] = creator.name;
                });
                User.findOne({_id: jobs[i].taker})
                .catch(err => {
                    jobs[i]['takerName'] = "";
                })
                .then(taker => {
                    jobs[i]['takerName'] = taker.name;
                    console.log("taker name is", takerName);
                });
            }
            res.render( './jobs/index-photo', {
                jobs: jobs 
            })       
        });
    }
    else {
    // client will have dashboard with the functions - edit a job; delete a job;

        Job.find({})
        .sort({date:'desc'})
        .then( jobs => {
            // create a new attribute for each job object, called creatorName
            for (let i = 0; i < jobs.length; i++) {
                jobs[i]["currentUser"] = req.user.id;
                User.findOne({_id: jobs[i].creator}).then(creator => {
                    jobs[i]["creatorName"] = creator.name;
                });
                User.findOne({_id: jobs[i].taker})
                .catch(err => {
                    jobs[i]['takerName'] = "";
                })
                .then(taker => {
                    jobs[i]['takerName'] = taker.name;
                    console.log("taker name is", takerName);
                });
            }
            res.render( './jobs/index', {
                jobs: jobs
            })       
        });
    }
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

// Only for photographer
// ------------------------------- Take a Job------------------------------------ //

// take a job
router.put('/take/:id', ensureAuthenticated, (req, res) => {
    console.log("req.params are:", req.params);
    Job.findOne({
        _id: req.params.id
    })
    .then(job => {
        if(req.user.userType != "photographer"){
            req.flash('error_msg', 'Only photographers can take a job');
            res.redirect('/jobs');
        } else {
            job.taker = req.user.id;
            job.save()
            .then(job => {
                req.flash('success_msg', 'Succesfully taken a job!');
                res.redirect('/jobs');
            })
        }
    });
});

// untake a job
router.put('/untake/:id', ensureAuthenticated, (req, res) => {
    console.log("req.params are:", req.params);
    Job.findOne({
        _id: req.params.id
    })
    .then(job => {
        if(req.user.userType != "photographer"){
            req.flash('error_msg', 'Only photographers can take a job');
            res.redirect('/jobs');
        } else {
            job.taker = "";
            job.save()
            .then(job => {
                req.flash('success_msg', 'Succesfully untaken a job!');
                res.redirect('/jobs');
            })
        }
    });
});

module.exports = router;