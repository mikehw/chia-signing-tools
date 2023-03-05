import { did_get_info, nft_get_info } from 'chia-agent/api/rpc/wallet';
import { wallet_agent } from './get-agents';
import { message_schema_compat } from './message-schema';
import { get_str_to_sign, get_str_to_sign_v0_1_x } from './get-str-to-sign';
import { Program } from 'clvm-lib';
import { fromBech32m, getCol1Id, toBech32m } from './utils';

export async function verify(messageString: string) {
  let message = message_schema_compat.parse(JSON.parse(messageString));
  let signedString: string;
  // v0.1.x compatibility
  if ('message' in message) {
    signedString = get_str_to_sign_v0_1_x(message);
    message = {
      did: message.did,
      msg: message.message,
      sig: message.sig,
    };
  } else {
    signedString = get_str_to_sign(message);
  }
  let pubKey = '';
  let p2Address = '';
  if ('nft' in message) {
    const coin_id = fromBech32m(message.nft);
    const nftInfo = await nft_get_info(wallet_agent(), {
      coin_id: `${coin_id}`,
    });
    if ('error' in nftInfo) {
      throw new Error(nftInfo.error);
    }
    pubKey = message.pubkey;
    p2Address = toBech32m(nftInfo.nft_info.p2_address, 'xch');
  } else {
    const coin_id = fromBech32m(message.did);
    const didInfo = await did_get_info(wallet_agent(), {
      coin_id: `0x${coin_id}`,
    });
    if ('error' in didInfo) {
      throw new Error(didInfo.error);
    }
    pubKey = didInfo.public_key;
    p2Address = didInfo.p2_address;
  }

  const prg = Program.cons(
    Program.fromText('Chia Signed Message'),
    Program.fromText(signedString)
  );
  const hash = prg.hashHex();
  const data = {
    pubkey: `${pubKey}`,
    signature: `${message.sig}`,
    message: hash,
    address: `${p2Address}`,
  };
  const verify = (await wallet_agent().sendMessage(
    'wallet',
    'verify_signature',
    data
  )) as { isValid: boolean; success: true } | { error: string; success: false };
  if ('error' in verify) {
    throw new Error(verify.error);
  }
  if ('nft' in message) {
    const col1Id = await getCol1Id(message.nft).catch((e) => {
      throw new Error(e);
    });
    if (col1Id !== message.col1Id) {
      throw new Error('Col1Id does not match');
    }
  }
  return { ...verify, ...message };
}
