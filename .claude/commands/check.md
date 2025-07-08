Check for type and lint errors. Attempt to fix them.

1. You're going to run both "pnpm lint" and "pnpm typecheck" at the root of the monorepo.
2. Create a new file called "TYPE_ERRORS_CHECKLIST.md" in the root of the monorepo. This will intelligently list all of the type and lint errors in the monorepo. Think of it like a checklist of errors that need to be fixed. If you can, start with the easiest errors to fix first.
3. One by one, you're going to fix the errors in the checklist until there are no errors left.
4. You're going to run "pnpm check" after each fix to make sure the errors are fixed.
5. Continue this process until there are no errors left.
6. Once you've fixed _ALL_ the errors, you can delete the "TYPE_ERRORS_CHECKLIST.md" file.
7. Run "pnpm format:fix" to fix any formatting errors.
