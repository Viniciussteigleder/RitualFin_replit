import { storage } from "./storage";

type OpenAIUsage = {
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  total_tokens?: number | null;
};

const MODEL_PRICING_PER_MILLION: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
};

function estimateOpenAICost(
  model: string,
  usage?: OpenAIUsage
): number | null {
  if (!usage) return null;
  const pricing = MODEL_PRICING_PER_MILLION[model];
  if (!pricing) return null;

  const promptTokens = usage.prompt_tokens ?? 0;
  const completionTokens = usage.completion_tokens ?? 0;
  if (promptTokens === 0 && completionTokens === 0) return null;

  const inputCost = (promptTokens / 1_000_000) * pricing.input;
  const outputCost = (completionTokens / 1_000_000) * pricing.output;
  return Number((inputCost + outputCost).toFixed(6));
}

function normalizeErrorMessage(error: unknown): string | null {
  if (!error) return null;
  const message = error instanceof Error ? error.message : String(error);
  if (!message) return null;
  return message.slice(0, 300);
}

export async function logOpenAIUsage(params: {
  featureTag: string;
  model: string;
  userId?: string | null;
  sessionId?: string | null;
  usage?: OpenAIUsage;
  status?: "success" | "error";
  error?: unknown;
}): Promise<void> {
  try {
    await storage.createAiUsageLog({
      userId: params.userId ?? null,
      sessionId: params.sessionId ?? null,
      featureTag: params.featureTag,
      model: params.model,
      promptTokens: params.usage?.prompt_tokens ?? null,
      completionTokens: params.usage?.completion_tokens ?? null,
      totalTokens: params.usage?.total_tokens ?? null,
      costEstimateUsd: estimateOpenAICost(params.model, params.usage),
      status: params.status ?? "success",
      errorMessage: normalizeErrorMessage(params.error),
    });
  } catch (logError) {
    console.warn("Failed to log AI usage:", logError);
  }
}

export async function withOpenAIUsage<T>(
  params: {
    featureTag: string;
    model: string;
    userId?: string | null;
    sessionId?: string | null;
    extractUsage?: (result: T) => OpenAIUsage | undefined;
  },
  call: () => Promise<T>
): Promise<T> {
  try {
    const result = await call();
    const usage = params.extractUsage ? params.extractUsage(result) : undefined;
    await logOpenAIUsage({
      featureTag: params.featureTag,
      model: params.model,
      userId: params.userId,
      sessionId: params.sessionId,
      usage,
      status: "success",
    });
    return result;
  } catch (error) {
    await logOpenAIUsage({
      featureTag: params.featureTag,
      model: params.model,
      userId: params.userId,
      sessionId: params.sessionId,
      status: "error",
      error,
    });
    throw error;
  }
}
