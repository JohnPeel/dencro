import type {
  Response as ServerResponse,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";

import { state } from "./_state.ts";

export default async (req: ServerRequest, res: ServerResponse) => {
  const { method, url, proto } = req;

  res.status = 200;
  res.headers?.set("Content-Type", "application/json");
  res.body = JSON.stringify(
    { addr: req.conn.remoteAddr, method, url, proto, ...state },
    null,
    2,
  );
};
