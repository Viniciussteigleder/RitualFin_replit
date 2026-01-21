import { getRules } from "@/lib/actions/rules";
import { getTaxonomyOptions } from "@/lib/actions/discovery";
import RulesClient from "@/components/settings/rules-client";

export const revalidate = 3600; // Revalidate every hour

export default async function RulesPage() {
  const rules = await getRules();
  const taxonomyOptions = await getTaxonomyOptions();

  return <RulesClient initialRules={rules} taxonomyOptions={taxonomyOptions} />;
}
