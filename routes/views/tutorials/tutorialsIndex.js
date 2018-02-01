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

  // Render the view
  view.render('tutorials/tutorialsIndex');
};
