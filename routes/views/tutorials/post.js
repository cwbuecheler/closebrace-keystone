var keystone = require('keystone');
var Post = keystone.list('Post');
var Comment = keystone.list('Comment');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'tutorials';
  locals.filters = {
  	post: req.params.post,
    date: req.params.date,
  }

  // Load requested post
  view.on('init', function(next) {
    var q = Post.model.findOne({
      state: 'published',
      postType: 'Tutorial',
      slug: locals.filters.post,
    }).populate('author tags category');

    q.exec(function(err, result) {
      locals.post = result;
      locals.filters.postID = locals.post._id;
      var updatedAtFormatted = result._.updatedAt.format('Do MMM YYYY');
      locals.post.updatedAtFormatted = updatedAtFormatted;
      var publishedAtFormatted = result._.publishedAt.format('YYYY-MM-DD');
      if (publishedAtFormatted === locals.filters.date) {
        next(err);
      }
      else {
        res.redirect('/tutorials/');
      }
    });
  });

  // Grab comments for post
  view.on('init', function(next) {
    var q = Comment.model.find({
      state: 'published',
    })
    .where('relatedPost', locals.filters.postID)
    .sort('-createdAt')
    .populate('author');

    q.exec(function(err, results) {
      locals.comments = results;
      for (var i = 0; i < results.length; i++) {
        var createdAtFormatted = results[i]._.createdAt.format('Do MMM YYYY');
        locals.comments[i].createdAtFormatted = createdAtFormatted;
      }
      next(err);
    });
  });

  // Render the view
  view.render('tutorials/post');

};
