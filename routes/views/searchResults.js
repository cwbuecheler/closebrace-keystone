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
      next(err);
    });
  });

  // Get Tags
  view.on('init', function(next) {
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
      next(err);
    });
  });

  // Get Posts
  view.on('post', function(next) {
    console.log(req.body.searchTerms);
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
      next(err);
    });
  });

  // Render the view
  view.render('searchResults');
};
