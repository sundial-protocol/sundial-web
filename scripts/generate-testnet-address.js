const bitcoin = require("bitcoinjs-lib");
const ECPairFactory = require("ecpair").ECPairFactory;
const ecc = require("tiny-secp256k1");

const ECPair = ECPairFactory(ecc);

const keyPair = ECPair.makeRandom({ network: bitcoin.networks.testnet });
// Convert Uint8Array to Buffer for bitcoinjs-lib compatibility
const pubkeyBuffer = Buffer.from(keyPair.publicKey);

const { address } = bitcoin.payments.p2wpkh({
  pubkey: pubkeyBuffer,
  network: bitcoin.networks.testnet,
});

console.log("Testnet Address:", address);
console.log("Private Key (WIF):", keyPair.toWIF());
