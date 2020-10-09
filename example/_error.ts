import type {
  Response as ServerResponse,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";

export const error = async (
  _req: ServerRequest,
  res: ServerResponse,
  next: (err?: Error) => void | Promise<void>,
) => {
  if (res.status && res.status >= 400) {
    res.status = res.status in [404] ? res.status : 400;
    res.body = "ERROR: " + (res.body ?? "Unkown");
  }

  await next();
};
