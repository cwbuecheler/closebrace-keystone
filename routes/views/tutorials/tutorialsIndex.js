var keystone = require('keystone');
var Post = keystone.list('Post');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'tutorials';

  // Load requested posts
  view.on('init', function(next) {
    var q = Post.model.find({
      state: 'published',
      postType: 'Tutorial',
    })
    .sort('-publishedAt')
    .populate('author categories');

    q.exec(function(err, result) {
      locals.firstPost = result[0];
      locals.firstPost.updatedAtFormatted = locals.firstPost._.updatedAt.format('Do MMM YYYY');
      result.splice(0,1);
      locals.posts = result;
      for (var post in locals.posts) {
        var updatedAtFormatted = locals.posts[post]._.updatedAt.format('Do MMM YYYY');
        locals.posts[post].updatedAtFormatted = updatedAtFormatted;
      }
      next(err);
    });


  });

	// Render the view
	view.render('tutorials/tutorialsIndex');
};
