const keystone = require('keystone');

const Types = keystone.Field.Types;

const SearchTerm = new keystone.List('SearchTerm', {
  autokey: { from: 'text', path: 'key', unique: true },
  label: 'Search Terms',
});

SearchTerm.add({
  text: { type: String, required: true, initial: false },
  count: { type: Types.Number, default: 1 },
  lastSearch: { type: Date, default: Date.now },
});

SearchTerm.defaultColumns = 'text, count, lastSearch';
SearchTerm.track = true;
SearchTerm.register();
