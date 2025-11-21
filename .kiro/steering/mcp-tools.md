# MCP Tools Configuration

This project has MCP (Model Context Protocol) tools configured for enhanced AI-assisted development.

## Available MCP Servers

### Svelte MCP Server

Official Svelte MCP server providing:

- **Documentation lookup**: Access to Svelte, SvelteKit, and related documentation
- **Code analysis**: Static analysis of Svelte code to suggest fixes and best practices
- **Best practices**: Recommendations for writing better Svelte code

#### When to use Svelte MCP tools:

- When you need to reference official Svelte or SvelteKit documentation
- When analyzing Svelte components for potential issues
- When you're unsure about Svelte or SvelteKit best practices
- When implementing Svelte-specific features (reactivity, stores, routing, etc.)

#### Available tools:

- `get_svelte_docs`: Retrieve relevant Svelte documentation
- `analyze_svelte_code`: Analyze Svelte code for issues and improvements
- `get_best_practices`: Get Svelte best practices for specific scenarios

Use these tools proactively when working with Svelte code to ensure high-quality, idiomatic implementations.

### Context7 MCP Server

Context7 MCP server provides up-to-date, version-specific documentation for any library or framework by dynamically fetching current official documentation and code examples.

- **Dynamic documentation**: Fetches the latest documentation from official sources
- **Version-specific**: Gets documentation for specific versions of libraries/frameworks
- **Multi-framework**: Supports any library or framework with online documentation
- **Code examples**: Provides real code examples from official sources

#### When to use Context7:

- When you need up-to-date documentation for any library (React, Vue, TypeScript, etc.)
- When working with newer versions of libraries and need version-specific docs
- When you need official code examples for a specific framework or library
- When the documentation might have changed since the AI's knowledge cutoff

#### How to use:

Simply include `use context7` in your prompt followed by the library/framework name and what you need. For example:

- "use context7 to get the latest TypeScript utility types documentation"
- "use context7 to find how to implement authentication in SvelteKit"
- "use context7 for Tailwind CSS dark mode examples"

Context7 will automatically fetch and inject the relevant documentation into the context.

## Best Practices

1. **Use Svelte MCP** when working with Svelte/SvelteKit-specific code
2. **Use Context7** when you need current documentation for any library
3. **Combine both** for comprehensive assistance (e.g., Svelte best practices + latest Tailwind docs)
4. **Be specific** in your requests to get the most relevant information
