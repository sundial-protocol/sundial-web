import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";

export default function QuickActions() {
  return (
    <Card className="col-span-3 sm:col-span-2">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common actions to manage your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button asChild>
          <Link href="/dashboard?tab=stake">Stake Bitcoin</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=withdraw">Withdraw Funds</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=deposits">My Deposits</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=history">View Transactions</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
