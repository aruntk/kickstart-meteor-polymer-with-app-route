Package.describe({
  name: 'mwc:synthesis',
  version: '1.0.42',
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
  api.use('mwc:synthesis');
  api.mainModule('synthesis-tests.js');
});


Package.registerBuildPlugin({
  name: 'synthesis',
  use: [
    'caching-compiler@1.0.0',
    'ecmascript@0.4.1',
    'underscore@1.0.8',
    'check@1.2.1',
    'babel-compiler@6.6.4'  
  ],
  sources: [
    'plugin/synthesis.js',
  ],
  npmDependencies: {
    'cheerio': '0.19.0'
  }
});
