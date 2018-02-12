const keystone = require('keystone');

const Post = keystone.list('Post');
const PostCategory = keystone.list('PostCategory');

module.exports = (req, res) => {
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
        next(err);
      }
      locals.categories = results;
      return next();
    });
  });

  view.on('init', async (next) => {
    // Build post query
    const q = Post.model.find({
      state: 'published',
      postType: 'Tutorial',
      hideFromIndex: false,
    })
    .sort('-publishedAt')
    .populate('author category');

    // Get posts and count them by category
    const totalPosts = await q.exec();

    // Now loop through the categories and compare them to the posts
    for (let i = 0; i < locals.categories.length; i += 1) {
      const category = locals.categories[i].name;
      const numPosts = totalPosts.filter((post) => {
        if (post.category) {
          if (post.category.name === category) { return true; }
        }
        return false;
      }).length;

      // Update the numbers in locals.categories
      locals.categories[i].numVideos = numPosts;
    }

    return next();
  });


  // Render the view
  view.render('tutorials/tutorialsIndex');
};

exports = module.exports;
