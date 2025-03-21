const test = require('tape');
const fs = require('fs');
const os = require('os');
const execSync = require('child_process').execSync;

const polyfillDir = process.cwd();
let basedir;

test('create fixture project directory', t => {
  const tmpdir = os.tmpdir();
  basedir = fs.mkdtempSync(`${tmpdir}/esm-`);
  process.chdir(basedir);
  execSync('npm init -y');
  execSync('npm install ' + polyfillDir);
  execSync('cp -r ' + polyfillDir + '/test/fixtures/* .');
  t.end();
});

test('esm default export', t => {
  t.doesNotThrow(() => execSync('node esm-default.mjs'));
  t.end();
});

test('esm named exports', t => {
  t.doesNotThrow(() => execSync('node esm-named.mjs'));
  t.end();
});

test('cleanup', t => {
  process.chdir(polyfillDir);
  execSync('rm -rf ' + basedir);
  t.end();
});
