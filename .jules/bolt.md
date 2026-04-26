## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Memoizing External Commands]
**Learning:** External command execution via `exec.getExecOutput` is a primary bottleneck in monorepos due to redundant process spawns for configuration checks (e.g., Yarn's `enableGlobalCache`). Memoizing these results in a module-level `Map` keyed by the command and CWD yields a 99%+ performance improvement for subsequent calls.
**Action:** Use a `Map<string, Promise<string>>` to cache command outputs and ensure a reset mechanism exists for test isolation.
