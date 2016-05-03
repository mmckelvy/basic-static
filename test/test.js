'use strict';

const http = require('http');
const test = require('tape');

const basicStatic = require('../basic-static');

test('Should return a 200 response for a requested file', function(t) {
  const serveStatic = basicStatic({rootDir: __dirname});

  const server = http.createServer(function(req, res) {
    serveStatic(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  const options = {
    protocol: 'http:',
    host: 'localhost',
    port: 3000,
    method: 'GET',
    path: '/testfiles/main.js'
  };

  http.get(options, function(res) {
    t.equal(res.statusCode, 200, 'Should return a 200');
    server.close();
    t.end();
  });
});

test('Should handle versioning querystrings', function(t) {
  const serveStatic = basicStatic({rootDir: __dirname});

  const server = http.createServer(function(req, res) {
    serveStatic(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  const options = {
    protocol: 'http:',
    host: 'localhost',
    port: 3000,
    method: 'GET',
    path: '/testfiles/main.js?v=123'
  };

  http.get(options, function(res) {
    t.equal(res.statusCode, 200, 'Should return a 200');
    server.close();
    t.end();
  });
});

test('Should return a 404 for a file that does not exist', function(t) {
  const serveStatic = basicStatic({rootDir: __dirname});

  const server = http.createServer(function(req, res) {
    serveStatic(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  const options = {
    protocol: 'http:',
    host: 'localhost',
    port: 3000,
    method: 'GET',
    path: '/testfiles/not-found.js'
  };

  http.get(options, function(res) {
    t.equal(res.statusCode, 404, 'Should return a 404');
    server.close();
    t.end();
  });
});

test('Should return a 404 when the directory does not exist', function(t) {
  const serveStatic = basicStatic({rootDir: __dirname});

  const server = http.createServer(function(req, res) {
    serveStatic(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  const options = {
    protocol: 'http:',
    host: 'localhost',
    port: 3000,
    method: 'GET',
    path: '/some-other-dir/not-found.js'
  };

  http.get(options, function(res) {
    t.equal(res.statusCode, 404, 'Should return a 404');
    server.close();
    t.end();
  });
});

test('Should return a 304 for matching etag', function(t) {
  const serveStatic = basicStatic({rootDir: __dirname, cache: 'no-cache'});

  const server = http.createServer(function(req, res) {
    serveStatic(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  const options = {
    protocol: 'http:',
    host: 'localhost',
    port: 3000,
    method: 'GET',
    path: '/testfiles/main.js'
  };

  // First request.
  http.get(options, function(res1) {

    // Get the etag
    const eTag = res1.headers['etag'];
    const moreOpts = Object.assign({}, options, {headers: {'if-none-match': eTag}});

    // Send another request with that etag
    http.get(moreOpts, function(res2) {
      t.equal(res2.statusCode, 304, 'Should return a 304');
      server.close();
      t.end();
    });
  });
});

test('Should set the proper cache-control header', function(t) {
  const cache = 'private, max-age=600';
  const serveStatic = basicStatic({rootDir: __dirname, cache: cache});

  const server = http.createServer(function(req, res) {
    serveStatic(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  const options = {
    protocol: 'http:',
    host: 'localhost',
    port: 3000,
    method: 'GET',
    path: '/testfiles/main.js',
  };

  http.get(options, function(res) {
    t.equal(res.headers['cache-control'], cache, 'Should set the proper header');
    server.close();
    t.end();
  });
});

test('Should send a 400 for an existing directory request', function(t) {
  const serveStatic = basicStatic({rootDir: __dirname});

  const server = http.createServer(function(req, res) {
    serveStatic(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  const options = {
    protocol: 'http:',
    host: 'localhost',
    port: 3000,
    method: 'GET',
    path: '/testfiles',
  };

  http.get(options, function(res) {
    t.equal(res.statusCode, 400, 'Should return a 400');
    server.close();
    t.end();
  });
});

test('Should set the proper mime type', function(t) {
  const serveStatic = basicStatic({rootDir: __dirname});

  const server = http.createServer(function(req, res) {
    serveStatic(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  const options = {
    protocol: 'http:',
    host: 'localhost',
    port: 3000,
    method: 'GET',
    path: '/testfiles/styles.css',
  };

  http.get(options, function(res) {
    t.equal(res.headers['content-type'], 'text/css', 'Should return proper headers');
    server.close();
    t.end();
  });
});

test('Should try to serve compressed file if options.compress is true', function(t) {
  const serveStatic = basicStatic({rootDir: __dirname, compress: true});

  const server = http.createServer(function(req, res) {
    serveStatic(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  const options = {
    protocol: 'http:',
    host: 'localhost',
    port: 3000,
    method: 'GET',
    headers: {'Accept-Encoding': 'gzip'},
    path: '/testfiles/main.js'
  };

  http.get(options, function(res) {
    t.equal(res.headers['content-encoding'], 'gzip', 'Set proper encoding');

    server.close();
    t.end();
  });
});

test('Should use uncompressed file if the compressed file does not exist', function(t) {
  const serveStatic = basicStatic({rootDir: __dirname, compress: true});

  const server = http.createServer(function(req, res) {
    serveStatic(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  const options = {
    protocol: 'http:',
    host: 'localhost',
    port: 3000,
    method: 'GET',
    headers: {'Accept-Encoding': 'gzip'},
    path: '/testfiles/styles.css'
  };

  http.get(options, function(res) {
    t.equal(res.statusCode, 200);

    server.close();
    t.end();
  });
});

test('Should send a 200 and a new etag if file changes', function(t) {
  const fs = require('fs');
  const path = require('path');

  const file = path.join(__dirname, 'testfiles', 'change.js');
  console.log('THE FILE', file);
  const serveStatic = basicStatic({rootDir: __dirname, cache: 'no-cache'});

  const server = http.createServer(function(req, res) {
    serveStatic(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  const options = {
    protocol: 'http:',
    host: 'localhost',
    port: 3000,
    method: 'GET',
    path: '/testfiles/change.js'
  };

  // First request
  http.get(options, function(res1) {

    // Get the etag
    const originalEtag = res1.headers['etag'];
    const moreOpts = Object.assign({}, options, {headers: {'if-none-match': originalEtag}});

    // Modify the file.
    fs.readFile(file, 'utf8', function(err, data) {
      if (err) {
        t.fail("Couldn't read file");
        server.close();
        t.end();

      } else {
        const re = /'[A-Za-z0-9]+'/g; // Find single quoted string.
        const newWord = Math.random().toString(36).slice(10);

        const update = data.replace(re, `'${newWord}'`);

        fs.writeFile(file, update, function(err) {
          if (err) {
            t.fail("Couldn't write file");
            server.close();
            t.end();

          } else {
            console.log('String successfully updated');

            // Send another request for now modified file with the original etag.
            http.get(moreOpts, function(res2) {
              t.equal(res2.statusCode, 200, 'Should return a 200');
              t.notEqual(res2.headers['etag'], originalEtag);
              server.close();
              t.end();
            });
          }
        });
      }
    });
  });
});
