import { z } from 'zod';

export const message_schema = z.object({
  did: z.string().startsWith('did:chia:'),
  msg: z.string(),
  sig: z.string(),
});

export const message_schema_v0_1_x = z.object({
  did: z.string().startsWith('did:chia:'),
  message: z.string(),
  sig: z.string(),
});

export const message_schema_compat = z.union([
  message_schema,
  message_schema_v0_1_x,
]);
