var keystone = require('keystone');
var User = keystone.list('User');
var nodemailer = require('nodemailer');
var cbOptions = require('../../../options.js');
var stripe = require("stripe")(cbOptions.stripe.privateKey);

exports = module.exports = function (req, res) {

  // If no one's logged in, disallow all of this
  if (!req.user) {
    return res.redirect('/account/log-in');
  }

  // If there's no cancel text, give up
  if(req.body.accountCancelSubscriptionConfirmText !== 'CANCEL SUBSCRIPTION') {
    req.flash('error', { detail: 'Incorrect text entered.' });
    return res.redirect('/account/profile')
  }

  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.section = 'account';
  locals.formData = req.body || {};
  locals.stripeInfo = {};
  locals.user = req.user;

  view.on('post', function(next) {
    stripe.subscriptions.del(locals.user.stripeSubscriptionID, { at_period_end: true },
      function(err, confirmation) {
        if(err) {
          req.flash('error', { detail: 'Something went wrong. Please try again or <a href="/contact">contact us</a> for help.' });
          return next();
        }

        // Save the user and send a confirmation email
        locals.user.cancelStripeSubscription('cancel-initial', function(err) {
          // if (err) return next(err);
          if (err) {
            req.flash('error', { detail: 'Sorry, something went wrong while trying to cancel your subscription. Please try again. Error #2' });
            next();
          }
          else {
            req.flash('success', { detail: 'Your subscription has been cancelled and will be disabled at the end of your billing period. We\'ve emailed you a confirmation.' });
            next();
          }
        });
      }
    );
  });

  view.render('account/profile');
};
