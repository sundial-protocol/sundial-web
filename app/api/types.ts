// API Response Types for Bitcoin-related endpoints

// Common error response interface
export interface ApiErrorResponse {
  error: string;
  details?: string;
}

// Common script info interface used by staking and withdrawal
export interface ScriptInfo {
  address: string;
  redeemScript: string;
}
