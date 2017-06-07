const keystone = require('keystone');

const Comment = keystone.list('Comment');

module.exports = (req, res) => {
  const view = new keystone.View(req, res);
  const locals = res.locals;

  if (!req.user) {
    req.flash('error', { detail: 'Sorry, you must be logged in to ubsubcribe. Please log in, then click your email link again.' });
    return res.redirect('/');
  }

  // Load requested comment
  view.on('init', (next) => {
    const q = Comment.model.findOne({
      _id: req.params.id,
    })
    .populate('author');

    q.exec((err, result) => {
      locals.comment = result;
      locals.correctUser = true;

      // Make sure the user requesting the unsub is the logged-in user
      if (locals.comment.author._id.toString() === req.user._id.toString()) {
        next();
      }
      else {
        res.redirect('/');
      }
    });
  });

  view.on('post', (next) => {
    const data = { emailReplies: false };

    locals.comment.getUpdateHandler(req).process(data, (error, comment) => {
      if (error) {
        req.flash('error', { detail: 'Something went wrong while trying to unsubscribe you. Please try again.' });
        return res.redirect(comment.relatedPostUrl);
      }

      req.flash('success', { detail: 'You have been unsubscribed from email replies on your comment on this post.' });
      return res.redirect(comment.relatedPostUrl);
    });
  });

  // Render the view
  view.render('comments/unsubscribe');
};
