const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../models/User');
const Employer = require('../models/Employer');
const Professor = require('../models/Professor');


module.exports = function (passport) {
  passport.use('user-signup',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.use('employer-signup',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match Employer
      Employer.findOne({
        email: email
      }).then(employer => {
        if (!employer) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, employer.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, employer);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.use('professor-signup',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match Professor
      Professor.findOne({
        email: email
      }).then(professor => {
        if (!professor) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, professor.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, professor);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function (user, done) {
    var key = {
      id: user.id,
      type: user.userType
    }
    return done(null, key);
  });

  passport.deserializeUser(function (key, done) {
    var Model = undefined;

    if (key.type === 'employer') {
      Model = Employer
    } else if (key.type === 'professor') {
      Model = Professor
    } else {
      Model = User
    }
    //var Model = key.type === 'employer' ? Employer : User;
    Model.findById(key.id, function (err, user) {
      done(err, user);
    });
  });
};