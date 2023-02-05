import { RPCAgent } from 'chia-agent';
let walletAgent: RPCAgent;

export function wallet_agent() {
  if (!walletAgent) {
    walletAgent = new RPCAgent({
      service: 'wallet',
    });
  }
  return walletAgent;
}
