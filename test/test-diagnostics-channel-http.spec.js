'use strict';

const test = require('tape');
const common = require('./common.js');
const dc = require('../dc-polyfill.js');
const { MAJOR, MINOR } = require('../checks.js');

if (MAJOR < 16) return;
if (MAJOR === 16 && MINOR < 17) return;
if (MAJOR === 17) return;
if (MAJOR === 18 && MINOR < 6) return;

const http = require('http');
const net = require('net');

const isHTTPServer = (server) => server instanceof http.Server;
const isIncomingMessage = (object) => object instanceof http.IncomingMessage;
const isOutgoingMessage = (object) => object instanceof http.OutgoingMessage;
const isNetSocket = (socket) => socket instanceof net.Socket;

// This test relies on features that only certain versions of Node.js provide

test('test-diagnostics-channel-http', (t) => {
  t.plan(11);
  dc.subscribe('http.client.request.start', common.mustCall(({ request }) => {
    t.strictEqual(isOutgoingMessage(request), true);
  }));

  dc.subscribe('http.client.response.finish', common.mustCall(({
    request,
    response
  }) => {
    t.strictEqual(isOutgoingMessage(request), true);
    t.strictEqual(isIncomingMessage(response), true);
  }));

  dc.subscribe('http.server.request.start', common.mustCall(({
    request,
    response,
    socket,
    server,
  }) => {
    t.strictEqual(isIncomingMessage(request), true);
    t.strictEqual(isOutgoingMessage(response), true);
    t.strictEqual(isNetSocket(socket), true);
    t.strictEqual(isHTTPServer(server), true);
  }));

  dc.subscribe('http.server.response.finish', common.mustCall(({
    request,
    response,
    socket,
    server,
  }) => {
    t.strictEqual(isIncomingMessage(request), true);
    t.strictEqual(isOutgoingMessage(response), true);
    t.strictEqual(isNetSocket(socket), true);
    t.strictEqual(isHTTPServer(server), true);
  }));

  const server = http.createServer(common.mustCall((req, res) => {
    res.end('done');
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
