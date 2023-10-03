# Diagnostics Channel Polyfill

This package provides a polyfill for the `diagnostics_channel` core Node.js module for use with older versions of Node.js. It aims to remain simple, with zero dependencies, and only taking up a few kilobytes of space.

This package attempts to backport every feature and bugfix that is added to Node.js core. If a feature hasn't been backported then please open a Pull Request or create an issue.

Whenever the currently running version of Node.js ships with `diagnostics_channel`, **dc-polyfill** will make sure to use the global registry of channels provided by the core module. However, for older versions of Node.js, **dc-polyfill** will instead use a global symbol to track the channels. This symbol will remain the same for all versions of **dc-polyfill** to avoid the issue where multiple versions of an npm library installed in a dependency hierarchy usually provide different singletons.

Ideally, this package will forever remain backwards compatible, and there will never be a v2.x release.

## Usage

```sh
npm install dc-polyfill
```

```javascript
const diagnostics_channel = require('dc-polyfill');
```

## Contributing

When a Pull Request is created the code runs against many different versions of Node.js. Notably, versions right before a change and versions right after a change, the first version of a release line, and the last version of a release line.

Currently this module tests Node.js >= v12. If you would like to use `dc-polyfill` for versions of Node.js older than this then feel free to submit a Pull Request or open an issue.
