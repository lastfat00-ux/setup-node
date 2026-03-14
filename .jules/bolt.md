## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-20 - [Redundant Network Requests for Metadata]
**Learning:** The `setup-node` action often fetches `index.json` and the versions manifest multiple times during a single step execution (e.g., once for `check-latest` and again for actual download). These redundant network calls are a significant bottleneck compared to CPU-bound tasks like parsing.
**Action:** Implement static, in-memory caching for these network requests using Promises to ensure the data is fetched only once per execution flow.
