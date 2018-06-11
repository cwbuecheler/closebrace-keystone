const keystone = require('keystone');

const Types = keystone.Field.Types;

const PostCategory = new keystone.List('PostCategory', {
  autokey: { from: 'name', path: 'key', unique: true },
  label: 'Post Categories',
});

PostCategory.add({
  name: { type: String, required: true },
  image: { type: Types.CloudinaryImage },
  description: { type: Types.Textarea, height: 150 },
  numVideos: { type: Types.Number, default: 0 },
  totalHours: { type: String },
  hasIntroPage: { type: Boolean, label: 'Has an Intro Page' },
  introPageHtml: { type: Types.Html, height: 500 },
  isPaidCourse: { type: Boolean, label: 'Is a Paid Course' },
});

PostCategory.relationship({ ref: 'Post', refPath: 'category' });

PostCategory.track = true;
PostCategory.register();
