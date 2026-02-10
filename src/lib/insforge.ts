import { createClient } from '@insforge/sdk';

const baseUrl =
  process.env.NEXT_PUBLIC_INSFORGE_BASE_URL ||
  'https://dw38nz2i.ap-southeast.insforge.app';

const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '';

export const insforge = createClient({
  baseUrl,
  anonKey,
});

