## 2025-05-22 - [Optimization: Pre-parsing semver Range objects]
**Learning:** In the version evaluation logic, pre-parsing range strings into `semver.Range` objects before loops avoids redundant parsing, yielding speedups of ~75% (4x faster) in benchmarks with many versions.
**Action:** Always pre-parse `semver.Range` objects when using them inside loops or repeated calls to `semver.satisfies`.
