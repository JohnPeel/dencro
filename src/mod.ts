import { serve } from "./deps.ts";
import type {
  HTTPOptions,
  Server,
  ServerRequest,
  ServerResponse,
} from "./deps.ts";
import { compose_handlers, error_response, legacy_wrapper } from "./util.ts";
import { Response } from "./response.ts";

export { compose_handlers, error_response, legacy_wrapper } from "./util.ts";
export type { ServerRequest, ServerResponse } from "./deps.ts";

export type LegacyRequestHandler = (req: ServerRequest) => string;
export type ModernRequestHandler = (
  req: ServerRequest,
  res: ServerResponse,
  next?: (err?: Error) => Promise<void>,
) => Promise<void> | void;
export type RequestHandler = ModernRequestHandler | LegacyRequestHandler;

export class Application {
  private _s: Server;
  private _handlers: RequestHandler[];

  constructor(addr: string | HTTPOptions) {
    this._s = serve(addr);
    this._handlers = [];
  }

  use(handler: RequestHandler): void {
    this._handlers.push(handler);
  }

  async listen(): Promise<void> {
    for await (const req of this._s) {
      const res: ServerResponse = new Response();

      const handler: RequestHandler = compose_handlers(...this._handlers) ??
        error_response(500, (req) => res.body = `No handler for ${req.url}`);

      try {
        const ret = legacy_wrapper(handler)(req, res);
        if (ret instanceof Promise) {
          ret.then(() => req.respond(res)).catch(console.error);
        } else {
          req.respond(res);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}
