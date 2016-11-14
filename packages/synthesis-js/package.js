Package.describe({
  name: 'mwc:synthesis-js',
  version: '0.6.0',
  summary: 'Compiler plugin that supports ES2015+ in all .js files',
  documentation: 'README.md'
});

Package.registerBuildPlugin({
  name: 'compile-ecmascript',
  use: ['babel-compiler'],
  sources: ['plugin.js']
});

Package.onUse(function (api) {
  api.use('isobuild:compiler-plugin@1.0.0');
  api.use('babel-compiler');

  // The following api.imply calls should match those in
  // ../coffeescript/package.js.
  api.imply('modules');
  api.imply('ecmascript-runtime');
  api.imply('babel-runtime');
  api.imply('promise');
});

Package.onTest(function (api) {
  api.use(["tinytest", "underscore"]);
  api.use(["es5-shim", "ecmascript", "babel-compiler"]);
});
