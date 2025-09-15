import { toast } from 'sonner';

import { networkName, NetworkType } from './util';

const WALLET_API_ERROR_TYPE = {
  Unknown: 'Unknown',
  ApiError: 'ApiError',
  TxSendError: 'TxSendError',
  TxSignError: 'TxSignError',
  BalanceExceededError: 'BalanceExceededError',
} as const;

const WALLET_API_ERROR_CODE = {
  [-1]: 'InvalidRequest', // Inputs do not conform to this spec or are otherwise invalid.
  [-2]: 'InternalError', // An error occurred during execution of this API call.
  [-3]: 'Refused', //  The request was refused due to lack of access - e.g. wallet disconnects.
  [-4]: 'AccountChange', // The account has changed. The dApp should call wallet.enable() to reestablish connection to the new account.
} as const;

const WALLET_TX_SEND_ERROR_CODE = {
  1: 'Refused', // Wallet refuses to send the tx (could be rate limiting)
  2: 'Failure', // Wallet could not send the tx
} as const;

const WALLET_TX_SIGN_ERROR_CODE = {
  1: 'ProofGeneration', // User has accepted the transaction sign, but the wallet was unable to sign the transaction
  2: 'UserDeclined', // User declined to sign the transaction
} as const;

type WalletApiBaseErrorCode = (typeof WALLET_API_ERROR_CODE)[keyof typeof WALLET_API_ERROR_CODE];
type WalletTxSendErrorCode = (typeof WALLET_TX_SEND_ERROR_CODE)[keyof typeof WALLET_TX_SEND_ERROR_CODE];
type WalletTxSignErrorCode = (typeof WALLET_TX_SIGN_ERROR_CODE)[keyof typeof WALLET_TX_SIGN_ERROR_CODE];

type WalletInternalApiError = {
  code: number;
  info: string;
};

export type WalletApiErrorType = (typeof WALLET_API_ERROR_TYPE)[keyof typeof WALLET_API_ERROR_TYPE];
export type WalletApiErrorCode =
  | WalletApiBaseErrorCode
  | WalletTxSendErrorCode
  | WalletTxSignErrorCode
  | 'BalanceExceeded'
  | 'Unknown';

export class WalletApiError extends Error {
  type: WalletApiErrorType;
  code: WalletApiErrorCode;

  constructor(type: WalletApiErrorType, code: WalletApiErrorCode, info: string) {
    super(info);
    this.type = type;
    this.code = code;
  }
}

export class ServerWalletNotSupported extends Error {
  constructor() {
    const message = `It appears you are trying to access the wallet API outside the browser which is not possible`;

    super(message);
    this.name = 'ServerWalletNotSupported';
  }
}

export class WalletNetworkDetectError extends Error {
  constructor() {
    const message = `There was an error while attempting to detect the network associated with the wallet`;

    super(message);
    this.name = 'WalletNetworkDetectError';
  }
}

export class WalletConnectError extends Error {
  constructor(walletName: string, errorMessage: string) {
    const message = `There was an error while connecting to the wallet. 
    Please ensure that you have created a wallet inside of your ${walletName} app and that your network or account has a proper configuration. 
    The error coming from this wallet is: ${errorMessage}.`;

    super(message);
    this.name = 'WalletConnectError';
  }
}

export class WrongNetworkTypeError extends Error {
  constructor(targetNetwork: NetworkType, currentNetwork: NetworkType) {
    const message = `You have tried to call functions on ${networkName(
      currentNetwork
    )}, while the network type is limited to ${networkName(targetNetwork)}.`;

    super(message);
    this.name = 'WrongNetworkTypeError';
  }
}

export class WalletNotCip30CompatibleError extends Error {
  constructor(wallet: string) {
    const message = `It seems that the API of ${wallet} is not cip30 compatible.`;
    super(message);
    this.name = 'WalletNotCip30CompatibleError';
  }
}

export class ExtensionNotInjectedError extends Error {
  constructor(wallet: string) {
    const message = `It seems that the API of ${wallet} is not injected and window.cardano. ${wallet} is not available.`;
    super(message);
    this.name = 'ExtensionNotInjectedError';
  }
}

export class WalletNotInstalledError extends Error {
  constructor(wallet: string) {
    super(`The wallet ${wallet} is not installed.`);
    this.name = 'WalletNotInstalledError';
  }
}

export class WalletExtensionNotFoundError extends Error {
  constructor(wallet: string) {
    const message = `${wallet} was not found. Please check if it is installed correctly.`;
    super(message);
    this.name = 'WalletExtensionNotFoundError';
  }
}

export class EnablementFailedError extends Error {
  constructor(wallet: string) {
    const message = `Enablement of ${wallet} failed. Please check your setup.`;
    super(message);
    this.name = 'EnablementFailedError';
  }
}

export function apiError(type: WalletApiErrorType, error: unknown) {
  if (isWalletInternalApiError(error)) {
    const code = convertErrorCode(type, error.code);
    const info = error.info;

    return new WalletApiError(type, code, info);
  } else if (error instanceof Error) {
    return error;
  } else {
    return new WalletApiError(type, 'Unknown', 'An unexpected error occurred with wallet api');
  }
}

export function isWalletInternalApiError(error: unknown): error is WalletInternalApiError {
  if (error instanceof Object) {
    if ('code' in error && typeof error.code === 'number' && 'info' in error && typeof error.info === 'string') {
      return true;
    }
  }

  return false;
}

export function getErrorMessage(error: unknown) {
  if (isWalletInternalApiError(error)) {
    return error.info;
  } else if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else {
    return 'An unknown error occurred';
  }
}

export function notifyError(error: unknown) {
  console.log(error);
  toast.error(getErrorMessage(error));
}

function walletApiErrorCode(code: number | undefined) {
  if (code) {
    switch (code) {
      case -1:
      case -2:
      case -3:
      case -4:
        return WALLET_API_ERROR_CODE[code];
    }
  }

  return 'Unknown';
}

// Make the error code into a human readable string
function convertErrorCode(type: WalletApiErrorType, code: number): WalletApiErrorCode {
  switch (type) {
    case 'ApiError':
      return walletApiErrorCode(code);
    case 'TxSendError':
      switch (code) {
        case 1:
        case 2:
          return WALLET_TX_SEND_ERROR_CODE[code];
        default:
          return walletApiErrorCode(code);
      }
    case 'TxSignError':
      switch (code) {
        case 1:
        case 2:
          return WALLET_TX_SIGN_ERROR_CODE[code];
        default:
          return walletApiErrorCode(code);
      }
    case 'BalanceExceededError':
      return 'BalanceExceeded';
    default:
      return 'Unknown';
  }
}
