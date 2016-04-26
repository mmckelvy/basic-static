'use strict';

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const mime = require('mime');

/**
* @function statFile
* Checks if a file exists and if so, returns file info.
*
* @param: filePath {String}
* @param: callback {Function}
*/
function statFile(filePath, callback) {
  fs.stat(filePath, function(err, stats) {

    // Resource does not exist
    if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
      const error = new Error('Resource does not exist');
      error.httpCode = 404;

      callback(error);

    // Not a file
    } else if (!stats.isFile()) {
      const error = new Error('Resource is not a file');
      error.httpCode = 400;

      callback(error);

    // Server error
    } else if (err) {
      const error = new Error('Server error');
      error.httpCode = 500;

      callback(error);

    // Success. Get the stats.
    } else {
      callback(null, stats);
    }
  });
}

/**
* @function createServerEtag
* @private
*
* @param: inode {Number} The file inode number
* @param: mTime {Date} JavaScript date object (returned from mtime in fs.stat call).
*
* @returns: an etag for use in HTTP headers.
*/
function createServerEtag(inode, mTime) {

  // Create a string from the file inode and mtime.
  var str = inode.toString() + mTime.getTime().toString();

  return crypto.createHash('md5').update(str).digest('hex');
}

/**
* @function should304
* @private
*
* @param: req {Object} Node request object
* @param: stats {Object} Result of a Node fs.stat call.
*
* @returns {Boolean}
*/
function should304(req, stats) {
  var clientEtag = req.headers['if-none-match'];

  if (!clientEtag) return false;
  var serverEtag = createServerEtag(stats.ino, stats.mtime);

  if (serverEtag !== clientEtag) return false;

  return true;
}

/**
* @function serveFile
* @private
*
* @param: req {Object} Node request object.
* @param: res {Object} Node response object.
* @param: stats {Object} Results from a Node fs.stat call.
* @param: filePath {String} The full file path for the static resource.
* @param: cache {String} Cache-Control headers. Defaults to private, 24hrs.
*
*/
function serveFile(req, res, stats, filePath, cache) {
  var stream = fs.createReadStream(filePath);

  stream.on('error', function(err) {
    const error = new Error('Error reading file');

    res.writeHead(500, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(error));
  });

  // Verify this won't get called in an error event
  res.writeHead(200, {
    'Content-Type': mime.lookup(filePath),
    'ETag': createServerEtag(stats.ino, stats.mtime),
    'Cache-Control': cache
  });

  stream.pipe(res);
}

/**
* @function serveStaticContent
* @public
*
* @param: req {Object} Node request object.
* @param: res {Object} Node response object.
* @param: options {Object} Possible options are as follows:
*   options.rootDir {String} Root directory. Defaults to process.cwd()
*   options.cache {String} Cache-Control headers. Defaults to private, 24hrs.
*/
function simpleStatic(req, res, options) {
  if (!options) options = {};

  const rootDir = options.rootDir ? options.rootDir : process.cwd();
  const filePath = path.join(rootDir, req.url);

  statFile(filePath, function(err, stats) {
    if (err) {
      res.writeHead(err.httpCode, {'Content-Type': 'application/json'});
      res.end(JSON.stringify(err));

    } else if (should304(req, stats)) {
      res.writeHead(304);
      res.end();

    } else {
      const cache = options.cache ? options.cache : 'private, max-age=86400';
      serveFile(req, res, stats, filePath, cache);
    }
  });
}

module.exports = simpleStatic;
