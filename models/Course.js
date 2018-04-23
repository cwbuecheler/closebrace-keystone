const keystone = require('keystone');

const Types = keystone.Field.Types;

const Course = new keystone.List('Course', {
  label: 'Course',
  autokey: { path: 'slug', from: 'title', unique: true },
});

Course.add({
  name: { type: String, initial: true, required: true },
  basePrice: { type: Types.Number, required: true },
});

Course.track = true;
Course.register();
