## 2025-05-15 - [Semver Range Pre-parsing]
**Learning:** Using `semver.satisfies(version, range, options)` inside a loop is inefficient because it re-parses the range string into a `semver.Range` object on every iteration.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and use `rangeObj.test(version)` inside the loop. This can reduce execution time by ~50% in version evaluation logic.
