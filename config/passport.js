const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


// Load User Model
const User = mongoose.model('users');


module.exports = function(passport){
    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
        console.log('local strategy is working');
        // Local Strategy come in here
        // Match User
        User.findOne({email:email})
            .then(user => {
                if(!user) {
                    return done(null, false, {message: 'Username or password incorrect'});
                };

                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, {message: 'Username or password incorrect'});
                    }
                })

            })

    }));

    // Serialize and Deserialize
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });
};