const fetch = require('node-fetch');

// Load prompt from GitHub Gist
async function loadPromptFromGist() {
  const GIST_ID = process.env.GIST_ID;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GIST_ID || !GITHUB_TOKEN) return '';
  try {
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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tokenName } = req.body;

    if (!process.env.OPENAI_API_KEY) {
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
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5.4-nano',
        messages: [{ role: 'system', content: prompt }],
        max_completion_tokens: 2000,
        temperature: 0.2
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
}; 