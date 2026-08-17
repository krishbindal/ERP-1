# Skill Policy

## Skill Principles

1. **Skills are task-specific.** Only load skills when their specific domain is being actively worked on.
2. **Do not install everything.** Avoid `--all` installations. A lean skill set prevents context pollution and conflicting instructions.
3. **Prefer minimum complete coverage.** Choose comprehensive, high-quality skills over multiple overlapping granular skills.
4. **Avoid redundant skills.** Do not stack multiple skills that cover the same domain (e.g., avoid combining `react-patterns` and `react-best-practices` unless they serve distinctly different purposes).
5. **Official vendor guidance takes precedence.** When official vendor skills (like the Official Supabase Agent Skill) are available, they override any generic skill for that technology.
6. **SchoolOS architecture takes precedence.** The `docs/` folder and project architecture decisions always overrule generic skill instructions.
7. **Security decisions require explicit review.** Skills cannot independently authorize architectural or security changes without validation.
8. **Skill selection must be recorded.** All installed skills must be documented in `SKILL_SELECTION_MATRIX.md`.
9. **Skill changes must be documented.** Updates or additions to the skill stack must be reflected in the project state.
10. **Skills cannot authorize architectural changes.** Skills serve as expert advisors, not decision-makers for foundational architecture.

## Required Process

```text
Task
 ↓
Read PROJECT_STATE
 ↓
Read relevant architecture docs
 ↓
Inspect capability surface
 ↓
Search skill catalog
 ↓
Compare candidate skills
 ↓
Select exact skill IDs
 ↓
Validate stack
 ↓
Implement
 ↓
Test
 ↓
Update PROJECT_STATE
```

## Precedence

```text
SchoolOS master specification
    >
Official vendor guidance
    >
Approved ADRs
    >
Specialized AAS skill
    >
Generic skill
```
