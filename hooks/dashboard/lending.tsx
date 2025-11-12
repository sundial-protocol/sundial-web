"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface LoanData {
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
  totalOwed: number;
  interestAccrued: number;
  monthlyPayment: number;
  nextPaymentDate: Date;
  paymentsRemaining: number;
  totalPaid: number;
  interestPaid: number;
}

export interface PaymentHistoryEntry {
  id: string;
  loanId: string;
  date: Date;
  amount: number;
  type: "payment" | "interest" | "fee";
  status: "completed" | "pending" | "failed";
  transactionHash?: string;
}

export interface LendingStats {
  totalBorrowed: number;
  totalInterestPaid: number;
  successfulLoans: number;
  totalLoans: number;
  paymentSuccessRate: number;
  activeLoanCount: number;
}

interface LendingContextType {
  // Loan Data
  loans: LoanData[];
  activeLoans: LoanData[];
  loanHistory: LoanData[];
  paymentHistory: PaymentHistoryEntry[];

  // Statistics
  stats: LendingStats;

  // Actions
  addLoan: (loan: Omit<LoanData, "id">) => Promise<void>;
  makePayment: (loanId: string, amount: number) => Promise<void>;
  extendLoan: (loanId: string, days: number) => Promise<void>;
  refinanceLoan: (
    loanId: string,
    newRate: number,
    newTerm: number
  ) => Promise<void>;
  updateLoanStatus: (loanId: string, status: LoanData["status"]) => void;

  // UI State
  showManageLoan: boolean;
  setShowManageLoan: (show: boolean) => void;
  showFullLoanInterface: boolean;
  setShowFullLoanInterface: (show: boolean) => void;
  selectedLoanId: string | null;
  setSelectedLoanId: (id: string | null) => void;

  // Loading States
  isProcessingPayment: boolean;
  isProcessingExtension: boolean;
  isProcessingRefinance: boolean;
  isProcessingNewLoan: boolean;

  // Refresh data
  refreshData: () => Promise<void>;
}

const LendingContext = createContext<LendingContextType | undefined>(undefined);

// Mock data - in production, this would come from an API
const mockLoans: LoanData[] = [
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
    totalOwed: 0,
    interestAccrued: 35.42,
    monthlyPayment: 0,
    nextPaymentDate: new Date(),
    paymentsRemaining: 0,
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
    totalOwed: 2526.04,
    interestAccrued: 26.04,
    monthlyPayment: 105.25,
    nextPaymentDate: new Date("2024-03-01"),
    paymentsRemaining: 1,
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
    totalOwed: 0,
    interestAccrued: 23.5,
    monthlyPayment: 0,
    nextPaymentDate: new Date(),
    paymentsRemaining: 0,
    totalPaid: 3023.5,
    interestPaid: 23.5,
  },
];

const mockPaymentHistory: PaymentHistoryEntry[] = [
  {
    id: "pay-001",
    loanId: "loan-002",
    date: new Date("2024-02-01"),
    amount: 105.25,
    type: "payment",
    status: "completed",
    transactionHash: "0x1234...abcd",
  },
  {
    id: "pay-002",
    loanId: "loan-001",
    date: new Date("2024-01-01"),
    amount: 105.25,
    type: "payment",
    status: "completed",
    transactionHash: "0x5678...efgh",
  },
  {
    id: "pay-003",
    loanId: "loan-003",
    date: new Date("2023-12-15"),
    amount: 15.5,
    type: "interest",
    status: "completed",
    transactionHash: "0x9abc...ijkl",
  },
];

function calculateStats(loans: LoanData[]): LendingStats {
  const totalBorrowed = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalInterestPaid = loans.reduce(
    (sum, loan) => sum + loan.interestPaid,
    0
  );
  const successfulLoans = loans.filter((loan) => loan.status === "paid").length;
  const totalLoans = loans.length;
  const paymentSuccessRate =
    totalLoans > 0 ? (successfulLoans / totalLoans) * 100 : 0;
  const activeLoanCount = loans.filter(
    (loan) => loan.status === "active"
  ).length;

  return {
    totalBorrowed,
    totalInterestPaid,
    successfulLoans,
    totalLoans,
    paymentSuccessRate,
    activeLoanCount,
  };
}

