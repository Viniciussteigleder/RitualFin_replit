
import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
