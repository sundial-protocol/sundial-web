"use client";

import { useState, useRef, useCallback } from "react";
import { Psbt } from "bitcoinjs-lib";
import type { AccountType } from "@reown/appkit/react";
import type { BitcoinConnector } from "@reown/appkit-adapter-bitcoin";
import { finalizePsbtSafe } from "@/lib/psbt-finalize";
import type { BtcWithdrawalResponse } from "@/app/api/btc-withdrawal/types";
import type { CreateProgramSuccessResponse } from "@/app/api/btc-program/types";
import type { DepositIntentSuccessResponse } from "@/app/api/deposit-intent/types";
import type { SupportedChain } from "@/lib/multichain";
import type { YieldOpportunity } from "./yield-opportunities";
import type { ActiveProgram } from "./dashboard";

export type DepositStep = "form" | "psbt" | "done";

export interface UseDepositFlowOptions {
  selectedChain: SupportedChain;
  userAddress: string;
  withdrawAddress: string;
  amount: string;
  manualPublicKey: string;
  isUsingConnectedWallet: boolean;
  bitcoinAccounts: AccountType[] | undefined;
  bitcoinConnector: BitcoinConnector | null;
  isDeposit: boolean;
  savedLocktime: number | null;
  selectedYieldProvider: YieldOpportunity | null;

  // Callbacks to update parent state
  setDepositAddress: (addr: string) => void;
  setSavedLocktime: (lt: number) => void;
  setActiveProgram: (p: ActiveProgram) => void;
  clearActiveProgram: () => void;

  // Dashboard callbacks
  addPendingTransaction: (
    chain: SupportedChain,
    amount: number,
    type: "deposit" | "withdraw",
  ) => string;
  updateTransactionStatus: (
    id: string,
    status: "completed" | "failed",
    txHash?: string,
    extraData?: Record<string, unknown>,
  ) => void;
  updateStakedAmount: (
    chain: SupportedChain,
    amount: number,
    type: "deposit" | "withdraw",
  ) => void;

  onSuccess?: (txHash: string, chain: SupportedChain, amount: string) => void;
}

