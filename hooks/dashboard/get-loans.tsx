export interface LoanHistory {
  id: string;
  type: "collateral" | "credit";
  amount: number;
  asset: string;
  collateral?: {
    amount: number;
    asset: string;
  };
  interestRate: number;
  startDate: Date;
  dueDate: Date;
  status: "active" | "paid" | "overdue" | "liquidated";
  totalPaid: number;
  interestPaid: number;
}

export function useGetLoans() {
  // This would normally fetch data from an API or database
  const lendingHistory: LoanHistory[] = [];

  return { lendingHistory };
}
