## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-16 - [Function Signature and Promise Identity in Memoization]
**Learning:** In async functions, returning a cached Promise wraps it in a new Promise instance, losing promise identity. Declaring the memoized function without `async` and returning the Promise directly preserves exact object identity.
**Action:** Always declare memoized asynchronous helpers as synchronous functions returning `Promise<T>` directly.
