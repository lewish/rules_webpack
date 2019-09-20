import * as webpack from "webpack";
import * as webpackDevServer from "webpack-dev-server";
import * as yargs from "yargs";

export class BazelResolverPlugin {
  public apply(resolver: any) {
    resolver
      .getHook("resolve")
      .tapAsync(
        BazelResolverPlugin.name,
        (request: { request: string }, resolveContext: any, callback: any) => {
          const newRequest = { ...request };
          if (!request.request.startsWith(".") && !request.request.startsWith("/")) {
            // Use the bazel require.resolve functionality to work out the path for this import.
            try {
              newRequest.request = require.resolve(request.request);
            } catch (e) {
              // If bazel can't find it, it might still resolve normally.
            }
          }
          const target = resolver.ensureHook("parsedResolve");
          return resolver.doResolve(target, newRequest, null, resolveContext, callback);
        }
      );
  }
}

export interface IBazelWebpackOptions {
  mode: "development" | "production";
  output: string;
  entry: string;
  port: string;
}

export interface IBazelWebpackConfiguration extends webpack.Configuration {
  devServer?: webpackDevServer.Configuration;
}

/**
 * Runs the bazel webpack wrapper with the given webpack configuration.
 */
export function run(config: (options: IBazelWebpackOptions) => IBazelWebpackConfiguration) {
  const args = yargs
    .option("mode", { type: "string" })
    .option("devserver", { type: "boolean" })
    .option("output", { type: "string" })
    .option("entry", { type: "string" })
    .option("port", { type: "string" }).argv;
  if (args.devserver) {
    devserver(config({ ...args, mode: (args.mode as any) || "development" }));
  } else {
    process.exitCode = bundle(config({ ...args, mode: args.mode as any }));
  }
}

function devserver(config: IBazelWebpackConfiguration) {
  // There is a bug in dev-server with lazy mode, which this works around.
  // https://github.com/webpack/webpack-dev-server/issues/1323
  const fixedConfig = { ...config, output: { ...config.output, path: "/" } };

  const compiler = webpack(fixedConfig);

  let running = false;
  const singleSimultaneousCompiler: webpack.Compiler = new Proxy(compiler, {
    get: (target: any, p: PropertyKey): any => {
      if (String(p) !== "run") {
        return target[p];
      }
      // Wrap the run() function in some code that blocks until any previous run completes.
      return async (callback: webpack.ICompiler.Handler) => {
        while (running) {
          await new Promise(resolve => setTimeout(() => resolve(), 100));
        }
        running = true;
        target[p]((err: Error, stats: webpack.Stats) => {
          running = false;
          callback(err, stats);
        });
      };
    }
  });

  const devServerOptions: webpackDevServer.Configuration = {
    port: 8080,
    lazy: true,
    filename: config.output.filename,
    // This is called once, while the devserver starts.
    after: (app, server: any) => {
      // Listen to STDIN, which is written to by ibazel to tell it to reload
      // only after all dependent ts_library rules have finished compiling.
      process.stdin.on("data", () => server.sockWrite(server.sockets, "content-changed"));
    },
    ...config.devServer
  };

  const server = new webpackDevServer(singleSimultaneousCompiler, devServerOptions);

  server.listen(devServerOptions.port, "127.0.0.1", () => {
    console.log(`Starting server on http://localhost:${devServerOptions.port}`);
    // Trigger an initial compilation immediately.
    singleSimultaneousCompiler.run(() => undefined);
  });
}

function bundle(config: webpack.Configuration): 0 | 1 {
  const compiler = webpack(config);
  let exitCode: 0 | 1 = 0;
  compiler.run((err, stats) => {
    if (err) {
      console.error(err.stack || err);
      if ((err as any).details) {
        console.error((err as any).details);
      }
      exitCode = 1;
    }
    if (stats.hasErrors()) {
      const json = stats.toJson();
      json.errors.forEach(error => console.error(error));
      exitCode = 1;
    }
  });
  return exitCode;
}
