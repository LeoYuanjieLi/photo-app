const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// create schema
const UserSchema = new Schema({
    name: {
        type:String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        required: true
    },
    // appointments, clients will see the appointments they posted, photographers can see the appointments in their market.
    jobs: [String],
    // only userType photographer will have access to their portfolio
    portfolio: [String],
    date: {
        type: Date,
        default: Date.now
    }
})


mongoose.model('users', UserSchema);