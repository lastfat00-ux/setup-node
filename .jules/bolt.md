## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2026-06-27 - [Memoization Safety in Environment-Manipulating Tools]
**Learning:** Memoizing shell command outputs in tools that modify the environment (like setup-node updating PATH) can lead to stale results if the environment change is not part of the cache key.
**Action:** Include relevant environment variables (like process.env.PATH) in the memoization key to ensure automatic cache invalidation when the environment is modified.
