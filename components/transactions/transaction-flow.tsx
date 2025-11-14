"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  AlertTriangle,
  Wallet,
  Bitcoin,
  DollarSign,
} from "lucide-react";
import { PsbtSigning, usePsbtGeneration } from "@/components/btc/psbt-signing";
import { TransactionType } from "@/hooks/dashboard/dashboard";

export type TransactionMethod = "bitcoin" | "traditional" | "cardano";

export interface TransactionFlowProps {
  /** Type of transaction */
  type: TransactionType;
  /** Amount in USD */
  amount: number;
  /** Asset being transferred */
  asset: string;
  /** Available payment methods */
  availableMethods: TransactionMethod[];
  /** Callback when transaction completes */
  onComplete: (result: TransactionResult) => void;
  /** Callback when transaction is cancelled */
  onCancel: () => void;
  /** Additional transaction details */
  details?: {
    fromAddress?: string;
    toAddress?: string;
    description?: string;
    benefits?: string[];
    fees?: {
      traditional?: number;
      bitcoin?: number;
    };
  };
  /** Whether to show as modal */
  showAsModal?: boolean;
  /** Title override */
  title?: string;
}

export interface TransactionResult {
  method: TransactionMethod;
  txid?: string;
  status: "success" | "failed" | "pending";
  amount: number;
  asset: string;
}

