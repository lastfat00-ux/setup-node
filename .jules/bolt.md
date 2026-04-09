## 2025-05-15 - [Semver Range Parsing in Loops]
**Learning:** semver.satisfies(version, range) parses the range string into a Range object every time it's called. In loops matching many versions against a single range, this causes significant overhead.
**Action:** Pre-parse the range string using `new semver.Range(range, options)` outside the loop and pass the resulting object to `semver.satisfies`.

## 2025-05-15 - [Cleanup after Install]
**Learning:** Running `pnpm install` can create a lockfile (like `pnpm-lock.yaml`) if it doesn't exist, which should not be committed unless requested.
**Action:** Always check for and remove any auto-generated lockfiles or temporary scripts before submission.

## 2025-05-15 - [Process Spawn Caching]
**Learning:** External process spawns (e.g., `yarn --version`) are expensive (~30ms) and can be called multiple times during cache resolution for monorepos.
**Action:** Memoize `getCommandOutput` using a `Map<string, Promise<string>>` to ensure identical commands are only executed once, while correctly handling concurrent callers.

## 2025-05-15 - [Artifact Integrity]
**Learning:** Modifying `dist/` files directly without corresponding source changes leads to "ghost" logic that disappears on build.
**Action:** Always implement optimizations in `src/` and run `npm run build` to update artifacts.
