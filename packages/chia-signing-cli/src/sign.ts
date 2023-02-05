import { get_did_wallets } from './get-did-wallets';
import { log_in } from 'chia-agent/api/rpc/wallet';
import { wallet_agent } from './get-agents';
import { get_fingerprints } from './get-fingerprints';
import { sign_message } from 'chia-signing-tools';
import * as prompts from 'prompts';

async function main() {
  await selectKeyAndLogIn();
  const wallet = await selectWallet();
  const message = await getMessage();
  return await sign_message(wallet, message);
}

async function selectKeyAndLogIn() {
  const keys = await get_fingerprints();
  if (keys.length === 0) {
    throw new Error('No keys found');
  }
  const key = await selectKeyFromList(keys);
  const loginResult = await log_in(wallet_agent(), {
    fingerprint: key.fingerprint,
  });
  if ('error' in loginResult) {
    throw new Error(loginResult.error);
  }
}

async function selectKeyFromList(
  keys: Awaited<ReturnType<typeof get_fingerprints>>
) {
  if (keys.length === 1) {
    return keys[0];
  }
  const response = await prompts.default({
    type: 'select',
    name: 'key',
    choices: [
      ...keys.map((key, i) => ({
        title: `${key.label ? `${key.label} - ` : ''}${key.fingerprint}`,
        value: i,
      })),
    ],
    message: 'Select key to get DID profile',
  });
  return keys[response.key];
}

async function selectWallet() {
  const wallets = await get_did_wallets();
  if (wallets.length === 0) {
    throw new Error('No DID profiles found');
  }
  const wallet = await selectWalletFromList(wallets);
  return wallet;
}

async function selectWalletFromList(
  wallets: Awaited<ReturnType<typeof get_did_wallets>>
) {
  if (wallets.length === 1) {
    return wallets[0];
  }
  const response = await prompts.default({
    type: 'select',
    name: 'wallet',
    choices: [
      ...wallets.map((wallet, i) => ({
        title: `${wallet.name ?? wallet.id}`,
        value: i,
      })),
    ],
    message: 'Select DID profile to sign message with',
  });
  return wallets[response.wallet];
}

async function getMessage() {
  const response = await prompts.default({
    type: 'text',
    name: 'message',
    message: 'Message to sign',
  });
  return response.message;
}

main()
  .then((result) => {
    console.log('Signed Message:');
    console.log(JSON.stringify(result));
  })
  .catch(console.error);
