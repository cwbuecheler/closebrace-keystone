var keystone = require('keystone');
var Post = keystone.list('Post');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

  // Load requested posts
  view.on('init', function(next) {
    var q = Post.model.find({
      state: 'published',
    })
    .sort({'publishedAt': -1})
    .limit(6)
    .populate('author categories');

    q.exec(function(err, result) {
      locals.posts = result;
      locals.topTwo = [result[0], result[1]];
      locals.nextFour = [result[2], result[3], result[4], result[5]];
      for (var post in result) {
        var updatedAtFormatted = result[post]._.updatedAt.format('Do MMM YYYY');
        locals.posts[post].updatedAtFormatted = updatedAtFormatted;
      }
      next(err);
    });
  });

	// Render the view
	view.render('index');
};
