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
  User.model.findById(data.userID).exec(function(err, item) {
    if(item.email != data.email) { return res.apiError('emails do not match', err) }
    // Set user's StripeID
    item.stripeID = data.token.id;
    // Set user to Pro
    item.isPro = true;
    if(data.proPlan === 'closebrace-pro-platinum-yearly' || data.proPlan === 'closebrace-pro-platinum-monthly') {
      // if Platinum, set user to platinum
      item.isPlatinum = true;
    }

    // Save the user as a Stripe customer
    var customer = stripe.customers.create({
      email: item.email,
    }, function(err, customer) {
      stripe.subscriptions.create({
        customer: customer.id,
        plan: item.proPlan,
      }, function(err, subscription) {
        console.log(subscription);
      });
    });
    // Subscribe the user to the Stripe plan


    // Save the user to closeBrace
    item.save(function(err) {
      if (err) { return res.apiError('error', err) };
      res.apiResponse({
        item: item
      });
    })
  });
}