## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2026-04-11 - [Memoization of Command Output]
**Learning:** External command execution using `@actions/exec` involves process spawning which is expensive (~20-30ms per call). Repetitive calls for environment probing (like `npm config get cache`) can be significantly optimized by memoizing the result.
**Action:** Use a module-level `Map<string, Promise<string>>` to cache the results of `getCommandOutput` based on the command and working directory.
