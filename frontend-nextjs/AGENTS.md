**Agents: Repository Instructions**

This document helps AI coding agents work productively in this repository. Keep it minimal and link-first—follow links to full docs where available.

**Quick Start**

- **Commands:** `npm run dev`, `npm run build`, `npm run build:prod`, `npm run test`, `npm run lint`
- **Dev workflow:** Run `npm run dev` for local development; run `npm run test` and `npm run lint` before proposing changes.

**Architecture (high level)**

- **Layers:** `core` (domain + application use cases), `infrastructure` (providers, repos), `src/_actions` (Next.js server actions), `components` (UI), `app` (Next.js app router).
- **Pattern:** Use case classes orchestrate small, injected steps (see `create-nlq-qa.usecase.ts` for an example).

**Conventions**

- **Naming:** Interfaces start with `I`, types with `T`, server actions use `kebab-case.action.ts`.
- **Files:** Use `*.action.ts` for Next.js server actions, `*.usecase.ts` for application use cases, `*.repo.ts` for repositories.
- **Validation:** Use Zod schemas; prefer deriving types from Zod when possible.

**Path aliases**

- See [tsconfig.json](tsconfig.json) for path aliases (agents should resolve imports using these aliases).

**Key files & examples**

- Build/test scripts — [package.json](package.json)
- Use-case example — [src/core/application/usecases/nlq/nlq-qa/create-nlq-qa.usecase.ts](src/core/application/usecases/nlq/nlq-qa/create-nlq-qa.usecase.ts)
- Server action example — [src/\_actions/auth/login.action.ts](src/_actions/auth/login.action.ts)
- Repository example — [src/infrastructure/repository/auth.repo.ts](src/infrastructure/repository/auth.repo.ts)
- Top-level README — [README.md](README.md)

**Common pitfalls for agents**

- Tests may load environment variables from `.env.development`; missing envs can break `npm run test`.
- DI-heavy patterns: adding a new use case often requires creating an interface, implementation, and DI wiring.
- Zod schema changes may require updating derived types and consuming code.
- Watch for circular dependencies when composing many steps.

**How agents should operate (concise rules)**

- Prefer small, focused edits and explanatory commit messages.
- Run `npm run lint` and `npm run test` locally (or in CI) before creating a PR.
- Link to relevant code and docs in explanations; do not duplicate large docs—use links.
- When adding new features, update any affected Zod schemas and unit tests.

**Where to look first**

- Architecture & patterns: `src/core` and `src/infrastructure`.
- Examples of server actions: `src/_actions`.
- Build/test scripts: [package.json](package.json)

If anything here is unclear or missing, open a PR against this file with suggested edits.
