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
  numVideos: { type: Types.Number },
  totalHours: { type: String },
});

PostCategory.relationship({ ref: 'Post', refPath: 'category' });

PostCategory.track = true;
PostCategory.register();
