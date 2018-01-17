var keystone = require('keystone');
var FeedParser = require('feedparser');
var request = require('request');
var Post = keystone.list('Post');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'home';

  // Get blog posts
  view.on('init', function(next) {
    locals.blogPosts = [];
    var feed = request('http://blog.closebrace.com/rss/')
    var feedparser = new FeedParser();

    feed.on('error', function (error) {
      // We'll generate an error on the front-end if null
      locals.blogPosts = null;
    });

    feed.on('response', function (res) {
      var stream = this;
      if (res.statusCode !== 200) {
        this.emit('error', new Error('Bad status code'));
      }
      else {
        stream.pipe(feedparser);
      }
    });

    feedparser.on('error', function (error) {
      // same deal, if there's an error, just go null
      locals.blogPosts = null;
    });

    feedparser.on('readable', function () {
      var stream = this;
      var meta = this.meta;
      var item;
      while (item = stream.read()) {
        if (locals.blogPosts.length < 5) {
          item.summary = item.summary.replace('<p>','');
          item.summary = item.summary.replace('</p>','');
          item.summary = item.summary.substring(0, 100);
          locals.blogPosts.push(item);
        }
      }
    });
    // move on the next step when the parser's done
    feedparser.on('end', next);
  });

  // Load requested posts
  view.on('init', function(next) {
    var q = Post.model.find({
      state: 'published',
      hideFromIndex: false,
    })
    .sort({'publishedAt': -1})
    .limit(12)
    .populate('author categories');

    q.exec(function(err, result) {
      locals.posts = result;
      locals.topTwo = [result[0], result[1]];
      locals.nextFour = [result[2], result[3], result[4], result[5]];
      locals.otherPosts = [];
      for (var i = 6; i < result.length; i++) {
        locals.otherPosts.push(result[i]);
      }
      for (var post in result) {
        var updatedAtFormatted = result[post]._.updatedAt.format('Do MMM YYYY');
        locals.posts[post].updatedAtFormatted = updatedAtFormatted;
        var publishedAtFormatted = locals.posts[post]._.publishedAt.format('YYYY-MM-DD');
        locals.posts[post].publishedAtFormatted = publishedAtFormatted;
      }
      next(err);
    });
  });

	// Render the view
	view.render('index');
};
