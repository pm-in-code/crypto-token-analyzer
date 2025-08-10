const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

// Simple test endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Crypto Token Analyzer Backend is running on Netlify!',
    timestamp: new Date().toISOString(),
    status: 'ok'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    openai_configured: !!OPENAI_API_KEY,
    stripe_configured: !!STRIPE_SECRET_KEY
  });
});

// Token analysis endpoint
app.post('/api/analyze-token', async (req, res) => {
  try {
    const { tokenName } = req.body;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const prompt = `📌 Execute this prompt: 🧠 Prompt for detailed cryptocurrency token analysis

Please provide a comprehensive analysis of the cryptocurrency token "${tokenName}". 

Analysis should include:

1. Market Metrics (0-100 score)
2. Tokenomics (0-100 score) 
3. Development Activity (0-100 score)
4. Social Metrics (0-100 score)
5. Team & Investors (0-100 score)
6. Risk Assessment (0-100 score)

For each category, provide:
- Detailed analysis with specific data points
- Score from 0-100 with justification
- Key strengths and weaknesses

Format the response as:
Category 1: Market Metrics - Score: [X]/100
[Detailed analysis]

Category 2: Tokenomics - Score: [X]/100
[Detailed analysis]

Category 3: Development Activity - Score: [X]/100
[Detailed analysis]

Category 4: Social Metrics - Score: [X]/100
[Detailed analysis]

Category 5: Team & Investors - Score: [X]/100
[Detailed analysis]

Category 6: Risk Assessment - Score: [X]/100
[Detailed analysis]

Overall Score: [Average of all scores]/100

Provide actionable insights and recommendations.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const analysis = data.choices[0].message.content;
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test Stripe API endpoint
app.get('/api/test-stripe', async (req, res) => {
  try {
    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    // Test Stripe API with a simple request
    const stripeResponse = await fetch('https://api.stripe.com/v1/account', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    const accountData = await stripeResponse.json();
    
    if (accountData.error) {
      return res.status(400).json({ 
        error: 'Stripe API error', 
        details: accountData.error 
      });
    }

    res.json({
      status: 'ok',
      stripe_configured: true,
      account_id: accountData.id
    });
  } catch (error) {
    console.error('Error testing Stripe:', error);
    res.status(500).json({ error: 'Failed to test Stripe API' });
  }
});

// Stripe payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    console.log('Stripe endpoint called with body:', req.body);
    
    if (!STRIPE_SECRET_KEY) {
      console.log('Stripe secret key not configured');
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const { amount, currency = 'usd' } = req.body;

    if (!amount) {
      console.log('Amount is missing');
      return res.status(400).json({ error: 'Amount is required' });
    }

    console.log('Creating payment intent with:', { amount, currency });

    // Create payment intent with Stripe
    const formData = new URLSearchParams();
    formData.append('amount', amount.toString());
    formData.append('currency', currency);
    formData.append('automatic_payment_methods[enabled]', 'true');

    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    console.log('Stripe response status:', stripeResponse.status);
    const paymentIntent = await stripeResponse.json();
    console.log('Stripe response:', paymentIntent);
    console.log('Publishable key:', STRIPE_PUBLISHABLE_KEY);

    if (paymentIntent.error) {
      console.error('Stripe error:', paymentIntent.error);
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

// Export the serverless function
module.exports.handler = serverless(app); # Trigger Netlify redeploy: Sun Aug 10 15:21:44 CEST 2025
