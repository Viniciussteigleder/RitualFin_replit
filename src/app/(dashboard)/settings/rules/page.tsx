import { getRules } from "@/lib/actions/rules";
import RulesClient from "@/components/settings/rules-client";

export default async function RulesPage() {
  const rules = await getRules();

  return <RulesClient initialRules={rules} />;
}
