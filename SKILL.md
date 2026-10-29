---
name: burnguard-mcp
description: Pre-Execution Token Budget Firewall & Cost Telemetry Sentinel for AI Coding Agents.
version: 1.0.0
tags:
  - token-budget
  - cost-control
  - telemetry
  - rate-limit
  - bloat-prevention
  - agent-governance
---

# BurnGuard: Token Budget Firewall & Spend Telemetry Sentinel

BurnGuard prevents autonomous coding agents from racking up catastrophic API bills ($15–$50+) during runaway debugging loops, recursive file reads, and bloated context dumps.

## The Problem

Autonomous agents frequently incur massive token burns due to unconstrained execution patterns:
1. **Accidental Giant File Ingestion**: An agent attempts to read a 15MB minified bundle or SQL dump, consuming 100k+ tokens in a single tool call.
2. **Infinite Debugging Bleed**: An agent loops through failing tests 20 times, burning $2.50 per turn without making progress.
3. **No Cumulative Guardrail**: Developers wake up to depleted API credits or surprise $500 monthly bills.

## Core Capabilities

1. **Pre-Execution Token Estimation**:
   - Computes expected input and output tokens and estimated dollar cost across major frontier models before tool execution.
2. **Hard Spending Cap Enforcement**:
   - Halts agent tool loops (exit code 2) once a pre-configured session limit (e.g. $2.00 or $5.00) is reached.
3. **Bloat Path Interceptor**:
   - Immediately blocks reading or listing huge build artifacts, lockfiles, or vendor directories (`node_modules`, `vendor`, `dist`, `.git`).
4. **Live Spend Telemetry**:
   - Provides a real-time dashboard of session expenditure, tokens consumed, and remaining headroom.

## Available MCP Tools

- `estimate_token_cost`: Calculates token counts and financial cost for text payloads and commands.
- `enforce_budget_cap`: Checks current session burn against hard limits and blocks execution if exhausted.
- `inspect_payload_bloat`: Scans file paths and command arguments for token bloat vectors.

## Hook Integration

BurnGuard registers a `PreToolUse` hook inside `hooks/hooks.json` to inspect all `read_file` and `run_command` calls before dispatch.
