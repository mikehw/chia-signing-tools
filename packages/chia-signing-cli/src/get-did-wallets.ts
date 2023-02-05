import { get_wallets } from 'chia-agent/api/rpc/wallet';
import { wallet_agent } from './get-agents';

const DID_WALLET_TYPE = 8;

export async function get_did_wallets() {
  const res = await get_wallets(wallet_agent(), {
    include_data: true,
    type: DID_WALLET_TYPE,
  });
  if ('error' in res) {
    throw new Error(res.error);
  }
  if (!res.fingerprint) {
    throw new Error('No fingerprint found');
  }
  return res.wallets.map((wallet) => {
    return { id: wallet.id, name: wallet.name };
  });
}
