# OC3 Company World UI Design

## Status
Approved visual direction based on the latest mockup in this conversation.

## Goal
Build OC3 as a playable-looking 2D AI operations command center where each real agent is represented by a large chibi pixel character inside a top-down office world, while preserving serious operational controls for tasks, approvals, logs, models, and agent lifecycle actions.

## Product Principle
The game world is a visualization and interaction layer over real OC3 state. Character animation must never become the source of truth for backend state. Critical actions remain available through clear management panels even if the map animation is disabled or unavailable.

## Visual Direction
- High top-down / slightly elevated 2D office camera.
- Retro handheld RPG visual language with original characters and assets.
- Large chibi characters with oversized heads and small bodies.
- Character silhouettes should be softer and less square than pure voxel/Minecraft characters.
- Use a subtle chunky pixel/voxel texture for clothing, hair, furniture, and environment details.
- Characters must be visibly larger than classic overworld sprites so expressions and state are readable at normal desktop zoom.
- Dark navy futuristic UI chrome around the game world with cyan/blue accents and green operational status accents.
- Office world remains warm and inviting rather than cyberpunk-black everywhere.
- Pixel-art world plus highly readable modern/pixel-compatible UI typography.

## Character State Language
Every agent maps real OC3 state to a visible animation/state:

| Backend state | Character presentation |
| --- | --- |
| idle | Sleeping at their own workstation with animated Zzz |
| queued | Wakes up and shows a short attention indicator |
| working | Awake at desk, typing/operating equipment |
| thinking | Thinking animation / bubble while remaining at workstation |
| using_tool | Moves to or animates at the relevant functional area when appropriate |
| communicating | Faces or moves toward the relevant agent; short message bubble/data effect |
| waiting_approval | Moves to approval area or clearly displays waiting state tied to Aria/approver |
| completed | Brief completion reaction/checkmark, then returns to workstation |
| error | Alert animation and clear error marker |
| paused | Sleeping/frozen-at-rest presentation with visible pause badge |
| offline | Dimmed/absent state distinct from paused/idle |

Idle sleeping is a UI metaphor only. It must not trigger, pause, or alter backend runtime behavior.

## Core Office Map
Phase-one layout follows the approved mockup and reserves these spaces:
- Central OC3 lobby / identity area.
- Yoda lead-agent workstation.
- BB8 messenger/engineering workstation.
- Aria approval workstation.
- Meeting room.
- AI Lab / Models room.
- Servers / Logs room.
- Shared workstations for additional agents.
- Lounge / quiet area.
- Main circulation paths wide enough for character movement.

The map must be data-driven so desks, zones, spawn points, and agent home positions are configurable rather than hard-coded across UI components.

## Primary UI Shell
### Top bar
- OC3 identity.
- System health/status.
- Online agent count.
- Active task count.
- Pending approvals.
- Current local clock/date presentation.

### Left navigation
- Agents.
- Tasks.
- Approvals.
- Logs.
- Models.
- Company / organization view.
- Settings.

### Center
- Interactive 2D office world.
- Camera pan/zoom.
- Click/select agents.
- Visible state animations.
- Optional task-flow effects.

### Right agent drawer/panel
For the selected agent:
- Name and role.
- Current state.
- Current task.
- Model/provider.
- Uptime/runtime indicators when available.
- Recent activity.
- View Logs.
- Assign Task.
- Pause.
- Resume.
- Restart when supported and safe.
- Memory view when supported.
- Workflow/task history.

Critical actions must use confirmation/approval gates where the OC3 backend requires them.

## Architecture
Use a three-part structure:

```text
OC3
├── apps/
│   └── control-center/       # Next.js/React shell + game UI
├── services/
│   └── oc3-gateway/          # backend adapter + realtime transport
└── packages/
    └── shared/               # shared TypeScript domain contracts
```

### Frontend
- Next.js.
- React.
- TypeScript.
- Tailwind CSS.
- shadcn/ui where appropriate for conventional controls.
- PixiJS for the 2D world renderer.
- Lightweight animation helpers for non-world UI transitions.

### Gateway
- Node.js + TypeScript.
- Fastify.
- WebSocket for realtime events.
- REST endpoints for initial fetches and command-style actions.
- Adapter boundary between OC3/OpenClaw internals and the frontend domain model.

