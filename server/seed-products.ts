/**
 * Seed Products Script for BíbliaFS
 * 
 * This script creates the subscription products and prices in Stripe.
 * Run this once in development to create products.
 * 
 * Usage: npx tsx server/seed-products.ts
 * 
 * The created prices will be synced to the database via webhooks.
 * Update your frontend with the generated price IDs.
 */

import { getUncachableStripeClient } from './stripeClient';

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('🚀 Creating BíbliaFS subscription products...\n');

  try {
    // Create Mensal (Monthly) product
    console.log('📦 Creating Mensal (Monthly) product...');
    const monthlyProduct = await stripe.products.create({
      name: 'Mensal',
      description: 'Acesso premium completo - IA Teológica, Podcasts, Modo Professor, Áudio narrado',
      metadata: {
        type: 'subscription',
        plan: 'monthly',
        aiLimit: '~500 perguntas/mês',
      },
    });
    console.log(`✅ Mensal product created: ${monthlyProduct.id}`);

    const monthlyPrice = await stripe.prices.create({
      product: monthlyProduct.id,
      unit_amount: 1990, // R$ 19,90
      currency: 'brl',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'monthly',
      },
    });
    console.log(`✅ Mensal price created: ${monthlyPrice.id}\n`);

    // Create Anual (Yearly) product
    console.log('📦 Creating Anual (Yearly) product...');
    const yearlyProduct = await stripe.products.create({
      name: 'Anual',
      description: 'Tudo do Mensal + Economia de 37% - IA Teológica, Badge exclusivo, Comunidade VIP',
      metadata: {
        type: 'subscription',
        plan: 'yearly',
        aiLimit: '~3.750 perguntas/ano',
        savings: 'R$ 89/ano',
      },
    });
    console.log(`✅ Anual product created: ${yearlyProduct.id}`);

    const yearlyPrice = await stripe.prices.create({
      product: yearlyProduct.id,
      unit_amount: 14990, // R$ 149,90
      currency: 'brl',
      recurring: {
        interval: 'year',
      },
      metadata: {
        plan: 'yearly',
      },
    });
    console.log(`✅ Anual price created: ${yearlyPrice.id}\n`);

    // Create Premium Plus product
    console.log('📦 Creating Premium Plus product...');
    const premiumPlusProduct = await stripe.products.create({
      name: 'Premium Plus',
      description: 'Máximo poder de IA - Dobro do limite Anual + Acesso antecipado a recursos + Suporte VIP 24h',
      metadata: {
        type: 'subscription',
        plan: 'premium_plus',
        aiLimit: '~7.200 perguntas/ano',
      },
    });
    console.log(`✅ Premium Plus product created: ${premiumPlusProduct.id}`);

    const premiumPlusPrice = await stripe.prices.create({
      product: premiumPlusProduct.id,
      unit_amount: 28900, // R$ 289,00
      currency: 'brl',
      recurring: {
        interval: 'year',
      },
      metadata: {
        plan: 'premium_plus',
      },
    });
    console.log(`✅ Premium Plus price created: ${premiumPlusPrice.id}\n`);

    // Output summary
    console.log('========================================');
    console.log('✨ All products created successfully!');
    console.log('========================================\n');

    console.log('📝 Update your environment variables:\n');
    console.log(`VITE_STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
    console.log(`VITE_STRIPE_YEARLY_PRICE_ID=${yearlyPrice.id}`);
    console.log(`VITE_STRIPE_PREMIUM_PLUS_PRICE_ID=${premiumPlusPrice.id}\n`);

    console.log('🎯 Price IDs summary:');
    console.log(`  Mensal:        ${monthlyPrice.id}`);
    console.log(`  Anual:         ${yearlyPrice.id}`);
    console.log(`  Premium Plus:  ${premiumPlusPrice.id}\n`);

    console.log('✅ Prices are being synced to database via webhooks');
    console.log('✅ You can now use these price IDs in your checkout flow\n');
  } catch (error: any) {
    console.error('❌ Error creating products:', error.message);
    process.exit(1);
  }
}

seedProducts();
