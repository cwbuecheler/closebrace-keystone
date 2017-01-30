var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Comment Model
 * =============
 */
var Comment = new keystone.List('Comment', {
    autokey: { path: 'slug', from: '_id', unique: true },
    defaultSort: '-publishedAt'
});

Comment.add({
  author: { type: Types.Relationship, ref: 'User', index: true, initial: true, required: true, },
  createdAt: { type: Date, default: Date.now },
  state: { type: Types.Select, options: 'published, hidden', default: 'hidden', index: true, required: true, },
  votes: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
  flags: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false },
  content: { type: Types.Markdown, height: 250, required: true, initial: true, },
  inReplyTo: { type: String, default: null },
  relatedPost: { type: String, index: true, noedit: true, },
});

// Provide access to Keystone
Comment.schema.virtual('canAccessKeystone').get(function () {
  return this.isAdmin;
});


/**
 * Registration
 */
Comment.register();
