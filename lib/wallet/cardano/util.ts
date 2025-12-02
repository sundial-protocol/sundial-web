import { bech32 } from 'bech32';

export enum NetworkType {
  MAINNET = 1,
  TESTNET = 0,
}

export function networkName(network: NetworkType) {
  if (network === NetworkType.MAINNET) {
    return 'MAINNET';
  }

  return 'PREPROD OR PREVIEW';
}

export function decodeHexAddress(hexAddress: string) {
  hexAddress = hexAddress.toLowerCase();
  const addressType = hexAddress.charAt(0);
  const networkId = Number(hexAddress.charAt(1)) as NetworkType;
  const addressBytes = Buffer.from(hexAddress, 'hex');
  const words = bech32.toWords(addressBytes);
  let prefix;

  if (['e', 'f'].includes(addressType)) {
    if (networkId === NetworkType.MAINNET) {
      prefix = 'stake';
    } else if (networkId === NetworkType.TESTNET) {
      prefix = 'stake_test';
    } else {
      throw new TypeError('Unsupported network type');
    }

    return bech32.encode(prefix, words, 1000);
  } else {
    if (networkId === NetworkType.MAINNET) {
      prefix = 'addr';
    } else if (networkId === NetworkType.TESTNET) {
      prefix = 'addr_test';
    } else {
      throw new TypeError('Unsupported network type');
    }

    return bech32.encode(prefix, words, 1000);
  }
}

export function waitforCardano(retries = 20, retryIntervalInMs = 25) {
  return new Promise((resolve: (promise?: Promise<any>) => any, reject) => {
    if (typeof window === 'undefined') {
      reject();
    } else if (typeof window.cardano === 'undefined') {
      if (retries > 0) {
        setTimeout(() => resolve(waitforCardano(retries - 1, retryIntervalInMs)), retryIntervalInMs);
      } else {
        reject();
      }
    } else {
      resolve();
    }
  });
}

// Sometimes it takes a some time for a wallet to be injected so this function polls the wallet
// name until it is injected or the retries are exceeded
export function waitforWalletExtension(walletName: string, retries = 20, retryIntervalInMs = 25) {
  return new Promise((resolve: (promise?: Promise<any>) => any, reject) => {
    if (typeof window === 'undefined') {
      reject();
    } else if (typeof window.cardano === 'undefined' || typeof window.cardano[walletName] === 'undefined') {
      if (retries > 0) {
        setTimeout(
          () => resolve(waitforWalletExtension(walletName, retries - 1, retryIntervalInMs)),
          retryIntervalInMs
        );
      } else {
        reject();
      }
    } else {
      resolve();
    }
  });
}
