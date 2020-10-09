#!/usr/bin/env deno --allow-net --allow-web --allow-env

import {
  Application,
  compose_handlers,
  error_response,
  legacy_wrapper,
} from "./mod.ts";
import type { RequestHandler, ServerRequest, ServerResponse } from "./mod.ts";
import { ModuleResolver } from "./resolver.ts";
import { error, logger } from "./middleware/index.ts";
import { Args, parse, red } from "./deps.ts";

const parse_args = async (): Promise<Args> => {
  const args = parse(Deno.args, {
    boolean: ["tag"],
    default: {
      port: Deno.env.get("PORT") ?? 8080,
      tag: false,
    },
  });

  if (args._.length < 1) {
    args._.push(Deno.cwd());
  }

  try {
    args._[0] = await Deno.realPath(args._[0] as string);
  } catch {
    console.error(red(`Unable to serve files from: ${args._[0]}`));
    Deno.exit(1);
  }

  return args;
};

async function create_server() {
  const args = await parse_args();
  const app = new Application({ port: args.port });
  const resolver = new ModuleResolver(args._[0] as string, args.tag);

  app.use(logger);

  app.use(
    async (
      req: ServerRequest,
      res: ServerResponse,
      next?: (err?: Error) => Promise<void>,
    ): Promise<void> => {
      const handlers: RequestHandler[] = [];
      const path = req.url.split("/");
      path[0] = ".";

      try {
        const middleware = await resolver.recursive_resolve(
          `${[...path, "_middleware"].join("/")}`,
        );
        if (middleware && middleware.middleware) {
          handlers.push(middleware.middleware);
        }

        const default_handlers = await resolver.recursive_resolve(
          `${[...path, "_default"].join("/")}`,
        );

        const route_handlers = await resolver.resolve(path.join("/")) ??
          default_handlers;
        if (route_handlers) {
          if (req.method.toLowerCase() in route_handlers) {
            handlers.push(route_handlers[req.method.toLowerCase()]);
          } else if ("default" in route_handlers) {
            handlers.push(route_handlers.default);
          } else {
            handlers.push(
              error_response(
                405,
                (req) =>
                  `Error: No handler for ${req.method.toUpperCase()} at ${req.url}`,
              ),
            );
          }
        } else {
          handlers.push(
            error_response(404, (req) => `Error: No handler for ${req.url}`),
          );
        }

        const error = await resolver.recursive_resolve(
          `${[...path, "_error"].join("/")}`,
        );
        if (error && error.error) {
          handlers.push(error.error);
        }
      } catch (error) {
        // We shouldn't get this, but it could happen with an invalid typescript handler.
        console.error(`ERROR: ${error}\n${error.stack}`);
        handlers.push(
          error_response(
            500,
            (req) => `Error: Unable to parse handler at ${req.url}`,
          ),
        );
      }

      const handler: RequestHandler =
        compose_handlers(...handlers.map(legacy_wrapper)) ??
          error_response(500, (req) => res.body = `No handler for ${req.url}`);
      await legacy_wrapper(handler)(req, res, next);
    },
  );

  app.use(error);

  console.log("Serving files from:", args._[0]);
  console.log(`Listening at http://localhost:${args.port}/`);
  await app.listen();
}

if (import.meta.main) {
  create_server();
}
