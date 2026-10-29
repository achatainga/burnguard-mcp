# BurnGuard MCP

> Pre-Execution Token Budget Firewall & Cost Telemetry Sentinel for AI Coding Agents.

[![MCP 2026-07-28](https://img.shields.io/badge/MCP-2026--07--28-blue.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## The Problem
When autonomous agents run without financial guardrails:
1. **Accidental Giant File Reads**: Ingesting lockfiles, minified bundles, or binary dumps consuming 100k+ tokens in a single second.
2. **Infinite Debugging Token Bleed**: Spending $20+ across repetitive failed test iterations without user notification.
3. **Surprise Invoices**: Developers discovering massive bill spikes on their Anthropic, OpenAI, or Google Cloud bills.

## The Solution
BurnGuard MCP enforces strict financial and context boundaries:
- **Pre-Execution Cost Estimator**: Calculates exact token burn and financial cost across frontier models prior to execution.
- **Bloat Path Interceptor**: Hard-blocks reading or dumping giant build directories (`node_modules`, `dist`, `vendor`, `.git`).
- **Hard Session Budget Cap**: Halts agent execution with exit code 2 when session spend crosses developer-set limits ($2.00, $5.00, etc.).

## Available MCP Tools

### `estimate_token_cost`
Calculates character counts, token equivalents, and dollar costs across frontier models.

### `inspect_payload_bloat`
Identifies dangerous context-bloating file paths and returns targeted mitigation advice.

### `enforce_budget_cap`
Audits cumulative spend against hard session limits and halts runaway processes.

## Live Verification
```bash
node tests/run_live_test.mjs
```

## License
MIT © 2026 BurnGuard Systems
