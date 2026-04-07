## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Memoizing External Command Output]
**Learning:** External process spawns are expensive (~15-20ms per call). In monorepo setups, utilities like `getCommandOutput` may be called repeatedly for the same command in different subdirectories, leading to redundant overhead.
**Action:** Memoize `getCommandOutput` using a `Map<string, Promise<string>>` keyed by the command and working directory. Fixing bugs like missing `await` in wrapper functions ensures the cache correctly stores resolved values.
