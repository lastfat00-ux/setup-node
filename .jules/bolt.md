## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2026-06-11 - [Shell Command Execution Bottleneck]
**Learning:** Shell command execution via `exec.getExecOutput` is a major bottleneck, especially in monorepos where configuration checks (e.g., `yarn --version`, `npm config get cache`) are repeated. Memoizing the resulting Promise prevents "dog-piling" and reduces execution time from ~20ms to <1ms for subsequent calls.
**Action:** Always memoize external command results that are expected to be static during the action's lifecycle.
