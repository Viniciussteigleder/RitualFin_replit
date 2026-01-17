import { auth } from "@/auth";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RulesStudioClient from "./rules-studio-client";

export default async function RulesStudioPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="container max-w-7xl mx-auto p-8 font-sans">
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-2">Acesso restrito</h1>
          <p className="text-muted-foreground mb-6">Faça login para acessar o Estúdio de Regras.</p>
          <Button asChild>
            <Link href="/login">Fazer login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return <RulesStudioClient />;
}

export const dynamic = 'force-dynamic';

