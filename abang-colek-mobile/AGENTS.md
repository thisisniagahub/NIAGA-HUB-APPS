# Repository Guidelines

## Project Structure & Module Organization

- `app/` holds Expo Router screens, including tab routes under `app/(tabs)/` and nested routes like `app/events/[id].tsx`.
- `components/` contains shared UI building blocks, with reusable primitives under `components/ui/`.
- `hooks/` includes React hooks for app data, auth, color schemes, and sound effects.
- `lib/` and `shared/` provide core utilities, types, validation, and tRPC helpers.
- `server/` contains the Node/Express backend, tRPC routers, and WOCS services; database schema lives in `drizzle/`.
- `tests/` houses Vitest specs; assets are under `assets/`.

## Build, Test, and Development Commands

- `pnpm dev`: runs API server + Expo Metro (web) concurrently for local development.
- `pnpm dev:server`: starts the backend with `tsx watch` for hot reload.
- `pnpm dev:metro`: launches Expo web on port 8081.
- `pnpm test`: runs Vitest in CI mode; use `pnpm test --watch` for iterative testing.
- `pnpm lint` / `pnpm format`: run ESLint and Prettier.
- `pnpm check`: type‑check the project with `tsc --noEmit`.
- `pnpm db:push`: generates and runs Drizzle migrations.
- `pnpm android` / `pnpm ios`: open native simulators via Expo.

## Coding Style & Naming Conventions

- TypeScript‑first codebase; prefer typed APIs and `zod` validation in `lib/` and `server/`.
- Formatting is enforced via Prettier; run `pnpm format` before PRs.
- Linting uses `expo lint`; fix warnings rather than suppressing them.
- File‑based routes are lowercase and hyphenated (e.g., `app/(tabs)/lucky-draw.tsx`).
- Tests follow `*.test.ts` or `*.test.tsx` naming under `tests/`.

## Testing Guidelines

- Use Vitest for unit and integration tests.
- Keep tests focused on data logic (`lib/`, `server/`) and critical UI flows in `app/`.
- Add coverage for regressions tied to bugs or production incidents.

## Commit & Pull Request Guidelines

- Git history is not available in this workspace; confirm commit conventions with maintainers.
- PRs should include a clear summary, linked issue (if any), and screenshots for UI changes.
- Note environment changes (env vars, migrations) and include rollback steps when relevant.

## Security & Configuration Tips

- Store secrets in `.env` and keep them out of source control.
- Review `server/_core/env.ts` and `app.config.ts` when introducing new configuration.
- If migrations are added, document the corresponding `drizzle/` files in the PR.

## Project Structure & Module Organization

- `app/` holds Expo Router screens, including tab routes under `app/(tabs)/` and nested routes like `app/events/[id].tsx`.
- `components/` contains shared UI building blocks, with reusable primitives under `components/ui/`.
- `hooks/` includes React hooks for app data, auth, color schemes, and sound effects.
- `lib/` and `shared/` provide core utilities, types, validation, and tRPC helpers.
- `server/` contains the Node/Express backend, tRPC routers, and WOCS services; database schema lives in `drizzle/`.
- `tests/` houses Vitest specs; assets are under `assets/`.

## Build, Test, and Development Commands

- `pnpm dev`: runs API server + Expo Metro (web) concurrently for local development.
- `pnpm dev:server`: starts the backend with `tsx watch` for hot reload.
- `pnpm dev:metro`: launches Expo web on port 8081.
- `pnpm test`: runs Vitest in CI mode; use `pnpm test --watch` for iterative testing.
- `pnpm lint` / `pnpm format`: run ESLint and Prettier.
- `pnpm check`: type-checks the project with `tsc --noEmit`.
- `pnpm db:push`: generates and runs Drizzle migrations.
- `pnpm android` / `pnpm ios`: open native simulators via Expo.

## Coding Style & Naming Conventions

- TypeScript-first codebase; prefer typed APIs and `zod` validation in `lib/` and `server/`.
- Formatting is enforced via Prettier; run `pnpm format` before PRs.
- Linting uses `expo lint`; fix warnings rather than suppressing them.
- File-based routes are lowercase and hyphenated (e.g., `app/(tabs)/lucky-draw.tsx`).
- Tests follow `*.test.ts` or `*.test.tsx` naming under `tests/`.

