## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-20 - [Promise identity & Truthiness in execution wrappers]
**Learning:** Returning a promise from an `async` function implicitly wraps it in a new promise, breaking promise identity and object equality. Also, failing to await a promise returned from a wrapper means checking if it is empty/falsy evaluates the Promise object (which is always truthy) instead of the actual resolved string.
**Action:** Declare wrappers returning cached promises *without* the `async` keyword to preserve original promise identity, and always explicitly `await` their values when verifying correctness.
