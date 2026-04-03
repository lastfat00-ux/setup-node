## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-16 - [Redundant Process Spawns for Command Outputs]
**Learning:** External process execution (e.g., `yarn --version`) is expensive. In this codebase, the same environment-probing commands were being executed multiple times across different modules in a single action run.
**Action:** Implement a module-level `Map<string, Promise<string>>` to memoize command outputs. Storing the promise instead of the result prevents race conditions where multiple concurrent calls might spawn multiple processes for the same command.
