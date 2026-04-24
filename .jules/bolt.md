## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-16 - [Memoizing External Commands]
**Learning:** External command execution (via `@actions/exec`) is a major bottleneck in monorepos where multiple subprojects may trigger the same configuration checks. Memoizing these results can reduce execution time by 99% for repeated calls.
**Action:** Use a module-level Map to cache command outputs, ensuring to provide a reset mechanism for test isolation.
