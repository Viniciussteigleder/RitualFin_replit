import { getTaxonomyTree } from "@/lib/actions/taxonomy";
import { TaxonomyClient } from "./taxonomy-client";

export default async function TaxonomyPage() {
  const taxonomy = await getTaxonomyTree();

  return <TaxonomyClient initialTaxonomy={taxonomy} />;
}
