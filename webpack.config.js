const path = require("path");
const webpack = require("webpack");
const dotenv = require("dotenv");
const env = dotenv.config().parsed;

const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

module.exports = {
  entry: "./bundle.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "/"),
  },
  resolve: {
    fallback: {
      buffer: require.resolve("buffer/"),
      process: require.resolve("process/browser"),
      crypto: require.resolve("crypto-browserify"),
      os: require.resolve("os-browserify/browser"),
      path: require.resolve("path-browserify"),
      stream: require.resolve("stream-browserify"),
      vm: require.resolve("vm-browserify"),
      assert: require.resolve("assert"),
      util: require.resolve("util/"),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser",
    }),
    new webpack.DefinePlugin(envKeys),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "/"),
    },
    port: 3000,
  },
  mode: "development",
};
