'use strict';
const test = require('tape');
const common = require('./common.js');
const dc = require('../dcpoly.js');
const { Worker } = require('worker_threads');
const { MAJOR, MINOR } = require('../checks.js');

// This test depends on features only available in certain versions of Node.js
if (MAJOR < 19) return;

test('test-diagnostics-channel-worker-threads', (t) => {
  t.plan(1);

  dc.subscribe('worker_threads', common.mustCall(({ worker }) => {
    t.strictEqual(worker instanceof Worker, true);
  }));

  new Worker('const a = 1;', { eval: true });
});
