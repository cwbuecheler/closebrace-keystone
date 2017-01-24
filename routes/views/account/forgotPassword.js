var keystone = require('keystone');
var User = keystone.list('User');
var sanitizer = require('sanitizer');

exports = module.exports = function (req, res) {

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

  view.on('post', { action: 'reset' }, function(next) {

    // Validation
    if (!locals.formData.userEmail) {
      req.flash('error', { detail: 'Please fill in all fields.' });
      return next();
    }

    // If the email in the form doesn't match the email of the logged in user, no dice
    if(req.user.email != locals.formData.userEmail) {
      req.flash('error', { detail: 'Sorry, that email address doesn\'t match the one we have on file.' });
      return res.redirect('/account/forgot-password')
    }

    // Get user
    keystone.list('User').model.findOne({ email: locals.formData.userEmail }, function(err, user) {
      if (err) return next(err);
      if (!user) {
        req.flash('error', { detail: 'Sorry, that email doesn\'t exist in  our database.' });
        return next();
      }

      user.resetPassword(function(err) {
        // if (err) return next(err);
        if (err) {
          req.flash('error', { detail: 'Error sending reset password email. Please <a href="/contact">contact us</a> about this error' });
          next();
        }
        else {
          req.flash('success', { detail: 'All set. We\'ve emailed you a link to reset your password' });
          res.redirect('/account/log-in');
        }
      });

    });
  });

  view.render('account/forgotPassword');

};
