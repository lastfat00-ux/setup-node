## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-20 - [Promise-based Cache for Shell Commands]
**Learning:** When memoizing async functions that spawn external processes, caching the `Promise` immediately (rather than awaiting it) prevents "dog-piling" where multiple concurrent calls spawn redundant processes. Also, a subtle bug was found where `if (!stdOut)` was checking a `Promise` object for truthiness instead of the resolved string.
**Action:** Always cache the `Promise` and ensure `await` is used before checking the result of an async command utility.
