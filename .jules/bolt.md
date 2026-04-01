## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Command Output Memoization]
**Learning:** External process spawns are expensive. In monorepo workflows, the same command (e.g., `yarn --version`) can be called repeatedly across multiple project directories, causing significant overhead.
**Action:** Use a `Map<string, Promise<string>>` to memoize command results by their command string and working directory. Storing the promise directly prevents race conditions where concurrent calls for the same command might spawn multiple processes.

## 2025-05-15 - [Awaiting Async Results in Validation]
**Learning:** Missing `await` when calling an async function that returns a string can lead to silent logic failures, as the code may end up checking the truthiness of a `Promise` object instead of the actual string result.
**Action:** Always `await` the results of asynchronous utility functions before performing validation or logical checks on their return values.
