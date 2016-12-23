var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Post Model
 * ==========
 */
var Post = new keystone.List('Post', {
    autokey: { path: 'slug', from: 'title', unique: true },
    map: { name: 'title' },
    defaultSort: '-publishedAt'
});

Post.add({
  title: { type: String, required: true, initial: true },
  subHead: { type: String, required: true, initial: true },
  author: { type: Types.Relationship, ref: 'User', index: true },
  postType: { type: Types.Select, options: 'Tutorial, Article, Blog, Other'},
  state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
  author: { type: Types.Relationship, ref: 'User' },
  tags: { type: Types.Relationship, ref: 'Tag', many: true },
  mainImage: { type: Types.CloudinaryImage },
  contentImages: { type: Types.CloudinaryImages },
  createdAt: { type: Date, default: Date.now },
  publishedAt: { type: Date, noedit: true, watch: { state: 'published' }, value: Date.now },
  updatedAt: { type: Date, noedit: true, watch: true, value: Date.now },
  content: { type: Types.Markdown, height: 400 },
});

// Provide access to Keystone
Post.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});


/**
 * Registration
 */
Post.defaultColumns = 'postType, title, author, publishedAt, updatedAt';
Post.register();
