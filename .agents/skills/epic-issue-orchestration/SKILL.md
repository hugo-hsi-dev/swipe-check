---
name: epic-issue-orchestration
description: Split product epics into GitHub issue hierarchies with one tracking epic, real subissues, and blocking dependencies. Use when converting a product or architecture epic into issue-ready work items for autonomous agents.
license: Complete terms in LICENSE.txt
---

This skill turns an epic document into a structured GitHub issue tree that an autonomous agent can execute without reinterpreting the domain.

## When To Use
- The user gives you a product epic, spec, or domain brief and wants GitHub issues created from it.
- The work needs one main tracking issue plus linked subissues.
- The issue graph should encode dependencies, not just mention them in prose.

## Core Strategy
1. Read the epic fully and identify the stable outcomes, constraints, and edge cases.
2. Break the epic into 4-8 subissues for a medium-sized epic.
3. Prefer one subissue per cohesive concern.
4. Aim for 1-3 files per subissue when the codebase makes that boundary clear.
5. Allow more than 3 files in one subissue only when the files are tightly coupled and belong to one behavior.
6. Order subissues from foundational to dependent:
   - canonical contract or shared definitions
   - fixed content or static data
   - selection or business rules
   - scoring or state transition logic
   - tie, low-data, or edge behavior
   - validation examples or tests
7. Make the epic issue the progress tracker and add every subissue as a dependency of the epic.
8. Make the final validation subissue depend on the domain-rule subissues it exercises.
9. Prefer aliasing GraphQL issue fields when fetching multiple issues in one query, and expect `addSubIssue` to fail if the subissue already has a parent.

## Naming Convention
- Epic: `Epic XX: <domain name>`
- Subissues: `Epic XX.1: <focused concern>`, `Epic XX.2: <focused concern>`, etc.
- Keep titles readable to someone who does not know the codebase.

## Issue Body Templates

### Epic Template
```md
## Goal
<what the epic delivers>

## Why
<why this matters>

## What This Tracks
- <cluster 1>
- <cluster 2>
- <cluster 3>

## Acceptance Criteria
- <observable outcome 1>
- <observable outcome 2>
- <observable outcome 3>
```

### Subissue Template
```md
## Goal
<one concrete outcome>

## Why
<why the change is needed>

## Acceptance Criteria
- <clear completion condition 1>
- <clear completion condition 2>
- <clear completion condition 3>

## Notes
- Keep the work scoped to one coherent concern.
- Avoid prescribing implementation details unless they are essential for correctness.
```

## Relationship Rules
- Use true GitHub subissues, not just references in the body.
- Use true GitHub blocking relationships for dependency order.
- The epic should be a parent/tracker for the subissues.
- Foundation issues should usually block later work.
- Validation issues should usually be blocked by all prerequisite domain-rule issues.
- If a subissue depends on multiple earlier subissues, add multiple blocking edges instead of explaining that dependency only in prose.

## GitHub Commands

### 1. Create Issues
Preferred: GraphQL `createIssue`.

Get the repository node id first:
```bash
gh api graphql -f query='query { repository(owner:"OWNER", name:"REPO") { id } }'
```

Create a plain issue:
```bash
gh api graphql -f query='mutation($repositoryId:ID!, $title:String!, $body:String) {
  createIssue(input:{repositoryId:$repositoryId, title:$title, body:$body}) {
    issue { id number url }
  }
}'
```

Create a subissue directly:
```bash
gh api graphql -f query='mutation($repositoryId:ID!, $title:String!, $body:String, $parentIssueId:ID) {
  createIssue(input:{repositoryId:$repositoryId, title:$title, body:$body, parentIssueId:$parentIssueId}) {
    issue { id number url }
  }
}'
```

### 2. Add Subissue Relationship
Use this if both issues already exist:
```bash
gh api graphql -f query='mutation($issueId:ID!, $subIssueId:ID!) {
  addSubIssue(input:{issueId:$issueId, subIssueId:$subIssueId}) {
    issue { number title }
    subIssue { number title }
  }
}'
```

