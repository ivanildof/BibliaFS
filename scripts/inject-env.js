import fs from 'fs';
import path from 'path';

// This script creates a .env file with the required variables for Vite build
// It reads from process.env and writes to .env so Vite can access them

const envVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLIC_KEY',
  'VITE_STRIPE_MONTHLY_PRICE_ID',
  'VITE_STRIPE_YEARLY_PRICE_ID',
  'VITE_STRIPE_PREMIUM_PLUS_PRICE_ID',
  'VITE_STRIPE_DONATION_10_PRICE_ID',
  'VITE_STRIPE_DONATION_25_PRICE_ID',
  'VITE_STRIPE_DONATION_50_PRICE_ID',
  'VITE_STRIPE_DONATION_100_PRICE_ID',
  'VITE_STRIPE_DONATION_CUSTOM_PRICE_ID',
  'VITE_APP_URL'
];

let envContent = '';

for (const varName of envVars) {
  const value = process.env[varName];
  if (value) {
    envContent += `${varName}=${value}\n`;
    console.log(`✓ ${varName} found`);
  } else {
    console.log(`✗ ${varName} not found`);
  }
}

// Write to .env file in the root directory
fs.writeFileSync('.env', envContent);
console.log('\n.env file created for Vite build');
