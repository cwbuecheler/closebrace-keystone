var keystone = require('keystone');
var User = keystone.list('User');
var cloudinary = require('cloudinary');

exports = module.exports = function (req, res) {

  // If no one's logged in, disallow all of this
  if (!req.user) {
    return res.redirect('/account/log-in');
  }

  // If the id in the form doesn't match the id of the logged in user, no dice
  if(req.user.id != req.body.userID) {
    req.flash('error', { detail: 'Sorry, something went wrong while uploading your avatar. Please try again. Error #1' });
    return res.redirect('/account/profile')
  }

  // If there's no image submitted, give up
  if(!req.files.file) {
    req.flash('error', { detail: 'Sorry, something went wrong while uploading your avatar. Please try again. Error #2' });
    return res.redirect('/account/profile')
  }

  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.section = 'account';
  locals.formData = req.body || {};

  view.on('init', function(next) {
    // Look up existing user
    User.model.findOne().where('_id', req.body.userID).exec(function(err, user) {
      if (err) {
        console.log(err);
        return next(err);
      }
      if (!user || user === null) {
        req.flash('error', { detail: 'Sorry, something went wrong while uploading your avatar. Please try again. Error #3' });
        return res.redirect('/account/profile');
      }
      locals.foundUser = user;
      next();
    });
  });

  view.on('init', function(next) {
    // upload the image to Cloudinary and assign the new URL
    cloudinary.uploader.upload(req.files.file.path, function(result, err) {
      if (err) {
        req.flash('error', { detail: 'Sorry, something went wrong while uploading your avatar. Please try again. Error #4' });
        return res.redirect('/account/profile');
      }
      else {
        locals.newUserImage = result;
        return next();
      }
    });
  });

  view.on('post', { action: 'avatar-upload' }, function(next) {
    // Save the user object now that it contains the new image data
    locals.foundUser.userImage = locals.newUserImage;
    locals.foundUser.save(function(err) {
      if (err) {
        req.flash('error', { detail: 'Sorry, something went wrong while uploading your avatar. Please try again. Error #5' });
        res.redirect('/account/profile');
      }
      req.flash('success', { detail: 'Changes Made!' });
      res.redirect('/account/profile');
    });
  });

  view.render('account/profile');
};
