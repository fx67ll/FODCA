const webpack = require(
  require.resolve("webpack", {
    paths: [process.env.UNI_CLI_CONTEXT || __dirname],
  })
);

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/),
    ],
  },
};
