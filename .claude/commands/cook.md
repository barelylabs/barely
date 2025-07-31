# cook

Get Claude up to speed on the current project and start implementing the next tasks. This command automatically discovers project context, determines progress, and begins work on the next feature.

## Usage

```bash
/cook
```

## Process

When you run this command, I will:

1. **Load Project Context**
   - Read CLAUDE_PROJECT.md for immediate context
   - Read START_HERE.md for workflow guidance  
   - Load .claude/project/plan-organized.md for tasks

2. **Analyze Current Progress**
   - Parse plan-organized.md to count completed vs pending tasks
   - Check recent git commits to understand what's been implemented
   - Identify which feature is currently being worked on

3. **Present Status**
   ```
   🍳 VIP MVP Project Status
   ⏰ Deadline: August 9th (X days remaining)
   
   📊 Progress Overview:
   - Feature 1 (Core Infrastructure): 2/14 tasks ✓
   - Feature 2 (VIP Page Creation): 0/16 tasks ⬜
   [... etc ...]
   
   🎯 Current Focus: Feature 1 - Core Infrastructure
   
   Next tasks:
   1. Create database migration for vipReleases table
   2. Create database migration for vipAccessLogs table
   3. Add indexes for query performance
   
   Ready to start implementing? (y/n)
   ```

4. **Begin Implementation** (if confirmed)
   - Use TodoWrite to track the next tasks
   - Start with the first uncompleted task
   - Follow existing code patterns and conventions
   - Run tests and linting after changes
   - Provide clear progress updates

## Error Handling

- **No project context found**: Inform user to run from a project worktree
- **No plan-organized.md**: Check for other planning documents
- **All tasks complete**: Suggest next steps (testing, PR creation)

## Benefits

- **Zero friction startup**: Just run `/cook` to get productive immediately
- **Context-aware**: Automatically understands project state
- **Progress tracking**: Never lose track of what's been done
- **Git-integrated**: Lives in the repo, evolves with the project

This command turns Claude into a focused implementation assistant that immediately understands where you left off and continues the work.