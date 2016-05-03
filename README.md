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