var keystone = require('keystone');
var sanitizer = require('sanitizer');

exports = module.exports = function (req, res) {

  // If someone's already logged in, redirect them to their profile page
  if (req.user) {
    return res.redirect('/account/profile');
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

  view.on('post', { action: 'login' }, function(next) {

    if (!locals.formData.userEmail || !locals.formData.userPassword) {
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

    keystone.session.signin({ email: locals.formData.userEmail, password: locals.formData.userPassword }, req, res, onSuccess, onFail);


  });

  view.render('account/login');

};
