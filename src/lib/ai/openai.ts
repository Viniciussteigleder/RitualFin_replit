import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

// Initialize OpenAI client - uses dummy key if not set to prevent build errors
// Actual API calls check for valid key before execution
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder-for-build",
});

export const AI_DESIGN = {
  model: "gpt-4o-mini",
  temperature: 0,
};

export const CategorizationSchema = z.object({
  suggested_leaf_id: z.string().describe("The UUID or name of the taxonomy leaf"),
  confidence: z.number().describe("Confidence score between 0 and 1"),
  rationale: z.string().describe("Short explanation for this categorization"),
  extracted_merchants: z.array(z.string()).describe("List of merchants identified"),
  extracted_keywords: z.array(z.string()).describe("Key terms found in the description"),
});

export type CategorizationResult = z.infer<typeof CategorizationSchema>;

export async function getAICategorization(description: string, taxonomyContext: string): Promise<CategorizationResult | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("AI categorization skipped: OPENAI_API_KEY not found.");
    return null;
  }

  try {
    const response = await (openai.beta as any).chat.completions.parse({
      model: AI_DESIGN.model,
      messages: [
        {
          role: "system",
          content: `You are a financial expert assistant specialized in transaction categorization.
          Use the provided taxonomy context to categorize the transaction.
          Strictly follow the output schema.
          Context: ${taxonomyContext}`
        },
        {
          role: "user",
          content: `Categorize this transaction: "${description}"`
        },
      ],
      response_format: zodResponseFormat(CategorizationSchema, "categorization"),
      temperature: AI_DESIGN.temperature,
    });

    return response.choices[0].message.parsed;
  } catch (error) {
    console.error("OpenAI Categorization Error:", error);
    return null;
  }
}

export async function getAIInsights(data: any): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null;

  try {
    const response = await openai.chat.completions.create({
      model: AI_DESIGN.model,
      messages: [
        {
          role: "system",
          content: "You are a financial assistant. Provide concise, assistive insights based on the provided data. Identify anomalies or recurring patterns."
        },
        {
          role: "user",
          content: JSON.stringify(data)
        },
      ],
      temperature: 0.5,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Insights Error:", error);
    return null;
  }
}

export const RuleSuggestionSchema = z.object({
  suggested_leaf_id: z.string().describe("The UUID (preferred) or name of the taxonomy leaf"),
  confidence: z.number().describe("Confidence score between 0 and 1"),
  proposed_key_words: z.string().describe("Semicolon-separated key_words proposal"),
  proposed_key_words_negative: z.string().nullable().describe("Semicolon-separated key_words_negative proposal"),
  rationale: z.string().describe("Short explanation for this proposal"),
});

export type RuleSuggestionResult = z.infer<typeof RuleSuggestionSchema>;

export async function getAIRuleSuggestion(description: string, taxonomyContext: string): Promise<RuleSuggestionResult | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("AI rule suggestion skipped: OPENAI_API_KEY not found.");
    return null;
  }

  try {
    const response = await (openai.beta as any).chat.completions.parse({
      model: AI_DESIGN.model,
      messages: [
        {
          role: "system",
          content: `You help create deterministic keyword rules for a personal finance app.
Goal: propose key_words/key_words_negative that match many similar transactions (not just this one).
Rules:
- Return the best taxonomy leaf using ONLY the provided taxonomy context (prefer returning the leaf UUID).
- key_words: semicolon-separated, 2-6 items. Prefer stable merchant tokens, brand names, service names, or unique identifiers.
- Avoid copying the full raw description; avoid dates, amounts, long free text, and one-off IDs.
- key_words_negative: optional semicolon-separated exclusions to prevent common false-positives (e.g. similar merchants, unrelated terms).
- Keep tokens concise (3-30 chars each) and uppercase-safe.
Strictly follow the output schema.
Context: ${taxonomyContext}`,
        },
        {
          role: "user",
          content: `Transaction description: "${description}"`,
        },
      ],
      response_format: zodResponseFormat(RuleSuggestionSchema, "rule_suggestion"),
      temperature: AI_DESIGN.temperature,
    });

    return response.choices[0].message.parsed;
  } catch (error) {
    console.error("OpenAI Rule Suggestion Error:", error);
    return null;
  }
}

