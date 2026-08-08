# Sprint 17 Report — Project Form UX Improvements

## Summary

Replaced the free-text project status field with a constrained status dropdown and improved the successful project-creation flow. New projects now refresh the dashboard immediately, close and reset the form, and open their task workspace after creation.

## Files Updated

- `src/index.html`
- `src/project-form.js`
- `src/projects.service.js`
- `src/app.js`
- `src/styles.css`
- `README.md`
- `docs/PRODUCT_VISION.md`
- `docs/PROJECT_CONSTITUTION.md`
- `docs/ROADMAP.md`
- `docs/WORKFLOW.md`

## Scope Confirmation

- The project status control now offers only `Active` and `Archived`, with `Active` selected by default.
- Existing project validation remains unchanged.
- No database schema, Supabase schema, migrations, task completion behavior, or task edit behavior changed.
- Project creation returns the created row only to support the existing dashboard refresh and cleanly select its task workspace.

## Verification

- Tested through the live Supabase-backed application integration.
- Created exactly one temporary project: `Sprint 17 Verification — DELETE ME`.
- Selected `Archived` and verified that the created project displayed that status immediately on the refreshed dashboard.
- Confirmed the creation dialog closed automatically and the newly created project task workspace opened.
- Reopened the form and confirmed it reset to an empty name and `Active` status.
- Deleted only the temporary verification project (ID `7c8160ab-03ce-48f9-940b-575460600cd4`) and confirmed no matching project remains.
- Confirmed the Sprint 16 task editing and completion code paths were not modified.

## Final Release Status

- Approved for release as `v0.2.6`.
- Release commit: `feat(projects): improve project creation UX`.
- No database schema or migration changes are included.
