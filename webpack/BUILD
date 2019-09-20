package(default_visibility = ["//visibility:public"])

load("@npm_bazel_typescript//:index.bzl", "ts_library")

ts_library(
    name = "webpack",
    srcs = glob(["**/*.ts"]),
    deps = [
        "@npm//@types/node",
        "@npm//@types/webpack",
        "@npm//@types/webpack-dev-server",
        "@npm//@types/yargs",
        "@npm//webpack",
        "@npm//webpack-dev-server",
        "@npm//yargs",
    ],
)
