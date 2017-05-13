var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Comment Model
 * =============
 */
var Comment = new keystone.List('Comment', {
    autokey: { path: 'slug', from: '_id', unique: true },
    defaultSort: '+isFlagged, -createdAt'
});

Comment.add({
  author: { type: Types.Relationship, ref: 'User', index: true, initial: true, required: true, },
  createdAt: { type: Date, default: Date.now },
  createdAtFormatted: { type: String },
  state: { type: Types.Select, options: 'published, hidden', default: 'hidden', index: true, required: true, },
  type: { type: Types.Select, options: 'comment, reply', default: 'comment', index: true, required: true, },
  votes: { type: Number, default: 0 },
  voters: { type: Types.TextArray },
  isFlagged: { type: Boolean, default: false },
  flags: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  isUserDeleted: { type: Boolean, default: false },
  content: { type: Types.Markdown, height: 250, required: true, initial: true, },
  inReplyTo: { type: String, default: null },
  replyToUsername: { type: String, index: true },
  relatedPost: { type: String, index: true },
  relatedPostTitle: { type: String },
  relatedPostUrl: { type: String },
  flaggers: { type: Types.TextArray },
});

// Provide access to Keystone
Comment.schema.virtual('canAccessKeystone').get(function () {
  return this.isAdmin;
});


/**
 * Registration
 */
Comment.defaultColumns = 'author, isFlagged, flags, createdAt';
Comment.register();
