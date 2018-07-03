const keystone = require('keystone');

const Post = keystone.list('Post');

exports = (req, res) => {
  const view = new keystone.View(req, res);
  const locals = res.locals;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'lessons';

  // Load requested posts
  view.on('init', (next) => {
    const q = Post.model.find({
      state: 'published',
      postType: 'Lesson',
      hideFromIndex: false,
    })
    .sort('publishedAt')
    .populate('author categories');

    q.exec((err, results) => {
      // If no posts, move along
      if (results.length < 1) {
        locals.posts = null;
        return next(err);
      }

      locals.posts = results;

      return next(err);
    });
  });

  // Render the view
  view.render('courses/coursesIndex');
};

module.exports = exports;
