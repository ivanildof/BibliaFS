/**
 * Get Price IDs from Products
 * Run this to get all price IDs from your created products
 */

import Stripe from 'stripe';

const productIds = {
  mensal: 'prod_TbawhaXAcd6Fxy',
  anual: 'prod_TbaxiGxB514Hbl',
  premiumPlus: 'prod_TbayGlqeiPPdgo',
  donation10: 'prod_Tbb2DFxgX8OTW0',
  donation25: 'prod_Tbb2QjKgwak0Mx',
  donation50: 'prod_Tbb36dLzJ3j68W',
  donation100: 'prod_Tbb5iKjtyRp8uV',
};

async function getPrices() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY não configurada');
    process.exit(1);
  }
  
  const stripe = new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
  });

  console.log('📦 Buscando Price IDs dos produtos...\n');

  try {
    const results: Record<string, string> = {};

    // Get prices for each product
    for (const [name, productId] of Object.entries(productIds)) {
      const prices = await stripe.prices.list({
        product: productId,
        active: true,
      });

      if (prices.data.length > 0) {
        const priceId = prices.data[0].id;
        results[name] = priceId;
        console.log(`✅ ${name}: ${priceId}`);
      } else {
        console.log(`❌ ${name}: Nenhum preço ativo encontrado`);
      }
    }

    console.log('\n========================================');
    console.log('📝 Copie e cole no seu ambiente:\n');
    
    console.log('# PLANOS');
    console.log(`VITE_STRIPE_MONTHLY_PRICE_ID=${results.mensal}`);
    console.log(`VITE_STRIPE_YEARLY_PRICE_ID=${results.anual}`);
    console.log(`VITE_STRIPE_PREMIUM_PLUS_PRICE_ID=${results.premiumPlus}`);
    
    console.log('\n# DOAÇÕES');
    console.log(`VITE_STRIPE_DONATION_10_PRICE_ID=${results.donation10}`);
    console.log(`VITE_STRIPE_DONATION_25_PRICE_ID=${results.donation25}`);
    console.log(`VITE_STRIPE_DONATION_50_PRICE_ID=${results.donation50}`);
    console.log(`VITE_STRIPE_DONATION_100_PRICE_ID=${results.donation100}`);
    
    console.log('\n========================================\n');
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

getPrices();
