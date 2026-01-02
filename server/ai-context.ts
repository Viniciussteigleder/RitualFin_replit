import { storage } from "./storage";
import { subDays, startOfMonth } from "date-fns";

export interface ChatContext {
  systemPrompt: string;
  tokensEstimate: number;
}

/**
 * Assemble context for AI chat from user's transaction data
 * Returns system prompt with embedded context
 */
export async function assembleChatContext(userId: string): Promise<ChatContext> {
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);
  const monthStart = startOfMonth(now);

  // Fetch recent transactions
  const transactions = (await storage.getTransactions(userId))
    .filter(t => t.paymentDate >= thirtyDaysAgo)
    .sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime())
    .slice(0, 50);

  // Fetch current month goal
  const goals = await storage.getGoals(userId);
  const currentGoal = goals.find(g => g.month === now.toISOString().slice(0, 7));

  // Calculate spending summary
  const totalSpent = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Get top categories
  const categoryTotals: Record<string, number> = {};
  transactions.forEach(t => {
    if (t.amount < 0 && t.category1) {
      categoryTotals[t.category1] = (categoryTotals[t.category1] || 0) + Math.abs(t.amount);
    }
  });
  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat, amt]) => `${cat}: €${amt.toFixed(2)}`);

  // Format recent transactions
  const recentTxns = transactions.slice(0, 10).map(t =>
    `${t.paymentDate.toISOString().slice(5, 10)}: ${t.descNorm} - €${Math.abs(t.amount).toFixed(2)} (${t.category1 || "Uncategorized"})`
  ).join("\n");

  // Build system prompt
  const systemPrompt = `You are a personal finance assistant for RitualFin, a budgeting app.

Current Date: ${now.toISOString().slice(0, 10)}

User Context:
- Current Month: ${now.toLocaleString("pt-BR", { month: "long", year: "numeric" })}
- Total Spending (30 days): €${totalSpent.toFixed(2)}
${currentGoal ? `- Monthly Budget: €${currentGoal.totalPlanned} (Remaining: €${(currentGoal.totalPlanned - totalSpent).toFixed(2)})` : ""}
- Top Spending Categories:
  ${topCategories.join("\n  ")}

Recent Transactions (last 10):
${recentTxns}

Instructions:
- Answer in Portuguese (pt-BR)
- Be concise and actionable (2-3 paragraphs max)
- Reference specific transactions when relevant
- Provide budget insights based on user's goals
- If asked about periods outside 30 days, explain data limitation`;

  // Estimate tokens (rough: 1 token ≈ 4 characters)
  const tokensEstimate = Math.ceil(systemPrompt.length / 4);

  return { systemPrompt, tokensEstimate };
}
