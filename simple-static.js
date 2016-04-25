'use strict';

var fs = require('fs');
var crypto = require('crypto');
var path = require('path');

var mime = require('mime');

var headers = require('./headers');
var createFriendlyError = require('./error').createFriendlyError;

var rootDir = process.cwd();

/**
* statFile() Checks if a file exists and if so, returns file info.
*
* @param: filePath <String>
* @param: callback <Function>
*/
function statFile(filePath, callback) {
  fs.stat(filePath, function(err, stats) {

    // Resource does not exist
    if (err && (err.code === 'ENOENT' || err.code === 'ENOTDIR')) {
      err.fnCall = 'statFile';
      console.log(err);

      var friendlyError = createFriendlyError(404, 'Not Found');
      callback(friendlyError);

    // Server error
    } else if (err) {
      err.fnCall = 'statFile';
      console.log(err);

      var friendlyError = createFriendlyError(500, 'Internal Server Error');
      callback(friendlyError);

    // Not a file
    } else if (!stats.isFile()) {
      var friendlyError = createFriendlyError(400, 'Bad Request');
      callback(friendlyError);

    // Get the stats
    } else {
      callback(null, stats);
    }
  });
}

/**
* createServerEtag()
* @param: inode <Number> The file inode number
* @param: mTime <Date> JavaScript date object (returned from mtime in fs.stat call).
*
* returns: an etag for use in HTTP headers.
*/
function createServerEtag(inode, mTime) {

  // Create a string from the file inode and mtime.
  var str = inode.toString() + mTime.getTime().toString();

  return crypto.createHash('md5').update(str).digest('hex');
}

// Check for cached resources.
function should304(req, stats) {
  var clientEtag = req.headers['if-none-match'];

  if (!clientEtag) return false;
  var serverEtag = createServerEtag(stats.ino, stats.mtime);

  if (serverEtag !== clientEtag) return false;

  return true;
}

// Serve the file
function serveFile(req, res, stats) {
  var staticPath = path.join(rootDir, req.url);
  var stream = fs.createReadStream(path.join(rootDir, req.url));

  stream.on('error', function(err) {
    err.fnCall = 'serveFile';
    console.log(err);

    var friendlyError = createFriendlyError(500, 'Internal Server Error');

    res.writeHead(500, headers.json);
    res.end(JSON.stringify(friendlyError));
  });

  // Verify this won't get called in an error event
  res.writeHead(200, {
    'Content-Type': mime.lookup(staticPath),
    'ETag': createServerEtag(stats.ino, stats.mtime),
    'Cache-Control': 'private, max-age=86400'
  });

  stream.pipe(res);
}

// PUBLIC
function serveStaticContent(req, res) {
  var staticPath = path.join(rootDir, req.url);

  statFile(staticPath, function(err, stats) {
    if (err) {
      res.writeHead(err.name, headers.json);
      res.end(JSON.stringify(err));

    } else if (should304(req, stats)) {
      res.writeHead(304);
      res.end();

    } else {
      serveFile(req, res, stats);
    }
  });
}

module.exports = {
  serveStaticContent
};
