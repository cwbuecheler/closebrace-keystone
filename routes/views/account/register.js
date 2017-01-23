var keystone = require('keystone');
var md5 = require('js-md5');
var nodemailer = require('nodemailer');
var cbOptions = require('../../../options.js');

exports = module.exports = function (req, res) {

  // If someone's already logged in, redirect them to their profile page
  if (req.user) {
    return res.redirect(req.cookies.target || '/account/profile');
  }

  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.section = 'account';
  locals.formData = req.body || {};

  // Turn off ads on this page
  locals.hideAds = true;

  view.on('init', function(next) {
    // Check for duplicate email
    keystone.list('User').model.findOne({ email: req.body.userEmail })
    .exec()
    .then( function(err, user) {
      if (err || user) {
        locals.dupeUserEmail = true;
      }
    })
    .then( function(err) {
      // Check for duplicate username
      keystone.list('User').model.findOne({ userName: req.body.userUsername }, function(err, user) {
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
    if (!req.body.userFirstName || !req.body.userLastName || !req.body.userEmail || !req.body.userPassword) {
      req.flash('error', { detail: 'Please fill in all fields.' });
      return next();
    }
    if (req.body.userPassword.length < 8) {
      req.flash('error', { detail: 'Password too short.' });
      return next();
    }

    var userConfirm = md5(req.body.userFirstName + req.body.userLastName + req.body.userEmail);
    var userData = {
      name: {
        first: req.body.userFirstName,
        last: req.body.userLastName,
      },
      userName: req.body.userUsername,
      email: req.body.userEmail,
      password: req.body.userPassword,
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

        // create reusable transporter object using the default SMTP transport
        var mailString = 'smtps://' + cbOptions.google.mailAddress + ':' + cbOptions.google.mailPassword + '@smtp.gmail.com';
        var transporter = nodemailer.createTransport(mailString);

        // setup e-mail data with unicode symbols
        var mailOptions = {
          from: '"CloseBrace" <contact@closebrace.com>', // sender address
          to: req.body.userEmail, // list of receivers
          subject: 'Please Confirm Your CloseBrace Account', // Subject line
          text: 'Thanks for registering with CloseBrace. You can confirm your account by visiting the following URL: https://dev.closebrace.com/account/confirm?id=' + userConfirm + ' ... If you did not sign up for CloseBrace and someone has used your email address by mistake, you don\'t need to do anything. This account will not be emailed again (unless a re-send of this confirmation email is requested), and will be automatically deleted in ten days.', // plaintext body
          html: '<h3>Welcome to CloseBrace</h3><p>Thanks for registering with CloseBrace, the tutorial and resource site for JavaScript developers, by JavaScript developers.</p><p>You can confirm your account by visiting the following URL: <a href="https://dev.closebrace.com/account/confirm?id=' + userConfirm + '" target="_blank">https://dev.closebrace.com/account/confirm?v=' + userConfirm + '</a>.</p><p>If you did not sign up for CloseBrace and someone has used your email address by mistake, you don\'t need to do anything. This account will not be emailed again (unless a re-send of this confirmation email is requested), and will be automatically deleted in ten days.</p>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
          if(error){
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

        keystone.session.signin({ email: req.body.userEmail, password: req.body.userPassword }, req, res, onSuccess, onFail);
      }
    });

  });

  view.render('account/register');

};
