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
  const lendingHistory: LoanHistory[] = [
    {
      id: "loan-001",
      type: "collateral",
      amount: 5000,
      asset: "USDC",
      collateral: { amount: 0.15, asset: "BTC" },
      interestRate: 8.5,
      startDate: new Date("2024-01-15"),
      dueDate: new Date("2024-02-14"),
      status: "paid",
      totalPaid: 5035.42,
      interestPaid: 35.42,
    },
    {
      id: "loan-002",
      type: "credit",
      amount: 2500,
      asset: "USDC",
      interestRate: 12.5,
      startDate: new Date("2024-02-20"),
      dueDate: new Date("2024-03-21"),
      status: "active",
      totalPaid: 0,
      interestPaid: 0,
    },
    {
      id: "loan-003",
      type: "collateral",
      amount: 3000,
      asset: "DJED",
      collateral: { amount: 2500, asset: "ADA" },
      interestRate: 9.2,
      startDate: new Date("2023-12-01"),
      dueDate: new Date("2024-01-01"),
      status: "paid",
      totalPaid: 3023.5,
      interestPaid: 23.5,
    },
  ];

  return { lendingHistory };
}
