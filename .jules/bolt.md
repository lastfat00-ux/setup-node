## 2025-05-14 - Pre-parsing Semver Range in loops
**Learning:** In version evaluation logic (e.g., in `BaseDistribution`), calling `semver.satisfies` with a string range inside a loop causes redundant parsing overhead. Pre-parsing the range string into a `semver.Range` object before the loop improves performance of the satisfaction check by ~50-70%.
**Action:** Always pre-parse `semver.Range` objects when performing multiple satisfaction checks against the same range.
