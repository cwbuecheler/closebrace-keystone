const keystone = require('keystone');
const sanitizer = require('sanitizer');
const nodemailer = require('nodemailer');
const cbOptions = require('../../options.js');

const Comment = keystone.list('Comment');
const User = keystone.list('User');

// create reusable transporter object using the default SMTP transport
const mailString = `smtps://CloseBrace:${cbOptions.mandrill.apiKey}@smtp.mandrillapp.com`;
const transporter = nodemailer.createTransport(mailString);

/**
 * List Comments
 */
exports.list = (req, res) => {
  Comment.model.find((err, items) => {
    if (err) { return res.apiError('database error', err); }
    return res.apiResponse({
      comments: items,
    });
  });
};

/**
 * Get Comment by ID
 */
exports.get = (req, res) => {
  Comment.model.findById(req.params.id).exec((err, item) => {
    if (err) { return res.apiError('database error', err); }
    if (!item) { return res.apiError('not found'); }
    return res.apiResponse({
      comments: item,
    });
  });
};

/**
 * Get Comments by Article ID
 */
exports.getByArticleId = (req, res) => {
  const data = (req.method === 'POST') ? req.body : req.query;

  const query = Comment.model.find({
    state: 'published', relatedPost: data.postId,
  })
  .where('flags', { $lt: 3 })
  .sort('-createdAt')
  .populate('author');

  query.exec((err, results) => {
    // Catch errors
    if (err) {
      return res.apiError('error', err);
    }

    // If there are comments, return them!
    if (results.length > 0) {
      const finalResults = results;
      for (let i = 0; i < results.length; i += 1) {
        const createdAtFormatted = results[i]._.createdAt.format('MMMM Do, YYYY');
        finalResults[i].createdAtFormatted = createdAtFormatted;
      }
      return res.apiResponse(finalResults);
    }

    // If there are no results, return a blank array
    return res.apiResponse([]);
  });
};

/**
 * Create a Comment
 */
exports.create = (req, res) => {
  const item = new Comment.model();
  const data = (req.method === 'POST') ? req.body : req.query;

  if (!req.user) {
    return res.apiError('error', 'No User');
  }

  data.author = req.user.id;
  data.state = 'published';
  data.type = data.isReply === true ? 'reply' : 'comment';
  if (data.content.length > 150) {
    data.contentTrimmed = data.content.trim(0, 150);
  }

  // sanitize form data
  for (const key in data) {
    // skip loop if the property is from prototype
    if (!data.hasOwnProperty(key)) continue;
    if (typeof data[key] === 'string') {
      data[key] = sanitizer.sanitize(data[key]);
    }
  }

  // If it's a reply, see if we need to mail the original author
  if (data.type === 'reply') {
    const originalComment = data.emailCommentId;
    Comment.model.findById(originalComment).populate('author').exec((err, comment) => {

      const unsubscribeUrl = `${req.headers.origin}/comments/unsubscribe/${comment._id}`;
      let plainText = '';
      let htmlText = '';

      if (data.contentTrimmed) {
        plainText = `A new reply to your comment has been posted on CloseBrace. Here's the first few sentences:\n \n ${data.contentTrimmed}...\n\n You can view the whole thing here: ${comment.relatedPostUrl}#${comment._id}\n\n\n\nYou can unsubscribe from replies to this comment by visiting this URL: ${unsubscribeUrl}`;

        htmlText = `<p>A new reply to your comment has been posted on CloseBrace. Here's the first few sentences:</p><p><em>${data.contentTrimmed}</em>&hellip;</p><p>You can view the whole thing here: <a href="${comment.relatedPostUrl}#${comment._id}">${comment.relatedPostUrl}#${comment._id}</a>.</p><br /><br /><p>You can unsubscribe from replies to your comment by clicking this link: <a href="${unsubscribeUrl}">${unsubscribeUrl}</a>.`;
      }
      else {
        plainText = `A new reply to your comment has been posted on CloseBrace: ${data.content}\n\n You can view the comment here: ${comment.relatedPostUrl}#${comment._id}\n\n\n\nYou can unsubscribe from replies to this comment by visiting this URL: ${unsubscribeUrl}`;

        htmlText = `<p>A new reply to your comment has been posted on CloseBrace:</p><p><em>${data.content}</em></p><p>You can view the whole thing here: <a href="${comment.relatedPostUrl}#${comment._id}">${comment.relatedPostUrl}#${comment._id}</a>.</p><br /><br /><p>You can unsubscribe from replies to your comment by clicking this link: <a href="${unsubscribeUrl}">${unsubscribeUrl}</a>.`;
      }

      if (err) { return false; }
      if (comment.mailReplies) {

        // Mail original author about a new comment
        // setup e-mail data with unicode symbols
        const mailOptions = {
          from: '"CloseBrace" <contact@closebrace.com>', // sender address
          to: `${comment.author.email}`, // list of receivers
          subject: 'New Reply To Your CloseBrace Comment', // Subject line
          text: plainText, // plaintext body
          html: htmlText, // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error) => {
          if (error) { return false; }
          return true;
        });
      }
      return false;
    });
  }

  item.getUpdateHandler(req).process(data, function (err) {
    if (err) { return res.apiError('error', err); };

    // Mail CloseBrace about a new comment
    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"CloseBrace" <contact@closebrace.com>', // sender address
      to: 'comments@closebrace.com', // list of receivers
      subject: 'New Comment', // Subject line
      text: 'A new comment has been posted on CloseBrace, on the post "' + data.relatedPostTitle + '". You can view it here: ' + data.relatedPostUrl + '#' + item._id + ' and you can moderate it here: http://closebrace.com/keystone/comments/' + item._id + '\n \n The full text is: \n \n' + data.content, // plaintext body
      html: '<p>A new comment has been posted on CloseBrace, on the post "' + data.relatedPostTitle + '". You can view it here: <a href="' + data.relatedPostUrl + '#' + item._id + '">' + data.relatedPostUrl + '#' + item._id + '</a>, and you can moderate it here: <a href="http://closebrace.com/keystone/comments/' + item._id + '">http://closebrace.com/keystone/comments/' + item._id + '</a>.</p><p>The full text is:<br /><br /><em>' + data.content + '</em>', // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) { console.log(error); }
    });

    res.apiResponse({
      comment: item,
    });
  });
};

