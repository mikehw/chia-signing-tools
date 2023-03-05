import { bech32m } from 'bech32';
import { createHash } from 'node:crypto';
import fetch from 'node-fetch';
import { nft_get_info } from 'chia-agent/api/rpc';
import { wallet_agent } from './get-agents';

export function fromBech32m(value: string) {
  const data = bech32m.decode(value);
  return Buffer.from(bech32m.fromWords(data.words)).toString('hex');
}

export async function getCol1Id(nftId: string): Promise<string> {
  const coin_id = fromBech32m(nftId);
  const nftInfo = await nft_get_info(wallet_agent(), { coin_id: coin_id });
  if ('error' in nftInfo) {
    throw new Error(nftInfo.error);
  }
  const metadataUrls = nftInfo.nft_info.metadata_uris;
  let did = nftInfo.nft_info.minter_did;
  if (!did) {
    throw new Error('No minter did found for NFT, unable to get col1');
  }
  did = removePrefix(did, '0x');
  const collectionId = await getCollectionIdFromMetadataUrls(metadataUrls);
  if (!collectionId || !did) {
    throw new Error('No collection id found for NFT, unable to get col1');
  }
  const col1Id = getColId(did, collectionId);
  if (!col1Id) {
    throw new Error('Error calculating col1 id, unable to sign');
  }
  return col1Id;
}

export async function getCollectionIdFromMetadataUrls(
  metadataUrls: string[]
): Promise<string> {
  for (const url of metadataUrls) {
    const response = await fetch(url);
    if (response.ok) {
      const metadata = (await response.json()) as any;
      if (metadata?.collection?.id) {
        return metadata.collection.id;
      }
    }
  }
  return '';
}

export function getColId(minter_did_id: string, collection_id: string) {
  if (minter_did_id && collection_id) {
    const hashBuffer = createHash('sha256')
      .update(`${minter_did_id}${collection_id}`)
      .digest();
    return encodeBuffer('col', hashBuffer);
  }
  return undefined;
}

export function encodeBuffer(prefix: string, buffer: Buffer) {
  const words = bech32m.toWords(buffer);
  return bech32m.encode(prefix, words);
}

export function toBech32m(value: string, prefix: string) {
  if (value.startsWith(prefix)) {
    return value;
  }
  const pureHash = removePrefix(value, '0x');
  const words = bech32m.toWords(Buffer.from(pureHash, 'hex'));
  return bech32m.encode(prefix, words);
}

export function removePrefix(value: string, prefix: string) {
  if (value.startsWith(prefix)) {
    return value.slice(prefix.length);
  }
  return value;
}
