# dencro

an adaptation of [micro](https://github.com/zeit/micro) for [deno](https://deno.land/)

Except this one will serve any handlers it finds on the file system that mirror the request.

## Install

```sh
deno install -n dencro --allow-net --allow-read --allow-env https://raw.githubusercontent.com/hswolff/dencro/master/src/index.ts
```

## Usage

```sh
dencro [directory] [options]
```

 - `[directory]` - directory which you want to serve
 - `[options]` - additional options
   - `--port [port]` - set the port on which to serve. Defaults to `8080`.
   - `--tag` - enable tagging of imports. (this allows dynamic changing of routes)

**Example:**

```sh
~ dencro .
Serving files from: ~
Listening at http://localhost:8080/
```

## Development

- Clone the repo:

```sh
git clone https://github.com/hswolff/dencro.git
```

- run dencro:

```sh
deno run --unstable --allow-net --allow-read --allow-env --watch src/index.ts <directoryToServeFiles> [--port 8080] [--tag]
```

**Note:** Make sure to format everything using the `deno fmt` command before pushing the changes.

## Todo

- [x] Add [command line argument parsing](https://deno.land/std/flags/)
  - So we can set the port
- [x] Load `index.ts` by default if no handler is given as an argument
- [x] Walk folders to load all `.ts` files as handlers
- [x] Set what folder to use as current working directory
- [x] Have handlers support returning:
  - [x] JSON
  - [ ] Templates
- [ ] Write tests
