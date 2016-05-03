# basic-static
Basic static file serving for use with Node's `http.createServer`.

# Installation
`npm install basic-static`

# Examples
```
const basicStatic = require('basic-static');
const serveStatic = basicStatic({rootDir: process.cwd(), compress: true});

// Set as a route handler using your preferred routing scheme
routes.set('/static/*', serveStatic);

// Or use as the sole route handler if your server only serves static files
const server = http.createServer(function(req, res) {
  serveStatic(req, res);
});
```

# Methodology
Employs standard strategies to manage static resources:
+ Sets `Cache-Control` headers (default value of `max-age=86400`) to prevent superfluous requests from the browser.
+ Sets an `e-tag` using an md5 hash of the file's inode number and `mTime` (modified time) and uses this `e-tag` to return a `304` response if appropriate.
+ Checks for a compressed (gzipped) version of the file if `options.compress` is set to true and the `accept-encoding` header is sent with the file request.

All files are served by piping a readable stream to Node's writable response stream.

As the name suggests, this module is meant to take care of the essentials and not much more. It assumes you are serving files from a relatively simple structure with a reasonable URL and you are good with strong e-tags.

# Test
`npm test`

# API
### `basicStatic([options])`

### Params
#### `options`
`{Object}` with three properties -- `rootDir`, `cache`, and `compress`.

`options.rootDir {String}` -- Root directory. Defaults to `process.cwd()`.

`options.cache {String}` -- `Cache-Control` headers. Defaults to `max-age=86400` (24 hours).

`options.compress {Boolean}` -- Check for a gzipped version of the file. Does not actually do the compression, just looks for a `.gz` version of the file as appropriate. Defaults to false.

### Returns
A `{Function}` that handles requests and sends the appropriate responses.

# License
MIT