## TypeScript Best Practices

- **Type Safety Principle**:
  - NEVER cast something to `any` or `unknown` if you're running into type errors. That is the kind of decision that only a human engineer can make, and only if we've exhausted all other proper methods for resolving a type issue.
  - NEVER use `as any` to bypass TypeScript errors. This is absolutely forbidden. Always find the proper type solution.
  - never use type annotations, never type cast or assert. always check for what the type should be and if an error is being thrown, figure out how to properly meet the type requirements!