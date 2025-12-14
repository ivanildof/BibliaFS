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

async function createDonationProducts() {
  console.log('🙏 Creating BíbliaFS Donation products...\n');
  
  const stripe = await getStripeClient();

  // Donation amounts
  const donations = [
    { name: 'R$ 10', amount: 1000, displayName: 'Doação R$ 10' },
    { name: 'R$ 25', amount: 2500, displayName: 'Doação R$ 25' },
    { name: 'R$ 50', amount: 5000, displayName: 'Doação R$ 50' },
    { name: 'R$ 100', amount: 10000, displayName: 'Doação R$ 100' },
  ];

  console.log('📋 Creating donation products:\n');
  
  const results: any = {};

  for (const donation of donations) {
    try {
      // Check if product already exists
      const existingProducts = await stripe.products.search({ 
        query: `name:'${donation.displayName}'`
      });

      if (existingProducts.data.length > 0) {
        const product = existingProducts.data[0];
        const prices = await stripe.prices.list({ product: product.id, active: true });
        const price = prices.data[0];
        
        console.log(`⏭️ ${donation.displayName} já existe`);
        console.log(`   Product ID: ${product.id}`);
        console.log(`   Price ID: ${price.id}\n`);
        
        results[donation.name] = { productId: product.id, priceId: price.id };
        continue;
      }

      // Create new donation product
      const product = await stripe.products.create({
        name: donation.displayName,
        description: 'Doação única para apoiar o BíbliaFS',
        metadata: {
          type: 'donation',
          amount_brl: donation.name,
          app: 'bibliafs'
        }
      });

      const price = await stripe.prices.create({
        product: product.id,
        currency: 'brl',
        custom_unit_amount: { enabled: true, maximum: 50000 }, // Permitir valores customizados até R$ 500
      });

      console.log(`✅ ${donation.displayName} criado!`);
      console.log(`   Product ID: ${product.id}`);
      console.log(`   Price ID: ${price.id}\n`);

      results[donation.name] = { productId: product.id, priceId: price.id };
    } catch (error: any) {
      console.error(`❌ Erro ao criar ${donation.displayName}:`, error.message);
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎉 Produtos de doação criados com sucesso!');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('📋 PREÇOS CRIADOS:\n');
  for (const [name, data] of Object.entries(results)) {
    console.log(`${name}:`);
    console.log(`  VITE_STRIPE_DONATION_${name.replace('R$ ', '').toUpperCase()}_PRICE_ID=${data.priceId}`);
  }
  console.log('\n');
}

createDonationProducts().catch(console.error);
