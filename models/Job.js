const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create schema
const JobSchema = new Schema({
    title: {
        type:String,
        required: true,
    },
    details: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    taker: {
        type: String,
    },
    location: {
        type: String,
        required: true
    },
    starttime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
	bio: {
        type:String
    },
    date: {
        type: Date,
        default: Date.now
    }
})


// add virtual attributes
JobSchema.virtual('endtime').get(function(){
    const endtime = this.starttime.addHours(this.duration);
    return endtime
});






const Job = mongoose.model('jobs', JobSchema);

module.exports = {Job};
