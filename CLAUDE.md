# CLAUDE.md

@AGENTS.md

## Claude Code Specifics

- For edits to this static site (HTML/CSS/vanilla JS, accessibility, performance, microsites, hero/contact form, visual polish), prefer delegating to the `static-site-maintainer` subagent — it already knows this repo's constraints and file map.
- A `static-site-change` skill is available under `.claude/skills/` for the common workflow of adding or editing a page/microsite. Use it when the task matches that shape.
- There is no linter, formatter, test suite, or build step in this repo. Do not invent npm scripts, dev servers, or CI config. Verify changes by opening the affected HTML file(s) directly in a browser.
- Treat `dist/` and `node_modules/` as ignored/local-only, even if they show up in `git status`. Never read them as source of truth and never edit them.
- Do not run `git commit`, `git push`, or any deployment/Docker/Caddy command unless the user explicitly asks in that turn. This repo has no server/deploy config, so there is nothing to "apply" beyond editing files.
- Use plan mode for changes that touch multiple sections/files or change the hero/contact form/visual system. Small copy or single-file CSS tweaks do not need it.
