---
"ts-macro-relay": patch
---

fix: handle method chaining to prevent duplicate AST processing

Fixes TypeError when using method chaining with Relay functions like `fetchQuery(...).toPromise()`. The plugin now detects and skips outer method calls to avoid processing the same node twice with incorrect arguments.
