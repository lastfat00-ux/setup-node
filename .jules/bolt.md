## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-16 - [pnpm install vs npm ci for NCC Bundling]
**Learning:** Running `pnpm install` creates pnpm symlinks in `node_modules` that cause `@vercel/ncc` to generate code-split chunk files (e.g. `975.index.js`) during `pnpm run build`.
**Action:** Use `npm ci` when building production artifacts to ensure `@vercel/ncc` generates clean single-file bundles in `dist/`.