/**
 * Update Comment by ID
 */
exports.update = function (req, res) {
  Comment.model.findById(req.params.id).exec(function (err, item) {
    if (err) { return res.apiError('database error', err); }
    if (!item) { return res.apiError('not found'); }
    var data = (req.method === 'POST') ? req.body : req.query;

    // Make sure the user requesting the update is the user who posted the comment
    if (String(item.author) !== String(req.user.id)) {
      return res.apiResponse({ success: false });
    }

    item.getUpdateHandler(req).process(data, function (err) {
      if (err) return res.apiError('update error', err);
      res.apiResponse({
        comment: item,
      });
    });
  });
};

/**
 * Plus-One a Comment
 */
exports.plusone = (req, res) => {
  const query = Comment.model.findById(req.body.id);

  query.exec((err, item) => {
    if (err) { return res.apiError('database error', err); }
    if (!item) { return res.apiError('not found'); }

    // Check if the user already voted
    const alreadyVoted = item.voters.find(user => user === req.user.id);
    if (alreadyVoted) {
      return res.apiResponse('already voted');
    }

    // Otherwise carry on
    const votes = item.votes + 1;
    const newVoters = [...item.voters];
    newVoters.push(req.user.id);
    const data = {
      author: item.author,
      votes,
      voters: newVoters,
    };

    // Give the post author a point, too
    // But only if it's not the same person plus-one-ing
    if (String(item.author) !== String(req.user.id)) {
      User.model.findById(item.author).exec((error, user) => {
        user.score += 1;
        user.save();
      });
    }

    return item.getUpdateHandler(req).process(data, (error, comment) => {
      if (error) return res.apiError('update error', error);
      return res.apiResponse({
        comment,
      });
    });
  });
};

/**
 * Delete Comment by ID
 */
exports.remove = function (req, res) {
  // Make sure the user requesting the delete is an admin
  User.model.findById(req.user.id).exec(function (err, user) {
    if (err) { return res.apiError('database error', err); }
    if (!user) {
      console.log('couldn\'t find user');
      return res.apiResponse({ success: false });
    }
    if (!user.isAdmin) {
      console.log('user is not an admin');
      return res.apiResponse({ success: false });
    }

    Comment.model.findById(req.params.id).exec(function (err, item) {
      console.log(err);
      if (err) { return res.apiError('database error', err); };
      if (!item) { return res.apiError('not found'); };
      item.remove(function (err) {
        if (err) { return res.apiError('database error', err); };
        return res.apiResponse({
          success: true,
        });
      });
    });
  });
};

/**
 * Flag Comment by ID
 */
exports.flag = function (req, res) {

  if (!req.user) {
    return res.apiError('error', 'No User');
  }

  Comment.model.findById(req.body.id).exec(function (err, item) {
    if (err) { return res.apiError('database error', err); };
    if (!item) { return res.apiError('not found'); };
    var flags = item.flags + 1;
    item.flaggers.push(req.body.flagger);
    var data = { isFlagged: true, flags: flags, flaggers: item.flaggers };
    if (flags > 2) {
      data.state = 'hidden';
    }
    item.getUpdateHandler(req).process(data, function (err) {
      if (err) return res.apiError('create error', err);

      // setup e-mail data with unicode symbols
      var mailOptions = {
        from: '"CloseBrace" <contact@closebrace.com>', // sender address
        to: 'twitter@closebrace.com', // list of receivers
        subject: 'Flagged Comment', // Subject line
        text: 'Moderate flagged comment: http://closebrace.com/keystone/comments/' + req.body.id, // plaintext body
        html: '<p>Moderate flagged comment: <a href="http://closebrace.com/keystone/comments/' + req.body.id + '">http://closebrace.com/keystone/comments/' + req.body.id + '</a>', // html body
      };

      // send mail with defined transport object
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) { console.log(error); }
      });

      res.apiResponse({
        comment: item,
      });
    });
  });
};
