var keystone = require('keystone');
var sanitizer = require('sanitizer');

var Post = keystone.list('Post');
var Category = keystone.list('PostCategory');
var Tag = keystone.list('Tag');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;
  locals.searchTerms = req.body.searchTerms;

  // sanitize form data for obvious reasons
  for (var key in locals.formData) {
    // skip loop if the property is from prototype
    if (!locals.formData.hasOwnProperty(key)) continue;
    if (typeof locals.formData[key] === 'string') {
      locals.formData[key] = sanitizer.sanitize(locals.formData[key]);
    }
  }

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'home';

  // Get Categories
  view.on('init', function(next) {

    if(req.body.searchTerms === '' || !req.body.searchTerms) {
      locals.categories = null;
      return next();
    }
    else {
      var q = Category.model.find({
        name: new RegExp(req.body.searchTerms, 'i')
      });

      q.exec(function(err, results) {
        if(results) {
          locals.categories = results;
        }
        else {
          locals.categories = null;
        }
        return next(err);
      });
    }
  });

  // Get Tags
  view.on('init', function(next) {
    if(req.body.searchTerms === '' || !req.body.searchTerms) {
      locals.tags = null;
      return next();
    }
    else {
      var q = Tag.model.find({
        name: new RegExp(req.body.searchTerms, 'i')
      });

      q.exec(function(err, results) {
        if(results) {
          locals.tags = results;
        }
        else {
          locals.tags = null;
        }
        return next(err);
      });
    }
  });

  // Get Posts
  view.on('post', function(next) {
    if(req.body.searchTerms === '' || !req.body.searchTerms) {
      locals.posts = null;
      return next();
    }
    else {
      var regex = new RegExp(req.body.searchTerms, 'i');
      var q = Post.model.find()
      .where('content.md', regex)
      .sort({'publishedAt': -1});

      q.exec(function(err, results) {
        if(results) {
          locals.posts = results;
        }
        else {
          locals.posts = null;
        }

        for (var post in locals.posts) {
          var updatedAtFormatted = locals.posts[post]._.updatedAt.format('Do MMM YYYY');
          locals.posts[post].updatedAtFormatted = updatedAtFormatted;
          var publishedAtFormatted = locals.posts[post]._.publishedAt.format('YYYY-MM-DD');
          locals.posts[post].publishedAtFormatted = publishedAtFormatted;
        }

        return next(err);
      });
    }
  });

  // Render the view
  view.render('searchResults');
};
