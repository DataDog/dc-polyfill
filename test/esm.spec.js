const test = require('tape');
const fs = require('fs');
const os = require('os');
const execSync = require('child_process').execSync;

test('esm', t => {
  const tmpdir = os.tmpdir();
  const basedir = fs.mkdtempSync(`${tmpdir}/esm-`);
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
