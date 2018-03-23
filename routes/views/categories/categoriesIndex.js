const keystone = require('keystone');

const Category = keystone.list('PostCategory');
const Post = keystone.list('Post');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const locals = res.locals;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'tutorials';
  locals.filters = {
    category: req.params.category,
  };

  // splash page remove header
  if (locals.filters.category === 'five-minute-react') {
    locals.noheader = true;
  }


  // set a basic categoryname for displaying
  locals.categoryName = locals.filters.category;

  // Look up category information and get it into locals
  view.on('init', (next) => {
    const q = Category.model.findOne({
      key: locals.filters.category,
    });

    q.exec((err, result) => {
      if (!result || result.length < 1) {
        return res.status(404).send(keystone.wrapHTMLError('Sorry, no page could be found at this address (404)'));
      }
      if (err) {
        return next(err);
      }
      locals.categoryInfo = result;
      return next();
    });
  });


  // Load requested posts
  view.on('init', (next) => {
    const q = Post.model.find({
      state: 'published',
      hideFromIndex: false,
    })
    .sort('+publishedAt')
    .populate('author category');

    q.exec(function(err, results) {

      if (!results || results.length < 1) {
        locals.firstPost = null;
        locals.posts = null;
        return next();
      }

      var finalPosts = [];
      for(var i = 0; i < results.length; i++) {
        var result = results[i];
        var resultCat = result.category;
        if (resultCat && resultCat.key === locals.filters.category) {
          finalPosts.push(result);
          // if any posts are found, overwrite the category name with a prettier version
          locals.categoryName = resultCat.name;
        }
      }

      if (finalPosts.length < 1) {
        locals.firstPost = null;
        locals.posts = null;
        return next();
      }
      locals.categoryId = finalPosts[0].category._id.toString();
      locals.firstPost = finalPosts[0];
      locals.firstPost.updatedAtFormatted = locals.firstPost._.updatedAt.format('Do MMM YYYY');
      locals.firstPost.publishedAtFormatted = locals.firstPost._.publishedAt.format('YYYY-MM-DD');
      finalPosts.splice(0,1);
      locals.posts = finalPosts;
      if (locals.posts.length > 0) {
        for (var post in locals.posts) {
          var updatedAtFormatted = locals.posts[post]._.updatedAt.format('Do MMM YYYY');
          locals.posts[post].updatedAtFormatted = updatedAtFormatted;
          var publishedAtFormatted = locals.posts[post]._.publishedAt.format('YYYY-MM-DD');
          locals.posts[post].publishedAtFormatted = publishedAtFormatted;
        }
      }
      next(err);
    });

  });

  // Render the view
  view.render('categories/categoriesIndex', { layout: 'wide' });
};

exports = module.exports;
