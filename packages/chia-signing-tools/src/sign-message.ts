import { sign_message_by_id } from 'chia-agent/api/rpc/wallet';
import { wallet_agent } from './get-agents';
import { get_str_to_sign } from './get-str-to-sign';

/** Deprecated, please use sign_message_with_did */
export async function sign_message(did: string, message: string) {
  return sign_message_with_did(did, message);
}

export async function sign_message_with_did(did: string, message: string) {
  const messageObject = {
    did: did,
    msg: message,
  };
  const msg = get_str_to_sign(messageObject);
  const signature = await sign_message_by_id(wallet_agent(), {
    id: did,
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

export async function sign_message_with_nft(
  nft: string,
  col1Id: string,
  message: string
) {
  const messageObject = {
    nft: nft,
    col1Id: col1Id,
    msg: message,
  };
  const msg = get_str_to_sign(messageObject);
  const signature = await sign_message_by_id(wallet_agent(), {
    id: nft,
    message: msg,
  });
  if ('error' in signature) {
    throw new Error(signature.error);
  }
  const signedMessage = {
    ...messageObject,
    sig: signature.signature,
    pubkey: signature.pubkey,
  };
  return signedMessage;
}
