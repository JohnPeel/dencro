import type {
  Response as ServerResponse,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";

export default async (
  req: ServerRequest,
  res: ServerResponse,
  next: (err?: Error) => void | Promise<void>,
) => {
  res.status = 404;
  res.body = `File not found - ${req.url}`;

  await next();
};
