import type {
  LegacyRequestHandler,
  ModernRequestHandler,
  RequestHandler,
} from "./mod.ts";

export const error_response = (
  status: number,
  handler: LegacyRequestHandler,
): ModernRequestHandler => {
  const error_response: ModernRequestHandler = async (req, res, next?) => {
    const message = handler(req);

    res.status = status;
    res.body = message;

    if (next) {
      await next();
    }
  };
  return error_response;
};

export const legacy_wrapper = (
  handler: RequestHandler,
): ModernRequestHandler => {
  const legacy_wrapper: ModernRequestHandler = async (req, res, next?) => {
    const ret = await handler(req, res, next);

    // TODO: Maybe support returning the ServerResponse?
    if (typeof ret === "string") {
      res.status = 200;
      res.body = ret;

      if (next) {
        await next();
      }
    }
  };
  return legacy_wrapper;
};

const next_wrapper = (
  handler: RequestHandler,
  next: RequestHandler,
): ModernRequestHandler => {
  const next_wrapper: ModernRequestHandler = async (req, res, _next?) => {
    await handler(req, res, async (_err?: Error) => {
      // TODO: Figure out some way to pass err down.
      await next(req, res, _next);
    });
  };
  return next_wrapper;
};

export const compose_handlers = (
  ...handlers: RequestHandler[]
): RequestHandler | null => {
  if (handlers.length <= 1) {
    return handlers.pop() ?? null;
  }

  return handlers.reduceRight((a, c) => {
    return next_wrapper(c, a);
  }, handlers.pop() as RequestHandler) as ModernRequestHandler;
};
