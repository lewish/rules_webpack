load("@npm_bazel_typescript//:index.bzl", "ts_library")

filegroup(
    name = "css",
    srcs = glob(["**/*.css"]),
)

ts_library(
  name = "example",
  srcs = glob(["**/*.ts", "**/*.tsx"], exclude = ["webpack.config.ts"]),
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
# This effectively webpack + webpack.config.js.
ts_library(
    name = "config",
    srcs = ["webpack.config.ts"],
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
        ":config",
        ":index.html",
        "//webpack"
    ],
    entry_point = "//webpack:devserver.ts",
    tags = [
        "ibazel_notify_changes",
    ],
    templated_args = [
        "--output=./app.bundle.js",
        "--entry=rules_webpack/example/index",
        "--mode=development",
        "--config=rules_webpack/example/webpack.config.js"
    ],
)

load("//webpack:webpack_bundle.bzl", "webpack_bundle")

webpack_bundle(
    name = "bundle",
    config = ":webpack.config.ts",
    deps = [":example", ":config"],
    data = ["//:tsconfig.json"],
    entry = ":index.tsx",
    outputs = [
        "app.bundle.js",
    ],
)
