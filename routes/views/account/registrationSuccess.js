var keystone = require('keystone');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // Set locals
  locals.section = 'account';

  // Turn off ads on this page
  locals.hideAds = true;

  view.render('account/registrationSuccess');
};
