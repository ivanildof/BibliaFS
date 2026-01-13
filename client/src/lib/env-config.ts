// Environment configuration for Capacitor Android builds
// These values are used as fallbacks when environment variables are not available
// Note: These are PUBLIC keys (anon key, publishable key) that are safe for client-side use

const envDefaults = {
  VITE_SUPABASE_URL: "https://olvumxgyoazdftdyasmx.supabase.co",
  VITE_SUPABASE_ANON_KEY: "sb_publishable_7Tg_A-xoQTzgSU70QUM4lA_Y8eQe5Jj",
  VITE_STRIPE_PUBLIC_KEY: "pk_live_51SdzfMLxcUHgdisLzNsUtr1jq8xohiZHoX4maFI9ZOFGiCihZLO3BC3XOMj7kMgwC4HDVmyAXnP0iQGOSC9xNXx900BwbqTRuc",
  VITE_STRIPE_MONTHLY_PRICE_ID: "price_1SoqxJLxcUHgdisLSjzqs9kP",
  VITE_STRIPE_YEARLY_PRICE_ID: "price_1SoqxOLxcUHgdisLsfxoxyj7",
  VITE_STRIPE_PREMIUM_PLUS_PRICE_ID: "price_1SoqxQLxcUHgdisLPywByiTk",
  VITE_STRIPE_DONATION_10_PRICE_ID: "price_1SoqxTLxcUHgdisL2oKZfTFV",
  VITE_STRIPE_DONATION_25_PRICE_ID: "price_1SoqxWLxcUHgdisLvXAn7mar",
  VITE_STRIPE_DONATION_50_PRICE_ID: "price_1SoqxYLxcUHgdisLJgKRDloE",
  VITE_STRIPE_DONATION_100_PRICE_ID: "price_1SoqxZLxcUHgdisLYgHEFqgT",
  VITE_STRIPE_DONATION_CUSTOM_PRICE_ID: "price_1SoqxbLxcUHgdisLbln2YRd7",
  VITE_APP_URL: "https://bibliafs.com.br",
};

// Get environment variable with fallback to default
export function getEnv(key: keyof typeof envDefaults): string {
  // Try to get from import.meta.env first
  const envValue = (import.meta as any).env?.[key];
  if (envValue && envValue !== '' && !envValue.includes('import.meta')) {
    return envValue;
  }
  // Fallback to defaults for Capacitor builds
  return envDefaults[key];
}

// Export individual values for convenience
export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
export const STRIPE_PUBLIC_KEY = getEnv('VITE_STRIPE_PUBLIC_KEY');
export const APP_URL = getEnv('VITE_APP_URL');
export const STRIPE_MONTHLY_PRICE_ID = getEnv('VITE_STRIPE_MONTHLY_PRICE_ID');
export const STRIPE_YEARLY_PRICE_ID = getEnv('VITE_STRIPE_YEARLY_PRICE_ID');
export const STRIPE_PREMIUM_PLUS_PRICE_ID = getEnv('VITE_STRIPE_PREMIUM_PLUS_PRICE_ID');
