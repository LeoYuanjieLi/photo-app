'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

// this is our schema to represent 2 type of users:
// photographers and clients
const userSchema = new Schema({
	username: {type: String, required: true, unique: true},
	password: {type:String, required: true},
	usertype: {type: String, required: true},
	firstName: {type: String, required: true},
	lastName: {type: String, required: true},
	address: {
		building: String,
		// coord will be an array of string values
		coord: [String],
		street: String,
		zipcode: String,
		// required:true
	},
  // reviews is an array of review objects
	reviews: [{
		content: {type: String, default: ''},
		// can we use our user object for the type here?
		reviewer: {type: String, default: ''},
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

userSchema.methods.serialize = function() {
	return {
		// in the example file, it is ` username:this.username || '' `
		username: this.username,
		firstName: this.firstName,
		lastName: this.lastName

	}
};

userSchema.methods.validatePassword = function(password) {
	return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
	return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', userSchema);

model.exports = {User};