## 2025-05-15 - [Initial Entry]
**Learning:** Using `rangeObj.test(version)` is more efficient than `semver.satisfies(version, rangeObj)` because the latter internally instantiates a new `Range` object even when provided with an existing one.
**Action:** In loops that use semver.satisfies, replace with a pre-constructed Range object and use the .test() method.
