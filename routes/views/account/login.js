var keystone = require('keystone');

exports = module.exports = function (req, res) {

  // If someone's already logged in, redirect them to their profile page
  if (req.user) {
    return res.redirect('/account/profile');
  }

  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.section = 'account';
  locals.formData = req.body || {};

  // Turn off ads on this page
  locals.hideAds = true;

  view.on('post', { action: 'login' }, function(next) {

    if (!req.body.userEmail || !req.body.userPassword) {
      req.flash('error', { detail: 'Please enter your email and password.' });
      return next();
    }

    var onSuccess = function() {
      res.redirect('/');
    }

    var onFail = function() {
      req.flash('error', { detail: 'Your email or password were incorrect, please try again.' });
      return next();
    }

    keystone.session.signin({ email: req.body.userEmail, password: req.body.userPassword }, req, res, onSuccess, onFail);


  });

  view.render('account/login');

};
