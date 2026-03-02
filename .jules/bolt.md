# Bolt's Journal - setup-node

## 2025-05-14 - Pre-parse semver ranges in loops
**Learning:** Calling `semver.satisfies(version, rangeString)` inside a loop is inefficient because it parses the `rangeString` on every iteration. Pre-parsing into a `semver.Range` object before the loop can yield a ~4x speedup (from ~320ms to ~80ms in high-version count scenarios).
**Action:** Always pre-parse version ranges into `semver.Range` objects before using them in loops for version evaluation.
