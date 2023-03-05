import { z } from 'zod';

export const message_schema_did = z.object({
  did: z.string().startsWith('did:chia:'),
  msg: z.string(),
  sig: z.string(),
});

export const message_schema_nft = z.object({
  nft: z.string().startsWith('nft'),
  col1Id: z.string().startsWith('col'),
  msg: z.string(),
  sig: z.string(),
  pubkey: z.string(),
});

export const message_schema = z.union([message_schema_did, message_schema_nft]);

export const message_schema_v0_1_x = z.object({
  did: z.string().startsWith('did:chia:'),
  message: z.string(),
  sig: z.string(),
});

export const message_schema_compat = z.union([
  message_schema_did,
  message_schema_nft,
  message_schema_v0_1_x,
]);
