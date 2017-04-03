var keystone = require('keystone');
var User = keystone.list('User');
var sanitizer = require('sanitizer');

exports = module.exports = function (req, res) {

  // If no one's logged in, disallow all of this
  if (!req.user) {
    return res.redirect('/account/log-in');
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

  view.on('init', function(next) {
    // Look up currently logged in user
    User.model.findOne().where('_id', req.user.id).exec(function(err, user) {
      if (err) {
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
    User.model.findOne().where('userName', new RegExp(locals.formData.userUsername, 'i')).exec(function(err, foundUser) {
      locals.dupeUsername = false;
      if (err) {
        console.log(err);
        return next(err);
      }
      if (!foundUser) {
        return next();
      }
      if (foundUser.id != req.user.id) {
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
    locals.found.name.first =locals.formData.userFirstName || locals.found.name.first;
    locals.found.name.last = locals.formData.userLastName || locals.found.name.last;
    locals.found.userName = locals.formData.userUsername || locals.found.userName;
    locals.found.location = locals.formData.userLocation;
    locals.found.website = addhttp(locals.formData.userWebsite);
    locals.found.twitterUsername = removeAtSign(locals.formData.userTwitter);

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