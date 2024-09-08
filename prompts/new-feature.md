# Creating a new feature in

## 1. Define the shape of the feature in the route

### 1.1 Define the tables, and relationships in 'packages/lib/server/routes/{feature}/{feature}.sql.ts'

### 1.2 Define the API schema in 'packages/lib/server/routes/{feature}/{feature}.schema.ts'

### 1.3 Define the API route handlers in 'packages/lib/server/routes/{feature}/{feature}.router.ts'

Generally, this should include:

- byWorkspace
- byId
- create
- update
- archive
- delete

### 1.4 add the route to the API router in 'packages/lib/server/api/router.ts'

## 2. Create the feature UI

Feature will be created in the app in 1 of 2 places:

'apps/app/src/app/[handle]/settings/{feature}'

or

'apps/app/src/app/[handle]/{feature}'

### 2.1 Create the components

This should be in a subfolder called '\_components'
files should include:

- '{feature}-context.tsx'
- 'all-{feature}s.tsx'
- 'create-{feature}-button.tsx'
- 'update-{feature}-modal.tsx'
-

### 2.2 Create the page
