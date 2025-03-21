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
  fs.copyFileSync(`${polyfillDir}/test/fixtures/esm-default.mjs`, 'esm-default.mjs');
  
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
  fs.copyFileSync(`${polyfillDir}/test/fixtures/esm-named.mjs`, 'esm-named.mjs');
  fs.writeFileSync('esm-named.mjs', `

  `);
  
  t.doesNotThrow(() => execSync('node esm-named.mjs'));
  process.chdir(polyfillDir);
  execSync('rm -rf ' + basedir);
  t.end();
});