export const ConflictResolutionSchema = z.object({
  rationale: z.string().describe("Short explanation of the proposed fix"),
  suggestions: z.array(
    z.object({
      rule_id: z.string().describe("The existing rule id to update"),
      add_key_words: z.string().nullable().describe("Semicolon-separated key_words to add (optional)"),
      add_key_words_negative: z
        .string()
        .nullable()
        .describe("Semicolon-separated key_words_negative to add (preferred for disambiguation)"),
    })
  ),
});

export type ConflictResolutionResult = z.infer<typeof ConflictResolutionSchema>;

export async function getAIConflictResolution(input: {
  transaction_description: string;
  candidates_context: string;
}): Promise<ConflictResolutionResult | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("AI conflict resolution skipped: OPENAI_API_KEY not found.");
    return null;
  }

  try {
    const response = await (openai.beta as any).chat.completions.parse({
      model: AI_DESIGN.model,
      messages: [
        {
          role: "system",
          content: `You help resolve conflicts between deterministic keyword rules.
Input includes one transaction description and multiple candidate rules that matched.
Goal: propose minimal additions (prefer key_words_negative) that reduce ambiguity for future transactions.
Do NOT propose creating new rules; only suggest additions to existing rules by rule_id.
Avoid overfitting to one transaction; prefer merchant/service tokens and generic exclusions.
Strictly follow the output schema.`,
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
      response_format: zodResponseFormat(ConflictResolutionSchema, "conflict_resolution"),
      temperature: 0,
    });

    return response.choices[0].message.parsed;
  } catch (error) {
    console.error("OpenAI Conflict Resolution Error:", error);
    return null;
  }
}

export const AIBudgetRecommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      category1: z.string(),
      category2: z.string().nullable(),
      category3: z.string().nullable(),
      proposedAmount: z.number().describe("The suggested monthly budget limit for this category level"),
      rationale: z.string().describe("A brief, encouraging explanation of why this amount is recommended based on past spending and financial best practices.")
    })
  ),
  overallAdvice: z.string().describe("General financial advice based on the user's spending habits.")
});

export type AIBudgetRecommendationResult = z.infer<typeof AIBudgetRecommendationSchema>;

export async function getAIBudgetRecommendations(
  spendingHistoricalData: any
): Promise<AIBudgetRecommendationResult | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("AI budget recommendations skipped: OPENAI_API_KEY not found.");
    return null;
  }

  try {
    const response = await (openai.beta as any).chat.completions.parse({
      model: AI_DESIGN.model,
      messages: [
        {
          role: "system",
          content: `You are an expert financial advisor and AI agent. 
Your task is to analyze the user's past spending data, which is provided grouped by categories (level 1, 2, and 3) over recent months.

Based on this historical data, seasonal patterns, and best-practice financial principles (like the 50/30/20 rule), generate an optimal, realistic monthly budget recommendation. 
You must generate recommendations not just for root categories (category1), but also for any subcategories (category2 and category3) that appear in the spending history.

For each recommendation:
1. Provide a logical budget limit.
2. Provide an encouraging rationale that explains why this amount makes sense, aimed at helping the user improve their financial health while maintaining a realistic lifestyle.`
        },
        {
          role: "user",
          content: `Here is the user's historical spending data:
${JSON.stringify(spendingHistoricalData, null, 2)}`
        },
      ],
      response_format: zodResponseFormat(AIBudgetRecommendationSchema, "budget_recommendation"),
      temperature: AI_DESIGN.temperature,
    });

    return response.choices[0].message.parsed;
  } catch (error) {
    console.error("OpenAI Budget Recommendation Error:", error);
    return null;
  }
}
