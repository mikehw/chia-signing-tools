import { z } from 'zod';

export const message_schema = z.object({
  did: z.string().startsWith('did:chia:'),
  message: z.string(),
  sig: z.string(),
});
