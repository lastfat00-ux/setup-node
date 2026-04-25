## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2026-04-25 - [Command Output Memoization]
**Learning:** External command execution via `exec.getExecOutput` is a primary bottleneck in monorepos due to redundant process spawns for configuration checks (e.g., Yarn's `enableGlobalCache`).
**Action:** Memoize command results in `src/cache-utils.ts` using a Map keyed by command and CWD. Fixed a missing `await` in `getCommandOutputNotEmpty` discovered during benchmarking.
