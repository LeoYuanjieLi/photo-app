'use strict';

const mongoose = require("mongoose"),
	Schema = mongoose.Schema;
	// bcrypt = require(bcrypt);


const appointmentSchema = new Schema({
	name: {type:String},
	starttime: {type:Date},
  	// address: {
	  //   building: String,
	  //   // coord will be an array of string values
	  //   coord: [String],
	  //   street: String,
	  //   zipcode: String
	  //   },
	location: {type:String},
	duration: {type:Number},
	rate: {type:Number},
	available: {type:Boolean},
	requester: {type:String},
	taker: {
		type:String,
		default:null
		},
	createdtime: {
		type:Date,
		default:Date.now
	    }
});


// here we may have some virtual properties of our schemas
appointmentSchema.virtual('endtime').get(function(){
	return this.starttime + this.duration;
});

// serielize appointments schema
appointmentSchema.methods.serialize = function(){

	return {
		id: this._id,
		name: this.name,
		starttime: this.starttime,
		location: this.location,
		endtime: this.endtime,
		requester: this.requester,
		taker: this.taker,
		createdtime: this.createdtime

	}
}
// for exporting to the routers
const Appointment = mongoose.model('appointment', appointmentSchema);

module.exports = {
	Appointment: Appointment
};