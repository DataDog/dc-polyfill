'use strict';

const dc = require('../dcpoly.js');
const common = require('./common.js');
const cluster = require('cluster');

const { MAJOR } = require('../checks.js');
if (MAJOR < 20) return;

if (cluster.isPrimary) {
  const test = require('tape');
  const { ChildProcess } = require('child_process');
  test('test-diagnostics-channel-process', (t) => {
    t.plan(1);
    dc.subscribe('child_process', common.mustCall(({ process }) => {
      t.strictEqual(process instanceof ChildProcess, true);
    }));
    const worker = cluster.fork();
    worker.on('online', common.mustCall(() => {
      worker.send('disconnect');
    }));
  });
} else {
  const assert = require('assert');
  process.on('message', common.mustCall((msg) => {
    assert.strictEqual(msg, 'disconnect');
    process.disconnect();
  }));
}
