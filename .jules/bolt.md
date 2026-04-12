## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Promise Caching for Request Collapsing]
**Learning:** Caching the Promise returned by an asynchronous operation (like an external command execution) instead of the resolved value prevents "thundering herd" issues where multiple concurrent calls would otherwise trigger multiple identical executions.
**Action:** Always store the Promise directly in the cache Map to ensure that concurrent callers subscribe to the same execution handle.
