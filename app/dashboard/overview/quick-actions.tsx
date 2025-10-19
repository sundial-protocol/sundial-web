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
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common actions to manage your portfolio
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        <Button asChild>
          <Link href="/stake">Stake Bitcoin</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=yield">Find Yield</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=strategies">View Strategies</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard?tab=history">View History</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
