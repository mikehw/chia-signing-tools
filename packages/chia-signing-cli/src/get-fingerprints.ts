import { getDaemon } from 'chia-agent';
import { get_keys } from 'chia-agent/api/ws/daemon';

export async function get_fingerprints() {
  const daemon = getDaemon();
  await daemon.connect();
  const res = await get_keys(daemon, { include_secrets: false });
  if ('error' in res.data) {
    throw new Error(res.data.error);
  }
  await daemon.close();
  return res.data.keys;
}
