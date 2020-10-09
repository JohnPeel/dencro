import type { ModernRequestHandler } from "../mod.ts";

export const error: ModernRequestHandler = async (_req, res, next?) => {
  if (!res.status && !res.body) {
    res.status = 500;
    res.body = "Internal Server Error";
  }

  if (next) {
    await next();
  }
};
