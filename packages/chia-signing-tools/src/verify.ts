import { did_get_info } from 'chia-agent/api/rpc/wallet';
import { wallet_agent } from './get-agents';
import { message_schema } from './message-schema';
import { bech32m } from 'bech32';
import { get_str_to_sign } from './get-str-to-sign';
import { Program } from 'clvm-lib';

export async function verify(messageString: string) {
  const message = message_schema.parse(JSON.parse(messageString));
  const signedString = get_str_to_sign(message);
  const coin_id = fromBech32m(message.did);
  const didInfo = await did_get_info(wallet_agent(), {
    coin_id: `0x${coin_id}`,
  });
  if ('error' in didInfo) {
    throw new Error(didInfo.error);
  }
  const prg = Program.cons(
    Program.fromText('Chia Signed Message'),
    Program.fromText(signedString)
  );
  const hash = prg.hashHex();
  const data = {
    pubkey: `${didInfo.public_key}`,
    signature: `${message.sig}`,
    message: hash,
    address: `${didInfo.p2_address}`,
  };
  const verify = (await wallet_agent().sendMessage(
    'wallet',
    'verify_signature',
    data
  )) as { isValid: boolean; success: true } | { error: string; success: false };
  if ('error' in verify) {
    throw new Error(verify.error);
  }
  return { ...verify, ...message };
}

function fromBech32m(value: string) {
  const data = bech32m.decode(value);
  return Buffer.from(bech32m.fromWords(data.words)).toString('hex');
}