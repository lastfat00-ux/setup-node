## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Concurrent Promise Identity and Eviction in Memoization]
**Learning:** Returning a cached Promise directly without declaring the outer wrapper function as `async` preserves exact promise reference identity (object equality) across concurrent calls, preventing "dog-piling" and duplicate spawner actions. Additionally, appending `.catch(...)` to a cached promise allows clean cache eviction of failures while letting errors propagate safely to all active awaiters.
**Action:** Structure memoized execution wrappers with non-`async` signatures, caching immediately upon promise creation, and hook eviction logic via a post-cache `.catch` handler.
