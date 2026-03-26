## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Efficient Sorting of SemVer Strings]
**Learning:** `semver.rcompare(a, b)` parses both version strings into `SemVer` objects on *every* comparison. For a sort of $N$ items, this causes $O(N \log N)$ parsing operations, which is expensive for large version sets.
**Action:** Implement a Schwartzian transform (map-sort-map) to pre-parse version strings into `SemVer` objects once, reducing total parses to $O(N)$.

## 2025-05-15 - [Direct Range Testing]
**Learning:** `semver.satisfies(version, rangeObj)` is a wrapper that performs extra checks (like checking if `rangeObj` is a `Range` instance) before calling `rangeObj.test(version)`.
**Action:** Call `rangeObj.test(version)` directly when you already have a `semver.Range` object to avoid unnecessary wrapper overhead.
