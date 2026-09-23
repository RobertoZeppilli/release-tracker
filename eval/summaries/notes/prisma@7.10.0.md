# Prisma ORM 7.10.0

Prisma ORM 7.10.0 introduces a compatibility package for running Prisma 7 alongside newer Prisma versions, secures Prisma Studio's local server, and includes fixes across Prisma Client and the PostgreSQL, MariaDB, Neon, SQLite, and Prisma Postgres Serverless adapters.

## Highlights

### Run Prisma 7 alongside Prisma 8

This release introduces `@prisma/prisma7`, a compatibility package that lets you retain a matching Prisma 7 CLI and configuration while installing Prisma 8 in the same project.

Once 7.10.0 is released, a side-by-side installation can use:

```sh
npm install --save-dev prisma@8 @prisma/prisma7@7.10.0
npm install @prisma/client@7.10.0
```

Use `prisma` for the directly installed Prisma 8 CLI and `prisma7` for Prisma 7:

```sh
npx prisma --version
npx prisma7 --version

npx prisma7 generate
npx prisma7 migrate dev
npx prisma7 db push
```

Prisma 7 now prefers version-specific configuration files, allowing its configuration to coexist with Prisma 8's `prisma.config.*` files:

```ts
// prisma7.config.ts
import { defineConfig } from '@prisma/prisma7/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
})
```

Without an explicit `--config` option, Prisma 7 searches for:

1. Root-level `prisma7.config.*` files.
2. `.config/prisma7.*` files.
3. Existing `prisma.config.*` files as a backwards-compatible fallback.

The supported extensions are `.js`, `.ts`, `.mjs`, `.cjs`, `.mts`, and `.cts`. An explicit config path always takes precedence:

```sh
npx prisma7 generate --config ./custom/prisma7.config.ts
```

New projects initialized by the Prisma 7 CLI use `prisma7.config.ts`. Existing projects containing only `prisma.config.*` continue to work without migration or additional warnings. If a `prisma7.config.*` file exists but cannot be loaded, Prisma reports the error rather than silently falling back to another configuration.

The `prisma7` identity is carried through CLI help, version output, shell completion, initialization, migration, database, and generation guidance. Stable Prisma concepts such as `schema.prisma`, Prisma Migrate, `@prisma/client`, and `PRISMA_*` environment variables remain unchanged.

Together, the separate executable and configuration namespace make it possible to operate Prisma 7 and Prisma 8 side by side without command or config-file collisions.

