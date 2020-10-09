import type {
  Response as ServerResponse,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std/path/mod.ts";
//import { lookup } from "https://deno.land/x/media_types@v2.3.7/mod.ts";

async function getPublicPath(): Promise<string> {
  return await Deno.realPath(
    join(dirname(fromFileUrl(import.meta.url)), "./public"),
  );
}

async function getFile(
  file: string,
  directory: string,
): Promise<string | null> {
  let possibles = ["/index.html", ".html"];
  if (file.length > 1) {
    possibles = ["", ...possibles];
  }

  for (const ext of possibles) {
    try {
      return await Deno.realPath(join(directory, "." + file + ext));
      // deno-lint-ignore no-empty
    } catch {}
  }

  return null;
}

export const get = async (
  req: ServerRequest,
  res: ServerResponse,
  next: (err?: Error) => void | Promise<void>,
) => {
  const publicPath = await getPublicPath();
  const filePath = await getFile(req.url, publicPath) ?? "";

  try {
    if (!filePath.startsWith(publicPath)) {
      throw new Error();
    }

    const contentType = undefined; //lookup(filePath); // media-types doesn't support the latest Deno.

    res.status = 200;
    if (contentType) {
      res.headers?.set("content-type", contentType);
    }
    res.body = await Deno.readFile(filePath);
  } catch (error) {
    res.status = 404;
    res.body = "File not found";
  }

  await next();
};
