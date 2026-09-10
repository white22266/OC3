# OC3 Company World

OC3 is being built as a 2D AI operations command center: a serious agent-management interface presented as a top-down company game.

## Phase 1

Phase 1 is intentionally **seeded-data only**. It establishes the visual shell, shared contracts, gateway boundary, interactive agent selection, the first PixiJS office scene, and the visual rule that idle agents sleep at their desks with `Zzz`. It does **not** connect to the real OC3/OpenClaw runtime yet.

## Requirements

- Node.js 22+
- npm 10+

## Start

```bash
npm install
npm run dev
```

- Control Center: http://localhost:3000
- Gateway health: http://localhost:4100/health

## Quality gates

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Architecture

```text
apps/control-center    Next.js + React + PixiJS UI
services/oc3-gateway  Fastify boundary for future OC3/OpenClaw integration
packages/shared       Shared TypeScript domain contracts
```

See `docs/superpowers/specs/2026-09-10-oc3-company-world-design.md` for the approved design and `docs/superpowers/plans/2026-09-10-oc3-company-world-phase-1.md` for the implementation plan.
