## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2026-03-17 - [Intra-step Redundant Network Requests]
**Learning:** Network calls for `index.json` and GitHub manifests can occur multiple times within a single action step execution (e.g., when `check-latest` is true and there is a cache miss).
**Action:** Implement static, promise-based caching in distribution classes to ensure that the same remote resource is only fetched once per execution.
