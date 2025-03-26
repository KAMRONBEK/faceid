module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Source map xatolarini e'tiborsiz qoldirish
      webpackConfig.ignoreWarnings = [
        { module: /node_modules\/@tensorflow-models\/coco-ssd/ },
        { file: /node_modules\/@tensorflow-models\/coco-ssd/ }
      ];
      
      return webpackConfig;
    }
  },
  jest: {
    configure: {
      moduleNameMapper: {
        '^@tensorflow-models/coco-ssd$': '<rootDir>/node_modules/@tensorflow-models/coco-ssd/dist/coco-ssd.es2017.esm.min.js'
      }
    }
  }
};