export function useDepositFlow({
  selectedChain,
  userAddress,
  withdrawAddress,
  amount,
  manualPublicKey,
  isUsingConnectedWallet,
  bitcoinAccounts,
  bitcoinConnector,
  isDeposit,
  savedLocktime,
  selectedYieldProvider,
  setDepositAddress,
  setSavedLocktime,
  setActiveProgram,
  clearActiveProgram,
  addPendingTransaction,
  updateTransactionStatus,
  updateStakedAmount,
  onSuccess,
}: UseDepositFlowOptions) {
  const [step, setStep] = useState<DepositStep>("form");
  const [unsignedTransactionData, setUnsignedTransactionData] = useState<{
    psbt_base64: string;
    locktime?: number;
  } | null>(null);
  const [psbtBase64, setPsbtBase64] = useState("");
  const [broadcastResult, setBroadcastResult] = useState("");
  const [txHash, setTxHash] = useState("");
  const [escrowAddress, setEscrowAddress] = useState("");
  const [isCalculatingPsbt, setIsCalculatingPsbt] = useState(false);
  const [psbtCalcFailed, setPsbtCalcFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingTransactionId, setPendingTransactionId] = useState<
    string | null
  >(null);

  const psbtDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  const getBTCPubKey = (
    address: string,
    accounts: AccountType[],
  ): string | null => {
    for (const account of accounts) {
      if (account.address === address && account.publicKey) {
        return account.publicKey;
      }
    }
    return null;
  };

  const resolveUserPubKey = (): string | null => {
    let key = isUsingConnectedWallet
      ? getBTCPubKey(userAddress, bitcoinAccounts || [])
      : null;

    if (!key) {
      const trimmed = manualPublicKey?.trim() || "";
      if (trimmed.length === 66 && /^[0-9a-fA-F]{66}$/.test(trimmed)) {
        key = trimmed;
      }
    }

    return key;
  };

  // ── Deposit preparation: Steps 1–3 (scripts → program → intent) ─────────

  /**
   * Prepares a deposit by:
   *  1. Creating timelock + escrow scripts
   *  2. Creating a staking program with the escrow address as vault
   *  3. Calling deposit-intent so the backend builds and returns the PSBT
   *
   * Must be called with `loading = true` already set.
   * Returns the backend-built PSBT base64 on success, or null on failure
   * (error state is set).
   */
  const prepareDeposit = async (): Promise<string | null> => {
    if (!selectedYieldProvider?.provider_id) {
      setError("No yield provider selected");
      return null;
    }

    const userPubKey = resolveUserPubKey();
    if (!userPubKey) {
      setError(
        "Public key required. Please connect your wallet or enter your public key manually.",
      );
      return null;
    }

    const locktime =
      selectedYieldProvider.locktime != null
        ? selectedYieldProvider.locktime
        : 30 * 24 * 60 * 60; // 30-day fallback in seconds

    try {
      // ── Step 1: Build scripts ──────────────────────────────────────────
      const scriptsRes = await fetch("/api/btc-scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPublicKey: userPubKey,
          network: selectedChain === "btc_testnet" ? "testnet" : "bitcoin",
          locktime,
        }),
      });

      if (!scriptsRes.ok) {
        const err = await scriptsRes.json();
        throw new Error(err.details || err.error || "Failed to create scripts");
      }

      const scripts = await scriptsRes.json();
      setEscrowAddress(scripts.escrowScript.address);
      setDepositAddress(scripts.escrowScript.address);
      setSavedLocktime(scripts.locktime);

      // ── Step 2: Create program ─────────────────────────────────────────
      const programRes = await fetch("/api/btc-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: selectedYieldProvider.provider_id,
          name: selectedYieldProvider.name + "-" + Date.now().toLocaleString(), // Ensure unique name for testing
          description: selectedYieldProvider.description,
          expected_yield_bps: Math.round(selectedYieldProvider.apy * 100),
          min_lock_ms: locktime * 1000,
          program_vault_address: scripts.escrowScript.address,
        }),
      });

      if (!programRes.ok) {
        const err = await programRes.json();
        throw new Error(err.details || err.error || "Failed to create program");
      }

      const program: CreateProgramSuccessResponse = await programRes.json();
      console.log("Program created:", program.program_id);

      setActiveProgram({
        program_id: program.program_id,
        provider_id: program.provider_id,
        name: program.name,
        expected_yield_bps: program.expected_yield_bps,
        min_lock_ms: program.min_lock_ms,
        program_vault_address: program.program_vault_address,
      });

      // ── Step 3: Create deposit intent — backend builds the PSBT ───────
      const intentRes = await fetch("/api/deposit-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_beneficiary_address: userAddress,
          user_pubkey_hex: userPubKey,
          provider_id: program.provider_id,
          program_id: program.program_id,
          amount_sats: Math.round(Number(amount) * 1e8),
          alpha_bps: 2500,
          lock_ms: locktime * 1000,
        }),
      });

      if (!intentRes.ok) {
        const err = await intentRes.json();
        throw new Error(
          err.details || err.error || "Failed to create deposit intent",
        );
      }

      const intent: DepositIntentSuccessResponse = await intentRes.json();
      console.log("Deposit intent created:", intent.deposit_id);
      setUnsignedTransactionData({ psbt_base64: intent.psbt_base64 });
      return intent.psbt_base64;
    } catch (err: any) {
      console.error("prepareDeposit error:", err);
      setError(err.message || "Failed to prepare deposit");
      return null;
    }
  };

  // ── Withdrawal: Build PSBT (debounced, pre-calculated) ───────────────────

  const calculateUnsignedPsbt = useCallback(async () => {
    // Only used for withdrawals — deposits are prepared on demand via prepareDeposit()
    if (isDeposit || isCalculatingPsbt) return;

    setIsCalculatingPsbt(true);
    setError(null);

    try {
      const userPubKey = resolveUserPubKey();
      if (!userPubKey) {
        setIsCalculatingPsbt(false);
        return;
      }

      const res = await fetch("/api/btc-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          withdrawAddress,
          amount,
          userPublicKey: userPubKey,
          network: selectedChain === "btc_testnet" ? "testnet" : "bitcoin",
          locktime: savedLocktime,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          err.details || err.error || "Failed to create withdrawal transaction",
        );
      }

      const withdrawData: BtcWithdrawalResponse = await res.json();
      if (!("success" in withdrawData) || !withdrawData.success) {
        throw new Error(
          "error" in withdrawData
            ? withdrawData.error
            : "Failed to create transaction",
        );
      }

      // Normalise field name
      const normalised: { psbt_base64: string; locktime?: number } =
        "psbt" in withdrawData
          ? {
              psbt_base64: withdrawData.psbt,
              locktime: withdrawData.locktime,
            }
          : (withdrawData as any);

      setUnsignedTransactionData(normalised);
    } catch (err: any) {
      console.error("Error calculating withdrawal PSBT:", err);
      setUnsignedTransactionData(null);
      setPsbtCalcFailed(true);
    }

    setIsCalculatingPsbt(false);
  }, [
    isDeposit,
    isCalculatingPsbt,
    selectedChain,
    userAddress,
    withdrawAddress,
    amount,
    manualPublicKey,
    isUsingConnectedWallet,
    bitcoinAccounts,
    savedLocktime,
  ]);

  /** Schedule a debounced withdrawal PSBT calculation (800 ms). */
  const schedulePsbtCalc = useCallback(() => {
    if (psbtDebounceRef.current) clearTimeout(psbtDebounceRef.current);
    psbtDebounceRef.current = setTimeout(() => {
      calculateUnsignedPsbt();
    }, 800);
  }, [calculateUnsignedPsbt]);

  const cancelPsbtCalc = useCallback(() => {
    if (psbtDebounceRef.current) clearTimeout(psbtDebounceRef.current);
  }, []);

  // ── Sign in browser & broadcast ──────────────────────────────────────────

  const handleSignInBrowser = async () => {
    setLoading(true);
    setError(null);

    const transactionId = addPendingTransaction(
      selectedChain,
      Number(amount),
      isDeposit ? "deposit" : "withdraw",
    );
    setPendingTransactionId(transactionId);

    try {
      let psbt: string;

      if (isDeposit) {
        // Steps 1–3: scripts → program → intent (backend builds the PSBT)
        const prepared = await prepareDeposit();
        if (!prepared) {
          updateTransactionStatus(transactionId, "failed");
          setLoading(false);
          return;
        }
        psbt = prepared;
      } else {
        if (!unsignedTransactionData) {
          setError("Transaction not ready. Please wait for PSBT calculation.");
          updateTransactionStatus(transactionId, "failed");
          setLoading(false);
          return;
        }
        psbt = unsignedTransactionData.psbt_base64;
      }

      const psbtResponse = await bitcoinConnector?.signPSBT({
        psbt,
        signInputs: [],
      });

      if (!psbtResponse?.psbt) throw new Error("Wallet returned no PSBT data");

      const signedPsbt = Psbt.fromBase64(psbtResponse.psbt);

      const alreadyFinalized = signedPsbt.data.inputs.every(
        (inp) =>
          (inp.finalScriptSig && inp.finalScriptSig.length > 0) ||
          (inp.finalScriptWitness && inp.finalScriptWitness.length > 0),
      );

      if (!alreadyFinalized) {
        const finalized = finalizePsbtSafe(signedPsbt);
        if (!finalized)
          throw new Error("Could not finalize the signed transaction.");
      }

      const rawTx = signedPsbt.extractTransaction();
      const txHex = rawTx.toHex();
      setPsbtBase64(signedPsbt.toBase64());

      const broadcastRes = await fetch("/api/btc-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawTx: txHex }),
      });

      if (!broadcastRes.ok) {
        const err = await broadcastRes.json();
        throw new Error(
          err.details || err.error || "Failed to broadcast transaction",
        );
      }

      const { txid } = await broadcastRes.json();
      setBroadcastResult(txid);

      if (isDeposit) {
        updateStakedAmount(selectedChain, Number(amount), "deposit");
        updateTransactionStatus(transactionId, "completed", txid);
        clearActiveProgram();
      } else {
        updateStakedAmount(selectedChain, Number(amount), "withdraw");
        updateTransactionStatus(
          transactionId,
          "completed",
          txid,
          savedLocktime ? { locktime: savedLocktime } : undefined,
        );
      }

      setTxHash(txid);
      setStep("done");
      onSuccess?.(txid, selectedChain, amount);
    } catch (err: any) {
      console.error("Sign/broadcast error:", err?.message);
      setError(err.message || "Error signing transaction in browser");
      updateTransactionStatus(transactionId, "failed");
    }

    setLoading(false);
  };

  // ── Copy unsigned PSBT for manual signing ────────────────────────────────

  const handleCopyUnsignedPSBT = async (): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      let psbt: string;

      if (isDeposit) {
        // Steps 1–3: scripts → program → intent (backend builds the PSBT)
        const prepared = await prepareDeposit();
        if (!prepared) return null;
        psbt = prepared;
      } else {
        if (!unsignedTransactionData) return null;
        psbt = unsignedTransactionData.psbt_base64;
      }

      const transactionId = addPendingTransaction(
        selectedChain,
        Number(amount),
        isDeposit ? "deposit" : "withdraw",
      );
      setPendingTransactionId(transactionId);

      setPsbtBase64(psbt);
      setStep("psbt");
      onSuccess?.(psbt, selectedChain, amount);
      return psbt;
    } catch (err: any) {
      setError(err.message || "Error preparing transaction");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ── PsbtSigning component found the tx on-chain ──────────────────────────

  const handleTransactionFound = async (txid: string) => {
    console.log("Transaction found on-chain:", txid);
    setBroadcastResult(txid);

    if (isDeposit) {
      updateStakedAmount(selectedChain, Number(amount), "deposit");
      if (pendingTransactionId) {
        updateTransactionStatus(pendingTransactionId, "completed", txid);
      }
      clearActiveProgram();
    } else {
      updateStakedAmount(selectedChain, Number(amount), "withdraw");
      if (pendingTransactionId) {
        updateTransactionStatus(
          pendingTransactionId,
          "completed",
          txid,
          savedLocktime ? { locktime: savedLocktime } : undefined,
        );
      }
    }

    setTxHash(txid);
    setStep("done");
    onSuccess?.(txid, selectedChain, amount);
  };

  // ── Reset ────────────────────────────────────────────────────────────────

  const resetFlow = () => {
    setStep("form");
    setUnsignedTransactionData(null);
    setPsbtBase64("");
    setBroadcastResult("");
    setTxHash("");
    setEscrowAddress("");
    setIsCalculatingPsbt(false);
    setPsbtCalcFailed(false);
    setLoading(false);
    setError(null);
    setPendingTransactionId(null);
    clearActiveProgram();
  };

  const resetPsbtCalc = () => {
    setUnsignedTransactionData(null);
    setPsbtCalcFailed(false);
  };

  return {
    // State
    step,
    setStep,
    unsignedTransactionData,
    psbtBase64,
    broadcastResult,
    txHash,
    escrowAddress,
    isCalculatingPsbt,
    psbtCalcFailed,
    loading,
    error,
    setError,
    pendingTransactionId,

    // Actions
    calculateUnsignedPsbt,
    schedulePsbtCalc,
    cancelPsbtCalc,
    handleSignInBrowser,
    handleCopyUnsignedPSBT,
    handleTransactionFound,
    resetFlow,
    resetPsbtCalc,
  };
}
