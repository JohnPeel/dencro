import type {
  Response as ServerResponse,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";

export const error = async (
  _req: ServerRequest,
  res: ServerResponse,
  next: (err?: Error) => void | Promise<void>,
) => {
  if (
    res.status && res.status >= 400 &&
    res.headers?.get("content-type") !== "application/json"
  ) {
    res.status = res.status ?? 400;
    res.headers?.set("content-type", "application/json");
    res.body = JSON.stringify(
      { error: true, status: res.status, message: res.body ?? "ERROR" },
    );
  }

  await next();
};
