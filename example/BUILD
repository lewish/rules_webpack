load("@npm_bazel_typescript//:index.bzl", "ts_library")

filegroup(
    name = "css",
    srcs = glob(["**/*.css"]),
)

ts_library(
  name = "example",
  srcs = glob(["**/*.ts", "**/*.tsx"], exclude = ["webpack.ts"]),
  data = [":css"],
  deps = [
      "@npm//@types/node",
      "@npm//@types/react",
      "@npm//@types/react-dom",
      "@npm//react",
      "@npm//react-dom",
  ]
)

# The "bundler" is thought of as an application, and has it's own deps.
ts_library(
    name = "bundler_lib",
    srcs = ["webpack.ts"],
    deps = [
        "//webpack",
        "@npm//@types/node",
        "@npm//@types/webpack",
        "@npm//css-loader",
        "@npm//style-loader",
        "@npm//umd-compat-loader",
        "@npm//webpack",
    ],
)

load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_binary")

# TODO: Package these up in a macro?

nodejs_binary(
    name = "devserver",
    data = [
        ":example",
        ":bundler_lib",
        ":index.html",
    ],
    entry_point = ":webpack.ts",
    tags = [
        "ibazel_notify_changes",
    ],
    templated_args = [
        "--output=./app.bundle.js",
        "--entry=rules_webpack/example/index",
        "--mode=development",
        "--devserver",
    ],
)

nodejs_binary(
    name = "bundler",
    data = [
        ":bundler_lib",
        # TODO: This shouldn't be in the runfiles, but a data input to the following rule.
        ":example"
    ],
    entry_point = ":webpack.ts",
)

load("//webpack:webpack_bundle.bzl", "webpack_bundle")

webpack_bundle(
    name = "bundle",
    bundler = ":bundler",
    data = ["//:tsconfig.json"],
    # TODO: Use a proper label e.g. ":index.ts" like new nodejs_binary rules.
    entry = "rules_webpack/example/index",
    outputs = [
        "app.bundle.js",
    ],
)
