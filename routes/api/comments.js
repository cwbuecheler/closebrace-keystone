var keystone = require('keystone');
var sanitizer = require('sanitizer');
var nodemailer = require('nodemailer');
var cbOptions = require('../../options.js');

var Comment = keystone.list('Comment');
var User = keystone.list('User');

// create reusable transporter object using the default SMTP transport
var mailString = 'smtps://CloseBrace:' + cbOptions.mandrill.apiKey + '@smtp.mandrillapp.com';
var transporter = nodemailer.createTransport(mailString);

/**
 * List Comments
 */
exports.list = function (req, res) {
  Comment.model.find(function (err, items) {
    if (err) { return res.apiError('database error', err); };
    res.apiResponse({
      comments: items,
    });
  });
};

/**
 * Get Comment by ID
 */
exports.get = function (req, res) {
  Comment.model.findById(req.params.id).exec(function (err, item) {
    if (err) { return res.apiError('database error', err); };
    if (!item) { return res.apiError('not found'); };
    res.apiResponse({
      comments: item,
    });
  });
};

/**
 * Get Comments by Article ID
 */
exports.getByArticleId = function (req, res) {

  var data = (req.method === 'POST') ? req.body : req.query;

  var query = Comment.model.find({
    state: 'published', relatedPost: data.postId,
  })
  .where('flags', { $lt: 3 })
  .sort('-createdAt')
  .populate('author');

  query.exec(function (err, results) {

    // Catch errors
    if (err) {
      return res.apiError('error', err);
    }

    // If no comments, move along
    if (results.length < 1) {
      return res.apiResponse([]);
    }

    // If there are comments, return them!
    if (results.length > 0) {
      for (var i = 0; i < results.length; i++) {
        var createdAtFormatted = results[i]._.createdAt.format('MMMM Do, YYYY');
        results[i].createdAtFormatted = createdAtFormatted;
      }
      return res.apiResponse(results);
    }
  });
};

/**
 * Create a Comment
 */
exports.create = function (req, res) {
  var item = new Comment.model();
  var data = (req.method === 'POST') ? req.body : req.query;

  if (!req.user) {
    return res.apiError('error', 'No User');
  }

  data.author = req.user.id;
  data.state = 'published';
  data.type = data.isReply === true ? 'reply' : 'comment';

  // sanitize form data
  for (var key in data) {
    // skip loop if the property is from prototype
    if (!data.hasOwnProperty(key)) continue;
    if (typeof data[key] === 'string') {
      data[key] = sanitizer.sanitize(data[key]);
    }
  }

  item.getUpdateHandler(req).process(data, function (err) {
    if (err) { return res.apiError('error', err); };

    // Mail CloseBrace about a new comment
    // setup e-mail data with unicode symbols
    var mailOptions = {
      from: '"CloseBrace" <contact@closebrace.com>', // sender address
      to: 'contact@closebrace.com', // list of receivers
      subject: 'New Comment', // Subject line
      text: 'A new comment has been posted on CloseBrace. You can view it here: ' + data.relatedPostUrl + ' and you can moderate it here: http://closebrace.com/keystone/comments/' + item._id, // plaintext body
      html: '<p>A new comment has been posted on CloseBrace. You can view it here: <a href="' + data.relatedPostUrl + '">' + data.relatedPostUrl + '</a>, and you can moderate it here: <a href="http://closebrace.com/keystone/comments/' + item._id + '">http://closebrace.com/keystone/comments/' + item._id + '</a>', // html body
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
  Comment.model.findById(req.body.id).exec((err, item) => {
    if (err) { return res.apiError('database error', err); }
    if (!item) { return res.apiError('not found'); }

    // Check if the user already voted
    const alreadyVoted = item.voters.find(user => user === req.user.id);
    if (alreadyVoted) {
      return res.apiResponse('already voted');
    }

    // Otherwise carry on
    const votes = item.votes + 1;
    const voters = item.voters;
    voters.push(req.user.id);
    const data = {
      votes,
      voters,
    };

    // Give the post author a point, too
    // But only if it's not the same person plus-one-ing
    if (String(item.author) !== String(req.user.id)) {
      User.model.findById(item.author).exec((error, user) => {
        user.score += 1;
        user.save();
      });
    }

    item.getUpdateHandler(req).process(data, (error, comment) => {
      if (err) return res.apiError('update error', err);
      return res.apiResponse({
        comment,
      });
    });

    return false;
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
        to: 'flags@closebrace.com', // list of receivers
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
