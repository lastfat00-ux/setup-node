## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-19 - [Source/Dist Sync and Maintenance]
**Learning:** Build artifacts in `dist/` can fall out of sync with `src/` if optimizations are committed without running the build script. This leads to confusing code reviews where existing source optimizations appear as new changes in `dist/` or vice versa.
**Action:** Always run `npm run build` before submitting to ensure `dist/` is perfectly synced with `src/`.
