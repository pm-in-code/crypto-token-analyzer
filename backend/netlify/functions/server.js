const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
const PROMPT_ADMIN_KEY = process.env.PROMPT_ADMIN_KEY; // short secret to update prompt via API
const ANALYSIS_PROMPT = process.env.ANALYSIS_PROMPT; // primary single-var storage

// Support multi-part prompt via ANALYSIS_PROMPT_1..N (each < 4KB)
function loadPromptFromEnvParts() {
  const parts = Object.keys(process.env)
    .filter((key) => /^ANALYSIS_PROMPT_\d+$/.test(key))
    .sort((a, b) => parseInt(a.split('_').pop(), 10) - parseInt(b.split('_').pop(), 10))
    .map((key) => process.env[key] || '');
  const combined = parts.join('');
  return combined.trim().length > 0 ? combined : '';
}

function loadAnalysisPrompt() {
  // 1) single env
  if (ANALYSIS_PROMPT && ANALYSIS_PROMPT.trim().length > 0) return ANALYSIS_PROMPT;
  // 2) multipart env
  const multi = loadPromptFromEnvParts();
  if (multi) return multi;
  return '';
}

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
  const hasPrompt = loadAnalysisPrompt().length > 0;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    openai_configured: !!OPENAI_API_KEY,
    stripe_configured: !!STRIPE_SECRET_KEY,
    prompt_configured: hasPrompt,
  });
});

// Token analysis endpoint
app.post('/api/analyze-token', async (req, res) => {
  try {
    const { tokenName } = req.body;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    const securePrompt = loadAnalysisPrompt();
    if (!securePrompt) {
      return res.status(500).json({ error: 'Analysis prompt not configured' });
    }
    if (!tokenName || typeof tokenName !== 'string') {
      return res.status(400).json({ error: 'tokenName is required' });
    }

    // Compose messages securely: system prompt from env, user supplies only token input
    const messages = [
      { role: 'system', content: securePrompt },
      { role: 'user', content: tokenName.trim() }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 4000,
        temperature: 0.2
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const analysis = data.choices?.[0]?.message?.content || '';
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing token:', error);
    res.status(500).json({ error: 'Internal server error' });
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
module.exports.handler = serverless(app);
