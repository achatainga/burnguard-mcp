import assert from 'node:assert';
import { BurnGuardEngine } from '../src/engine.mjs';

async function runAllTests() {
  console.log('🧪 Starting BurnGuard MCP Live Test Gauntlet...');
  const engine = new BurnGuardEngine();

  // Test 1: Token estimation & pricing
  console.log('\n[Test 1] Calculating token estimation and pricing metrics...');
  const smallText = 'export function calculateTotal(a: number, b: number) { return a + b; }';
  const smallCost = engine.estimateTokenCost(smallText, 'claude-3-5-sonnet');
  assert.ok(smallCost.estimatedTokens > 0);
  assert.strictEqual(smallCost.isExcessive, false);

  const giantPayload = 'x'.repeat(400_000); // ~100k tokens
  const giantCost = engine.estimateTokenCost(giantPayload, 'claude-3-5-sonnet');
  assert.strictEqual(giantCost.isExcessive, true);
  assert.ok(giantCost.estimatedCostUsd >= 0.30);
  console.log(`  ✅ 400k characters correctly evaluated: ~${giantCost.estimatedTokens} tokens ($${giantCost.estimatedCostUsd})`);

  // Test 2: Detecting bloat path vectors
  console.log('\n[Test 2] Intercepting context bloat path patterns...');
  const bloatPaths = [
    'project/node_modules/lodash/index.js',
    'frontend/dist/bundle.min.js',
    'backend/package-lock.json'
  ];

  for (const p of bloatPaths) {
    const bloat = engine.inspectPayloadBloat(p);
    assert.strictEqual(bloat.isBloat, true);
    assert.strictEqual(bloat.severity, 'BLOCKING');
  }
  console.log('  ✅ Successfully blocked 3 context bloat vectors (node_modules, dist, lockfile).');

  // Test 3: Safe code paths pass cleanly
  console.log('\n[Test 3] Verifying clean application paths are permitted...');
  const safePath = 'src/services/billingService.ts';
  const safeCheck = engine.inspectPayloadBloat(safePath);
  assert.strictEqual(safeCheck.isBloat, false);
  assert.strictEqual(safeCheck.severity, 'SAFE');
  console.log('  ✅ Safe source file permitted without hindrance.');

  // Test 4: Budget enforcement and hard stops
  console.log('\n[Test 4] Enforcing hard session budget cap...');
  const currentSpend = 1.85;
  const maxLimit = 2.00;

  // Small operation ($0.05) -> Allowed
  const allowed = engine.enforceBudgetCap(currentSpend, maxLimit, 0.05);
  assert.strictEqual(allowed.isExhausted, false);
  assert.strictEqual(allowed.action, 'ALLOW_EXECUTION');

  // Heavy operation ($0.25) -> Exhausted (1.85 + 0.25 = 2.10 > 2.00)
  const blocked = engine.enforceBudgetCap(currentSpend, maxLimit, 0.25);
  assert.strictEqual(blocked.isExhausted, true);
  assert.strictEqual(blocked.action, 'HALT_EXECUTION_EXIT_2');
  console.log('  ✅ Hard stop triggered at budget limit ($2.10 projected vs $2.00 cap).');

  console.log('\n🎉 ALL 4 GAUNTLET TESTS PASSED WITH 100% SUCCESS RATE!');
}

runAllTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
