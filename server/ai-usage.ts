import { logAIUsage } from "./ai-logger";

type OpenAIUsage = {
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  total_tokens?: number | null;
};

function getTokensUsed(usage?: OpenAIUsage): number {
  if (!usage) return 0;
  const total = usage.total_tokens ?? null;
  if (typeof total === "number") return total;
  return (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0);
}

function mapFeatureTagToOperation(featureTag: string): "categorize" | "chat" | "bulk" {
  const normalized = featureTag.toLowerCase();
  if (normalized.includes("bulk")) return "bulk";
  if (normalized.includes("chat")) return "chat";
  return "categorize";
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
  if (params.status === "error") {
    return;
  }

  const tokensUsed = getTokensUsed(params.usage);
  if (tokensUsed <= 0) return;

  const userId = params.userId ?? "demo";
  const operation = mapFeatureTagToOperation(params.featureTag);

  await logAIUsage(userId, operation, tokensUsed, params.model);
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
