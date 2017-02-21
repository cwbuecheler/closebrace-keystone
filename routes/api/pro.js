var keystone = require('keystone');
var sanitizer = require('sanitizer');
var nodemailer = require('nodemailer');
var cbOptions = require('../../options.js');
var stripe = require("stripe")(cbOptions.stripe.privateKeyTest);

var User = keystone.list('User');

/**
 * Register a User as Pro
 */
exports.register = function(req, res) {
  var data = (req.method == 'POST') ? req.body : req.query;

  // sanitize form data
  for (var key in data) {
    // skip loop if the property is from prototype
    if (!data.hasOwnProperty(key)) continue;
    if (typeof data[key] === 'string') {
      data[key] = sanitizer.sanitize(data[key]);
    }
  }

  // Make sure emails are the same
  User.model.findById(data.userID).exec(function(err, user) {
    if(user.email != data.email) { return res.apiError('emails do not match', err) }
    // Set user's StripeCardID
    user.stripeCardID = data.token.id;
    // Set user to Pro
    user.isPro = true;
    if(data.proPlan === 'closebrace-pro-platinum-yearly' || data.proPlan === 'closebrace-pro-platinum-monthly') {
      // if Platinum, set user to platinum
      user.isPlatinum = true;
    }

    // Check if the user already has a stripe customer id
    if (user.stripeID && user.stripeID !== '') {
        stripe.subscriptions.create({
          customer: user.stripeID,
          plan: data.proPlan,
        }, function(err, subscription) {
          saveUser(req, res, user);
        });
    }
    else {
      // Otherwise save the user as a Stripe customer
      var customer = stripe.customers.create({
        email: user.email,
        card: data.token.id,
      }, function(err, customer) {
        // record the user's stripe ID
        user.stripeID = customer.id;
        // Then subscribe the user to the Stripe plan
        stripe.subscriptions.create({
          customer: customer.id,
          plan: data.proPlan,
        }, function(err, subscription) {
          saveUser(req, res, user);
        });
      });
    }
  });
}

function saveUser(req, res, user) {
    // Save the user to closeBrace
  user.save(function(err) {
    if (err) { return res.apiError('error', err) };
    res.apiResponse({
      user: user
    });
  })
}