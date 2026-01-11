"use server";

import { revalidatePath } from "next/cache";

export type PreferencesData = {
  language: string;
  currency: string;
  autoApproval: boolean;
  confidenceThreshold: string;
  viewMode: string;
};

export async function savePreferences(data: PreferencesData) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Log the data (in a real app, this would update the user record in DB)
  console.log("Saving preferences:", data);
  
  // Revalidate settings page to reflect changes
  revalidatePath("/settings");
  
  return { success: true };
}
