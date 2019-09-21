import {
  BazelResolverPlugin,
  IBazelWebpackOptions
} from "rules_webpack/webpack";
import * as path from "path";

module.exports = (env: any, argv: IBazelWebpackOptions) => ({
  mode: argv.mode,
  entry: [argv.entry],
  output: {
    path: path.dirname(path.resolve(argv.output)),
    filename: path.basename(argv.output)
  },
  optimization: {
    minimize: argv.mode === "production"
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
    // This makes sure we can resolve modules in bazel, but only works in runfiles.
    // TODO: Copy rollup_bundle node_modules linking example so we can remove this.
    // plugins: [new BazelResolverPlugin()]
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
});
