"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { assistantSettings, AssistantSettings } from "@/lib/db/schema";
import { DEFAULT_ASSISTANT_SETTINGS } from "@/lib/assistant/default-prompts";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const DEFAULT_SETTINGS = DEFAULT_ASSISTANT_SETTINGS;

export async function getAssistantSettings(): Promise<{
  success: boolean;
  data?: AssistantSettings;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const [settings] = await db
      .select()
      .from(assistantSettings)
      .where(eq(assistantSettings.userId, session.user.id))
      .limit(1);

    if (!settings) {
      // Create default settings for the user
      const [newSettings] = await db
        .insert(assistantSettings)
        .values({
          userId: session.user.id,
          ...DEFAULT_SETTINGS,
        })
        .returning();

      return { success: true, data: newSettings };
    }

    return { success: true, data: settings };
  } catch (err) {
    console.error("Error fetching assistant settings:", err);
    return { success: false, error: "Erro ao buscar configurações" };
  }
}

export async function updateAssistantSettings(data: {
  databaseContext?: string;
  analysisPrompt?: string;
  advicePrompt?: string;
  summaryPrompt?: string;
  responseLanguage?: string;
  responseStyle?: string;
  maxResponseLength?: number;
  includeEmojis?: boolean;
  autoSuggestions?: boolean;
  contextAware?: boolean;
  includeRecentTransactions?: boolean;
  includeCategoryBreakdown?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    // Check if settings exist
    const [existing] = await db
      .select()
      .from(assistantSettings)
      .where(eq(assistantSettings.userId, session.user.id))
      .limit(1);

    if (existing) {
      // Update existing settings
      await db
        .update(assistantSettings)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(assistantSettings.userId, session.user.id));
    } else {
      // Create new settings
      await db.insert(assistantSettings).values({
        userId: session.user.id,
        ...DEFAULT_SETTINGS,
        ...data,
      });
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("Error updating assistant settings:", err);
    return { success: false, error: "Erro ao salvar configurações" };
  }
}

// Reset assistant settings to defaults
export async function resetAssistantSettings(): Promise<{
  success: boolean;
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    await db
      .update(assistantSettings)
      .set({
        ...DEFAULT_SETTINGS,
        updatedAt: new Date(),
      })
      .where(eq(assistantSettings.userId, session.user.id));

    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("Error resetting assistant settings:", err);
    return { success: false, error: "Erro ao resetar configurações" };
  }
}
