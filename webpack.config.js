const path    = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "production",
  entry: "./src/mushroom-strategy.js",
  output: {
    filename: "mushroom-strategy.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ],
};
