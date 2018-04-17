const keystone = require('keystone');
const sanitizer = require('sanitizer');

const Post = keystone.list('Post');
const Category = keystone.list('PostCategory');
const SearchTerm = keystone.list('SearchTerm').model;

exports = module.exports = function (req, res) {

  const view = new keystone.View(req, res);
  const locals = res.locals;
  locals.searchTerms = req.body.searchTerms;

  // sanitize form data for obvious reasons
  for (const key in locals.formData) {
    // skip loop if the property is from prototype
    if (!locals.formData.hasOwnProperty(key)) continue;
    if (typeof locals.formData[key] === 'string') {
      locals.formData[key] = sanitizer.sanitize(locals.formData[key]);
    }
  }

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'home';

  // Record the search term
  view.on('init', (next) => {
    if (req.body.searchTerms === '' || !req.body.searchTerms) {
      locals.categories = null;
      return next();
    }

    const q = SearchTerm.findOne({
      text: new RegExp(req.body.searchTerms, 'i'),
    });

    q.exec((err, result) => {
      if (result) {
        locals.foundTerm = result;
        // Increment the count of the existing term
        locals.foundTerm.count += 1;
        locals.foundTerm.lastSearch = new Date();
        locals.foundTerm.save((error) => {
          if (error) {
            return next(err);
          }
          return next();
        });
      }
      else if (err) {
        // fail gracefully
        return next(err);
      }
      else {
        // Create a new search term
        const newTerm = new SearchTerm({ text: req.body.searchTerms });

        newTerm.save((error) => {
          if (error) {
            // fail gracefully
            return next(err);
          }
          return next();
        });
      }
    });
  });

  // Get Categories
  view.on('init', (next) => {

    if (req.body.searchTerms === '' || !req.body.searchTerms) {
      locals.categories = null;
      return next();
    }

    const q = Category.model.find({
      name: new RegExp(req.body.searchTerms, 'i'),
    });

    q.exec((err, results) => {
      if (results) {
        locals.categories = results;
      }
      else {
        locals.categories = null;
      }
      return next(err);
    });
  });

  // Get Posts
  view.on('post', (next) => {
    if (req.body.searchTerms === '' || !req.body.searchTerms) {
      locals.posts = null;
      return next();
    }

    const regex = new RegExp(req.body.searchTerms, 'i');
    const q = Post.model.find()
    .where('content.md', regex)
    .sort({ publishedAt: -1 })
    .populate('category');

    q.exec((err, results) => {
      if (results) {
        const filteredPosts = results.filter((post) => {
          if (post.category && post.category.key) {
            return post.category.key !== 'five-minute-react';
          }
          return true;
        });
        locals.posts = filteredPosts;
      }
      else {
        locals.posts = null;
      }

      for (const post in locals.posts) {
        const updatedAtFormatted = locals.posts[post]._.updatedAt.format('Do MMM YYYY');
        locals.posts[post].updatedAtFormatted = updatedAtFormatted;
        const publishedAtFormatted = locals.posts[post]._.publishedAt.format('YYYY-MM-DD');
        locals.posts[post].publishedAtFormatted = publishedAtFormatted;
      }

      return next(err);
    });
  });

  // Render the view
  view.render('searchResults');
};