### Shared domain contracts
Initial domain objects:
- Agent.
- AgentState.
- Task.
- TaskState.
- Approval.
- ApprovalState.
- ActivityEvent.
- ModelInfo.
- SystemHealth.

The frontend must consume shared contracts rather than inventing separate copies of backend shapes.

## Data Flow
```text
OC3/OpenClaw runtime
      ↓
OC3 Gateway adapter
      ↓
normalized domain events
      ↓
WebSocket + REST
      ↓
frontend state store
      ↓
React panels + PixiJS world
```

Commands travel in the opposite direction:

```text
UI action
  ↓
validated gateway command
  ↓
OC3/OpenClaw action/approval path
  ↓
backend result/event
  ↓
UI state refresh
```

The UI never treats an optimistic animation as proof that the backend action succeeded.

## Functional Scope by Phase

### Phase 1 — Foundation + Static Command Center
Deliver a bootable OC3 application skeleton with:
- Workspace/project setup.
- `apps/control-center`.
- `services/oc3-gateway`.
- `packages/shared`.
- Shared domain types.
- Static shell matching the approved layout.
- Static/seeded agent roster.
- First office map scene.
- Large chibi placeholder/original sprites.
- Agent selection and right-side detail panel.
- Idle sleeping state visible in the map.
- Basic tests, linting, type-checking, and build scripts.

Phase 1 is intentionally not connected to the real OC3 runtime yet.

### Phase 2 — Agent World State Engine
- Agent finite-state presentation model.
- Idle/sleep, wake, working, thinking, waiting, error, paused, offline animations.
- Home desk positions and map zones.
- Basic path movement.
- Camera and selection polish.
- State transition tests.

### Phase 3 — Realtime Gateway
- Gateway health endpoint.
- Agent snapshot endpoint.
- Task/approval snapshot endpoints.
- WebSocket event stream.
- Normalization layer for future OC3/OpenClaw adapters.
- Frontend reconnect and stale-state handling.

### Phase 4 — Real Operations
- Assign Task.
- Pause/Resume.
- Safe Restart if supported.
- Approval review/approve/reject.
- Logs viewer.
- Current task and activity feed.
- Model/provider display.
- Error handling and command result feedback.

### Phase 5 — Task and Approval Visualization
- Visible agent-to-agent handoff effects.
- BB8 → Aria approval journey/indicator.
- Task queue visualization.
- Meeting/communication state.
- Workflow timeline and recent activity.

### Phase 6 — Production Polish
- Final original character sprite sets.
- Expanded office detail.
- Particle/data effects kept subtle and meaningful.
- Responsive layouts.
- Reduced-motion mode.
- Keyboard navigation where practical.
- Performance profiling.
- Error boundaries and degraded-mode UI.
- Sound-ready hooks, with sound disabled by default unless explicitly enabled.

## Error and Degraded-State Design
- WebSocket disconnect: show reconnecting indicator while preserving last confirmed snapshot with stale-state label.
- Gateway unavailable: map remains viewable but command actions are disabled.
- Individual agent error: keep the rest of the office interactive.
- Failed command: revert optimistic presentation and show the backend error.
- Missing optional data: show `Unavailable`, never fabricated values.

## Security and Safety
- Never expose provider API keys/secrets in frontend payloads or logs.
- Destructive/external actions must respect OC3 approval policies.
- Sanitize/redact sensitive log content before sending to browser clients.
- Separate display role metadata from actual backend permissions.
- UI controls must reflect backend authorization rather than granting authority by appearance.

## Testing Strategy
- Unit tests for shared contracts and state mapping.
- Component tests for agent selection and operational panels.
- State-machine tests for character presentation transitions.
- Gateway contract tests for REST/WebSocket payloads.
- End-to-end smoke tests for command center boot, select agent, view state, and later operational commands.
- Build/type-check/lint gates before merge.

## Non-Goals for Initial Phases
- No full autonomous life-simulation economy.
- No combat, leveling, inventory, or unrelated game mechanics.
- No dependency on real OC3 runtime in Phase 1.
- No direct frontend access to OpenClaw internals.
- No replacing operational panels with map-only controls.

## Success Criteria
The design is successful when a user can open OC3 and immediately understand which agents are idle, working, waiting, paused, offline, or in error; select an agent to inspect operational details; and later perform real OC3 actions from the same interface while the game world accurately mirrors confirmed backend state.
