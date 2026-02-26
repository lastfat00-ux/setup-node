# Bolt's Performance Journal

## 2025-05-15 - Redundant Semver Parsing
**Learning:** Calling `semver.satisfies` in a loop with a string range causes the range to be re-parsed in every iteration. This can lead to a 3-4x performance degradation in hot loops (e.g., matching hundreds of available versions).
**Action:** Always pre-parse version range strings into `semver.Range` objects before entering a loop that performs multiple `satisfies` checks.
