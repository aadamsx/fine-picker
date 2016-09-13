Package.describe({
  name: 'aadams:fine-picker',
  summary: 'Server Side Router for Meteor',
  version: '1.0.0',
  git: 'https://github.com/aadamsx/fine-picker'
});

Npm.depends({
  'path-to-regexp': '1.2.1'
});

Package.onUse(function(api) {
  configurePackage(api);
  api.export(['FinePicker']);
});

Package.onTest(function(api) {
  configurePackage(api);
  api.use(['tinytest', 'http', 'random'], ['server']);
  api.addFiles([
    'test/instance.js'
  ], ['server']);
});

function configurePackage(api) {
  if(api.versionsFrom) {
    api.versionsFrom('METEOR@1.2');
  }

  api.use(['webapp', 'underscore'], ['server']);
  api.addFiles([
    'lib/implementation.js',
    'lib/instance.js',
  ], ['server']);
}
