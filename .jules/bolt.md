## 2025-05-15 - [Semver Range Pre-parsing]
**Learning:** Calling `semver.satisfies` in a loop with a string range causes the range to be parsed on every iteration. Pre-parsing it into a `semver.Range` object significantly improves performance when evaluating many versions.
**Action:** Always check for loops containing `semver.satisfies` or similar semver functions and ensure ranges/versions are pre-parsed if they remain constant within the loop.
