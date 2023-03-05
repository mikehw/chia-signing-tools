import { log_in } from 'chia-agent/api/rpc/wallet';
import { wallet_agent } from './get-agents';
import { get_fingerprints } from './get-fingerprints';
import { sign_message_with_nft } from 'chia-signing-tools';
import * as prompts from 'prompts';
import { getCol1Id } from 'chia-signing-tools/lib/utils';

async function main() {
  await selectKeyAndLogIn();
  const nftId = await getNftId();
  const col1Id = await getCol1Id(nftId).catch((e) => {
    console.error(e);
    console.log(
      'Unable to load collection info for NFT, unable to sign Error 1'
    );
    return;
  });
  if (!col1Id) {
    return;
  }
  const message = await getMessage();
  return await sign_message_with_nft(nftId, col1Id, message);
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
    message: 'Select key which controls nft',
  });
  return keys[response.key];
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

async function getNftId(): Promise<string> {
  const response = await prompts.default({
    type: 'text',
    name: 'message',
    message: 'NFT ID',
  });
  return response.message;
}
