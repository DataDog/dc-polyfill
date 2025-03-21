const test = require('tape');
const fs = require('fs');
const os = require('os');
const execSync = require('child_process').execSync;

test('esm basic import', t => {
  const tmpdir = os.tmpdir();
  const basedir = fs.mkdtempSync(`${tmpdir}/esm-basic-`);
  const polyfillDir = process.cwd();
  process.chdir(basedir);
  execSync('npm init -y');
  execSync('npm install ' + polyfillDir);
  fs.writeFileSync('esm.mjs', `import { tracingChannel } from 'dc-polyfill'`);
  t.doesNotThrow(() => execSync('node esm.mjs'));
  process.chdir(polyfillDir);
  execSync('rm -rf ' + basedir);
  t.end();
});

test('esm default export', t => {
  const tmpdir = os.tmpdir();
  const basedir = fs.mkdtempSync(`${tmpdir}/esm-default-`);
  const polyfillDir = process.cwd();
  process.chdir(basedir);
  execSync('npm init -y');
  execSync('npm install ' + polyfillDir);
  
  // Create a test file that uses the default export
  fs.writeFileSync('esm-default.mjs', `
    import dc from 'dc-polyfill';
    
    // Verify the default export has all the expected methods
    console.assert(typeof dc.channel === 'function', 'dc.channel is a function');
    console.assert(typeof dc.hasSubscribers === 'function', 'dc.hasSubscribers is a function');
    console.assert(typeof dc.Channel === 'function', 'dc.Channel is a function/class');
    
    // Create a channel and ensure the API works
    const ch = dc.channel('test-channel');
    console.assert(ch instanceof dc.Channel, 'channel instance should be instance of Channel');
  `);
  
  t.doesNotThrow(() => execSync('node esm-default.mjs'));
  process.chdir(polyfillDir);
  execSync('rm -rf ' + basedir);
  t.end();
});

test('esm named exports', t => {
  const tmpdir = os.tmpdir();
  const basedir = fs.mkdtempSync(`${tmpdir}/esm-named-`);
  const polyfillDir = process.cwd();
  process.chdir(basedir);
  execSync('npm init -y');
  execSync('npm install ' + polyfillDir);
  
  // Create a test file that imports named exports individually
  fs.writeFileSync('esm-named.mjs', `
    // Import named exports individually to test each one
    import { channel } from 'dc-polyfill';
    import { subscribe } from 'dc-polyfill';
    import { unsubscribe } from 'dc-polyfill';
    import { Channel } from 'dc-polyfill';
    import { hasSubscribers } from 'dc-polyfill';
    import { tracingChannel } from 'dc-polyfill';
    
    // Simple existence test for each function
    console.assert(typeof channel === 'function', 'channel is a function');
    console.assert(typeof subscribe === 'function', 'subscribe is a function');
    console.assert(typeof unsubscribe === 'function', 'unsubscribe is a function');
    console.assert(typeof hasSubscribers === 'function', 'hasSubscribers is a function');
    console.assert(typeof tracingChannel === 'function', 'tracingChannel is a function');
    console.assert(typeof Channel === 'function', 'Channel is a function');
    
    // Basic API test - not trying to be comprehensive
    const ch = channel('test-channel');
    const handler = () => {};
    subscribe('test-channel', handler);
  `);
  
  t.doesNotThrow(() => execSync('node esm-named.mjs'));
  process.chdir(polyfillDir);
  execSync('rm -rf ' + basedir);
  t.end();
});
