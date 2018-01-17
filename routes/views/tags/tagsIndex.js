var keystone = require('keystone');
var Post = keystone.list('Post');

exports = module.exports = function (req, res) {

  var view = new keystone.View(req, res);
  var locals = res.locals;

  // locals.section is used to set the currently selected
  // item in the header navigation.
  locals.section = 'tags';
  locals.tag = req.params.tag.toLowerCase();
  locals.tagName = locals.tag;

  // Load requested posts
  view.on('init', function(next) {
    var q = Post.model.find({
      state: 'published',
      hideFromIndex: false,
    })
    .sort('-createdAt')
    .populate('author categories tags');

    // TODO: I think this can be done with mongoose filtering instead of the for loop
    q.exec(function(err, results) {
      var finalPosts = [];
      for(var i = 0; i < results.length; i++) {
        var result = results[i];
        var resultTags = result.tags;
        for(var t = 0; t < resultTags.length; t++) {
          if (resultTags[t].key === locals.tag) {
            finalPosts.push(result);
            // this is just so we have a prettier version of the tag to reference in the title
            // doesn't really matter if it gets overwritten multiple times.
            locals.tagName = resultTags[t].name;
          }
        }
      }
      for (var post in finalPosts) {
        var updatedAtFormatted = finalPosts[post]._.updatedAt.format('Do MMM YYYY');
        finalPosts[post].updatedAtFormatted = updatedAtFormatted;
        var publishedAtFormatted = finalPosts[post]._.publishedAt.format('YYYY-MM-DD');
        finalPosts[post].publishedAtFormatted = publishedAtFormatted;
      }
      locals.posts = finalPosts;
      next(err);
    });
  });

  // Render the view
  view.render('tags/tagsIndex');
};

function hasTag(item, tag) {
  if (item.tags.key === tag) {
    return true;
  }
  return false;
}