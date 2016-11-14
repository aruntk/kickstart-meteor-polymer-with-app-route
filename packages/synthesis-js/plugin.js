const BCp = BabelCompiler.prototype;

BCp.processFilesForTarget = function (inputFiles) {
  // Reset this cache for each batch processed.
  this._babelrcCache = null;

  inputFiles.forEach(function (inputFile) {
    var toBeAdded = this.processOneFileForTarget(inputFile);
    if (toBeAdded) {
      inputFile.addJavaScript(toBeAdded);
      inputFile.addAsset(toBeAdded);
    }
  }, this);
};
Plugin.registerCompiler({
  extensions: ['js'],
}, function () {
  return new BabelCompiler({
  });
});
