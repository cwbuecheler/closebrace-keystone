var keystone = require('keystone');
var User = keystone.list('User');
var sanitizer = require('sanitizer');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // Turn off ads on this page
  locals.hideAds = true;

  view.on('init', function(next) {

    User.model.findOne().where('resetPasswordKey', req.params.key).exec(function(err, user) {
      if (err) {
        console.log(err);
        return next(err);
      }
      if (!user) {
        req.flash('error', { detail: "Sorry, that reset password key isn't valid." });
        return res.redirect('/account/forgot-password');
      }
      locals.found = user;
      next();
    });

  });

  view.on('post', { action: 'reset-password' }, function(next) {

    if (!req.body.userPassword) {
      req.flash('error', { detail: "Please fill in all the fields." });
      res.redirect('/account/reset-password/' + req.params.key);
    }

    locals.found.password = sanitizer.sanitize(req.body.userPassword);
    locals.found.resetPasswordKey = '';
    locals.found.save(function(err) {
      if (err) {
        req.flash('error', { detail: 'There was a problem resetting your password. Please try again.' });
        res.redirect('/account/log-in');
      }
      req.flash('success', { detail: 'Your password has been reset, please sign in.' });
      res.redirect('/account/log-in');
    });

  });

  view.render('account/resetPassword');

}