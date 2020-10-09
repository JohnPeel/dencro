import { resolve, SEP } from "./deps.ts";
import type { RequestHandler } from "./mod.ts";

export interface RequestHandlers {
  [method: string]: RequestHandler;
}

export class ModuleResolver {
  private _basepath: string;
  private _tag: boolean;
  private _tagCount = 0;

  constructor(basepath?: string, tag: boolean = false) {
    this._basepath = basepath ?? Deno.cwd();
    this._tag = tag;
  }

  get basepath(): string {
    return this._basepath;
  }

  set basepath(basepath: string) {
    // TODO: Validate the path. fs.existsSync(path) [unstable]
    this._basepath = basepath;
  }

  private async findFile(file: string): Promise<string | null> {
    try {
      return await Deno.realPath(file + ".ts");
    } catch {
      try {
        return await Deno.realPath(file + SEP + "index.ts");
      } catch {
        return null;
      }
    }
  }

  private async resolvePath(file: string): Promise<string | null> {
    const filePath = await this.findFile(resolve(this._basepath, file));
    return (filePath && filePath.startsWith(this._basepath)) ? filePath : null;
  }

  async resolve(file: string): Promise<RequestHandlers | null> {
    const filePath = await this.resolvePath(file);
    // TODO: Generate tag from mtime. fs.statSync(path) [unstable]
    return (filePath)
      ? await import(
        "file://" +
          ((this._tag) ? `${filePath}?tag=${this._tagCount++}` : filePath)
      )
      : null;
  }

  async recursive_resolve(...path: string[]): Promise<RequestHandlers | null> {
    if (path.length === 1) {
      path = path[0].split("/");
    }

    const file_name = path.pop();
    while (path.length > 0) {
      path.pop();
      const handlers = await this.resolve(`${[...path, file_name].join("/")}`);
      if (handlers) {
        return handlers;
      }
    }

    return null;
  }
}
