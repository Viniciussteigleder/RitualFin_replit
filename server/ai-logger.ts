import { db } from "./db";
import { aiUsageLogs } from "@shared/schema";
import { logger } from "./logger";

// OpenAI pricing as of January 2025
// Source: https://openai.com/pricing
const PRICING = {
  "gpt-4": {
    input: 0.03 / 1000,   // $0.03 per 1K input tokens
    output: 0.06 / 1000   // $0.06 per 1K output tokens
  },
  "gpt-4o-mini": {
    input: 0.00015 / 1000,  // $0.00015 per 1K input tokens
    output: 0.0006 / 1000   // $0.0006 per 1K output tokens
  },
};

/**
 * Log AI usage to database with cost calculation
 * Call AFTER successful OpenAI API response
 *
 * @param userId - User ID (currently "demo")
 * @param operation - Type of operation: "categorize" | "chat" | "bulk"
 * @param tokensUsed - Total tokens from response.usage.total_tokens
 * @param modelUsed - Model identifier (default: "gpt-4o-mini")
 */
export async function logAIUsage(
  userId: string,
  operation: "categorize" | "chat" | "bulk",
  tokensUsed: number,
  modelUsed: string = "gpt-4o-mini"
): Promise<void> {
  try {
    const pricing = PRICING[modelUsed as keyof typeof PRICING] || PRICING["gpt-4o-mini"];

    // Simplified cost calculation
    // Assumes 50/50 split between input and output tokens
    // More accurate: track input/output separately via response.usage
    const avgTokenPrice = (pricing.input + pricing.output) / 2;
    const cost = tokensUsed * avgTokenPrice;

    await db.insert(aiUsageLogs).values({
      userId,
      operation,
      tokensUsed,
      cost: cost.toFixed(6),
      modelUsed,
    });

    logger.info(`AI usage logged: ${operation}, ${tokensUsed} tokens, $${cost.toFixed(6)}`);
  } catch (error) {
    logger.error("ai_usage_log_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't throw - logging failure shouldn't break AI features
  }
}
