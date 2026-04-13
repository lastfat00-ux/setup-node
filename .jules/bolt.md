## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Missing await in validation logic]
**Learning:** Forgetting to `await` an asynchronous function when checking its result (e.g., `if (!getCommandOutput(...))`) will always evaluate to false because a Promise is truthy. This can lead to silent failures in validation.
**Action:** Always verify that async functions returning values are awaited before being used in conditional checks.

## 2025-05-15 - [Command Output Memoization]
**Learning:** External process spawns via `exec.getExecOutput` are expensive. When the same command (e.g., `yarn --version`) is called multiple times within a single action run, it creates significant overhead.
**Action:** Implement a module-level cache for command outputs to collapse redundant process executions.
