import { green, red } from "../deps.ts";
import type { ModernRequestHandler } from "../mod.ts";

export const logger: ModernRequestHandler = async (req, res, next?) => {
  const start = performance.now();
  if (next) {
    await next();
  }
  const duration = performance.now() - start;

  const { conn: { remoteAddr }, method, url, proto } = req;
  const status = res.status ?? 200;

  const addr = (remoteAddr.transport === "tcp") ? remoteAddr.hostname : "-";
  const message =
    `${addr} "${method.toUpperCase()} ${url} ${proto}" ${status} ${duration}ms`;
  console.log(status < 400 ? green(message) : red(message));
};
