## TypeScript Best Practices

- **Type Safety Principle**:
  - NEVER cast something to `any` or `unknown` if you're running into type errors. That is the kind of decision that only a human engineer can make, and only if we've exhausted all other proper methods for resolving a type issue.
  - NEVER use `as any` to bypass TypeScript errors. This is absolutely forbidden. Always find the proper type solution.
  - never use type annotations, never type cast or assert. always check for what the type should be and if an error is being thrown, figure out how to properly meet the type requirements!
  - nope nope nope, we never fucking cast something as any without asking my permission to do so.

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