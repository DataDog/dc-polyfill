# `dcpoly`: Diagnostics Channel Polyfill

This package provides a polyfill (or ponyfill) for the `diagnostics_channel` core Node.js module (including `TracingChannel`) for use with older versions of Node.js. It aims to remain simple, with zero dependencies, and only taking up a few kilobytes of space.

**dcpoly** attempts to backport every feature and bugfix that is added to Node.js core. If a feature hasn't been backported then please open a Pull Request or open an issue.

Currently this package provides an API compatible with `diagnostics_channel` as of **Node.js v20.6**. Therefore, to view the capabilities of this package, read the [Node.js `diagnostics_channel` documentation](https://nodejs.org/dist/latest-v20.x/docs/api/diagnostics_channel.html).

Whenever the currently running version of Node.js ships with `diagnostics_channel`, **dcpoly** will make sure to use the global registry of channels provided by the core module. However, for old versions of Node.js which lack it, **dcpoly** instead uses a global symbol to track the channels. This symbol will remain the same for all versions of **dcpoly** to avoid the issue where multiple versions of an npm library installed in a dependency hierarchy usually provide different singletons.

Ideally, this package will forever remain backwards compatible, and there will never be a v2.x release.

## Usage

```sh
npm install dcpoly
```

```javascript
const diagnostics_channel = require('dcpoly');
```

## Contributing

When a Pull Request is created the code runs against many different versions of Node.js. Notably, versions right before a change and versions right after a change, the first version of a release line, and the last version of a release line.

Currently this module tests Node.js >= v12.17. If you would like to use `dcpoly` for versions of Node.js older than this then feel free to submit a Pull Request or open an issue.

## License / Copyright

See [LICENSE.txt](LICENSE.txt) for full details.

MIT License - Copyright (c) 2023 Datadog, Inc.
