import { getExclusionRules } from "@/lib/actions/exclusions";
import { ExclusionsClient } from "./exclusions-client";

export const revalidate = 3600; // Revalidate every hour

export default async function ExclusionsPage() {
  const rules = await getExclusionRules();
  return <ExclusionsClient initialRules={rules} />;
}
