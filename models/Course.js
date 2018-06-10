const keystone = require('keystone');

const Types = keystone.Field.Types;

const Course = new keystone.List('Course', {
  label: 'Course',
  autokey: { path: 'slug', from: 'title', unique: true },
});

Course.add({
  name: { type: String, initial: true, required: true },
  basePrice: { type: Types.Number, initial: true, required: true, default: 0 },
});

Course.track = true;
Course.register();
