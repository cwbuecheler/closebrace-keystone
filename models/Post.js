const keystone = require('keystone');

const Types = keystone.Field.Types;

/**
 * Post Model
 * ==========
 */
const Post = new keystone.List('Post', {
  autokey: { path: 'slug', from: 'title', unique: true },
  map: { name: 'title' },
  defaultSort: '-publishedAt',
});

Post.add({
  title: { type: String, required: true, initial: true },
  subHead: { type: String, required: true, initial: true },
  author: { type: Types.Relationship, ref: 'User', filters: { isAuthor: 'true' }, index: true },
  postType: { type: Types.Select, options: 'Tutorial, Article, Lesson, Blog, Other' },
  course: { type: Types.Relationship, ref: 'Course', many: true, emptyOption: true },
  lessonNumber: { type: Types.Number },
  category: { type: Types.Relationship, ref: 'PostCategory', emptyOption: true },
  state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
  tags: { type: Types.Relationship, ref: 'Tag', many: true, emptyOption: true },
  mainImage: { type: Types.CloudinaryImage },
  videoURL: { type: String },
  videoDownloadURL: { type: String },
  createdAt: { type: Date, default: Date.now },
  publishedAt: { type: Date, noedit: true, watch: { state: 'published' }, value: Date.now },
  updatedAt: { type: Date, noedit: true, watch: true, value: Date.now },
  tutorialInfo: {
    type: Types.Markdown,
    height: 150,
    sanitizeOptions: {
      allowedTags: false,
      allowedAttributes: false,
    },
  },
  contentImages: { type: Types.CloudinaryImages },
  content: {
    type: Types.Markdown,
    height: 500,
    sanitizeOptions: {
      allowedTags: false,
      allowedAttributes: false,
    },
  },
  unlockDate: { type: Date, default: new Date(2000, 0, 1, 0, 0, 0) },
  // comments: { type: Types.Relationship, ref: 'Comment', many: true, hidden: true },
}, 'Permissions', {
  isProLocked: { type: Boolean, label: 'Is Pro Locked', index: true },
  hideFromIndex: { type: Boolean, label: 'Hide From Index', default: false },
});

// Provide access to Keystone
Post.schema.virtual('canAccessKeystone').get(() => this.isAdmin);

Post.schema.methods.isPublished = function() {
    return true;
}

/**
 * Registration
 */
Post.defaultColumns = 'postType, title, author, publishedAt, updatedAt';
Post.register();
