## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Redundant Process Spawns in Monorepos]
**Learning:** External command execution via `exec.getExecOutput` is a primary bottleneck in monorepos because configuration checks (e.g., `yarn config get enableGlobalCache`) are often repeated for every project directory. Memoizing these results as Promises ensures they are only executed once while safely handling concurrent calls.
**Action:** Use a module-level `Map<string, Promise<string>>` to cache command outputs, keyed by the command and working directory. Ensure cache resetting is integrated into existing `resetCache` mechanisms for test isolation.
