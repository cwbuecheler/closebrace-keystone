var keystone = require('keystone');

exports = module.exports = function(req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // Turn off ads on this page
  locals.hideAds = true;

  locals.section = 'account';

  keystone.session.signout(req, res, function() {
    res.redirect('/');
  });

};