# basic-static
Basic static file serving for use with Node's `http.createServer`.

# Installation
`npm install basic-static`

# Example
```
const basicStatic = require('basic-static');

const server = http.createServer(function(req, res) {
  basicStatic(req, res, {rootDir: __dirname, compress: true});
});
```

# API


# License
MIT