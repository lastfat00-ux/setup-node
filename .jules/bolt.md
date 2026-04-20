## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Memoize External Commands]
**Learning:** External process spawns via `@actions/exec` are expensive (~16ms per call). In monorepos or with `check-latest: true`, the same commands (like `yarn --version`) are often called repeatedly.
**Action:** Memoize results of `getCommandOutput` using a `Map<string, Promise<string>>` keyed by command and `cwd`. Also found that missing `await` on such calls can lead to truthiness bugs where a `Promise` is checked instead of its result.
