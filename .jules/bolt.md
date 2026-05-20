## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Out-of-sync Dist Directory]
**Learning:** The `dist/` directory can become out-of-sync with `src/` if optimizations were committed to `src/` without rebuilding. This leads to confusing code review diffs where logic appears to be missing from `src/` but is present in `dist/`.
**Action:** Always run `npm run build` before modifying source files to ensure `dist/` reflects the current `src/` state, or at least before final verification.
