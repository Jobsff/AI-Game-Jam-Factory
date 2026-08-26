# Agent Execution Agreement

## Start
- Declare `DELIVERY_MODE`: `PROTOTYPE` / `JAM_DEMO` / `VERTICAL_SLICE` / `COMMERCIAL`. This repository defaults to `JAM_DEMO`.
- State the current milestone, deadline, acceptance criteria and stop condition before acting.
- For formal development, read `GDD.md`, `TDD.md`, `GAME_MAP.md` and the relevant contract. For trials or prototypes, read only what the task needs.

## Orchestration
- The primary agent is the producer: it owns scope, schedule, delegation and final decisions.
- Default to one agent. Delegate only bounded work that benefits from isolated context.
- `KK3`: read-only review for ambiguous, irreversible or cross-module decisions.
- `G53`: default and only production-code writer.
- `MM3`: time-boxed delivery-blocker check at named milestones; never a continuous background audit.

## Delivery modes
- `PROTOTYPE`: prove the idea quickly.
- `JAM_DEMO`: finish a complete, memorable and stable demo on time.
- `VERTICAL_SLICE`: prove maintainability and product potential.
- `COMMERCIAL`: satisfy explicit release, security and reliability gates.

## Control limits
- Every review has a scope, time budget and issue budget. For `JAM_DEMO`, MM3 defaults to 30 minutes and at most 5 findings.
- P0/P1 block delivery. P2 is a producer decision. P3 goes to backlog.
- One repair-and-regression loop is the default for a milestone; regression may not open a new attack surface.
- Do not run a full roundtable for routine implementation or ordinary bug fixes.

## Engineering discipline
- Make the smallest change that satisfies the accepted goal; do not add unrequested systems or refactor unrelated code.
- Preserve core loop, input ownership, public contracts and data formats unless the producer approves a change.
- Protect existing work; do not use destructive Git commands. Commit or push only when explicitly authorized.
- Report actual files changed, commands run, exit codes, unverified items and deferred work.

Factory operators: see `00_Command_Center/MULTI_AGENT_WORKFLOW.md` in the source repository.
