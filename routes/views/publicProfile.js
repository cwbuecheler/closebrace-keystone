var keystone = require('keystone');
var User = keystone.list('User');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'home';
  locals.filters = {
    username: req.params.username,
  }

  // Load requested user's profile
  view.on('init', function(next) {
    var q = User.model.findOne({
      userName: new RegExp(locals.filters.username, 'i')
    });

    q.exec(function(err, result) {
      if(!result) {
        req.flash('error', { detail: "Sorry, that user doesn't seem to exist." });
      }
      locals.foundUser = result;
      locals.foundUser.dateJoinedFormatted = locals.foundUser._.dateJoined.format('MMMM Do, YYYY');
      next(err);
    });

  });

  // Render the view
  view.render('publicProfile');

};