## Testing Guidelines

- Use Vitest for unit and integration tests.
- Keep tests focused on data logic (`lib/`, `server/`) and critical UI flows in `app/`.
- Add coverage for regressions tied to bugs or production incidents.

## Commit & Pull Request Guidelines

- Git history is not available in this workspace; confirm commit conventions with maintainers.
- PRs should include a clear summary, linked issue (if any), and screenshots for UI changes.
- Note environment changes (env vars, migrations) and include rollback steps when relevant.

## Security & Configuration Tips

- Store secrets in `.env` and keep them out of source control.
- Review `server/_core/env.ts` and `app.config.ts` when introducing new configuration.
- If migrations are added, document the corresponding `drizzle/` files in the PR.

## Project Structure & Module Organization

- `app/` holds Expo Router screens, including tab routes under `app/(tabs)/` and nested routes like `app/events/[id].tsx`.

- `components/` contains shared UI building blocks, with reusable primitives under `components/ui/`.

- `hooks/` includes React hooks for app data, auth, color schemes, and sound effects.

- `lib/` and `shared/` provide core utilities, types, validation, and tRPC helpers.

- `server/` contains the Node/Express backend, tRPC routers, and WOCS services; database schema lives in `drizzle/`.

- `tests/` houses Vitet specs; assets are under `assets/`.

## Build, Test, and Development Commands

- `pnpm dev`: runs API server + Expo Metro (web) concurrently for local development.

- `pnpm dev:server`: starts the backend with `tsx watch` for hot reload.

- `pnpm dev:metro`: launches Expo web on port 8081.

- `pnpm test`: runs Vitest in CI mode; use `pnpm test --watch` for iterative testing.

- `pnpm lint` / `pnpm format`: run ESLint and Prettier.

- `pnpm check`: type-checks the project with `tsc --noEmit`.

- `pnpm db:push`: generates and runs Drizzle migrations.

- `pnpm android` / `pnpm ios`: open native simulators via Expo.

## Coding Style & Naming Conventions

- TypeScript-first codebase; prefer typed APIs and `zod` validation in `lib/` and `server/`.

- Formatting is enforced via Prettier; run `pnpm format` before PRs.

- Linting uses `expo lint`; fix warnings rather than suppressing them.

- File-based routes are lowercase and hyphenated (e.g., `app/(tabs)/lucky-draw.tsx`).

- Tests follow `*.test.ts` or `*.test.tsx` naming under `tests/`.

## Testing Guidelines

- Use Vitest for unit and integration tests.

- Keep tests focused on data logic (`lib/`, `server/`) and critical UI flows in `app/`.

- Add coverage for regressions tied to bugs or production incidents.

## Commit & Pull Request Guidelines

- Git history is not available in this workspace; confirm commit conventions with maintainers.

- PRs should include a clear summary, linked issue (if any), and screenshots for UI changes.

- Note environment changes (env vars, migrations) and include rollback steps when relevant.

## Security & Configuration Tips

- Store secrets in `.env` and keep them out of source control.

- Review `server/_core/env.ts` and `app.config.ts` when introducing new configuration.

- If migrations are added, document the corresponding `drizzle/` files in the PR.

## Project Structure & Module Organization

- `app/` holds Expo Router screens, including tab routes under `app/(tabs)/` and nested routes like `app/events/[id].tsx`.

- `components/` contains shared UI building blocks, with reusable primitives under `components/ui/`.

- `hooks/` includes React hooks for app data, auth, color schemes, and sound effects.

- `lib/` and `shared/` provide core utilities, types, validation, and tRPC helpers.

- `server/` contains the Node/Express backend, tRPC routers, and WOCS services; database schema lives in `drizzle/`.

- `tests/` houses Vitest specs; assets are under `assets/`.

## Build, Test, and Development Commands

- `pnpm dev`: runs API server + Expo Metro (web) concurrently for local development.

- `pnpm dev:server`: starts the backend with `tsx watch` for hot reload.

