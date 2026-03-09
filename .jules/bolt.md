## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Redundant Network Requests and Range.test Efficiency]
**Learning:** Redundant network requests for `index.json` and manifests occur when multiple version lookups are performed. Additionally, `rangeObj.test(version)` is more efficient than `semver.satisfies(version, rangeObj)` because it bypasses internal checks.
**Action:** Implement class-level caching for remote metadata and use `rangeObj.test()` in performance-critical loops.
