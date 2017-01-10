var keystone = require('keystone');
var Post = keystone.list('Post');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'articles';
  locals.filters = {
    post: req.params.post,
  }

  // Load requested post
  view.on('init', function(next) {
    var q = Post.model.findOne({
      state: 'published',
      postType: 'Article',
      slug: locals.filters.post,
    }).populate('author categories tags');

    q.exec(function(err, result) {
      locals.post = result;
      var updatedAtFormatted = result._.updatedAt.format('Do MMM YYYY');
      locals.post.updatedAtFormatted = updatedAtFormatted;
      next(err);
    });

  });

  // Render the view
  view.render('articles/post');

};
