import { did_get_did, sign_message_by_id } from 'chia-agent/api/rpc/wallet';
import { wallet_agent } from './get-agents';
import { get_str_to_sign } from './get-str-to-sign';

export async function sign_message(
  wallet: { id: number; name: string },
  message: string
) {
  const didResp = await did_get_did(wallet_agent(), { wallet_id: wallet.id });
  if ('error' in didResp) {
    throw new Error(didResp.error);
  }
  if (!didResp.coin_id) {
    throw new Error('No coin id found for DID');
  }
  const messageObject = {
    did: didResp.my_did,
    message,
    ts: new Date().toISOString(),
  };
  const msg = get_str_to_sign(messageObject);
  const signature = await sign_message_by_id(wallet_agent(), {
    id: didResp.my_did,
    message: msg,
  });
  if ('error' in signature) {
    throw new Error(signature.error);
  }
  const signedMessage = {
    ...messageObject,
    sig: signature.signature,
  };
  return signedMessage;
}
