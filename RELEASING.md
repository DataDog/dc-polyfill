# Releasing

`dc-polyfill` is published to npm as [`dc-polyfill`](https://www.npmjs.com/package/dc-polyfill).

## Prerequisites

- Write access to `DataDog/dc-polyfill` on GitHub.

## Cutting a release

1. Go to the [Release workflow](https://github.com/DataDog/dc-polyfill/actions/workflows/release.yml) in GitHub Actions.
2. Click **Run workflow**.
3. Select the bump type (`patch`, `minor`, or `major`) and click **Run workflow**.

The workflow will:
- Bump the version in `package.json` and create a version commit and tag.
- Publish the package to npm with provenance.
- Push the commit and tag to `main`.
- Create a GitHub release with auto-generated notes.

## Verifying the release

```sh
# Confirm the new version is live on npm.
npm view dc-polyfill version

# Confirm the GitHub release exists.
gh release view "v$(npm view dc-polyfill version)"
```
