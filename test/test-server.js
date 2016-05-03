'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const serveStatic = require('../basic-static')({rootdir: __dirname, compress: true});

const server = http.createServer(function(req, res) {
  if (req.url === '/') {
    fs.readFile(path.join(__dirname, 'testfiles', 'index.html'), function(err, data) {
      if (!err) res.end(data);
    });

  } else {
    serveStatic(req, res);
  }

});

server.listen(3000, function() {
  console.log('Server started');
});
