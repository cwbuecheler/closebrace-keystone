const keystone = require('keystone');

const Types = keystone.Field.Types;

const Coupon = new keystone.List('Coupon', {
  label: 'Coupons',
});

Coupon.add({
  code: { type: String, initial: true, required: true },
  expiration: { type: Types.Date },
  percentage: { type: Types.Number },
  courses: { type: Types.Relationship, ref: 'Course' },
});

Coupon.track = true;
Coupon.register();
