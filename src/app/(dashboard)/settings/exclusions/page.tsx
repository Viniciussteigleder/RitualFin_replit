import { getExclusionRules } from "@/lib/actions/exclusions";
import { ExclusionsClient } from "./exclusions-client";

export const dynamic = 'force-dynamic';

export default async function ExclusionsPage() {
  const rules = await getExclusionRules();
  return <ExclusionsClient initialRules={rules} />;
}
