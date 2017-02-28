var keystone = require('keystone');
var User = keystone.list('User');
var cbOptions = require('../../../options.js');
var stripe = require("stripe")(cbOptions.stripe.privateKeyTest);

exports = module.exports = function (req, res) {

  // If no one's logged in, disallow all of this
  if (!req.user) {
    return res.redirect('/account/log-in');
  }

  // If the id in the form doesn't match the id of the logged in user, no dice
  if(req.user.id != req.body.userID) {
    req.flash('error', { detail: 'Sorry, something went wrong while trying to update your card. Please try again. Error #1' });
    return res.redirect('/account/profile');
  }

  // If there's no token, no dice
  if(!req.body.stripeToken) {
    req.flash('error', { detail: 'Sorry, something went wrong while trying to update your card. Please try again. Error #2' });
    return res.redirect('/acount/profile');
  }

  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.section = 'account';
  locals.formData = req.body || {};
  locals.user = req.user;

  view.on('post', function(next) {
    console.log(locals.user.stripeID);
    console.log(locals.formData.stripeToken);
    stripe.customers.update(
      locals.user.stripeID,
      { source: locals.formData.stripeToken },
      function(err, customer) {
        if(err) {
          console.log(err);
          req.flash('error', { detail: 'Something went wrong. Please try again or <a href="/contact">contact us</a> for help.' });
          return next();
        }

        // Save the user and send a confirmation email
        locals.user.updateStripeCard(locals.formData, function(err) {
          // if (err) return next(err);
          if (err) {
            req.flash('error', { detail: 'Sorry, something went wrong while trying to update your card. Please try again. Error #3' });
            next();
          }
          else {
            req.flash('success', { detail: 'Your card has been updated. We\'ve emailed you a confirmation.' });
            next();
          }
        });
    });
  });

  view.render('account/profile');
}