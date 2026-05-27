## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Dist Directory Parity]
**Learning:** The `dist/` directory in this repository can sometimes be out of sync with the `src/` directory. Running `npm run build` may produce large diffs in `dist/` that include logic already present in `src/`. This can lead to reviewer confusion if they only look at the `dist/` changes.
**Action:** Always include `dist/` updates in PRs to ensure production parity, and explicitly mention in the PR description if large `dist/` diffs are due to a required sync with existing source optimizations.

## 2025-05-15 - [Async Promise Evaluation Bug]
**Learning:** Failing to `await` an async function (like `getCommandOutput`) when checking its result (e.g., `if (!stdOut)`) results in the check always being false (because a Promise object is truthy), even if the command eventually returns an empty string or fails.
**Action:** Always verify that async helper functions are properly awaited before their results are used in conditional logic.
