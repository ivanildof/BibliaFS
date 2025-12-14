import Stripe from 'stripe';

async function getStripeClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
      ? 'depl ' + process.env.WEB_REPL_RENEWAL
      : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  const url = new URL(`https://${hostname}/api/v2/connection`);
  url.searchParams.set('include_secrets', 'true');
  url.searchParams.set('connector_names', 'stripe');
  url.searchParams.set('environment', 'development');

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'X_REPLIT_TOKEN': xReplitToken
    }
  });

  const data = await response.json();
  const connectionSettings = data.items?.[0];

  if (!connectionSettings?.settings?.secret) {
    throw new Error('Stripe connection not found');
  }

  return new Stripe(connectionSettings.settings.secret, {
    apiVersion: '2025-08-27.basil' as any,
  });
}

async function createProducts() {
  console.log('🚀 Creating BíbliaFS Stripe products...\n');
  
  const stripe = await getStripeClient();

  // Check if products already exist
  const existingProducts = await stripe.products.search({ 
    query: "name:'BíbliaFS'" 
  });
  
  if (existingProducts.data.length > 0) {
    console.log('⚠️ Products already exist. Listing current price IDs:\n');
    
    for (const product of existingProducts.data) {
      const prices = await stripe.prices.list({ product: product.id, active: true });
      console.log(`📦 ${product.name}`);
      for (const price of prices.data) {
        console.log(`   Price ID: ${price.id}`);
        console.log(`   Amount: R$ ${(price.unit_amount! / 100).toFixed(2)}`);
        console.log(`   Interval: ${price.recurring?.interval || 'one-time'}\n`);
      }
    }
    return;
  }

  // Create Monthly Plan Product
  console.log('📦 Creating Monthly Plan...');
  const monthlyProduct = await stripe.products.create({
    name: 'BíbliaFS Premium Mensal',
    description: 'Acesso completo à BíbliaFS com IA ilimitada, podcasts, modo professor e mais',
    metadata: {
      plan_type: 'monthly',
      app: 'bibliafs'
    }
  });

  const monthlyPrice = await stripe.prices.create({
    product: monthlyProduct.id,
    unit_amount: 1990, // R$ 19,90 (in cents)
    currency: 'brl',
    recurring: { interval: 'month' },
    lookup_key: 'monthly',
    metadata: { plan_type: 'monthly' }
  });

  console.log(`✅ Monthly Plan created!`);
  console.log(`   Product ID: ${monthlyProduct.id}`);
  console.log(`   Price ID: ${monthlyPrice.id}\n`);

  // Create Annual Plan Product
  console.log('📦 Creating Annual Plan...');
  const yearlyProduct = await stripe.products.create({
    name: 'BíbliaFS Premium Anual',
    description: 'Acesso completo por 1 ano - Economize 37%',
    metadata: {
      plan_type: 'yearly',
      app: 'bibliafs'
    }
  });

  const yearlyPrice = await stripe.prices.create({
    product: yearlyProduct.id,
    unit_amount: 14990, // R$ 149,90 (in cents)
    currency: 'brl',
    recurring: { interval: 'year' },
    lookup_key: 'yearly',
    metadata: { plan_type: 'yearly' }
  });

  console.log(`✅ Annual Plan created!`);
  console.log(`   Product ID: ${yearlyProduct.id}`);
  console.log(`   Price ID: ${yearlyPrice.id}\n`);

  // Create Premium Plus Plan Product
  console.log('📦 Creating Premium Plus Plan...');
  const premiumPlusProduct = await stripe.products.create({
    name: 'BíbliaFS Premium Plus',
    description: 'O plano mais completo - Dobro do limite de IA + Acesso VIP',
    metadata: {
      plan_type: 'premium_plus',
      app: 'bibliafs'
    }
  });

  const premiumPlusPrice = await stripe.prices.create({
    product: premiumPlusProduct.id,
    unit_amount: 28900, // R$ 289,00 (in cents)
    currency: 'brl',
    recurring: { interval: 'year' },
    lookup_key: 'premium_plus',
    metadata: { plan_type: 'premium_plus' }
  });

  console.log(`✅ Premium Plus Plan created!`);
  console.log(`   Product ID: ${premiumPlusProduct.id}`);
  console.log(`   Price ID: ${premiumPlusPrice.id}\n`);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 All products created successfully!');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('📋 CONFIGURE THESE ENVIRONMENT VARIABLES:\n');
  console.log(`VITE_STRIPE_MONTHLY_PRICE_ID=${monthlyPrice.id}`);
  console.log(`VITE_STRIPE_YEARLY_PRICE_ID=${yearlyPrice.id}`);
  console.log(`VITE_STRIPE_PREMIUM_PLUS_PRICE_ID=${premiumPlusPrice.id}`);
  console.log('\n');
}

createProducts().catch(console.error);
