'use strict';

const http = require('http');
const url = require('url');
const test = require('tape');

const basicStatic = require('../basic-static');

test('Should return a 200 response for a requested file', function(t) {
  const static = basicStatic({rootDir: __dirname});

  // Set up the test server.
  const server = http.createServer(function(req, res) {
    static(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  // Make a request to the server.
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

test('Should return a 404 for a file that does not exist', function(t) {
  const static = basicStatic({rootDir: __dirname});

  // Set up the test server.
  const server = http.createServer(function(req, res) {
    static(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  // Make a request to the server.
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
  const static = basicStatic({rootDir: __dirname});

  // Set up the test server.
  const server = http.createServer(function(req, res) {
    static(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  // Make a request to the server.
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
  const static = basicStatic({rootDir: __dirname, cache: 'no-cache'});

  // Set up the test server.
  const server = http.createServer(function(req, res) {
    static(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  // Make a request to the server.
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
  const static = basicStatic({rootDir: __dirname, cache: cache});

  // Set up the test server.
  const server = http.createServer(function(req, res) {
    static(req, res);
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  // Make a request to the server.
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

test('Should send a 400 for a directory request', function(t) {
  const static = basicStatic({rootDir: __dirname});

  const server = http.createServer(function(req, res) {
    static(req, res);
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

test('Should return the proper file headers', function(t) {
  const server = http.createServer(function(req, res) {
    basicStatic(req, res, {rootDir: __dirname});
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  // Make a request to the server.
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
  // Set up the test server.
  const server = http.createServer(function(req, res) {
    basicStatic(req, res, {rootDir: __dirname, compress: true});
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  // Make a request to the server.
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
  // Set up the test server.
  const server = http.createServer(function(req, res) {
    basicStatic(req, res, {rootDir: __dirname, compress: true});
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  // Make a request to the server.
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
