#!/usr/bin/env node

const { execSync } = require('child_process');

const pkg = require('./package.json');
pkg.dependencies = pkg.dependencies || {};
pkg.devDependencies = pkg.devDependencies || {};

let violations = 0;

const limits = pkg.limits;

if (!limits) {
  process.exit(0);
}

if (('packedSize' in limits) || ('unpackedSize' in limits)) {
  const { size, unpackedSize } = JSON.parse(execSync(`npm pack --dry-run --json`).toString())[0];

  console.log(`     Packed Size: ${size}\n   Unpacked Size: ${unpackedSize}`);

  if ('packedSize' in limits && size > limits.packedSize) {
    violations++;
    console.error(`The packed size of ${size} exceeds the limit of ${limits.packedSize}!`);
  }

  if ('unpackedSize' in limits && unpackedSize > limits.unpackedSize) {
    violations++;
    console.error(`The unpacked size of ${unpackedSize} exceeds the limit of ${limits.unpackedSize}!`);
  }
}

const depCount = Object.keys(pkg.dependencies).length;
console.log(`    Dependencies: ${depCount}`);

if ('maxDependencies' in limits) {
  if (depCount > limits.maxDependencies) {
    violations++;
    console.error(`The dependency count of ${depCount} exceeds the limit of ${limits.maxDependencies}!`);
  }
}

const devDepCount = Object.keys(pkg.devDependencies).length;
console.log(`Dev Dependencies: ${devDepCount}`);

if ('maxDevDependencies' in limits) {
  if (devDepCount > limits.maxDevDependencies) {
    violations++;
    console.error(`The dev dependency count of ${devDepCount} exceeds the limit of ${limits.maxDevDependencies}!`);
  }
}

if (violations > 0) {
  process.exit(1);
}

console.log('OK');
