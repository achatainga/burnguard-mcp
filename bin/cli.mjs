#!/usr/bin/env node
import { BurnGuardEngine } from '../src/engine.mjs';

const engine = new BurnGuardEngine();
const tokens = parseInt(process.argv[2] || '100000', 10);
const model = process.argv[3] || 'claude-3-5-sonnet';
console.log(JSON.stringify(engine.estimateTokenCost(tokens, model), null, 2));
