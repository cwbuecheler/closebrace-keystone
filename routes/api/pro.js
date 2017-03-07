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

  if(!req.user.id || req.user.id === '') {
    res.apiResponse({
      success: false
    });
  }
  else {
    User.model.findById(req.user.id).exec(function(err, user) {
      if(user) {
        user.addStripeSubscription(data, function(err) {
          if (err) { return res.apiError('error', err) };
          res.apiResponse({
            success: true
          });
        });
      }
      else {
        res.apiResponse({
          success: false
        });
      }
    });
  }
}