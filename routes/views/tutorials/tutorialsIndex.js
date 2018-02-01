const keystone = require('keystone');

const Post = keystone.list('Post');
const PostCategory = keystone.list('PostCategory');

exports = module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const locals = res.locals;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'tutorials';

  // Get a list of categories
  view.on('init', (next) => {
    const q = PostCategory.model.find()
    .sort('+name');

    q.exec((err, results) => {
      if (err || results.length < 1) {
        locals.categories = null;
        return next(err);
      }
      locals.categories = results;
      console.log(locals.categories);
      return next();
    });
  });

  // ===================================================== //

  // Load requested posts
  view.on('init', function(next) {
    var q = Post.model.find({
      state: 'published',
      postType: 'Tutorial',
      hideFromIndex: false,
    })
    .sort('-publishedAt')
    .populate('author categories');

    q.exec(function(err, result) {

      // If no posts, move along
      if(result.length < 1) {
        locals.firstPost = null;
        locals.posts = null;
        return next(err);
      }

      locals.firstPost = result[0];
      locals.firstPost.updatedAtFormatted = locals.firstPost._.updatedAt.format('Do MMM YYYY');
      locals.firstPost.publishedAtFormatted = locals.firstPost._.publishedAt.format('YYYY-MM-DD');
      result.splice(0,1);
      locals.posts = result;
      for (var post in locals.posts) {
        var updatedAtFormatted = locals.posts[post]._.updatedAt.format('Do MMM YYYY');
        locals.posts[post].updatedAtFormatted = updatedAtFormatted;
        var publishedAtFormatted = locals.posts[post]._.publishedAt.format('YYYY-MM-DD');
        locals.posts[post].publishedAtFormatted = publishedAtFormatted;
      }
      next(err);
    });
  });

  // ===================================================== //

  // Render the view
  view.render('tutorials/tutorialsIndex');
};
