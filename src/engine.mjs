/**
 * BurnGuard Engine (Stateless MCP 2026-07-28 Spec)
 * Pre-Execution Token Budget Firewall & Cost Telemetry Sentinel
 */

export class BurnGuardEngine {
  constructor(config = {}) {
    this.config = config;
    // Standard model pricing per 1 Million tokens (USD)
    this.pricing = {
      'claude-3-5-sonnet': { inputPerM: 3.00, outputPerM: 15.00 },
      'gpt-4o': { inputPerM: 2.50, outputPerM: 10.00 },
      'gemini-1-5-pro': { inputPerM: 1.25, outputPerM: 5.00 }
    };
    this.bloatPatterns = [
      /node_modules/i,
      /vendor\//i,
      /\.git\//i,
      /dist\//i,
      /build\//i,
      /package-lock\.json$/i,
      /yarn\.lock$/i,
      /cargo\.lock$/i,
      /\.map$/i,
      /\.min\.js$/i
    ];
  }

  /**
   * Estimates token count and dollar cost for a given text or character count.
   */
  estimateTokenCost(payload, model = 'claude-3-5-sonnet') {
    const chars = typeof payload === 'number' ? payload : (typeof payload === 'string' ? payload.length : JSON.stringify(payload).length);
    // Standard approximation: ~4 characters per token
    const estimatedTokens = Math.ceil(chars / 4);
    const modelRates = this.pricing[model] || this.pricing['claude-3-5-sonnet'];

    // Assume input tokens for reads/commands
    const estimatedCostUsd = Number(((estimatedTokens / 1_000_000) * modelRates.inputPerM).toFixed(5));

    return {
      model,
      characters: chars,
      estimatedTokens,
      estimatedCostUsd,
      isExcessive: estimatedTokens > 30_000
    };
  }

  /**
   * Scans file paths or command arguments for token bloat vectors.
   */
  inspectPayloadBloat(targetPath) {
    for (const pat of this.bloatPatterns) {
      if (pat.test(targetPath)) {
        return {
          path: targetPath,
          isBloat: true,
          severity: 'BLOCKING',
          matchedRule: pat.toString(),
          recommendation: `Target path '${targetPath}' matches known context-bloat pattern. Reading this directly will burn significant tokens. Use targeted AST queries or grep instead.`
        };
      }
    }

    return {
      path: targetPath,
      isBloat: false,
      severity: 'SAFE'
    };
  }

  /**
   * Checks whether the upcoming operation would exceed the configured session spending budget.
   */
  enforceBudgetCap(currentSpendUsd, maxBudgetLimitUsd, nextCostUsd = 0) {
    const projectedSpend = Number((currentSpendUsd + nextCostUsd).toFixed(5));
    const isExhausted = projectedSpend > maxBudgetLimitUsd;
    const remainingBudget = Number(Math.max(0, maxBudgetLimitUsd - currentSpendUsd).toFixed(5));

    return {
      currentSpendUsd,
      maxBudgetLimitUsd,
      projectedSpendUsd: projectedSpend,
      remainingBudgetUsd: remainingBudget,
      isExhausted,
      action: isExhausted ? 'HALT_EXECUTION_EXIT_2' : 'ALLOW_EXECUTION',
      message: isExhausted
        ? `HARD STOP: Session token budget ($${maxBudgetLimitUsd.toFixed(2)}) exhausted. Projected spend: $${projectedSpend.toFixed(4)}.`
        : `Budget healthy. $${remainingBudget.toFixed(2)} remaining.`
    };
  }
}

// Standalone CLI runner
if (process.argv[1]?.endsWith('engine.mjs')) {
  const engine = new BurnGuardEngine();
  console.log(JSON.stringify(engine.estimateTokenCost(100_000, 'claude-3-5-sonnet'), null, 2));
}
