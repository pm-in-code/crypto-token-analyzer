const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
const GIST_ID = process.env.GIST_ID; // GitHub Gist ID
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // GitHub Personal Access Token
const ANALYSIS_PROMPT = process.env.ANALYSIS_PROMPT; // fallback single-var storage

// Support multi-part prompt via ANALYSIS_PROMPT_1..N (each < 4KB) - fallback
function loadPromptFromEnvParts() {
  const parts = Object.keys(process.env)
    .filter((key) => /^ANALYSIS_PROMPT_\d+$/.test(key))
    .sort((a, b) => parseInt(a.split('_').pop(), 10) - parseInt(b.split('_').pop(), 10))
    .map((key) => process.env[key] || '');
  const combined = parts.join('');
  return combined.trim().length > 0 ? combined : '';
}

// Load prompt from GitHub Gist (primary method)
async function loadPromptFromGist() {
  if (!GIST_ID || !GITHUB_TOKEN) return '';
  
  try {
    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Crypto-Token-Analyzer'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch Gist:', response.status);
      return '';
    }
    
    const gist = await response.json();
    // Get the first file content (assuming it's the prompt)
    const firstFile = Object.values(gist.files)[0];
    return firstFile ? firstFile.content : '';
  } catch (error) {
    console.error('Error fetching from Gist:', error);
    return '';
  }
}

async function loadAnalysisPrompt() {
  // 1) GitHub Gist (primary)
  const gistPrompt = await loadPromptFromGist();
  if (gistPrompt && gistPrompt.trim().length > 0) return gistPrompt;
  
  // 2) single env (fallback)
  if (ANALYSIS_PROMPT && ANALYSIS_PROMPT.trim().length > 0) return ANALYSIS_PROMPT;
  
  // 3) multipart env (fallback)
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
app.get('/api/health', async (req, res) => {
  const hasPrompt = (await loadAnalysisPrompt()).length > 0;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    openai_configured: !!OPENAI_API_KEY,
    stripe_configured: !!STRIPE_SECRET_KEY,
    prompt_configured: hasPrompt,
    gist_configured: !!(GIST_ID && GITHUB_TOKEN),
  });
});

// Token analysis endpoint
app.post('/api/analyze-token', async (req, res) => {
  try {
    const { tokenName } = req.body;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    const securePrompt = await loadAnalysisPrompt();
    if (!securePrompt) {
      return res.status(500).json({ error: 'Analysis prompt not configured' });
    }
    if (!tokenName || typeof tokenName !== 'string') {
      return res.status(400).json({ error: 'tokenName is required' });
    }

    // Compose messages securely: system prompt from Gist/env, user supplies only token input
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

// PDF generation endpoint
app.post('/api/generate-pdf', async (req, res) => {
  try {
    const { analysisData } = req.body;
    
    if (!analysisData) {
      return res.status(400).json({ error: 'analysisData is required' });
    }

    // Parse the analysis data (should be JSON string from AI)
    let parsedData;
    try {
      parsedData = typeof analysisData === 'string' ? JSON.parse(analysisData) : analysisData;
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON in analysisData' });
    }

    // Read HTML template
    const templatePath = path.join(__dirname, 'pdf-template.html');
    let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
    
    // Replace placeholder with actual data
    htmlTemplate = htmlTemplate.replace('{{REPORT_DATA}}', JSON.stringify(parsedData));
    
    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
    });
    
    await browser.close();
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="token-analysis-${parsedData.tokenSymbol || 'report'}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
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
