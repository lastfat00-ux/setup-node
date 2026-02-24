## 2026-02-24 - [Pre-parse semver ranges in loops]
**Learning:** In version evaluation logic (e.g., in `BaseDistribution`), calling `semver.satisfies` with a string range inside a loop causes the range to be re-parsed on every iteration. Pre-parsing the range string into a `semver.Range` object before the loop significantly improves performance, especially when there are many versions to evaluate.
**Action:** Always pre-parse `semver.Range` objects when they are used repeatedly in loops with the same range criteria.
