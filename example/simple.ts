import type { ServerRequest } from "https://deno.land/std/http/server.ts";

export default (req: ServerRequest): string => {
  return `Hello, World!\n${req.url}`;
};
