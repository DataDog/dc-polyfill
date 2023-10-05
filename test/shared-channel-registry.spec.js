'use strict';

const path = require('path');
const test = require('tape');
const common = require('./common.js');

test('shared-channel-registry', (t) => {
  t.plan(5);

  const entrypoint = require.resolve(path.join(__dirname, '..', 'dc-polyfill.js'));
  const reimpl = require.resolve(path.join(__dirname, '..', 'reimplementation.js'));
  const acquire = require.resolve(path.join(__dirname, '..', 'acquire-channel-registry.js'));

  const dc_v1 = require('../dc-polyfill.js');

  t.ok(require.cache[entrypoint], 'should find entrypoint in the require cache');
  delete require.cache[entrypoint];
  t.notOk(require.cache[entrypoint], 'entrypoint should now be removed from require cache');

  // these would only be present for old versions of Node.js
  delete require.cache[reimpl];
  delete require.cache[acquire];

  const dc_v2 = require('../dc-polyfill.js');

  t.notStrictEqual(dc_v1, dc_v2, 'should be two separate dc instances');
  t.deepEqual(Object.keys(dc_v1), Object.keys(dc_v2), 'the two instances should have the same shape');

  dc_v1.subscribe('foo', common.mustCall(function(msg) {
    t.equal(msg, 'bar');
  }))

  dc_v2.channel('foo').publish('bar');
});
