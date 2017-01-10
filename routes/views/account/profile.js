var keystone = require('keystone');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // Turn off ads on this page
  locals.hideAds = true;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'account';

  // Render the view
  view.render('account/profile');
};
