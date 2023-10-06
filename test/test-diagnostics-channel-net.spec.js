'use strict';
const test = require('tape');
const common = require('./common.js');
const net = require('net');
const dc = require('../dc-polyfill.js');
const { MAJOR, MINOR } = require('../checks.js');

// This test depends on features only available in certain versions of Node.js
if (MAJOR < 16) return;
if (MAJOR === 16 && MINOR < 20) return;
if (MAJOR === 17) return;
if (MAJOR === 18 && MINOR < 18) return;

const isNetSocket = (socket) => socket instanceof net.Socket;

test('test-diagnostics-channel-net', (t) => {
  t.plan(2);
  dc.subscribe('net.client.socket', common.mustCall(({ socket }) => {
    t.strictEqual(isNetSocket(socket), true);
  }));

  dc.subscribe('net.server.socket', common.mustCall(({ socket }) => {
    t.strictEqual(isNetSocket(socket), true);
  }));

  const server = net.createServer(common.mustCall((socket) => {
    socket.destroy();
    server.close();
  }));

  server.listen(() => {
    const { port } = server.address();
    net.connect(port);
  });
});
