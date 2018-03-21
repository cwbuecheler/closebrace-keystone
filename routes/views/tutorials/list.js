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
    code: req.params.code,
  };

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

    q.exec((err, results) => {
      if (!results || results.length < 1) {
        locals.posts = null;
        return next();
      }

      const finalPosts = [];
      for (let i = 0; i < results.length; i += 1) {
        const result = results[i];
        const resultCat = result.category;
        if (resultCat && resultCat.key === locals.filters.category) {
          finalPosts.push(result);
          // if any posts are found, overwrite the category name with a prettier version
          locals.categoryName = resultCat.name;
        }
      }

      if (finalPosts.length < 1) {
        locals.posts = null;
        return next();
      }

      locals.categoryId = finalPosts[0].category._id.toString();
      locals.posts = finalPosts;
      if (locals.posts.length > 0) {
        for (const post in locals.posts) {
          const updatedAtFormatted = locals.posts[post]._.updatedAt.format('Do MMM YYYY');
          locals.posts[post].updatedAtFormatted = updatedAtFormatted;
          const publishedAtFormatted = locals.posts[post]._.publishedAt.format('YYYY-MM-DD');
          locals.posts[post].publishedAtFormatted = publishedAtFormatted;
        }
      }

      // Now check access codes
      if (locals.filters.category === 'five-minute-react') {
        if (locals.filters.code === '3xWbVULhnTR3F0HgVX') {
          locals.posts.splice(0, 24);
          return next(err);
        }
        else if (locals.filters.code === 'XFuAXn6WV8cdfGYXbT') {
          return next(err)
        }
        else {
          locals.posts = null;
          return next(err);
        }
      }

      return next(err);
    });
  });

  // Render the view
  view.render('tutorials/list');
};

exports = module.exports;
