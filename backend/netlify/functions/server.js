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
  if (!GIST_ID) return '';

  try {
    // Try with token first, fallback to public access
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Crypto-Token-Analyzer'
    };
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    let response = await fetch(`https://api.github.com/gists/${GIST_ID}`, { headers });

    // If token auth failed, retry without token (public gist fallback)
    if (!response.ok && GITHUB_TOKEN) {
      console.warn('Gist fetch with token failed (status:', response.status, '), retrying without auth...');
      delete headers['Authorization'];
      response = await fetch(`https://api.github.com/gists/${GIST_ID}`, { headers });
    }

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

// Helper function to get real token data from CoinGecko
async function getRealTokenData(tokenSymbol) {
  try {
    console.log('Fetching real data for token:', tokenSymbol);
    
    // First, search for the token
    const searchResponse = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(tokenSymbol)}`);
    const searchData = await searchResponse.json();
    
    if (!searchData.coins || searchData.coins.length === 0) {
      console.log('Token not found in CoinGecko search:', tokenSymbol);
      return { success: false, error: 'Token not found' };
    }
    
    // Get the first (most relevant) result
    const coinId = searchData.coins[0].id;
    console.log('Found coin ID:', coinId);
    
    // Get detailed market data
    const coinResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
    const coinData = await coinResponse.json();
    
    if (!coinResponse.ok) {
      console.error('CoinGecko API error:', coinData);
      return { success: false, error: 'API request failed' };
    }
    
    const marketData = coinData.market_data;
    
    return {
      success: true,
      data: {
        name: coinData.name,
        symbol: coinData.symbol.toUpperCase(),
        current_price: marketData.current_price?.usd || 0,
        market_cap: marketData.market_cap?.usd || 0,
        market_cap_rank: coinData.market_cap_rank || null,
        volume_24h: marketData.total_volume?.usd || 0,
        price_change_24h: marketData.price_change_24h || 0,
        price_change_percentage_24h: marketData.price_change_percentage_24h || 0,
        ath: marketData.ath?.usd || 0,
        ath_date: marketData.ath_date?.usd || null,
        atl: marketData.atl?.usd || 0,
        atl_date: marketData.atl_date?.usd || null,
        circulating_supply: marketData.circulating_supply || 0,
        total_supply: marketData.total_supply || 0,
        max_supply: marketData.max_supply || null,
        // Additional useful data
        price_change_percentage_7d: marketData.price_change_percentage_7d || 0,
        price_change_percentage_30d: marketData.price_change_percentage_30d || 0,
        price_change_percentage_1y: marketData.price_change_percentage_1y || 0
      }
    };
  } catch (error) {
    console.error('Error fetching real token data:', error);
    return { success: false, error: error.message };
  }
}

// Token analysis endpoint
app.post('/api/analyze-token', async (req, res) => {
  try {
    const { tokenName } = req.body;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    let securePrompt = await loadAnalysisPrompt();
    if (!securePrompt) {
      return res.status(500).json({ error: 'Analysis prompt not configured' });
    }
    // Substitute {{TOKEN_NAME}} placeholder with actual token name
    securePrompt = securePrompt.replace('{{TOKEN_NAME}}', tokenName.trim());
    if (!tokenName || typeof tokenName !== 'string') {
      return res.status(400).json({ error: 'tokenName is required' });
    }

    // Get real token data from CoinGecko
    console.log('Fetching real data for analysis...');
    const realDataResult = await getRealTokenData(tokenName.trim());
    
    let realDataSection = '';
    if (realDataResult.success) {
      const data = realDataResult.data;
      realDataSection = `

REAL MARKET DATA (USE ONLY THESE EXACT VALUES):
Token Name: ${data.name}
Symbol: ${data.symbol}
Current Price: $${data.current_price}
Market Cap: $${data.market_cap}
Market Cap Rank: #${data.market_cap_rank || 'N/A'}
24h Volume: $${data.volume_24h}
24h Price Change: ${data.price_change_24h} (${data.price_change_percentage_24h}%)
7d Price Change: ${data.price_change_percentage_7d}%
30d Price Change: ${data.price_change_percentage_30d}%
1y Price Change: ${data.price_change_percentage_1y}%
All-Time High: $${data.ath} (${data.ath_date || 'N/A'})
All-Time Low: $${data.atl} (${data.atl_date || 'N/A'})
Circulating Supply: ${data.circulating_supply}
Total Supply: ${data.total_supply || 'N/A'}
Max Supply: ${data.max_supply || 'N/A'}

CRITICAL: Use ONLY these exact real values in your analysis. Do not estimate, approximate, or make up any numbers.`;
    } else {
      console.log('Could not fetch real data, proceeding with original prompt:', realDataResult.error);
      realDataSection = `

REAL DATA UNAVAILABLE: Could not fetch real market data for this token.
Please proceed with analysis but clearly indicate when data is estimated or unavailable.`;
    }

    const userMessage = `${realDataSection.trim()}

IMPORTANT INSTRUCTION: You are analyzing a well-known public token. You MUST use your training knowledge about this token's publicly available information — including tokenomics, team background, audit history, development activity, GitHub commits, social metrics, and investor history. Do NOT assign 0 scores simply because data was not provided above. Use your knowledge of publicly documented facts about this token to assign accurate scores according to the scoring criteria. Only assign 0 if the criterion truly does not apply or if the token genuinely has no public information for that criterion.`;

    const messages = [
      { role: 'system', content: securePrompt },
      { role: 'user', content: userMessage }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5.4-nano',
        messages,
        max_completion_tokens: 2000,
        temperature: 0.2
      })
    });

    const data = await response.json();

    console.log('OpenAI response keys:', Object.keys(data));
    console.log('OpenAI response structure:', JSON.stringify(data).substring(0, 500));

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    // Support both old (choices[0].message.content) and new (output) response formats
    let analysis = '';
    if (data.choices?.[0]?.message?.content) {
      analysis = data.choices[0].message.content;
    } else if (data.output_text) {
      analysis = data.output_text;
    } else if (Array.isArray(data.output)) {
      // New format: output is an array of message objects
      const outputMsg = data.output.find(o => o.type === 'message' && o.role === 'assistant');
      if (outputMsg && Array.isArray(outputMsg.content)) {
        analysis = outputMsg.content
          .filter(c => c.type === 'output_text')
          .map(c => c.text)
          .join('');
      }
    }

    console.log('Parsed analysis length:', analysis.length);
    console.log('Analysis preview:', analysis.substring(0, 200));

    // Temporary debug: include raw response structure when analysis is empty
    if (!analysis) {
      return res.json({
        success: false,
        error: 'Empty analysis from model',
        debug_keys: Object.keys(data),
        debug_raw: JSON.stringify(data).substring(0, 1000)
      });
    }

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
  console.log('Getting PayPal access token...');
  console.log('PAYPAL_CLIENT_ID:', PAYPAL_CLIENT_ID ? 'SET' : 'NOT SET');
  console.log('PAYPAL_SECRET:', PAYPAL_SECRET ? 'SET' : 'NOT SET');
  console.log('PAYPAL_API_URL:', PAYPAL_API_URL);
  
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET || !PAYPAL_API_URL) {
    throw new Error('PayPal credentials not configured');
  }
  
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  
  console.log('PayPal token response status:', response.status);
  const data = await response.json();
  console.log('PayPal token response:', data);
  
  if (!response.ok) {
    throw new Error(`PayPal token request failed: ${data.error_description || data.error || 'Unknown error'}`);
  }
  
  if (!data.access_token) {
    throw new Error('No access token received from PayPal');
  }
  
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
    console.log('Got PayPal access token, creating order...');
    
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
    
    console.log('PayPal order response status:', orderResponse.status);
    const order = await orderResponse.json();
    console.log('PayPal order response:', order);
    
    if (!orderResponse.ok) {
      console.error('PayPal order request failed:', order);
      return res.status(400).json({ 
        error: order.details?.[0]?.description || order.message || 'PayPal order creation failed' 
      });
    }
    
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
