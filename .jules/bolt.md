## 2025-05-14 - Pre-parsing Semver Range Objects
**Learning:** Redundant parsing of semver range strings inside loops can be a significant performance bottleneck. `semver.satisfies(version, range)` parses the range string every time it is called. Pre-parsing the range into a `semver.Range` object outside the loop and using its `.test(version)` method is much more efficient.
**Action:** Always pre-parse semver ranges when evaluating multiple versions against the same range in a loop.
