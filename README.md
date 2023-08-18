# Diagnostics Channel Polyfill

This package provides a polyfill for the `diagnostics_channel` core Node.js module. It aims to be compatible with every single version of Node.js. It also aims to remain simple, ideally one or two files, and with zero dependencies.

The package attempts to backport support for every single feature that is added at later dates in Node.js core, at least assuming these are backwards compatible.

Whenever the currently running version of Node.js ships with `diagnostics_channel`, **dc-polyfill** will make sure to use the global registry of channels provided by the core module. However, for older versions of Node.js, **dc-polyfill** will instead use a global symbol to track the channels. This symbol will remain the same for all versions of **dc-polyfill** to avoid the issue where multiple versions of an npm library installed in a dependency hierarchy usually provide different singletons.

Ideally, this package will forever remain backwards compatible, and there will never be a v2.x release.

```sh
npm install dc-polyfill
```

```javascript
const diagnostics_channel = require('dc-polyfill');
