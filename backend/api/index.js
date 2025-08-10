const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // Simple test endpoint
  if (pathname === '/' && req.method === 'GET') {
    return res.json({
      message: 'Crypto Token Analyzer Backend is running!',
      timestamp: new Date().toISOString(),
      status: 'ok'
    });
  }

  // Health check endpoint
  if (pathname === '/api/health' && req.method === 'GET') {
    return res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      openai_configured: !!process.env.OPENAI_API_KEY,
      stripe_configured: !!process.env.STRIPE_SECRET_KEY
    });
  }

  // Token analysis endpoint
  if (pathname === '/api/analyze-token' && req.method === 'POST') {
    try {
      const { tokenName } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
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
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
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
      
      return res.json({
        success: true,
        analysis
      });
    } catch (error) {
      console.error('Error analyzing token:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Default response
  res.status(404).json({ error: 'Not found' });
}; 