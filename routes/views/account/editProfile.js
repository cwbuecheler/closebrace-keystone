var keystone = require('keystone');
var User = keystone.list('User');

exports = module.exports = function (req, res) {

  // If no one's logged in, disallow all of this
  if (!req.user) {
    return res.redirect('/account/log-in');
  }

  // If the id in the form doesn't match the id of the logged in user, no dice
  if(req.user.id != req.body.userID) {
    req.flash('error', { detail: 'Sorry, something went wrong while trying to update your profile. Please try again. Error #1' });
    return res.redirect('/account/profile')
  }

  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.section = 'account';
  locals.formData = req.body || {};

  // Turn off ads on this page
  locals.hideAds = true;

  view.on('init', function(next) {
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
      next();
    });

  });

  view.on('init', function(next) {
    // catch username conflicts
    User.model.findOne().where('userName', req.body.userUsername).exec(function(err, foundUser) {
      locals.dupeUsername = false;
      if (err) {
        console.log(err);
        return next(err);
      }
      if (!foundUser) {
        return next();
      }
      if (foundUser.id != req.body.userID) {
        locals.dupeUsername = true;
      }
      next();
    });
  });

  view.on('post', { action: 'edit-profile' }, function(next) {
    // Redirect dupes
    if (locals.dupeUsername) {
      req.flash('error', { detail: 'Sorry, that username already exists. Please try another one.' });
      return next();
    }

    // Build our user (ignoring blank required inputs by using saved values)
    locals.found.name.first = req.body.userFirstName || locals.found.name.first;
    locals.found.name.last = req.body.userLastName || locals.found.name.last;
    locals.found.userName = req.body.userUsername || locals.found.userName;
    locals.found.location = req.body.userLocation;
    locals.found.website = addhttp(req.body.userWebsite);
    locals.found.twitterUsername = removeAtSign(req.body.userTwitter);

    locals.found.save(function(err) {
      if (err) {
        req.flash('error', { detail: 'Sorry, something went wrong while trying to update your profile. Please try again. Error #4' });
        res.redirect('/account/profile');
      }
      req.flash('success', { detail: 'Changes Made!' });
      res.redirect('/account/profile');
    });

  });

  view.render('account/profile');

};

function addhttp(url) {
   if (url && !/^(f|ht)tps?:\/\//i.test(url)) {
      url = "http://" + url;
   }
   return url;
}

function removeAtSign(str) {
  if (str.charAt(0) === '@') {
    return str.slice(1, str.length);
  }
  return str
}