### 3. Add Blocking Relationship
```bash
gh api graphql -f query='mutation($issueId:ID!, $blockingIssueId:ID!) {
  addBlockedBy(input:{issueId:$issueId, blockingIssueId:$blockingIssueId}) {
    issue { number title }
    blockingIssue { number title }
  }
}'
```

### 4. Verify The Graph
```bash
gh api graphql -F number=15 -f query='query($owner:String!, $name:String!, $number:Int!) {
  repository(owner:$owner, name:$name) {
    issue(number:$number) {
      number
      title
      parent { number title }
      subIssues(first:50) { nodes { number title } }
      blockedBy(first:50) { nodes { number title } }
    }
  }
}'
```

## Reusable Shell Script Pattern
Use this as a starting point for automating the whole workflow:
```bash
#!/usr/bin/env bash
set -euo pipefail

repo_id="$(gh api graphql -f query='query { repository(owner:"OWNER", name:"REPO") { id } }' --jq '.data.repository.id')"

create_issue() {
  local title="$1"
  local body="$2"
  local parent_issue_id="${3:-}"

  if [ -n "$parent_issue_id" ]; then
    gh api graphql -f query='mutation($repositoryId:ID!, $title:String!, $body:String, $parentIssueId:ID) {
      createIssue(input:{repositoryId:$repositoryId, title:$title, body:$body, parentIssueId:$parentIssueId}) {
        issue { id number url }
      }
    }' -f repositoryId="$repo_id" -f title="$title" -f body="$body" -f parentIssueId="$parent_issue_id"
  else
    gh api graphql -f query='mutation($repositoryId:ID!, $title:String!, $body:String) {
      createIssue(input:{repositoryId:$repositoryId, title:$title, body:$body}) {
        issue { id number url }
      }
    }' -f repositoryId="$repo_id" -f title="$title" -f body="$body"
  fi
}

add_subissue() {
  local issue_id="$1"
  local sub_issue_id="$2"

  gh api graphql -f query='mutation($issueId:ID!, $subIssueId:ID!) {
    addSubIssue(input:{issueId:$issueId, subIssueId:$subIssueId}) {
      issue { number title }
      subIssue { number title }
    }
  }' -f issueId="$issue_id" -f subIssueId="$sub_issue_id"
}

add_blocking() {
  local issue_id="$1"
  local blocking_issue_id="$2"

  gh api graphql -f query='mutation($issueId:ID!, $blockingIssueId:ID!) {
    addBlockedBy(input:{issueId:$issueId, blockingIssueId:$blockingIssueId}) {
      issue { number title }
      blockingIssue { number title }
    }
  }' -f issueId="$issue_id" -f blockingIssueId="$blocking_issue_id"
}
```

## Common Pitfalls
- `gh issue create` is fine for a plain issue, but it does not create subissues or dependency edges.
- Use `parentIssueId` or `addSubIssue` to create a real subissue.
- Use `addBlockedBy` to encode dependency order.
- Pass numeric GraphQL values with `-F` when the schema expects `Int`; string inputs can use `-f`.
- When querying multiple issues in one GraphQL call, alias repeated `issue(number:...)` fields or the request will conflict.
- `addSubIssue` is not idempotent; if an issue already has a parent, the mutation will fail with a duplicate-parent validation error.
- After creation, patch the epic body to include the subissue list so humans can read the tracking issue quickly.

## Lessons From The Epic Workflow
- The GitHub GraphQL schema exposes `createIssue`, `addSubIssue`, and `addBlockedBy`, so the full issue graph can be created without manual UI steps.
- The epic should list its subissues in the body for human readability, but the actual linkage must be created through GraphQL.
- Validation works best as the last subissue because it depends on the rules defined by earlier subissues.
- When in doubt, keep issues smaller and more focused rather than bundling unrelated file changes together.

## Recommended Execution Flow
1. Read the epic and related product docs.
2. Draft the epic and subissue titles and bodies.
3. Create the epic issue first.
4. Create each subissue, preferably with `parentIssueId`.
5. Add blocking edges from prerequisite issues to dependent issues.
6. Patch the epic body with links to the subissues.
7. Verify `parent`, `subIssues`, and `blockedBy` on GitHub.

## Expected Output
When you use this skill, report:
- the epic issue URL
- the subissue URLs
- the dependency summary
- any caveats encountered
