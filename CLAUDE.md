## TypeScript Best Practices

- **Type Safety Principle**:
  - NEVER cast to `any` or `unknown` when encountering type errors. Type casting decisions require explicit human approval after exhausting all proper type solutions.
  - NEVER use `as any` to bypass TypeScript errors. This practice is strictly prohibited. Always implement proper type solutions.
  - Avoid type assertions and unnecessary type annotations. Instead, analyze what the correct type should be and properly satisfy the type requirements.
  - Type casting to `any` is absolutely forbidden without explicit permission from the user.

## Preferred Workflow for Feature Development

When working on new features or significant changes:

1. **Planning Phase (First Claude Instance)**:
   - Create a new git worktree and branch for the feature
   - Add any PM/PRD documents to a `tasks` folder in the worktree
   - Focus on planning, documentation, and specification

2. **Implementation Phase (Second Claude Instance)**:
   - User will open the worktree in a separate editor
   - A different Claude instance will assist with the actual code implementation
   - This separation allows for focused planning vs. implementation work

This workflow keeps planning and implementation concerns separated and allows for better focus on each phase of development.