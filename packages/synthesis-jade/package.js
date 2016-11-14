Package.describe({
  name: 'mwc:synthesis-jade',
  version: '1.0.46',
  summary: 'Synthesis is meteor + polymer',
  git: 'https://github.com/meteorwebcomponents/synthesis',
  documentation: 'README.md',
});

Package.onUse((api) => {
  api.versionsFrom('1.3');
  api.use('ecmascript');
  api.use('isobuild:compiler-plugin@1.0.0');
  api.addFiles('synthesis-client.js', 'client');
  api.export('Synthesis', ['client']);
});

Package.onTest((api) => {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('mwc:synthesis-jade');
  api.mainModule('synthesis-jade-tests.js');
});


Package.registerBuildPlugin({
  name: 'synthesis-jade',
  use: [
    'mwc:synthesis-compiler@1.0.40',
    'caching-html-compiler@1.0.7',
    'ecmascript@0.4.1',
    'templating-tools@1.0.5',
  ],
  sources: [
    'plugin/synthesis.js',
  ],
  npmDependencies: {
    jade: '1.11.0',
  },
});
