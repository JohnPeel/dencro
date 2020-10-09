import type { ServerResponse } from "./mod.ts";

export class Response implements ServerResponse {
  res: ServerResponse;

  constructor() {
    this.res = {};
  }

  get status(): number | undefined {
    return this.res.status;
  }

  set status(status: number | undefined) {
    this.res.status = status;
  }

  get headers(): Headers | undefined {
    if (!this.res.headers) {
      this.res.headers = new Headers();
    }
    return this.res.headers;
  }

  set headers(headers: Headers | undefined) {
    this.res.headers = headers;
  }

  get body(): Uint8Array | Deno.Reader | string | undefined {
    return this.res.body;
  }

  set body(body: Uint8Array | Deno.Reader | string | undefined) {
    this.res.body = body;
  }

  get trailers(): (() => Promise<Headers> | Headers) | undefined {
    return this.res.trailers;
  }

  set trailers(trailers: (() => Promise<Headers> | Headers) | undefined) {
    this.res.trailers = trailers;
  }
}
