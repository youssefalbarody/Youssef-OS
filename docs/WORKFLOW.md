# WORKFLOW

Version: 0.5.0
Current release: Sprint 22
Status: Active
Project: Youssef OS

---

## Purpose

This workflow defines how Youssef OS is planned, built, reviewed, and improved through small, maintainable releases.

## Release Cycle

Each release follows this sequence:

1. Define the release goal and scope.
2. Prepare or update the documentation required for that scope.
3. Review and approve the release plan.
4. Implement the approved scope.
5. Test the release against its acceptance criteria.
6. Review the outcome, record decisions and issues, and identify the next release.

No release step should be skipped unless explicitly approved. Documentation, architecture, database, and security work are completed before implementation when they are required by the release scope.

## Communication Rules

Every AI response should provide, in this order:

1. Current task
2. Files to create or edit
3. Exact content, when applicable
4. Next action after completion
5. Optional explanation

Actionable information appears before explanation.

## Documentation Rules

- Every document has a version and status.
- Related documentation is updated together when a release changes its meaning.
- Major architecture, data, and security decisions are documented before implementation.
- Each completed sprint includes `SPRINT_REPORT.md` with the work completed, decisions, issues, and readiness for the next step.

## Implementation Rules

- Implement only approved, in-scope release work.
- Keep changes modular and proportionate to the release goal.
- Test the approved scope before considering the release complete.
- Consider security from the beginning of every release.

---

End of WORKFLOW v0.3.0
