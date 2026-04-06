const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
const GIST_ID = process.env.GIST_ID;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Load prompt from GitHub Gist
async function loadPromptFromGist() {
  if (!GIST_ID || !GITHUB_TOKEN) return '';
  try {
    const fetch = require('node-fetch');
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });
    if (!response.ok) return '';
    const gist = await response.json();
    const firstFile = Object.values(gist.files)[0];
    return firstFile ? firstFile.content : '';
  } catch (error) {
    console.error('Error fetching from Gist:', error);
    return '';
  }
}

// Simple test endpoint (no auth required)
app.get('/', (req, res) => {
  res.json({
    message: 'Crypto Token Analyzer Backend is running!',
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

    // Load prompt from Gist and substitute token name
    let prompt = await loadPromptFromGist();
    if (!prompt) {
      return res.status(500).json({ error: 'Analysis prompt not configured. Set GIST_ID and GITHUB_TOKEN.' });
    }
    prompt = prompt.replace('{{TOKEN_NAME}}', tokenName.trim());

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5.4-nano',
        messages: [{ role: 'system', content: prompt }],
        max_completion_tokens: 16000
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const analysis = data.choices[0].message.content;
    
    res.json({
      success: true,
      analysis: analysis,
      tokenName: tokenName,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe payment intent endpoint
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount = 299 } = req.body; // $2.99 in cents
    
    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
      metadata: { integration_check: 'accept_a_payment' }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: STRIPE_PUBLISHABLE_KEY
    });

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Payment setup failed' });
  }
});

// Payment confirmation endpoint
app.post('/api/confirm-payment', async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY);
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Payment confirmation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 OpenAI configured: ${!!OPENAI_API_KEY}`);
  console.log(`💳 Stripe configured: ${!!STRIPE_SECRET_KEY}`);
}); 