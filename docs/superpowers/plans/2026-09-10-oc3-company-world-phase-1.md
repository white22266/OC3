# OC3 Company World Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a bootable OC3 Company World foundation that visually follows the approved mockup, renders a large-chibi 2D office scene, supports seeded agent selection, and clearly shows sleeping idle agents before any real OpenClaw/OC3 runtime connection is introduced.

**Architecture:** Use an npm-workspaces monorepo with a Next.js control-center app, a Fastify gateway service, and a shared TypeScript package. The frontend owns the visual shell and PixiJS office renderer; the gateway is a stubbed boundary in Phase 1; shared contracts define all domain shapes consumed by both sides.

**Tech Stack:** Node.js 22+, npm 10+, TypeScript strict mode, Next.js, React, Tailwind CSS, PixiJS, Fastify, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-10-oc3-company-world-design.md`

## Global Constraints

- Work only on `feat/company-world-phase-1`; do not implement Phase 1 directly on `main`.
- Keep the approved visual direction: high-angle top-down office, dark navy futuristic shell, warm office interior, large chibi pixel characters, subtle chunky/voxel texture, softer silhouettes than pure cube characters.
- Idle agents visually sleep at their own desks with `Zzz`; this is presentation only and never changes backend runtime state.
- Phase 1 uses seeded data only and must not call the real OC3/OpenClaw runtime.
- The 2D map must be data-driven; agent home positions and office zones live in configuration/data files, not scattered component constants.
- The UI must not fabricate success for commands; Phase 1 command buttons are visibly non-operational/preview-only where applicable.
- TypeScript strict mode, lint, unit/component tests, typecheck, and production build must pass before Phase 1 is considered complete.

---

## Phase Roadmap

### Phase 1 — Foundation + Static Command Center
Bootable monorepo, shared contracts, seeded agents, approved shell layout, PixiJS office scene, oversized chibi agent rendering, idle sleeping UI, agent selection and detail panel, tests/build gates.

### Phase 2 — Agent World State Engine
Add the presentation state machine for idle/sleep, queued/wake, working, thinking, using-tool, communicating, waiting-approval, completed, error, paused, and offline. Add basic movement between configured office zones and polished camera behavior.

### Phase 3 — Realtime Gateway
Add normalized REST snapshots, WebSocket events, reconnect/stale-state handling, and the OC3/OpenClaw adapter boundary without coupling the frontend to runtime internals.

### Phase 4 — Real Operations
Wire Assign Task, Pause, Resume, safe Restart where supported, approval review/approve/reject, logs, current task, activity stream, and model/provider information through the gateway with backend-confirmed results.

### Phase 5 — Workflow Visualization
Visualize agent-to-agent handoffs, BB8-to-Aria approval flow, queues, communication/meeting state, task routes, and workflow timelines.

### Phase 6 — Production Polish
Replace placeholders with final original sprite sets and richer office assets; add meaningful particles/data-flow effects, responsive behavior, reduced motion, keyboard access, performance profiling, degraded-state UI, error boundaries, and optional sound hooks.

---

## Phase 1 File Structure

```text
OC3/
├── package.json
├── tsconfig.base.json
├── .gitignore
├── README.md
├── apps/
│   └── control-center/
│       ├── package.json
│       ├── next.config.ts
│       ├── tsconfig.json
│       ├── postcss.config.mjs
│       ├── src/
│       │   ├── app/
│       │   │   ├── globals.css
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── components/
│       │   │   ├── command-center/CommandCenter.tsx
│       │   │   ├── command-center/CommandCenter.test.tsx
│       │   │   ├── navigation/Sidebar.tsx
│       │   │   ├── shell/TopStatusBar.tsx
│       │   │   ├── agent/AgentPanel.tsx
│       │   │   └── world/CompanyWorldCanvas.tsx
│       │   ├── data/
│       │   │   ├── agents.ts
│       │   │   └── office-layout.ts
│       │   └── lib/
│       │       └── agent-presentation.ts
│       ├── vitest.config.ts
│       └── vitest.setup.ts
├── services/
│   └── oc3-gateway/
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/server.ts
│       ├── src/app.ts
│       └── src/app.test.ts
└── packages/
    └── shared/
        ├── package.json
        ├── tsconfig.json
        ├── src/index.ts
        ├── src/domain.ts
        └── src/domain.test.ts
