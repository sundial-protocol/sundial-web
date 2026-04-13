// BTC Price API Types
export interface BtcPriceCachedResponse {
  price: number;
  cached: true;
  age: number;
  sessionAge: number;
  requestCount: number;
  cacheDuration: number;
  nextRefreshIn?: number;
  stale?: boolean;
  error?: boolean;
}

export interface BtcPriceFreshResponse {
  price: number;
  cached: false;
  timestamp: number;
  sessionAge: number;
  requestCount: number;
  cacheDuration: number;
  nextRefreshIn: number;
}

export interface BtcPriceErrorResponse {
  error: string;
  sessionAge: number;
  requestCount: number;
}

export interface BtcPriceSessionResetResponse {
  message: string;
  sessionStart: number;
  requestCount: number;
}

export type BtcPriceResponse =
  | BtcPriceCachedResponse
  | BtcPriceFreshResponse
  | BtcPriceErrorResponse;
