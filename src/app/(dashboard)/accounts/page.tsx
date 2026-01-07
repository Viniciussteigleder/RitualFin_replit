
import { getAccounts } from "@/lib/actions/accounts";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  Plus, 
  Wallet, 
  Building2, 
  Coins,
  Settings2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ICON_MAP: Record<string, any> = {
  credit_card: CreditCard,
  bank_account: Building2,
  debit_card: Wallet,
  cash: Coins,
};

export default async function AccountsPage() {
  const accounts = await getAccounts();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">Manage your bank accounts and credit cards.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accounts.length === 0 ? (
          <Card className="col-span-full border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>No accounts yet</CardTitle>
              <CardDescription className="mt-2">
                Add your first bank account or credit card to start tracking transactions.
              </CardDescription>
              <Button variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Create Account
              </Button>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => {
            const Icon = ICON_MAP[account.type] || Wallet;
            return (
              <Card key={account.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div 
                  className="h-1.5 w-full" 
                  style={{ backgroundColor: account.color || "#6366f1" }} 
                />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold">{account.name}</CardTitle>
                    <div className="text-xs text-muted-foreground font-mono">
                      {account.accountNumber || "**** **** ****"}
                    </div>
                  </div>
                  <div 
                    className="p-2 rounded-xl text-white"
                    style={{ backgroundColor: account.color || "#6366f1" }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mt-4">
                    <Badge variant="secondary" className="capitalize">
                      {account.type.replace("_", " ")}
                    </Badge>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
