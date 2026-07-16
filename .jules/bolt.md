## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Memoizing External Command Results]
**Learning:** In monorepos or complex setups, commands like `yarn config get` or `yarn --version` are executed repeatedly across multiple project directories. Memoizing these results using a Promise-based cache yields massive performance gains (~1900x speedup for repeated calls).
**Action:** Use a module-level `Map` keyed by command, `cwd`, and `PATH` to cache command output Promises. Caching the Promise ensures concurrent callers wait for the same execution.
