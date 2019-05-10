var keystone = require('keystone');
var md5 = require('js-md5');
const mailgun = require('mailgun-js');
const cbOptions = require('../../../options.js');
var sanitizer = require('sanitizer');

const DOMAIN = cbOptions.mailgun.domain;
const apiKey = cbOptions.mailgun.apiKey;
const mg = mailgun({ apiKey, domain: DOMAIN });

exports = module.exports = function (req, res) {

  // If someone's already logged in, redirect them to their profile page
  if (req.user) {
    return res.redirect(req.cookies.target || '/account/profile');
  }

  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.section = 'account';
  locals.formData = req.body || {};

  // sanitize form data for obvious reasons
  for (var key in locals.formData) {
    // skip loop if the property is from prototype
    if (!locals.formData.hasOwnProperty(key)) continue;
    if (typeof locals.formData[key] === 'string') {
      locals.formData[key] = sanitizer.sanitize(locals.formData[key]);
    }
  }

  // Turn off ads on this page
  locals.hideAds = true;

  view.on('init', function(next) {
    // Check for duplicate email
    keystone.list('User').model.findOne({ email: locals.formData.userEmail })
    .exec()
    .then( function(err, user) {
      if (err || user) {
        locals.dupeUserEmail = true;
      }
    })
    .then( function(err) {
      // Check for duplicate username
      keystone.list('User').model.findOne({ userName: new RegExp(locals.formData.userUsername, 'i') }, function(err, user) {
        if (err || user) {
          locals.dupeUsername = true;
        }
        return next();
      });
    });
  });

  view.on('post', { action: 'register' }, function(next) {

    // Redirect dupes
    if (locals.dupeUserEmail) {
      req.flash('error', { detail: 'Sorry, a user already exists with that email address. Did you <a href="/forgot-password">forget your password</a>?' });
      return next();
    }
    if (locals.dupeUsername) {
      req.flash('error', { detail: 'Sorry, that username already exists. Please try another one.' });
      return next();
    }

    // Validation
    if (!locals.formData.userFirstName || !locals.formData.userLastName || !locals.formData.userEmail || !locals.formData.userPassword) {
      req.flash('error', { detail: 'Please fill in all fields.' });
      return next();
    }
    if (locals.formData.userPassword.length < 8) {
      req.flash('error', { detail: 'Password too short.' });
      return next();
    }

    var userConfirm = md5(locals.formData.userFirstName + locals.formData.userLastName + locals.formData.userEmail);
    var userData = {
      name: {
        first: locals.formData.userFirstName,
        last: locals.formData.userLastName,
      },
      userName: locals.formData.userUsername,
      email: locals.formData.userEmail,
      password: locals.formData.userPassword,
      confirmHash: userConfirm,
    };

    var User = keystone.list('User').model;
    var newUser = new User(userData);

    newUser.save(function(err) {
      if(err) {
        req.flash('error', { title: 'Something Went Wrong', detail: err });
        return next();
      }
      else {
        // setup e-mail data with unicode symbols
        var mailOptions = {
          from: '"CloseBrace" <contact@closebrace.com>', // sender address
          to: locals.formData.userEmail, // list of receivers
          subject: 'Please Confirm Your CloseBrace Account', // Subject line
          text: 'Thanks for registering with CloseBrace. You can confirm your account by visiting the following URL: https://closebrace.com/account/confirm?conf=' + userConfirm + ' ... If you did not sign up for CloseBrace and someone has used your email address by mistake, you don\'t need to do anything. This account will not be emailed again (unless a re-send of this confirmation email is requested), and will be automatically deleted in ten days.', // plaintext body
          html: '<h3>Welcome to CloseBrace</h3><p>Thanks for registering with CloseBrace, the tutorial and resource site for JavaScript developers, by JavaScript developers.</p><p>You can confirm your account by visiting the following URL: <a href="https://closebrace.com/account/confirm?conf=' + userConfirm + '" target="_blank">https://closebrace.com/account/confirm?conf=' + userConfirm + '</a></p><p>If you did not sign up for CloseBrace and someone has used your email address by mistake, you don\'t need to do anything. This account will not be emailed again (unless a re-send of this confirmation email is requested), and will be automatically deleted in ten days.</p>' // html body
        };

        // send mail
        mg.messages().send(mailOptions, (error, body) => {
          if (error) {
            req.flash('error', { title: 'Unable to send email', detail: error });
          }
        });

        // log the user in and send to thanks page
        var onSuccess = function() {
          res.redirect('/account/registration-success');
        }

        var onFail = function(e) {
          req.flash('error', { title: 'There was a problem signing you in, please try again.', detail: e });
          res.redirect('/');
        }

        keystone.session.signin({ email: locals.formData.userEmail, password: locals.formData.userPassword }, req, res, onSuccess, onFail);
      }
    });

  });

  view.render('account/register');

};
