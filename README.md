# basic-static
Basic static file serving for use with Node's `http.createServer`.

# Installation
`npm install basic-static`

# Examples
Use as the sole route handler:
```
const basicStatic = require('basic-static');

const server = http.createServer(function(req, res) {
  basicStatic(req, res, {rootDir: __dirname, compress: true});
});
```

Or add as one of many route handlers:
```
routes.set('/static/*', basicStatic);
```

# Methodology
Employs standard strategies to manage static resources:
+ Sets `Cache-Control` headers (default value of `max-age=86400`) to prevent superfluous requests from the browser.
+ Sets an `e-tag` using an md5 hash of the file's inode number and `mTime` (modified time).
+ Checks for a compressed (gzipped) version of the file if `options.compress` is set to true and the `accept-encoding` header is sent with the file request.

As the name suggests, this module is meant to take care of the essentials and not much more. It assumes you are serving files from a relatively simple structure and you are good with strong e-tags and gzip compression. 

# Test
`npm test`

# API
### `basicStatic(req, res, [options])`

#### `req, res`
`Object`:
`req, res` are the usual Node.js request and response objects (instances of `http.IncomingMessage` and `http.ServerResponse` respectively).

#### `options`
`{Object}` with three properties -- `rootDir`, `cache`, and `compress`.

`options.rootDir {String}` -- Root directory. Defaults to `process.cwd()`.

`options.cache {String}` -- `Cache-Control` headers. Defaults to `max-age=86400` (24 hours).

`options.compress {Boolean}` -- Check for a gzipped version of the file. Does not actually do the compression, just looks for a `.gz` version of the file as appropriate.

# License
MIT