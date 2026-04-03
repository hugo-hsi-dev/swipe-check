---
name: epic-issue-orchestration
description: Mandatory for requests that transform an epic, product spec, PRD, roadmap, or domain brief into GitHub issues, subissues, or dependency graphs. Use when creating issue hierarchies from product epics.
license: Complete terms in LICENSE.txt
---

This skill turns an epic document into a structured GitHub issue tree that an autonomous agent can execute without reinterpreting the domain or renegotiating scope mid-flight.

This skill is the required entrypoint for epic-to-issues work. If the user is asking for issue breakdowns, tracking epics, subissues, or dependency ordering from a spec/epic document, use this skill instead of generic issue creation.

## When To Use
- The user gives you a product epic, spec, or domain brief and wants GitHub issues created from it.
- The work needs one main tracking issue plus linked subissues.
- The issue graph should encode dependencies, not just mention them in prose.

## Core Strategy
1. Treat each subissue as an execution unit for an autonomous agent, not as a loose project-management ticket.
2. Read the epic and inspect the codebase before splitting work so the issue graph matches the actual module boundaries, shared files, and integration points.
3. Identify the stable outcomes, constraints, edge cases, and likely edit surface before drafting issues.
4. Break the epic into the fewest subissues that preserve deterministic execution. Prefer fewer, clearer issues over oversplitting for superficial parallelism.
5. Prefer one subissue per owned change boundary: one contract, one data layer, one screen, one isolated component, one migration, one integration pass, or one validation pass.
6. Design each subissue to move the repo from one valid state to another valid state. Avoid issues that leave the codebase intentionally half-wired or rely on later cleanup.
7. Use staged issue graphs by default:
   - foundation or shared contracts
   - isolated leaf implementations
   - integration or wiring
   - validation or hardening
8. Encode dependencies for both semantic order and execution safety:
   - contract or interface dependencies
   - shared-file or shared-module contention
   - environment, migration, or config prerequisites
   - validation that depends on multiple implementation issues
9. Keep each subissue scoped tightly enough that completion is machine-verifiable without human interpretation.
10. Prefer the issue graph that minimizes ambiguity, overlap, and failure blast radius rather than the graph with the most theoretical parallelism.
11. Make the epic issue the progress tracker and add every subissue as a dependency of the epic.
12. Prefer aliasing GraphQL issue fields when fetching multiple issues in one query, and expect `addSubIssue` to fail if the subissue already has a parent.

## Issue Architecture Heuristics
- Optimize for deterministic execution, bounded scope, and clear handoffs between issues.
- Prefer explicit shared contracts before parallel implementation work.
- Reserve cross-cutting concerns such as wiring, providers, analytics, route registration, shared configuration, and integration tests for dedicated issues.
- Keep agents off shared hotspots unless one issue explicitly owns them.
- Use a discovery or decision issue first when part of the epic is materially ambiguous.
- Prefer subissues that produce a concrete downstream artifact, such as a schema, component, route shell, data adapter, migration, fixture, or test harness.
- Add a final validation issue when multiple earlier issues must be exercised together.
- If the codebase structure forces heavy overlap, reduce the number of subissues instead of creating parallel issues that will compete for the same files.

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

## Execution Shape
- Foundation: <shared contracts, schemas, or setup>
- Parallel leaves: <isolated implementation concerns>
- Integration: <wiring or shared hotspots>
- Validation: <tests, hardening, or final verification>

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

## Preconditions
- <required prior issue, contract, migration, or config>

## Owned Edit Surface
- <file or directory this issue owns>
- <shared hotspot reserved for this issue, if any>

## Do Not Touch
- <shared file or module owned by another issue, or `None`>

## Deliverables
- <artifact, behavior, or interface produced by this issue>
- <output that later issues can depend on>

## Acceptance Criteria
- <clear completion condition 1>
- <clear completion condition 2>
- <clear completion condition 3>

