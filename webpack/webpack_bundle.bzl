load("@build_bazel_rules_nodejs//internal/linker:link_node_modules.bzl", "module_mappings_aspect", "register_node_modules_linker")
load("@build_bazel_rules_nodejs//internal/common:node_module_info.bzl", "NodeModuleSources", "collect_node_modules_aspect")
load("@build_bazel_rules_nodejs//internal/common:collect_es6_sources.bzl", "collect_es6_sources")

_DOC = """TODO"""

_ATTRS = {
    "entry": attr.label(
        mandatory = True,
        allow_single_file = [".js", ".ts", ".jsx", ".tsx"],
    ),
    "config": attr.label(
        mandatory = True,
        allow_single_file = [".js", ".ts"],
    ),
    "deps": attr.label_list(
        aspects = [module_mappings_aspect, collect_node_modules_aspect],
    ),
    "data": attr.label_list(allow_files = True),
    "outputs": attr.output_list(mandatory = True),
    "bundler": attr.label(
        default = Label("//webpack:bundle"),
        executable = True,
        cfg = "host",
    ),
}

def _no_ext(f):
    return f.short_path[:-len(f.extension) - 1]

def _bundle_impl(ctx):
    args = ctx.actions.args()

    es6_sources = collect_es6_sources(ctx).to_list()

    print(es6_sources)

    # deps = depset(
    #   ctx.files.data,
    #   transitive = [dep[GoLibrary].deps for dep in ctx.attr.deps],
    # )

    # for dep in ctx.attr.deps:
    #   print(dep.__dict__)

    inputs = [] + ctx.files.data + ctx.files.deps + es6_sources

    register_node_modules_linker(ctx, args, inputs)

    args.add("--mode=production")
    args.add("--output={output}".format(output = ctx.outputs.outputs[0].path))
    # TODO: this path should be execroot-relative
    # so it shouldn't need the ctx.workspace_name prefix
    args.add("--entry={entry}".format(entry = ctx.workspace_name + "/" + _no_ext(ctx.file.entry)))
    args.add("--config={config}".format(config = ctx.workspace_name + "/" + _no_ext(ctx.file.config)))
    ctx.actions.run(
        inputs = inputs,
        tools = [ctx.executable.bundler],
        executable = ctx.executable.bundler,
        outputs = ctx.outputs.outputs,
        progress_message = "Building webpack bundle %s" % ctx.outputs.outputs[0].short_path,
        arguments = [args],
    )

webpack_bundle = rule(
    implementation = _bundle_impl,
    doc = _DOC,
    attrs = _ATTRS,
)
