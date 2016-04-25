'use strict';

const http = require('http');
const url = require('url');
const test = require('tape');

const simpleStatic = require('../lib/simple-static');

test('Should return a 200 response for a requested file', function(t) {

  // Set up the test server.
  const server = http.createServer(function(req, res) {
    simpleStatic(req, res, {rootDir: __dirname});
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  // Make a request to the server.
  const options = {
    protocol: 'http:',
    hots: 'localhost',
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

  // Set up the test server.
  const server = http.createServer(function(req, res) {
    simpleStatic(req, res, {rootDir: __dirname});
  });

  server.listen(3000, function() {
    console.log('Server started');
  });

  // Make a request to the server.
  const options = {
    protocol: 'http:',
    hots: 'localhost',
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
