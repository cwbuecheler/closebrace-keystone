var keystone = require('keystone');
var User = keystone.list('User');

exports = module.exports = function (req, res) {

  // If no one's logged in, disallow all of this
  if (!req.user) {
    return res.redirect('/account/log-in');
  }

  // If the id in the form doesn't match the id of the logged in user, no dice
  if(req.user.id !== req.body.userID) {
    req.flash('error', { detail: 'Sorry, something went wrong while trying to update your profile. Please try again. Error #1' });
    return res.redirect('/account/profile')
  }

  // If there's no delete text, give up
  if(req.body.accountDeleteConfirmText !== 'DELETE MY ACCOUNT') {
    req.flash('error', { detail: 'Incorrect text entered.' });
    return res.redirect('/account/profile')
  }

  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.section = 'account';
  locals.formData = req.body || {};

  view.on('init', function(next) {
    console.log('here1');
    // Look up existing user
    User.model.findOne().where('_id', req.body.userID).exec(function(err, user) {
      if (err) {
        console.log(err);
        return next(err);
      }
      if (!user) {
        req.flash('error', { detail: 'Sorry, something went wrong while trying to update your profile. Please try again. Error #2' });
        return res.redirect('/account/profile');
      }
      locals.found = user;
      console.log('here2');
      next();
    });

  });


  view.on('post', { action: 'delete-account' }, function(next) {
    console.log('here3');
    // Delete the user's comments
    // Delete the user's *
    // Delete the user
    locals.found.remove(function(err) {
      if (!err) {
        req.flash('success', { detail: 'Account deleted. Goodbye!' });
        return res.redirect('/account/log-out');
      }
      else {
        req.flash('error', { title: err, detail: 'Sorry, something went wrong while deleting your account. Please <a href="/contact">contact us</a>.' });
        return res.redirect('/account/profile');
      }
    });
  });

  view.render('/');

};
