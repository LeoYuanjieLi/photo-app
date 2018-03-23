'use strict';

const mongoose = require("mongoose"),
	Schema = mongoose.Schema,
	bcrypt = require(bcrypt);

// this is our schema to represent 2 type of users:
// photographers and clients
const userSchema = new Schema({
	username: {type: String, required: true},
	password: {type:String, required: true},
	usertype: {type: String, required: true},
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	address: {
		building: String,
		// coord will be an array of string values
		coord: [String],
		street: String,
		zipcode: String
	},
  // reviews is an array of review objects
	reviews: [{
		content: {type: String},
		reviewer: {type: String},
		date: {type:Date}
		}],

	// appointments is an array of appointment ids
	appointments: [String],
	rate: {type:Number},
	// only photographer will have bio property
	bio: {type:String},
	// only photographer will have portfolio
	portfolio: [String],

});

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
	rate: {type:String},
	available: {type:Boolean},
	requester: {type:String},
	taker: {
		type:String,
		default:null
		}
	createdtime: {
		type:Date,
		default:Date.now
	    }
});


// here we may have some virtual properties of our schemas
appointmentSchema.virtual('endtime').get(function(){
	return this.starttime + this.duration;
});

// serielize the schema
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
const user = mongoose.model('user', userSchema);
const appointments = mongoose.model('appointment', appointmentSchema);

module.exports = {
	user: user,
	appointment: appointment
};