[#29949](https://github.com/prisma/prisma/pull/29949), [#29969](https://github.com/prisma/prisma/pull/29969), [#29994](https://github.com/prisma/prisma/pull/29994), [#30000](https://github.com/prisma/prisma/pull/30000), [#30002](https://github.com/prisma/prisma/pull/30002), [#30020](https://github.com/prisma/prisma/pull/30020)

### Prisma Studio security hardening

Prisma Studio's local HTTP server now:

- Binds explicitly to `127.0.0.1` instead of all network interfaces.
- Rejects browser requests from origins other than the active `localhost` or `127.0.0.1` Studio URL.
- No longer returns wildcard CORS headers.
- Applies the same protections across Node.js, Bun, and Deno.

This prevents network clients or malicious websites from accessing Studio's database endpoints while Studio is running.

[#29890](https://github.com/prisma/prisma/pull/29890)

## Prisma Client

- Fixed `P2002` errors from nested writes so `meta.modelName` identifies the model where the unique constraint violation occurred, including models using `@@map` and `@@schema`. [#29628](https://github.com/prisma/prisma/pull/29628)
- Fixed automatically batched `findUniqueOrThrow()` calls so every missing record rejects with `P2025`; later misses no longer resolve to `undefined`. [#29654](https://github.com/prisma/prisma/pull/29654)
- Parameter-chunked statements are now executed atomically in a transaction and rolled back if a later chunk fails. [#29771](https://github.com/prisma/prisma/pull/29771)
- Improved interactive transaction cleanup during `$disconnect()`, including transactions whose driver-level startup is still in progress. [#28768](https://github.com/prisma/prisma/pull/28768)
- Prevented transaction cleanup failures after a timeout or backend termination from becoming unhandled promise rejections. [#29611](https://github.com/prisma/prisma/pull/29611)
- Fixed fluent relation queries when relation fields are literally named `select` or `include`. [#29683](https://github.com/prisma/prisma/pull/29683)
- Fixed handling of `Date` and `Uint8Array` values created in other JavaScript realms, such as iframes, jsdom, and Node.js `vm` contexts. [#29177](https://github.com/prisma/prisma/pull/29177)
- Invalid `Date` values passed to `$queryRaw` or `$executeRaw` now throw `PrismaClientValidationError` instead of a generic error. [#29718](https://github.com/prisma/prisma/pull/29718)
- Fixed `moduleFormat` inference for the `prisma-client` generator in TypeScript projects using `module: "node16"` or `"nodenext"`. Generated output now follows the nearest `package.json` `type`, defaulting to CommonJS when absent. [#29712](https://github.com/prisma/prisma/pull/29712)
- Deserialized `Bytes` values now own standalone `ArrayBuffer`s rather than exposing unrelated contents from Node.js's shared `Buffer` pool. This applies to both regular and raw query results. [#29701](https://github.com/prisma/prisma/pull/29701)
- Fixed an incorrect logging context in the remote executor, including Accelerate-backed query execution. [#28892](https://github.com/prisma/prisma/pull/28892)

## Client extensions and observability

- Result-extension `compute` callbacks now receive the current model name as a typed second argument:

  ```ts
  compute(data, modelName) {
    // ...
  }
  ```

  The model name is also preserved when multiple extensions compose the same computed field. [#29782](https://github.com/prisma/prisma/pull/29782)

- Improved OpenTelemetry context for remotely executed queries:
  - `$on('query')` callbacks run within the matching `db_query` span.
  - Events from one operation share the same trace.
  - Error events are recorded as span exceptions.
  - Log events continue to be emitted when tracing is disabled or their reported span is unavailable.

  [#28892](https://github.com/prisma/prisma/pull/28892)

## Driver adapters

### MariaDB

- `@prisma/adapter-mariadb` now accepts an existing `mariadb` pool. External pools remain caller-owned unless `disposeExternalPool: true` is supplied. [#27992](https://github.com/prisma/prisma/pull/27992)
- Fixed pooled connection leaks during commit, rollback, and failed transaction startup. Connections are now returned with `release()` and transaction-specific listeners are removed before reuse. [#29612](https://github.com/prisma/prisma/pull/29612)
- Added support for bracketed IPv6 addresses in both `mysql://` and `mariadb://` connection strings. [#29026](https://github.com/prisma/prisma/pull/29026)
- Prevented malformed connection strings from exposing embedded passwords in retained debug output and diagnostic reports. [#27992](https://github.com/prisma/prisma/pull/27992)

### PostgreSQL, Neon, and Prisma Postgres Serverless

- PostgreSQL deadlocks using SQLSTATE `40P01` are now reported as `P2034` transaction write conflicts. [#29717](https://github.com/prisma/prisma/pull/29717)
- PostgreSQL `RESTRICT` violations using SQLSTATE `23001` are now reported as `P2003`, preserving an available field or constraint name. [#29554](https://github.com/prisma/prisma/pull/29554)
- `@prisma/adapter-pg` now preserves database constraint names when reporting unique constraint violations through `P2002`. [#29587](https://github.com/prisma/prisma/pull/29587)
- Prisma Postgres Serverless now prefers the named constraint for `P2002`, falling back to parsed field names when no constraint name is available. [#29801](https://github.com/prisma/prisma/pull/29801)
- Fixed Neon HTTP adapter serialization for typed parameters such as `Bytes` and `DateTime`. [#29747](https://github.com/prisma/prisma/pull/29747)

### SQLite

- `@prisma/adapter-better-sqlite3` now converts previously unhandled SQLite result codes into typed database errors instead of exposing raw driver errors.
- The complete `SQLITE_BUSY` family is now mapped to socket timeout errors, with numeric extended result codes preserved where available.

[#29794](https://github.com/prisma/prisma/pull/29794)

## CLI and Migrate

- `prisma generate` can now offer to install Prisma's agent skills. The opt-in prompt:
  - Is shown at most once per machine.
  - Is skipped in CI, containers, Git hooks, npm lifecycle scripts, and watch mode.
  - Is skipped when `--no-hints` is used or Prisma skills are already installed.
  - Times out after 30 seconds.
  - Never causes generation to fail if installation is unsuccessful.

  [#29690](https://github.com/prisma/prisma/pull/29690)

- A globally installed CLI now warns during `prisma generate` when its version differs from the project's local `prisma` or `@prisma/client`, and recommends running the local CLI. The check is best-effort and does not fail generation. [#29593](https://github.com/prisma/prisma/pull/29593)
- `prisma version` and `prisma version --json` now include the resolved Prisma CLI package path, making global-versus-local installation issues easier to diagnose. [#29573](https://github.com/prisma/prisma/pull/29573)
- Empty or generator-only schema files now report `Schema must contain a datasource block` from `db pull`, `db push`, and `migrate dev`, rather than reaching the schema engine and potentially producing inconsistent errors. [#29657](https://github.com/prisma/prisma/pull/29657)
- CLI commands now tolerate corrupt, unreadable, or unwritable command-state files. Invalid state is reinitialized, writes are atomic, and persistence failures fall back to in-memory state. [#29609](https://github.com/prisma/prisma/pull/29609)
- Studio now recognizes semicolon-delimited `sqlserver://` connection strings before reporting the existing explicit message that SQL Server is not supported by Studio. [#29623](https://github.com/prisma/prisma/pull/29623)
- The AI-agent safety checkpoint now also covers interactive `prisma db push` confirmations involving data-loss warnings, rather than only invocations using `--accept-data-loss`. [#29793](https://github.com/prisma/prisma/pull/29793)

## Performance and reliability

- Optimized query-plan execution by eagerly evaluating plans with one unconditional database operation and synchronously interpreting the remaining pure plan. Cached plans remain immutable. [#29004](https://github.com/prisma/prisma/pull/29004)
- Prevented call-stack overflows when rendering very large parameter lists or combining chunked results containing hundreds of thousands of rows. [#29751](https://github.com/prisma/prisma/pull/29751)
- Reduced ordinary query setup overhead by constructing fluent-relation field maps lazily and in linear time. Non-fluent queries no longer build this map. [#29752](https://github.com/prisma/prisma/pull/29752)

## Dependencies

- Updated the transitive `fast-uri` dependency to a patched release addressing production audit advisories affecting versions through `3.1.3`. [#29758](https://github.com/prisma/prisma/pull/29758)

