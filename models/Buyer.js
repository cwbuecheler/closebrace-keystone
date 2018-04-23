const keystone = require('keystone');

const Types = keystone.Field.Types;

const Buyer = new keystone.List('Buyer', {
  label: 'Buyers',
});

Buyer.add({
  courses: { type: Types.Relationship, ref: 'Course', emptyOption: true },
  email: { type: Types.Email, initial: true, required: true, index: true },
  hash: { type: String },
});

// Buyer.relationship({ ref: 'Category', refPath: 'buyers' });

Buyer.track = true;
Buyer.register();
