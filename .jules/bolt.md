## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Race Condition in Async Caching]
**Learning:** Storing the result of an async operation in a cache *after* `await`ing it allows concurrent calls to bypass the cache check and trigger redundant executions.
**Action:** When implementing caching for asynchronous operations, store the returned Promise directly in the cache *before* awaiting it. This ensures that subsequent concurrent callers receive the same Promise and wait for the same result.

## 2025-05-15 - [Path Deduplication Order]
**Learning:** Deduplicating directories *before* resolving real paths (via `fs.realpathSync`) can fail to catch different path representations (e.g., symlinks vs absolute paths) of the same physical directory.
**Action:** Always apply `unique()` filters after `fs.realpathSync` to ensure that the collection of directories is truly collapsed to unique physical locations.
