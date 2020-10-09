interface State {
  headers?: {
    [k: string]: string;
  };
  // deno-lint-ignore no-explicit-any
  body?: string | any;
}

export const state: State = (() => {
  return {};
})();
