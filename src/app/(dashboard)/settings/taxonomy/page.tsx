import { getTaxonomyTree } from "@/lib/actions/taxonomy";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TaxonomyPage() {
  const taxonomy = await getTaxonomyTree();

  return (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium">Taxonomy</h3>
            <p className="text-sm text-muted-foreground">Your categorization hierarchy.</p>
        </div>

        <div className="grid gap-4">
            {taxonomy.length === 0 ? <p className="text-muted-foreground">No custom taxonomy defined.</p> : null}
            {taxonomy.map(level1 => (
                <Card key={level1.id}>
                    <CardHeader>
                        <CardTitle>{level1.nivel1Pt}</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ul className="list-disc pl-5 space-y-2">
                            {level1.level2s.map(level2 => (
                                <li key={level2.id}>
                                    <span className="font-medium">{level2.nivel2Pt}</span>
                                    {level2.leaves.length > 0 && (
                                        <ul className="list-circle pl-5 mt-1 text-sm text-muted-foreground">
                                            {level2.leaves.map(leaf => (
                                                <li key={leaf.id}>{leaf.leafPt}</li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                         </ul>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
