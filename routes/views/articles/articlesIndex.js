var keystone = require('keystone');
var Post = keystone.list('Post');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'articles';

  // Load requested posts
  view.on('init', function(next) {
    var q = Post.model.find({
      state: 'published',
      postType: 'Article',
    })
    .sort('-createdAt')
    .populate('author categories');

    q.exec(function(err, result) {
      for (var post in result) {
        var updatedAtFormatted = result[post]._.updatedAt.format('Do MMM YYYY');
        locals.posts[post].updatedAtFormatted = updatedAtFormatted;
      }
      next(err);
    });

  });

  // Render the view
  view.render('articles/articlesIndex');
};
