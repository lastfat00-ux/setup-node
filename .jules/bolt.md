## 2026-02-28 - Pre-parsing Semver Range
**Learning:** Calling `semver.satisfies` with a range string inside a loop causes redundant parsing of the range string on every iteration. Pre-parsing the range into a `semver.Range` object once before the loop significantly reduces CPU overhead.
**Action:** Always pre-parse semver ranges when evaluating multiple versions against the same criteria.
