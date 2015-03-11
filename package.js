Package.describe({
  name: 'meteorflux:dispatcher',
  version: '1.0.1',
  // Brief, one-line summary of the package.
  summary: 'A Flux Dispatcher for Meteor, based on the Facebook\'s Flux Dispatcher',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/MeteorFlux/Dispatcher.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: null
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles('meteorflux:dispatcher.js');
  api.export('MeteorFlux');
  api.export('Dispatcher');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('meteorflux:dispatcher');
  api.addFiles('meteorflux:dispatcher-tests.js');
});
