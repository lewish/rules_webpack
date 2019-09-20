load("@build_bazel_rules_nodejs//:defs.bzl", "nodejs_binary")
load("@build_bazel_rules_nodejs//internal/common:collect_es6_sources.bzl", "collect_es6_sources")
load("@build_bazel_rules_nodejs//internal/common:node_module_info.bzl", "NodeModuleSources", "collect_node_modules_aspect")
load("@build_bazel_rules_nodejs//internal/common:sources_aspect.bzl", "sources_aspect")

def _bundle_impl(ctx):
    args = ctx.actions.args()
    args.add("--mode=production")
    args.add("--output={output}".format(output = ctx.outputs.outputs[0].path))
    args.add("--entry={entry}".format(entry = ctx.attr.entry))
    ctx.actions.run(
        inputs = ctx.files.data,
        tools = [ctx.executable.bundler],
        executable = ctx.executable.bundler,
        outputs = ctx.outputs.outputs,
        progress_message = "Building webpack bundle %s" % ctx.outputs.outputs[0].short_path,
        arguments = [args],
    )
    return [DefaultInfo()]

webpack_bundle = rule(
    implementation = _bundle_impl,
    attrs = {
        "entry": attr.string(mandatory = True),
        "deps": attr.label_list(
            aspects = [collect_node_modules_aspect, sources_aspect],
        ),
        "data": attr.label_list(allow_files = True),
        "outputs": attr.output_list(mandatory = True),
        "bundler": attr.label(
            executable = True,
            cfg = "host",
        ),
    },
)
