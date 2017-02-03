var keystone = require('keystone');
var User = keystone.list('User');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.section = 'account';
  locals.confirmSucceeded = false;

  // Turn off ads on this page
  locals.hideAds = true;

  // get the confirm string from the querystring
  locals.confirmString = req.query.conf; // $_GET["id"]


  view.on('init', function(next) {

    console.log(locals.confirmString);


    // Find a user who matches this confirm string
    User.model.findOne().where('confirmHash', locals.confirmString).exec(function(err, user) {
      if (err) return next(err);
      if (!user) {
        next();
      }
      locals.found = user;

      // Update the user to be verified in the DB
      if (locals.found) {
        locals.found.isVerified = true;
        locals.found.save(function(err) {
          if (err) {
            return next();
          }
          locals.confirmSucceeded = true;
          next();
        });
      }
      else {
        next();
      }
    });



  });

  view.render('account/confirm');

};
