import {
  BazelResolverPlugin,
  IBazelWebpackConfiguration,
  run
} from "rules_webpack/webpack";
import * as path from "path";
import * as webpack from "webpack";

// Notable things:
// - We don't set the output, must be set on the command line
// - We have seperate CSS loaders for our code and modules
// - We user require.resolve so that webpack can find these modules in a Bazel context
// - The tsconfig paths plugin fixes file resolution in a bazel context (dfco/)

run(options => ({
  mode: options.mode,
  entry: [options.entry],
  output: {
    path: path.dirname(path.resolve(options.output)),
    filename: path.basename(options.output)
  },
  optimization: {
    minimize: options.mode === "production"
  },
  watchOptions: {
    ignored: [/node_modules/]
  },
  stats: {
    warnings: true
  },
  devServer: {
    port: 8080,
    open: false,
    publicPath: "/",
    contentBase: path.resolve("./example"),
    stats: {
      colors: true
    }
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".css"],
    plugins: [new BazelResolverPlugin()],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          { loader: require.resolve("style-loader") },
          {
            loader: require.resolve("css-loader"),
            query: {
              modules: true
            }
          }
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{ loader: require.resolve("umd-compat-loader") }]
      }
    ]
  }
}));
