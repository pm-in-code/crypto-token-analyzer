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
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API_URL = process.env.PAYPAL_API_URL; // Must be set in environment variables
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

    // Compose messages: secure system prompt + explicit JSON instruction for stable parsing
    const jsonInstruction = `IMPORTANT: Search for the token "${tokenName.trim()}" using these strategies:
1. For "Trump" - search for "TRUMP", "TRUMP47", "MAGA", "Donald Trump coin", political meme tokens
2. For "Openloot" - search for "OL" symbol, "Open Loot", gaming/NFT tokens (CoinMarketCap symbol: OL)
3. Common token variations to try: full name, ticker symbol, alternative spellings, project name
4. Check multiple data sources: CoinMarketCap, CoinGecko, DexScreener, DEXTools, Dune Analytics
5. For new/meme coins: check DEX data, social metrics, on-chain analytics, community channels
6. Search by: exact symbol, full project name, common abbreviations, related keywords
7. If not on major CEX, check DEX listings and contract addresses

You MUST respond with strict JSON only, no prose. Schema:
{
  "tokenName": string,
  "tokenSymbol": string,
  "overallScore": number, // 0-100
  "categories": [
    { 
      "name": "Market Metrics", 
      "score": number, 
      "summary": string, // 2-4 sentences specific to this token
      "strengths": [string, string, string], // 2-3 specific strengths
      "weaknesses": [string, string, string] // 2-3 specific weaknesses
    },
    { 
      "name": "Tokenomics", 
      "score": number, 
      "summary": string,
      "strengths": [string, string, string],
      "weaknesses": [string, string, string]
    },
    { 
      "name": "Development Activity", 
      "score": number, 
      "summary": string,
      "strengths": [string, string, string],
      "weaknesses": [string, string, string]
    },
    { 
      "name": "Social Metrics", 
      "score": number, 
      "summary": string,
      "strengths": [string, string, string],
      "weaknesses": [string, string, string]
    },
    { 
      "name": "Team & Investors", 
      "score": number, 
      "summary": string,
      "strengths": [string, string, string],
      "weaknesses": [string, string, string]
    },
    { 
      "name": "Risk Assessment", 
      "score": number, 
      "summary": string,
      "strengths": [string, string, string],
      "weaknesses": [string, string, string]
    }
  ]
}
Guidelines: 
- Use the search strategies above to find accurate data for "${tokenName.trim()}"
- ALL content MUST be specific to this exact token, not generic templates
- If token exists but has limited data, use available information from DEX/on-chain sources
- If truly not found after thorough search, indicate this in the analysis
- Return valid JSON only with real data.`;
    const messages = [
      { role: 'system', content: securePrompt },
      { role: 'user', content: `Token: ${tokenName.trim()}\n${jsonInstruction}` }
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
        max_tokens: 2000,
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

// HTML template endpoint for PDF generation
app.post('/api/get-pdf-template', async (req, res) => {
  try {
    const { analysisData } = req.body;
    
    if (!analysisData) {
      return res.status(400).json({ error: 'analysisData is required' });
    }

    // Create HTML template directly in code
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crypto Token Analysis Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
            color: #1f2937;
            line-height: 1.6;
        }
        
        .page {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            padding: 20mm;
            background: #fafafa;
            position: relative;
            page-break-after: always;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        .overview-page {
            background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
        }
        
        .title-section h1 {
            font-size: 48px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 10px;
        }
        
        .title-section h2 {
            font-size: 24px;
            font-weight: 600;
            color: #374151;
        }
        
        .verdict-banner {
            background: #22c55e;
            color: white;
            padding: 20px 30px;
            border-radius: 20px;
            font-size: 24px;
            font-weight: 700;
            transform: rotate(5deg);
            box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
        }
        
        .overall-score {
            text-align: center;
            margin: 40px 0;
        }
        
        .overall-score h3 {
            font-size: 18px;
            color: #374151;
            margin-bottom: 10px;
        }
        
        .overall-score p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 30px;
        }
        
        .token-card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            margin: 0 auto;
            max-width: 500px;
        }
        
        .token-info {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .token-icon {
            width: 60px;
            height: 60px;
            background: #3b82f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: 700;
        }
        
        .token-details h4 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .token-details p {
            font-size: 16px;
            color: #6b7280;
        }
        
        .score-badge {
            background: #22c55e;
            color: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
        }
        
        .score-badge .score {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .score-badge .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .category-ratings {
            margin: 40px 0;
        }
        
        .category-ratings h3 {
            font-size: 18px;
            color: #374151;
            margin-bottom: 20px;
        }
        
        .ratings-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }
        
        .rating-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .rating-item .name {
            font-weight: 500;
            color: #1f2937;
        }
        
        .rating-item .score {
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
        }
        
        .score-green { background: #22c55e; color: white; }
        .score-yellow { background: #eab308; color: white; }
        .score-pink { background: #ec4899; color: white; }
        
        .powered-by {
            margin: 40px 0;
        }
        
        .powered-by h3 {
            font-size: 18px;
            color: #374151;
            margin-bottom: 20px;
        }
        
        .partners {
            display: flex;
            gap: 20px;
            justify-content: center;
        }
        
        .partner-card {
            background: white;
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            min-width: 120px;
        }
        
        .partner-logo {
            width: 40px;
            height: 40px;
            margin: 0 auto 10px;
            background: #f3f4f6;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: #6b7280;
        }
        
        .partner-name {
            font-size: 12px;
            color: #374151;
            font-weight: 500;
        }
        
        .footer {
            position: absolute;
            bottom: 20mm;
            left: 20mm;
            right: 20mm;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #6b7280;
        }
        
        .app-logo {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .logo-square {
            width: 20px;
            height: 20px;
            background: #1f2937;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
            font-weight: 700;
        }
        
        .page-number {
            font-weight: 500;
        }
        
        .generation-time {
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="page overview-page">
        <div class="header">
            <div class="title-section">
                <h2>COMPREHENSIVE ANALYSIS REPORT</h2>
                <h1>Is ${analysisData.tokenName} worth it?</h1>
            </div>
            <div class="verdict-banner">${analysisData.overallVerdict}</div>
        </div>
        
        <div class="overall-score">
            <h3>OVERALL SCORE</h3>
            <p>YOUR QUICK GUIDE TO TRUST: THE CLOSER TO 100, THE STRONGER THE TOKEN'S OUTLOOK.</p>
            
            <div class="token-card">
                <div class="token-info">
                    <div class="token-icon">${analysisData.tokenSymbol.charAt(0)}</div>
                    <div class="token-details">
                        <h4>${analysisData.tokenName}</h4>
                        <p>${analysisData.tokenSymbol}</p>
                    </div>
                </div>
                <div class="score-badge">
                    <div class="score">${analysisData.overallScore}</div>
                    <div class="label">WORTH POINTS</div>
                </div>
            </div>
        </div>
        
        <div class="category-ratings">
            <h3>CATEGORY RATINGS</h3>
            <div class="ratings-grid">
                ${analysisData.categories.map(category => `
                    <div class="rating-item">
                        <span class="name">${category.name}</span>
                        <span class="score score-${category.color}">${category.score}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="powered-by">
            <h3>POWERED BY</h3>
            <div class="partners">
                <div class="partner-card">
                    <div class="partner-logo">🦎</div>
                    <div class="partner-name">coingecko</div>
                </div>
                <div class="partner-card">
                    <div class="partner-logo">M</div>
                    <div class="partner-name">CoinMarketCap</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="app-logo">
                <div class="logo-square">W</div>
                <span>ITSWORTH.APP</span>
            </div>
            <div class="page-number">1/1</div>
            <div class="generation-time">GENERATED: ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            }).toUpperCase()} AT ${new Date().toLocaleTimeString('en-US', { hour12: false })}</div>
        </div>
    </div>
</body>
</html>`;
    
    res.json({
      success: true,
      htmlTemplate
    });
    
  } catch (error) {
    console.error('Error getting PDF template:', error);
    res.status(500).json({ error: 'Failed to get PDF template' });
  }
});

// Stripe Checkout Session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    console.log('Stripe checkout endpoint called with body:', req.body);
    
    if (!STRIPE_SECRET_KEY) {
      console.log('Stripe secret key not configured');
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const { amount = 299, currency = 'usd' } = req.body;

    if (!amount) {
      console.log('Amount is missing');
      return res.status(400).json({ error: 'Amount is required' });
    }

    console.log('Creating checkout session with:', { amount, currency });

    // Create checkout session with Stripe
    const formData = new URLSearchParams();
    formData.append('mode', 'payment');
    formData.append('line_items[0][price_data][currency]', currency);
    formData.append('line_items[0][price_data][product_data][name]', 'Premium Crypto Analysis Report');
    formData.append('line_items[0][price_data][product_data][description]', 'Detailed AI-powered cryptocurrency analysis with actionable insights');
    formData.append('line_items[0][price_data][unit_amount]', amount.toString());
    formData.append('line_items[0][quantity]', '1');
    formData.append('success_url', 'https://itsworth.app?payment=success');
    formData.append('cancel_url', 'https://itsworth.app?payment=cancelled');

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    console.log('Stripe response status:', stripeResponse.status);
    const session = await stripeResponse.json();
    console.log('Stripe response:', session);

    if (session.error) {
      console.error('Stripe error:', session.error);
      return res.status(400).json({ error: session.error.message });
    }

    res.json({
      sessionId: session.id,
      url: session.url,
      publishableKey: STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Helper function to get PayPal access token
async function getPayPalAccessToken() {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  
  const data = await response.json();
  return data.access_token;
}

// PayPal Create Order endpoint
app.post('/api/create-paypal-order', async (req, res) => {
  try {
    console.log('PayPal order endpoint called with body:', req.body);
    
    if (!PAYPAL_SECRET) {
      console.log('PayPal secret not configured');
      return res.status(500).json({ error: 'PayPal not configured' });
    }
    
    const { amount = 2.99 } = req.body;
    
    if (!amount) {
      console.log('Amount is missing');
      return res.status(400).json({ error: 'Amount is required' });
    }
    
    console.log('Creating PayPal order with amount:', amount);
    
    // Get access token
    const accessToken = await getPayPalAccessToken();
    
    // Create order
    const orderResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2)
          },
          description: 'Premium Crypto Analysis Report'
        }],
        application_context: {
          brand_name: 'ItsWorth',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: 'https://itsworth.app?payment=success',
          cancel_url: 'https://itsworth.app?payment=cancelled'
        }
      })
    });
    
    const order = await orderResponse.json();
    console.log('PayPal order response:', order);
    
    if (order.error) {
      console.error('PayPal error:', order.error);
      return res.status(400).json({ error: order.error.message || 'PayPal error' });
    }
    
    // Find approval URL
    const approvalUrl = order.links?.find(link => link.rel === 'approve')?.href;
    
    res.json({
      orderId: order.id,
      approvalUrl: approvalUrl
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

// PayPal Capture Order endpoint (called after user approves payment)
app.post('/api/capture-paypal-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    
    console.log('Capturing PayPal order:', orderId);
    
    // Get access token
    const accessToken = await getPayPalAccessToken();
    
    // Capture order
    const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const capture = await captureResponse.json();
    console.log('PayPal capture response:', capture);
    
    if (capture.error) {
      console.error('PayPal capture error:', capture.error);
      return res.status(400).json({ error: capture.error.message || 'Capture failed' });
    }
    
    res.json({
      success: true,
      captureId: capture.id,
      status: capture.status
    });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ error: 'Failed to capture PayPal order' });
  }
});

// Export the serverless function
module.exports.handler = serverless(app);
