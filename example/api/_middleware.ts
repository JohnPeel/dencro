import type {
  Response as ServerResponse,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";

// FIXME: This leaks state from previous request, and probably isn't thread-safe.
import { state } from "./_state.ts";

export const middleware = async (
  req: ServerRequest,
  _res: ServerResponse,
  next: (err?: Error) => Promise<void>,
) => {
  const headers = Object.fromEntries(req.headers.entries());
  // deno-lint-ignore no-explicit-any
  let body: string | any = new TextDecoder("utf-8").decode(
    await Deno.readAll(req.body),
  );

  if (
    "content-type" in headers &&
    headers["content-type"].startsWith("application/json")
  ) {
    body = JSON.parse(body);
  }

  state.headers = headers;
  state.body = body;

  await next();
};
