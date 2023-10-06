'use strict';

const test = require('tape');
const common = require('./common.js');
const { AsyncLocalStorage } = require('async_hooks');
const dc = require('../dc-polyfill.js');
const http = require('http');
const { MAJOR, MINOR } = require('../checks.js');

// This test depends on features only available in certain versions of Node.js
if (MAJOR < 14) return;
if (MAJOR === 14 && MINOR < 17) return;
if (MAJOR === 15 && MINOR < 1) return;

const als = new AsyncLocalStorage();
let context;

test('test-diagnostics-channel-http-server-start', t => {
  t.plan(12);
  // Bind requests to an AsyncLocalStorage context
  dc.subscribe('http.server.request.start', common.mustCall((message) => {
    als.enterWith(message);
    context = message;
  }));

  // When the request ends, verify the context has been maintained
  // and that the messages contain the expected data
  dc.subscribe('http.server.response.finish', common.mustCall((message) => {
    const data = {
      request,
      response,
      server,
      socket: request.socket
    };

    // Context is maintained
    compare(t, als.getStore(), context);

    compare(t, context, data);
    compare(t, message, data);
  }));

  let request;
  let response;

  const server = http.createServer(common.mustCall((req, res) => {
    request = req;
    response = res;

    setTimeout(() => {
      res.end('done');
    }, 1);
  }));

  server.listen(() => {
    const { port } = server.address();
    http.get(`http://localhost:${port}`, (res) => {
      res.resume();
      res.on('end', () => {
        server.close();
      });
    });
  });
});

function compare(t, a, b) {
  t.strictEqual(a.request, b.request, '.request');
  t.strictEqual(a.response, b.response, '.response');
  t.strictEqual(a.socket, b.socket, '.socket');
  t.strictEqual(a.server, b.server, '.server');
}
