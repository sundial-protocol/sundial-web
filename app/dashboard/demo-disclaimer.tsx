"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export default function DemoDisclaimer({ classes }: { classes?: string }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`${classes} bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm flex-1">
          <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">
            Demo Environment
          </div>
          <div className="text-amber-700 dark:text-amber-300">
            This is an early-stage, non-functional demonstration. Dashboard
            features, transactions, and staking functions are simulated for
            preview purposes only and do not interact with actual blockchain
            networks.
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors p-1 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/30"
          aria-label="Close disclaimer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