## Validation
- <command, test, or observable check>
- <what must pass before the issue is complete>

## Notes
- Keep the work inside the owned edit surface.
- If exact files are uncertain, bound the issue to the smallest stable module or directory available.
- Avoid prescribing implementation details unless they are essential for correctness.
```

## Relationship Rules
- Use true GitHub subissues, not just references in the body.
- Use true GitHub blocking relationships for both dependency order and execution safety.
- The epic should be a parent/tracker for the subissues.
- Each subissue should own a bounded edit surface and produce a concrete output for downstream issues.
- Use a single-writer rule for hotspots: sibling issues should not claim the same file, module, or shared test harness unless one explicitly blocks the other.
- Foundation and shared-contract issues should usually block later work.
- Leaf issues may run in parallel only when their owned edit surfaces are disjoint and their preconditions are already satisfied.
- Integration issues should usually be blocked by the leaf issues they wire together.
- Validation issues should usually be blocked by all prerequisite implementation and integration issues.
- If a subissue depends on multiple earlier subissues, add multiple blocking edges instead of explaining that dependency only in prose.
- If overlap or ambiguity remains after planning, serialize the work rather than creating optimistic parallel issues.

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
- Planning from the epic text alone often produces issues that collide in shared files, shared tests, or top-level wiring.
- Oversplitting one shared edit surface into several sibling issues creates ambiguous ownership and merge conflicts.
- Letting every issue touch route registration, shared providers, schemas, package metadata, or integration tests defeats parallel execution.
- If exact file ownership is unclear, narrow the issue to the smallest stable module or directory boundary, or serialize the work.
- Use `parentIssueId` or `addSubIssue` to create a real subissue.
- Use `addBlockedBy` to encode both semantic prerequisites and shared-file contention.
- Pass numeric GraphQL values with `-F` when the schema expects `Int`; string inputs can use `-f`.
- When querying multiple issues in one GraphQL call, alias repeated `issue(number:...)` fields or the request will conflict.
- `addSubIssue` is not idempotent; if an issue already has a parent, the mutation will fail with a duplicate-parent validation error.
- After creation, patch the epic body to include the subissue list so humans can read the tracking issue quickly.
- Do not assume an autonomous agent will ask for clarification or create a corrective follow-up issue when the plan is underspecified.

## Lessons From The Epic Workflow
- The GitHub GraphQL schema exposes `createIssue`, `addSubIssue`, and `addBlockedBy`, so the full issue graph can be created without manual UI steps.
- The epic should list its subissues in the body for human readability, but the actual linkage must be created through GraphQL.
- The issue graph should reflect repo boundaries and owned edit surfaces, not just product themes.
- Shared hotspots work best when one issue owns them at a time, usually in a foundation or integration stage.
- Integration works best as a dedicated later subissue when multiple leaves would otherwise compete to edit the same wiring.
- Validation works best as the last subissue because it depends on the outputs of earlier implementation and integration issues.
- When in doubt, reduce the number of issues until each one is independently executable, mergeable, and verifiable.

## Recommended Execution Flow
1. Read the epic and related product docs.
2. Inspect the codebase to identify module boundaries, hotspots, shared contracts, and likely edit surfaces.
3. Draft the epic stages and the smallest set of independently executable subissues.
4. For each subissue, define preconditions, owned edit surface, do-not-touch boundaries, deliverables, and validation.
5. Collapse or serialize issues that would otherwise compete for the same files or modules.
6. Create the epic issue first.
7. Create each subissue, preferably with `parentIssueId`.
8. Add blocking edges for both semantic prerequisites and shared-file contention.
9. Patch the epic body with the ordered subissue list and execution-stage summary.
10. Verify `parent`, `subIssues`, and `blockedBy` on GitHub.

## Expected Output
When you use this skill, report:
- the epic issue URL
- the subissue URLs
- the dependency summary
- the owned edit surface or parallel-lane summary
- any caveats encountered
