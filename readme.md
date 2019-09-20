## Running the devserver

```bash
ibazel run example:devserver
```

## Building production outputs

```bash
bazel build example:app.bundle.js
```

## Next steps

- Upgrade to latest rules_nodejs, and all other bazel deps (currently tested running on bazel 0.29.1)
- Copy the node_modules linking behaviour in rollup_bundle so we can remove the webpack BazelResolverPlugin
- Move code to data from the bundler runfiles (blocked on above)
- Package up these rules into a macro so they are easier to use
- Invert the relationship between the bundler entry point and the users webpack code. Currently user code calls the libraries under `/webpack` to create a binary. The more webpack way (I think) would be to run the bazel_webpack bundler binary, passing in the user bundler library (in this example, the contents of `/example/webpack.ts`).