export function TransactionFlow({
  type,
  amount,
  asset,
  availableMethods,
  onComplete,
  onCancel,
  details,
  showAsModal = false,
  title,
}: TransactionFlowProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<TransactionMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [psbtData, setPsbtData] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { generatePsbt, loading: generatingPsbt } = usePsbtGeneration();

  const getTransactionTitle = () => {
    if (title) return title;

    const typeLabels = {
      loan_payment: "Make Payment",
      deposit: "Deposit Funds",
      withdraw: "Withdraw Funds",
      stake: "Stake Assets",
      unstake: "Unstake Assets",
      reward: "Claim Rewards",
      loan_created: "Create Loan",
      loan_extended: "Extend Loan",
      loan_refinanced: "Refinance Loan",
      loan_closed: "Close Loan",
    };

    return typeLabels[type] || "Complete Transaction";
  };

  const getMethodInfo = (method: TransactionMethod) => {
    switch (method) {
      case "bitcoin":
        return {
          name: "Bitcoin",
          icon: <Bitcoin className="w-5 h-5 text-orange-600" />,
          description: "Pay with Bitcoin (BTC)",
          benefits: ["Lower fees", "Instant settlement", "Decentralized"],
          fees: details?.fees?.bitcoin || 0,
          badgeColor: "bg-orange-100 text-orange-700",
        };
      case "traditional":
        return {
          name: "Traditional",
          icon: <DollarSign className="w-5 h-5 text-green-600" />,
          description: "Pay with USD/Stablecoin",
          benefits: [
            "Familiar process",
            "Fixed amount",
            "Instant confirmation",
          ],
          fees: details?.fees?.traditional || 0,
          badgeColor: "bg-green-100 text-green-700",
        };
      case "cardano":
        return {
          name: "Cardano",
          icon: <div className="w-5 h-5 bg-blue-600 rounded-full" />,
          description: "Pay with ADA",
          benefits: ["Low fees", "Fast confirmation", "Energy efficient"],
          fees: 0.5,
          badgeColor: "bg-blue-100 text-blue-700",
        };
    }
  };

  const handleMethodSelect = async (method: TransactionMethod) => {
    setSelectedMethod(method);
    setError(null);

    if (method === "bitcoin") {
      await generateBitcoinTransaction();
    }
  };

  const generateBitcoinTransaction = async () => {
    try {
      const psbt = await generatePsbt({
        sourceAddress: details?.fromAddress || "user-address",
        targetAddress: details?.toAddress || "contract-address",
        amount: amount / 50000, // Assuming $50k BTC price
        chain: "btc",
      });

      setPsbtData(psbt);
    } catch (error) {
      setError("Failed to generate Bitcoin transaction");
    }
  };

  const handleTraditionalPayment = async () => {
    setIsProcessing(true);
    try {
      // Simulate traditional payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      onComplete({
        method: "traditional",
        status: "success",
        amount,
        asset,
        txid: `traditional_${Date.now()}`,
      });
    } catch (error) {
      setError("Traditional payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBitcoinSuccess = (txid: string) => {
    onComplete({
      method: "bitcoin",
      status: "success",
      amount,
      asset,
      txid,
    });
  };

  const content = (
    <div className="space-y-6">
      {/* Transaction Summary */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium mb-2">Transaction Summary</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-medium">
              ${amount.toFixed(2)} {asset}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="capitalize">{type}</span>
          </div>
          {details?.description && (
            <div className="flex justify-between">
              <span>Description:</span>
              <span>{details.description}</span>
            </div>
          )}
        </div>
      </div>

      {/* Method Selection */}
      {!selectedMethod && (
        <div className="space-y-4">
          <h4 className="font-medium">Choose Payment Method</h4>
          <div className="grid gap-3">
            {availableMethods.map((method) => {
              const info = getMethodInfo(method);
              return (
                <div
                  key={method}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleMethodSelect(method)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {info.icon}
                      <div>
                        <h5 className="font-medium">{info.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {info.description}
                        </p>
                      </div>
                    </div>
                    <Badge className={info.badgeColor}>
                      {info.fees > 0 ? `$${info.fees} fee` : "Low fees"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {info.benefits.map((benefit, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bitcoin Payment Flow */}
      {selectedMethod === "bitcoin" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Bitcoin Payment</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMethod(null)}
            >
              Change Method
            </Button>
          </div>

          {psbtData ? (
            <PsbtSigning
              psbtBase64={psbtData}
              targetAddress={details?.toAddress || "payment-address"}
              expectedAmount={Math.floor((amount / 50000) * 100000000)} // Convert to sats
              chain="btc"
              onTransactionFound={handleBitcoinSuccess}
              onError={(error) => setError(error)}
              title={`Bitcoin ${type.charAt(0).toUpperCase() + type.slice(1)}`}
              description={`Complete your ${amount} ${asset} ${type} with Bitcoin`}
              showCard={false}
            />
          ) : (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm">Generating Bitcoin transaction...</span>
            </div>
          )}
        </div>
      )}

      {/* Traditional Payment Flow */}
      {selectedMethod === "traditional" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Traditional Payment</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedMethod(null)}
            >
              Change Method
            </Button>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium mb-2">
              <Wallet className="w-4 h-4" />
              Confirm Payment
            </div>
            <p className="text-sm text-green-600 dark:text-green-500 mb-4">
              Process ${amount.toFixed(2)} {asset} {type} using traditional
              payment method.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleTraditionalPayment}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
              </Button>
              <Button variant="outline" onClick={() => setSelectedMethod(null)}>
                Back
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-red-700 dark:text-red-400 text-sm">
            {error}
          </span>
        </div>
      )}

      {/* Benefits Display */}
      {details?.benefits && details.benefits.length > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="text-sm font-medium mb-2">Benefits</div>
          <ul className="text-sm text-muted-foreground space-y-1">
            {details.benefits.map((benefit, idx) => (
              <li key={idx}>• {benefit}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {!selectedMethod && (
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );

  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              {getTransactionTitle()}
            </CardTitle>
          </CardHeader>
          <CardContent>{content}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          {getTransactionTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

// Simplified hook for common transaction flows
export function useTransactionFlow() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<Partial<TransactionFlowProps> | null>(
    null
  );

  const startTransaction = (
    transactionConfig: Partial<TransactionFlowProps>
  ) => {
    setConfig(transactionConfig);
    setIsOpen(true);
  };

  const closeTransaction = () => {
    setIsOpen(false);
    setConfig(null);
  };

  return {
    isOpen,
    config,
    startTransaction,
    closeTransaction,
  };
}
