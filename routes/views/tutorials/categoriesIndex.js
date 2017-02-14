var keystone = require('keystone');
var Post = keystone.list('Post');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'tutorials';
  locals.filters = {
    category: req.params.category,
  }

  // Load requested posts
  view.on('init', function(next) {
    var q = Post.model.find({
      state: 'published',
      postType: 'Tutorial',
    })
    .sort('-createdAt')
    .populate('author category');

    q.exec(function(err, results) {

      if (!results || results.length < 1) {
        locals.firstPost = null;
        locals.posts = null;
        return next();
      }

      var finalPosts = [];
      console.log(results.length);
      for(var i = 0; i < results.length; i++) {
        var result = results[i];
        var resultCat = result.category;
        console.log(resultCat);
        if (resultCat !== null && resultCat.key === locals.filters.category) {
          finalPosts.push(result);
          locals.categoryName = resultCat.name;
        }
      }

      if (finalPosts.length < 1) {
        locals.posts
      }

      locals.firstPost = finalPosts[0];
      locals.firstPost.updatedAtFormatted = locals.firstPost._.updatedAt.format('Do MMM YYYY');
      finalPosts.splice(0,1);
      locals.posts = finalPosts;
      if (locals.posts.length > 0) {
        for (var post in locals.posts) {
          var updatedAtFormatted = locals.posts[post]._.updatedAt.format('Do MMM YYYY');
          locals.posts[post].updatedAtFormatted = updatedAtFormatted;
        }
      }
      next(err);
    });

  });

  // Render the view
  view.render('tutorials/categoriesIndex');
};
