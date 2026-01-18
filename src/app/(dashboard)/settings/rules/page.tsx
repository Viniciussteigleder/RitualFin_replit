import { getRules } from "@/lib/actions/rules";
import { getTaxonomyOptions } from "@/lib/actions/discovery";
import RulesClient from "@/components/settings/rules-client";

export const dynamic = 'force-dynamic';

export default async function RulesPage() {
  const rules = await getRules();
  const taxonomyOptions = await getTaxonomyOptions();

  return <RulesClient initialRules={rules} taxonomyOptions={taxonomyOptions} />;
}
