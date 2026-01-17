import { getTaxonomyTree } from "@/lib/actions/taxonomy";
import { TaxonomyClient } from "./taxonomy-client";

export const dynamic = 'force-dynamic';

export default async function TaxonomyPage() {
  const taxonomy = await getTaxonomyTree();

  return <TaxonomyClient initialTaxonomy={taxonomy} />;
}
