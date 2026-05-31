## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-22 - [Memoizing External Command Outputs]
**Learning:** External command execution via `exec.getExecOutput` is a significant bottleneck in monorepos because it's called repeatedly for each project directory to resolve cache paths (e.g., `yarn config get cacheFolder`).
**Action:** Memoize these calls at the module level in `src/cache-utils.ts`, ensuring that different working directories are handled correctly in the cache key.
