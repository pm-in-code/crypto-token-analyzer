const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

// Stripe payment intent endpoint
app.post('/create-payment-intent', async (req, res) => {
  try {
    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const { amount, currency = 'usd' } = req.body;

    // Create payment intent with Stripe
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amount.toString(),
        currency: currency,
        automatic_payment_methods: 'enabled',
      }),
    });

    const paymentIntent = await stripeResponse.json();

    if (paymentIntent.error) {
      return res.status(400).json({ error: paymentIntent.error.message });
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    stripe_configured: !!STRIPE_SECRET_KEY
  });
});

// Export the serverless function
module.exports.handler = serverless(app);