export function LendingProvider({ children }: { children: ReactNode }) {
  // Data State
  const [loans, setLoans] = useState<LoanData[]>(mockLoans);
  const [paymentHistory, setPaymentHistory] =
    useState<PaymentHistoryEntry[]>(mockPaymentHistory);

  // UI State
  const [showManageLoan, setShowManageLoan] = useState(false);
  const [showFullLoanInterface, setShowFullLoanInterface] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  // Loading States
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isProcessingExtension, setIsProcessingExtension] = useState(false);
  const [isProcessingRefinance, setIsProcessingRefinance] = useState(false);
  const [isProcessingNewLoan, setIsProcessingNewLoan] = useState(false);

  // Computed values
  const activeLoans = loans.filter((loan) => loan.status === "active");
  const loanHistory = loans.filter((loan) => loan.status !== "active");
  const stats = calculateStats(loans);

  // Actions
  const addLoan = useCallback(async (loanData: Omit<LoanData, "id">) => {
    setIsProcessingNewLoan(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      const newLoan: LoanData = {
        ...loanData,
        id: `loan-${Date.now()}`,
      };

      setLoans((prev) => [...prev, newLoan]);
      setShowFullLoanInterface(false);
    } catch (error) {
      console.error("Failed to create loan:", error);
      throw error;
    } finally {
      setIsProcessingNewLoan(false);
    }
  }, []);

  const makePayment = useCallback(
    async (loanId: string, amount: number) => {
      setIsProcessingPayment(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

        // Update loan
        setLoans((prev) =>
          prev.map((loan) => {
            if (loan.id === loanId) {
              const newTotalOwed = Math.max(0, loan.totalOwed - amount);
              const newTotalPaid = loan.totalPaid + amount;
              const newStatus =
                newTotalOwed === 0 ? ("paid" as const) : loan.status;

              return {
                ...loan,
                totalOwed: newTotalOwed,
                totalPaid: newTotalPaid,
                status: newStatus,
                // Update interest paid if loan is completed
                interestPaid:
                  newStatus === "paid"
                    ? loan.interestAccrued
                    : loan.interestPaid,
              };
            }
            return loan;
          })
        );

        // Add payment to history
        const payment: PaymentHistoryEntry = {
          id: `pay-${Date.now()}`,
          loanId,
          date: new Date(),
          amount,
          type: "payment",
          status: "completed",
          transactionHash: `0x${Math.random()
            .toString(16)
            .substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        };

        setPaymentHistory((prev) => [payment, ...prev]);

        // If loan is fully paid, automatically close the management interface
        const updatedLoan = loans.find((l) => l.id === loanId);
        if (updatedLoan && updatedLoan.totalOwed - amount <= 0) {
          setShowManageLoan(false);
          setSelectedLoanId(null);
        }
      } catch (error) {
        console.error("Failed to process payment:", error);
        throw error;
      } finally {
        setIsProcessingPayment(false);
      }
    },
    [loans]
  ); // Add loans as dependency

  const extendLoan = useCallback(async (loanId: string, days: number) => {
    setIsProcessingExtension(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

      setLoans((prev) =>
        prev.map((loan) => {
          if (loan.id === loanId) {
            const newDueDate = new Date(loan.dueDate);
            newDueDate.setDate(newDueDate.getDate() + days);

            // Calculate additional interest
            const additionalInterest =
              (loan.interestRate / 100) * loan.amount * (days / 365);

            return {
              ...loan,
              dueDate: newDueDate,
              totalOwed: loan.totalOwed + additionalInterest,
              interestAccrued: loan.interestAccrued + additionalInterest,
            };
          }
          return loan;
        })
      );
    } catch (error) {
      console.error("Failed to extend loan:", error);
      throw error;
    } finally {
      setIsProcessingExtension(false);
    }
  }, []);

  const refinanceLoan = useCallback(
    async (loanId: string, newRate: number, newTerm: number) => {
      setIsProcessingRefinance(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2500)); // Simulate API call

        setLoans((prev) =>
          prev.map((loan) => {
            if (loan.id === loanId) {
              const newDueDate = new Date();
              newDueDate.setDate(newDueDate.getDate() + newTerm);

              // Recalculate terms
              const newMonthlyPayment =
                (loan.totalOwed * (newRate / 100 / 12)) /
                (1 - Math.pow(1 + newRate / 100 / 12, -(newTerm / 30)));

              return {
                ...loan,
                interestRate: newRate,
                dueDate: newDueDate,
                monthlyPayment: newMonthlyPayment,
              };
            }
            return loan;
          })
        );
      } catch (error) {
        console.error("Failed to refinance loan:", error);
        throw error;
      } finally {
        setIsProcessingRefinance(false);
      }
    },
    []
  );

  const updateLoanStatus = useCallback(
    (loanId: string, status: LoanData["status"]) => {
      setLoans((prev) =>
        prev.map((loan) => (loan.id === loanId ? { ...loan, status } : loan))
      );
    },
    []
  );

  const refreshData = useCallback(async () => {
    // In a real app, this would fetch fresh data from the API
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // For now, just recalculate stats
      // setLoans(prev => [...prev]);
    } catch (error) {
      console.error("Failed to refresh lending data:", error);
    }
  }, []);

  const contextValue: LendingContextType = {
    // Data
    loans,
    activeLoans,
    loanHistory,
    paymentHistory,
    stats,

    // Actions
    addLoan,
    makePayment,
    extendLoan,
    refinanceLoan,
    updateLoanStatus,

    // UI State
    showManageLoan,
    setShowManageLoan,
    showFullLoanInterface,
    setShowFullLoanInterface,
    selectedLoanId,
    setSelectedLoanId,

    // Loading States
    isProcessingPayment,
    isProcessingExtension,
    isProcessingRefinance,
    isProcessingNewLoan,

    // Refresh
    refreshData,
  };

  return (
    <LendingContext.Provider value={contextValue}>
      {children}
    </LendingContext.Provider>
  );
}

export function useLending() {
  const context = useContext(LendingContext);
  if (context === undefined) {
    throw new Error("useLending must be used within a LendingProvider");
  }
  return context;
}

// Additional hooks for specific use cases
export function useActiveLoan() {
  const { activeLoans } = useLending();
  return activeLoans[0] || null; // Return first active loan
}

export function useActiveLoans() {
  const { activeLoans } = useLending();
  return activeLoans; // Return all active loans
}

export function useLendingStats() {
  const { stats, refreshData } = useLending();
  return { stats, refreshData };
}

export function usePaymentHistory(loanId?: string) {
  const { paymentHistory } = useLending();
  if (loanId) {
    return paymentHistory.filter((payment) => payment.loanId === loanId);
  }
  return paymentHistory;
}

export function useRecentActivity(limit: number = 10) {
  const { paymentHistory } = useLending();
  return paymentHistory
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function useLoanById(loanId: string) {
  const { loans } = useLending();
  return loans.find((loan) => loan.id === loanId) || null;
}

export function usePortfolioSummary() {
  const { loans, activeLoans, loanHistory, stats } = useLending();

  const totalValue = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalOwed = activeLoans.reduce((sum, loan) => sum + loan.totalOwed, 0);
  const totalPaid = loans.reduce((sum, loan) => sum + loan.totalPaid, 0);

  return {
    totalLoans: loans.length,
    activeLoans: activeLoans.length,
    completedLoans: loanHistory.length,
    totalValue,
    totalOwed,
    totalPaid,
    successRate: stats.paymentSuccessRate,
  };
}
