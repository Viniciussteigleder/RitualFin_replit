import { getTaxonomyTree } from "@/lib/actions/taxonomy";
import { TaxonomyClient } from "./taxonomy-client";

export const revalidate = 3600; // Revalidate every hour

export default async function TaxonomyPage() {
  const taxonomy = await getTaxonomyTree();

  return <TaxonomyClient initialTaxonomy={taxonomy} />;
}
