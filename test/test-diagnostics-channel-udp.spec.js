'use strict';
const test = require('tape');
const common = require('./common.js');
const dc = require('../dcpoly.js');
const dgram = require('dgram');

const { MAJOR, MINOR } = require('../checks.js');

// This test depends on features only available in certain versions of Node.js
if (MAJOR < 16) return;
if (MAJOR === 16 && MINOR < 18) return;
if (MAJOR === 17) return;
if (MAJOR === 18 && MINOR < 8) return;

test('test-diagnostics-channel-udp', (t) => {
  t.plan(1);

  const udpSocketChannel = dc.channel('udp.socket');

  const isUDPSocket = (socket) => socket instanceof dgram.Socket;

  udpSocketChannel.subscribe(common.mustCall(({ socket }) => {
    t.strictEqual(isUDPSocket(socket), true);
  }));
  const socket = dgram.createSocket('udp4');
  socket.close();
});