- `pnpm dev:metro`: launches Expo web on port 8081.

- `pnpm test`: runs Vitest in CI mode; use `pnpm test --watch` for iterative testing.

- `pnpm lint` / `pnpm format`: run ESLint and Prettier.

- `pnpm check`: type-checks the project with `tsc --noEmit`.

- `pnpm db:push`: generates and runs Drizzle migrations.

- `pnpm android` / `pnpm ios`: open native simulators via Expo.

## Coding Style & Naming Conventions

- TypeScript-first codebase; prefer typed APIs and `zod` validation in `lib/` and `server/`.

- Formatting is enforced via Prettier; run `pnpm format` before PRs.

- Linting uses `expo lint`; fix warnings rather than suppressing them.

- File-based routes are lowercase and hyphenated (e.g., `app/(tabs)/lucky-draw.tsx`).

- Tests follow `*.test.ts` or `*.test.tsx` naming under `tests/`.

## Testing Guidelines

- Use Vitest for unit and integration tests.

- Keep tests focused on data logic (`lib/`, `server/`) and critical UI flows in `app/`.

- Add coverage for regressions tied to bugs or production incidents.

## Commit & Pull Request Guidelines

- Git history is not available in this workspace; confirm commit conventions with maintainers.

- PRs should include a clear summary, linked issue (if any), and screenshots for UI changes.

- Note environment changes (env vars, migrations) and include rollback steps when relevant.

## Security & Configuration Tips

- Store secrets in `.env` and keep them out of source control.

- Review `server/_core/env.ts` and `app.config.ts` when introducing new configuration.

- If migrations are added, document the corresponding `drizzle/` files in the PR.

## Project Structure & Module Organization

- `app/` holds Expo Router screens, including tab routes under `app/(tabs)/` and nested routes like `app/events/[id].tsx`.
- `components/` contains shared UI building blocks, with reusable primitives under `components/ui/`.
- `hooks/` includes React hooks for app data, auth, color schemes, and sound effects.
- `lib/` and `shared/` provide core utilities, types, validation, and tRPC helpers.
- `server/` contains the Node/Express backend, tRPC routers, and WOCS services; database schema lives in `drizzle/`.
- `tests/` houses Vitest specs; assets are under `assets/`.

## Build, Test, and Development Commands

- `pnpm dev`: runs API server + Expo Metro (web) concurrently for local development.
- `pnpm dev:server`: starts the backend with `tsx watch` for hot reload.
- `pnpm dev:metro`: launches Expo web on port 8081.
- `pnpm test`: runs Vitest in CI mode; use `pnpm test --watch` for iterative testing.
- `pnpm lint` / `pnpm format`: run ESLint and Prettier.
- `pnpm check`: type-checks the project with `tsc --noEmit`.
- `pnpm db:push`: generates and runs Drizzle migrations.
- `pnpm android` / `pnpm ios`: open native simulators via Expo.

## Coding Style & Naming Conventions

- TypeScript-first codebase; prefer typed APIs and `zod` validation in `lib/` and `server/`.
- Formatting is enforced via Prettier; run `pnpm format` before PRs.
- Linting uses `expo lint`; fix warnings rather than suppressing them.
- File-based routes are lowercase and hyphenated (e.g., `app/(tabs)/lucky-draw.tsx`).
- Tests follow `*.test.ts` or `*.test.tsx` naming under `tests/`.

## Testing Guidelines

- Use Vitest for unit and integration tests.
- Keep tests focused on data logic (`lib/`, `server/`) and critical UI flows in `app/`.
- Add coverage for regressions tied to bugs or production incidents.

## Commit & Pull Request Guidelines

- Git history is not available in this workspace; confirm commit conventions with maintainers.
- PRs should include a clear summary, linked issue (if any), and screenshots for UI changes.
- Note environment changes (env vars, migrations) and include rollback steps when relevant.

## Security & Configuration Tips

- Store secrets in `.env` and keep them out of source control.
- Review `server/_core/env.ts` and `app.config.ts` when introducing new configuration.
- If migrations are added, document the corresponding `drizzle/` files in the PR.
