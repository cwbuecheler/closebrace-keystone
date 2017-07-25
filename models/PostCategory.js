var keystone = require('keystone');
var Types = keystone.Field.Types;

var PostCategory = new keystone.List('PostCategory', {
  autokey: { from: 'name', path: 'key', unique: true },
  label: 'Post Categories',
});

PostCategory.add({
  name: { type: String, required: true },
});

PostCategory.relationship({ ref: 'Post', refPath: 'category' });

PostCategory.track = true;
PostCategory.register();