```

### Task 1: Monorepo Foundation and Shared Domain Contracts

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `README.md`
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/domain.test.ts`
- Create: `packages/shared/src/domain.ts`
- Create: `packages/shared/src/index.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `AgentState`, `Agent`, `Task`, `Approval`, `ActivityEvent`, `ModelInfo`, `SystemHealth` exported from `@oc3/shared`.

- [ ] **Step 1: Create workspace/config files** with npm workspaces for `apps/*`, `services/*`, and `packages/*`; define root scripts `dev`, `test`, `typecheck`, `lint`, and `build`.
- [ ] **Step 2: Write the failing shared-domain test** asserting the complete supported `AgentState` vocabulary and a seeded-compatible `Agent` shape.
- [ ] **Step 3: Run `npm test -w @oc3/shared` and verify RED** because domain exports do not yet exist.
- [ ] **Step 4: Implement the minimal shared domain types** in `domain.ts` and re-export them from `index.ts`.
- [ ] **Step 5: Run `npm test -w @oc3/shared` and verify GREEN**.
- [ ] **Step 6: Run `npm run typecheck -w @oc3/shared`**.
- [ ] **Step 7: Commit** with `feat: establish OC3 workspace and shared domain contracts`.

### Task 2: Gateway Skeleton and Health Contract

**Files:**
- Create: `services/oc3-gateway/package.json`
- Create: `services/oc3-gateway/tsconfig.json`
- Create: `services/oc3-gateway/src/app.test.ts`
- Create: `services/oc3-gateway/src/app.ts`
- Create: `services/oc3-gateway/src/server.ts`

**Interfaces:**
- Consumes: `SystemHealth` from `@oc3/shared`.
- Produces: `buildApp()` and `GET /health` returning `{ status: "online", mode: "seeded", runtimeConnected: false }`.

- [ ] **Step 1: Write the failing gateway contract test** using Fastify injection against `GET /health`.
- [ ] **Step 2: Run `npm test -w @oc3/gateway` and verify RED** because `buildApp()` does not exist.
- [ ] **Step 3: Implement `buildApp()` and the seeded health route**; keep runtime connectivity explicitly `false`.
- [ ] **Step 4: Add `server.ts` that listens on `OC3_GATEWAY_PORT` or port `4100`**.
- [ ] **Step 5: Run gateway tests and verify GREEN**.
- [ ] **Step 6: Run gateway typecheck**.
- [ ] **Step 7: Commit** with `feat: add OC3 gateway health skeleton`.

### Task 3: Seeded Office Model and Presentation Mapping

**Files:**
- Create: `apps/control-center/src/data/agents.ts`
- Create: `apps/control-center/src/data/office-layout.ts`
- Create: `apps/control-center/src/lib/agent-presentation.test.ts`
- Create: `apps/control-center/src/lib/agent-presentation.ts`

**Interfaces:**
- Consumes: `Agent` and `AgentState` from `@oc3/shared`.
- Produces: `seedAgents`, `officeZones`, `agentHomePositions`, and `getAgentPresentation(state)` returning label, badge tone, sleeping flag, and marker text.

- [ ] **Step 1: Write the failing presentation test** asserting `idle` maps to `{ isSleeping: true, marker: "Zzz" }`, `working` is awake, and `paused` is visually distinct from idle.
- [ ] **Step 2: Run the targeted test and verify RED**.
- [ ] **Step 3: Implement the minimal presentation mapper**.
- [ ] **Step 4: Add seeded agents for Yoda, BB8, Aria, Forge, Research, and Ops** with varied states so the scene visibly contains working and sleeping agents.
- [ ] **Step 5: Add data-driven office zones/home positions** matching the approved mockup: meeting room, lobby, AI lab, Yoda/BB8/Aria desks, shared desks, lounge, servers/logs.
- [ ] **Step 6: Run tests and typecheck; verify GREEN**.
- [ ] **Step 7: Commit** with `feat: add seeded agents and office presentation model`.

### Task 4: Command Center Shell and Agent Selection

**Files:**
- Create: `apps/control-center/package.json`
- Create: `apps/control-center/next.config.ts`
- Create: `apps/control-center/tsconfig.json`
- Create: `apps/control-center/postcss.config.mjs`
- Create: `apps/control-center/vitest.config.ts`
- Create: `apps/control-center/vitest.setup.ts`
- Create: `apps/control-center/src/app/layout.tsx`
- Create: `apps/control-center/src/app/page.tsx`
- Create: `apps/control-center/src/app/globals.css`
- Create: `apps/control-center/src/components/command-center/CommandCenter.test.tsx`
- Create: `apps/control-center/src/components/command-center/CommandCenter.tsx`
- Create: `apps/control-center/src/components/navigation/Sidebar.tsx`
- Create: `apps/control-center/src/components/shell/TopStatusBar.tsx`
- Create: `apps/control-center/src/components/agent/AgentPanel.tsx`

**Interfaces:**
- Consumes: `seedAgents`, shared domain types.
- Produces: page-level layout with left nav, top bar, center world slot, and right agent panel; selecting a roster/world agent changes the detail panel.

- [ ] **Step 1: Write the failing component test** that renders `CommandCenter`, confirms Yoda is initially selected, clicks Aria, and expects the right panel to show `Aria` and `Approval Agent`.
- [ ] **Step 2: Run the targeted test and verify RED**.
- [ ] **Step 3: Implement the minimal command-center state and agent panel** so the test passes.
- [ ] **Step 4: Add the approved dark navy shell styling** with a compact left sidebar, wide central world area, top system bar, and right inspector.
- [ ] **Step 5: Make non-wired Phase 1 operations visibly `Preview`/disabled rather than pretending they work**.
- [ ] **Step 6: Run component tests and typecheck; verify GREEN**.
- [ ] **Step 7: Commit** with `feat: build OC3 command center shell and agent inspector`.

### Task 5: PixiJS Office World and Large Chibi Characters

**Files:**
- Create: `apps/control-center/src/components/world/CompanyWorldCanvas.tsx`
- Create: `apps/control-center/src/components/world/world-model.test.ts`
- Create: `apps/control-center/src/components/world/world-model.ts`
- Modify: `apps/control-center/src/components/command-center/CommandCenter.tsx`
- Modify: `apps/control-center/src/app/globals.css`

**Interfaces:**
- Consumes: `officeZones`, `agentHomePositions`, `seedAgents`, `getAgentPresentation`.
- Produces: data-derived Pixi scene model and interactive world selection callback `onSelectAgent(agentId: string)`.

- [ ] **Step 1: Write the failing world-model test** proving each seeded agent resolves to one configured home position and idle agents produce a sleeping marker.
- [ ] **Step 2: Run the targeted test and verify RED**.
- [ ] **Step 3: Implement `buildWorldModel()`** as a pure function independent of Pixi rendering.
- [ ] **Step 4: Verify the world-model test GREEN**.
- [ ] **Step 5: Implement `CompanyWorldCanvas` as a client-only PixiJS renderer** with high-angle office zones, furniture blocks, signage, desks, large soft-edged chibi figures, selection glow, and `Zzz` markers for sleeping agents.
- [ ] **Step 6: Connect Pixi agent clicks to the React-selected-agent state**.
- [ ] **Step 7: Size characters substantially larger than classic overworld sprites and keep heads oversized, bodies small, and silhouettes less boxy than Minecraft avatars**.
- [ ] **Step 8: Add a graceful DOM fallback message if WebGL/canvas initialization fails**.
- [ ] **Step 9: Run all control-center tests and typecheck**.
- [ ] **Step 10: Commit** with `feat: render interactive OC3 company world`.

### Task 6: Phase 1 Quality Gate

**Files:**
- Modify: `README.md`
- Modify only files required to fix verified quality-gate failures.

**Interfaces:**
- Consumes: all Phase 1 deliverables.
- Produces: reproducible startup/test instructions and a verified Phase 1 branch.

- [ ] **Step 1: Document setup**: `npm install`, `npm run dev`, frontend/gateway ports, Phase 1 seeded-data limitation, and Phase 2 next step.
- [ ] **Step 2: Run `npm test`** and require all suites green.
- [ ] **Step 3: Run `npm run typecheck`** and require zero TypeScript errors.
- [ ] **Step 4: Run `npm run lint`** and require zero lint errors.
- [ ] **Step 5: Run `npm run build`** and require both frontend and gateway/shared build steps to pass.
- [ ] **Step 6: Start the app locally and smoke-test** that the command center loads, sleeping agents display `Zzz`, and selecting an agent updates the right panel.
- [ ] **Step 7: Commit documentation/fixes** with `chore: complete Phase 1 verification`.

## Phase 1 Definition of Done

Phase 1 is complete only when the branch boots from a fresh `npm install`, shows the approved OC3 command-center shell, renders the configured office world with oversized chibi characters, visibly shows idle agents sleeping, supports agent selection, keeps actions non-operational unless backed by a real command path, and passes test/typecheck/lint/build verification.
