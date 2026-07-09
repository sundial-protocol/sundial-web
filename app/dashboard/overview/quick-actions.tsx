import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

const TAB_MAP: Record<string, string> = {
  stake: "stake",
  withdraw: "withdraw",
  history: "history",
};

export default function QuickActions() {
  const router = useRouter();

  const navigateToTab = (tabId: string) => {
    router.push(`/dashboard?tab=${TAB_MAP[tabId]}`);
  };

  return (
    <Card className="col-span-3 sm:col-span-2">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common actions to manage your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button onClick={() => navigateToTab("stake")}>
          Stake Bitcoin
        </Button>
        <Button variant="outline" onClick={() => navigateToTab("withdraw")}>
          Withdraw Funds
        </Button>
        {/*<Button variant="outline" onClick={() => navigateToTab("deposits")}>
          My Deposits
        </Button>*/}
        <Button variant="outline" onClick={() => navigateToTab("history")}>
          View Transactions
        </Button>
      </CardContent>
    </Card>
  );
}
