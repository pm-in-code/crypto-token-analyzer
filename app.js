// Crypto Token Analyzer App
// Using vanilla JavaScript with React CDN

const { useState, useEffect, createContext, useContext } = React;

// Function to parse analysis summary and extract scores
const parseAnalysisSummary = (summary) => {
  console.log('Parsing analysis summary:', summary.substring(0, 200) + '...');
  let categories = [];
  let overallScore = null;
  let tokenName;
  let tokenSymbol;

  // First, attempt JSON parsing because the model frequently returns JSON
  try {
    const parsed = JSON.parse(summary);
    if (parsed && (parsed.categories || parsed.overallScore || parsed.tokenName || parsed.token || parsed.tokenSymbol)) {
      // Categories may be like: [{ name: "Market Metrics", score: "70/100" }]
      if (Array.isArray(parsed.categories)) {
        categories = parsed.categories
          .map((c) => {
            const name = c.name || c.category || c.title;
            let scoreRaw = c.score;
            if (typeof scoreRaw === 'string') {
              const m = scoreRaw.match(/\d{1,3}/);
              scoreRaw = m ? parseInt(m[0], 10) : NaN;
            }
            if (typeof scoreRaw === 'number') {
              return { name, score: scoreRaw };
            }
            return null;
          })
          .filter(Boolean)
          .filter((c) => c.name && Number.isFinite(c.score) && c.score >= 0 && c.score <= 100);
      }

      // Overall score may be "68/100" or a number
      if (parsed.overallScore !== undefined && parsed.overallScore !== null) {
        if (typeof parsed.overallScore === 'number') {
          overallScore = parsed.overallScore;
        } else if (typeof parsed.overallScore === 'string') {
          const m = parsed.overallScore.match(/\d{1,3}/);
          overallScore = m ? parseInt(m[0], 10) : null;
        }
      }

      tokenName = parsed.tokenName || parsed.token || undefined;
      tokenSymbol = parsed.tokenSymbol || undefined;

      // Early return if JSON parse succeeded meaningfully
      if ((categories && categories.length) || overallScore !== null || tokenName || tokenSymbol) {
        console.log('Parsed (JSON) categories:', categories);
        console.log('Parsed (JSON) overall score:', overallScore);
        return { categories, overallScore, tokenName, tokenSymbol };
      }
    }
  } catch (e) {
    // Not JSON, continue with regex parsing below
  }
  
  const expectedCategories = [
    'Market Metrics',
    'Tokenomics', 
    'Development Activity',
    'Social Metrics',
    'Team & Investors',
    'Risk Assessment'
  ];

  // Улучшенные паттерны для поиска категорий
  const categoryPatterns = [
    // Паттерн 1: "Category 1: Market Metrics - Score: 85"
    /Category\s+(\d+):\s*([^-]+?)\s*-\s*Score:\s*(\d+)/gi,
    // Паттерн 2: "Market Metrics: 85"
    /(Market Metrics|Tokenomics|Development Activity|Social Metrics|Team & Investors|Risk Assessment):\s*(\d+)/gi,
    // Паттерн 3: "Category 1 - Market Metrics: 85"
    /Category\s+\d+\s*-\s*([^:]+?):\s*(\d+)/gi,
    // Паттерн 4: "Market Metrics Score: 85"
    /(Market Metrics|Tokenomics|Development Activity|Social Metrics|Team & Investors|Risk Assessment)\s+Score:\s*(\d+)/gi,
  ];

  let foundCategories = false;

  // Попробуем все паттерны
  for (let pattern of categoryPatterns) {
    const matches = [...summary.matchAll(pattern)];
    
    if (matches.length > 0) {
      matches.forEach(match => {
        let categoryName, score;
        
        if (match.length === 4) {
          // Паттерн 1: Category X: Name - Score: Y
          const categoryIndex = parseInt(match[1]) - 1;
          categoryName = expectedCategories[categoryIndex] || match[2].trim();
          score = parseInt(match[3]);
        } else if (match.length === 3) {
          // Паттерн 2, 3, 4: Name: Y или Category X - Name: Y
          categoryName = match[1].trim();
          score = parseInt(match[2]);
        }
        
        if (categoryName && !isNaN(score) && score >= 0 && score <= 100) {
          // Проверяем, что это действительно одна из ожидаемых категорий
          const normalizedName = categoryName.toLowerCase();
          const expectedCategory = expectedCategories.find(cat => 
            cat.toLowerCase() === normalizedName ||
            cat.toLowerCase().includes(normalizedName) ||
            normalizedName.includes(cat.toLowerCase())
          );
          
          if (expectedCategory) {
            categories.push({ name: expectedCategory, score });
            foundCategories = true;
          }
        }
      });
      
      if (foundCategories) break;
    }
  }

  // Если не нашли категории, попробуем найти числа рядом с ключевыми словами
  if (!foundCategories) {
    expectedCategories.forEach(category => {
      const categoryLower = category.toLowerCase();
      const categoryRegex = new RegExp(`${categoryLower.replace(/\s+/g, '\\s+')}[^\\d]*?(\\d{1,2}|100)`, 'gi');
      const matches = [...summary.matchAll(categoryRegex)];
      
      if (matches.length > 0) {
        const score = parseInt(matches[0][1]);
        if (!isNaN(score) && score >= 0 && score <= 100) {
          categories.push({ name: category, score });
          foundCategories = true;
        }
      }
    });
  }

  // Парсим общий счет
  const overallPatterns = [
    /Overall Score[^:]*:\s*(\d+)/i,
    /Overall[^:]*Score[^:]*:\s*(\d+)/i,
    /Final Score[^:]*:\s*(\d+)/i,
    /Total Score[^:]*:\s*(\d+)/i
  ];
  
  for (let pattern of overallPatterns) {
    const overallMatch = summary.match(pattern);
    if (overallMatch) {
      overallScore = parseInt(overallMatch[1]);
      break;
    }
  }

  // Если категории не найдены, попробуем извлечь числа из текста
  if (categories.length === 0) {
    console.log('No categories found, trying to extract numbers...');
    const numberMatches = summary.match(/\b([0-9]{1,2}|100)\b/g);
    if (numberMatches && numberMatches.length >= 6) {
      for (let i = 0; i < Math.min(6, numberMatches.length); i++) {
        const score = parseInt(numberMatches[i]);
        // Игнорируем числа меньше 10, так как это скорее всего не оценки
        if (score >= 10 && score <= 100) {
          categories.push({ name: expectedCategories[i], score });
        }
      }
    }
  }

  // Удаляем дубликаты и сортируем категории по порядку
  const uniqueCategories = [];
  const seenNames = new Set();
  
  categories.forEach(category => {
    if (!seenNames.has(category.name)) {
      seenNames.add(category.name);
      uniqueCategories.push(category);
    }
  });
  
  uniqueCategories.sort((a, b) => {
    const aIndex = expectedCategories.indexOf(a.name);
    const bIndex = expectedCategories.indexOf(b.name);
    return aIndex - bIndex;
  });
  
  categories = uniqueCategories;
  
  console.log('Parsed categories:', categories);
  console.log('Overall score:', overallScore);
  return { categories, overallScore, tokenName, tokenSymbol };
};

// Real-time crypto data fetching
const fetchCryptoData = async () => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false&locale=en');
    const data = await response.json();
    
    return data.map((coin, index) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      logo: getCryptoLogo(coin.symbol),
      price: `$${coin.current_price.toLocaleString()}`,
      change24h: parseFloat(coin.price_change_percentage_24h.toFixed(2)),
      marketCap: `$${(coin.market_cap / 1e9).toFixed(1)}B`,
      color: getCryptoColor(coin.symbol),
      image: coin.image,
      market_cap_rank: coin.market_cap_rank
    }));
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    // Fallback to mock data if API fails
    return getMockCryptoData();
  }
};

// Helper function to get crypto logos
const getCryptoLogo = (symbol) => {
  const logos = {
    'btc': '₿',
    'eth': 'Ξ',
    'ada': '₳',
    'sol': '◎',
    'dot': '●',
    'link': '🔗',
    'matic': '⬡',
    'avax': '❄',
    'bnb': '🟡',
    'xrp': '✖',
    'doge': '🐕',
    'ltc': 'Ł',
    'uni': '🦄',
    'xlm': '★'
  };
  return logos[symbol.toLowerCase()] || '●';
};

// Helper function to get crypto colors
const getCryptoColor = (symbol) => {
  const colors = {
    'btc': 'from-orange-400 to-orange-600',
    'eth': 'from-purple-400 to-purple-600',
    'ada': 'from-blue-400 to-blue-600',
    'sol': 'from-green-400 to-green-600',
    'dot': 'from-pink-400 to-pink-600',
    'link': 'from-blue-500 to-blue-700',
    'matic': 'from-purple-500 to-purple-700',
    'avax': 'from-red-400 to-red-600',
    'bnb': 'from-yellow-400 to-yellow-600',
    'xrp': 'from-gray-400 to-gray-600',
    'doge': 'from-yellow-500 to-yellow-700',
    'ltc': 'from-gray-500 to-gray-700',
    'uni': 'from-pink-500 to-pink-700',
    'xlm': 'from-purple-600 to-purple-800'
  };
  return colors[symbol.toLowerCase()] || 'from-gray-400 to-gray-600';
};

// Fallback mock data
const getMockCryptoData = () => [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    logo: '₿',
    price: '$43,250',
    change24h: 2.5,
    marketCap: '$850B',
    color: 'from-orange-400 to-orange-600'
  },
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    logo: 'Ξ',
    price: '$2,680',
    change24h: -1.2,
    marketCap: '$320B',
    color: 'from-purple-400 to-purple-600'
  },
  {
    id: 'cardano',
    name: 'Cardano',
    symbol: 'ADA',
    logo: '₳',
    price: '$0.45',
    change24h: 5.8,
    marketCap: '$15.8B',
    color: 'from-blue-400 to-blue-600'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    logo: '◎',
    price: '$98.50',
    change24h: 3.2,
    marketCap: '$42.3B',
    color: 'from-green-400 to-green-600'
  },
  {
    id: 'polkadot',
    name: 'Polkadot',
    symbol: 'DOT',
    logo: '●',
    price: '$7.20',
    change24h: -0.8,
    marketCap: '$9.1B',
    color: 'from-pink-400 to-pink-600'
  },
  {
    id: 'chainlink',
    name: 'Chainlink',
    symbol: 'LINK',
    logo: '🔗',
    price: '$14.20',
    change24h: 1.5,
    marketCap: '$8.2B',
    color: 'from-blue-500 to-blue-700'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    logo: '⬡',
    price: '$0.85',
    change24h: 4.2,
    marketCap: '$8.1B',
    color: 'from-purple-500 to-purple-700'
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    symbol: 'AVAX',
    logo: '❄',
    price: '$32.50',
    change24h: -2.1,
    marketCap: '$12.3B',
    color: 'from-red-400 to-red-600'
  },
  {
    id: 'binancecoin',
    name: 'BNB',
    symbol: 'BNB',
    logo: '🟡',
    price: '$312.50',
    change24h: 1.8,
    marketCap: '$48.2B',
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    id: 'ripple',
    name: 'XRP',
    symbol: 'XRP',
    logo: '✖',
    price: '$0.52',
    change24h: -0.5,
    marketCap: '$28.1B',
    color: 'from-gray-400 to-gray-600'
  },
  {
    id: 'dogecoin',
    name: 'Dogecoin',
    symbol: 'DOGE',
    logo: '🐕',
    price: '$0.078',
    change24h: 3.1,
    marketCap: '$11.2B',
    color: 'from-yellow-500 to-yellow-700'
  },
  {
    id: 'litecoin',
    name: 'Litecoin',
    symbol: 'LTC',
    logo: 'Ł',
    price: '$68.40',
    change24h: 2.3,
    marketCap: '$5.1B',
    color: 'from-gray-500 to-gray-700'
  },
  {
    id: 'uniswap',
    name: 'Uniswap',
    symbol: 'UNI',
    logo: '🦄',
    price: '$6.85',
    change24h: 4.7,
    marketCap: '$4.2B',
    color: 'from-pink-500 to-pink-700'
  },
  {
    id: 'stellar',
    name: 'Stellar',
    symbol: 'XLM',
    logo: '★',
    price: '$0.12',
    change24h: 1.9,
    marketCap: '$3.3B',
    color: 'from-purple-600 to-purple-800'
  }
];

// Mock API function
const generateTokenReport = async (tokenName) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const mockData = {
    'BTC': {
      token: 'BTC',
      score: 8.9,
      summary: 'Bitcoin remains the dominant cryptocurrency with strong network effects, high liquidity, and institutional adoption. The limited supply and growing demand make it a solid long-term investment.',
      metrics: {
        marketCap: '$850B',
        volume24h: '$28.5B',
        liquidityScore: 9.5,
        devScore: 8.2,
        socialScore: 9.1,
        tokenomics: 'Fixed supply: 21M, Circulating: 19.5M'
      }
    },
    'ETH': {
      token: 'ETH',
      score: 8.7,
      summary: 'Ethereum leads the smart contract platform space with the largest developer ecosystem and DeFi applications. The transition to proof-of-stake has improved its sustainability.',
      metrics: {
        marketCap: '$320B',
        volume24h: '$15.2B',
        liquidityScore: 9.2,
        devScore: 9.5,
        socialScore: 8.8,
        tokenomics: 'Inflationary supply, ~120M circulating'
      }
    },
    'ADA': {
      token: 'ADA',
      score: 7.5,
      summary: 'Cardano is a promising blockchain with an active developer community and strong tokenomics. The peer-reviewed approach and focus on sustainability are notable strengths.',
      metrics: {
        marketCap: '$15.8B',
        volume24h: '$480M',
        liquidityScore: 8.1,
        devScore: 7.3,
        socialScore: 6.9,
        tokenomics: 'Fixed supply: 45B, Circulating: 35B'
      }
    },
    'SOL': {
      token: 'SOL',
      score: 7.8,
      summary: 'Solana offers high-speed transactions and low fees, making it attractive for DeFi applications. However, network stability concerns remain a risk factor.',
      metrics: {
        marketCap: '$42.3B',
        volume24h: '$2.1B',
        liquidityScore: 8.5,
        devScore: 7.8,
        socialScore: 7.2,
        tokenomics: 'Inflationary supply, ~430M circulating'
      }
    },
    'DOT': {
      token: 'DOT',
      score: 7.2,
      summary: 'Polkadot enables cross-chain interoperability with a unique governance model. The parachain ecosystem is growing but faces competition from other Layer 1 solutions.',
      metrics: {
        marketCap: '$9.1B',
        volume24h: '$320M',
        liquidityScore: 7.8,
        devScore: 7.5,
        socialScore: 6.8,
        tokenomics: 'Inflationary supply, ~1.2B circulating'
      }
    }
  };

  const upperToken = tokenName.toUpperCase();
  if (mockData[upperToken]) {
    return mockData[upperToken];
  }

  const randomScore = Math.floor(Math.random() * 4) + 5;
  return {
    token: upperToken,
    score: randomScore,
    summary: `Analysis of ${upperToken} shows mixed signals. The token demonstrates moderate market activity with varying levels of developer engagement and community interest.`,
    metrics: {
      marketCap: `$${(Math.random() * 10 + 1).toFixed(1)}B`,
      volume24h: `$${(Math.random() * 500 + 50).toFixed(0)}M`,
      liquidityScore: Math.floor(Math.random() * 3) + 6,
      devScore: Math.floor(Math.random() * 3) + 5,
      socialScore: Math.floor(Math.random() * 3) + 5,
      tokenomics: `Supply: ${Math.floor(Math.random() * 1000 + 100)}M tokens`
    }
  };
};

// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Global configuration
const BACKEND_API_URL = 'https://dainty-malasada-96ee00.netlify.app/api';

// Premium PDF Generation - 8-page professional report
const generatePDFReport = async (analysisData, userEmail, isPremium = false) => {
  try {
    console.log('=== PREMIUM PDF GENERATION START ===');
    console.log('Analysis data:', analysisData);
    console.log('Analysis data keys:', Object.keys(analysisData));
    console.log('Analysis data.token:', analysisData.token);
    console.log('Analysis data.summary:', analysisData.summary);
    
    // Validate input data
    if (!analysisData) {
      throw new Error('Analysis data is missing');
    }
    
    if (!analysisData.summary) {
      throw new Error('Analysis summary is missing');
    }
    
    // Parse the analysis to extract structured data
    let { categories, overallScore, tokenName, tokenSymbol } = parseAnalysisSummary(analysisData.summary);
    console.log('Parsed data:', { categories, overallScore, tokenName, tokenSymbol });
    console.log('Overall score type:', typeof overallScore);
    console.log('Overall score value:', overallScore);
    
    // Fallbacks
    if ((overallScore === null || Number.isNaN(overallScore)) && Array.isArray(categories) && categories.length > 0) {
      const sum = categories.reduce((acc, c) => acc + (typeof c.score === 'number' ? c.score : 0), 0);
      const avg = Math.round(sum / categories.length);
      overallScore = Number.isFinite(avg) ? avg : 0;
    }
    const tokenDisplay = (analysisData.token || tokenName || tokenSymbol || 'Token').toString();
    const tokenInitial = tokenDisplay.charAt(0).toUpperCase();
    
    // Create 8-page professional PDF report
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Premium Token Analysis - ${tokenDisplay}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #fafafa;
            color: #1f2937;
            line-height: 1.6;
          }
          
          .page {
            width: 210mm;
            height: 297mm;
            margin: 0 auto 20px;
            padding: 20mm;
            background: white;
            position: relative;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .overview-page {
            background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
          }
          .download-btn {
            position: absolute;
            top: 8mm;
            right: 20mm;
            background: #111827;
            color: #ffffff;
            padding: 8px 14px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 6px 18px rgba(0,0,0,0.15);
            border: none;
            cursor: pointer;
            z-index: 50;
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
            color: white;
            padding: 20px 30px;
            border-radius: 20px;
            font-size: 24px;
            font-weight: 700;
            transform: rotate(5deg);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }
          
          .verdict-green {
            background: #22c55e;
            box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
          }
          
          .verdict-yellow {
            background: #eab308;
            box-shadow: 0 10px 25px rgba(234, 179, 8, 0.3);
          }
          
          .verdict-red {
            background: #ef4444;
            box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
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
            color: white;
            padding: 20px;
            border-radius: 15px;
            text-align: center;
          }
          
          .score-badge.score-green {
            background: #22c55e;
          }
          
          .score-badge.score-yellow {
            background: #eab308;
          }
          
          .score-badge.score-red {
            background: #ef4444;
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
            padding: 15px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            min-width: 100px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          
          .partner-logo {
            width: 32px;
            height: 32px;
            margin: 0 auto 8px;
            background: #f3f4f6;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            color: #6b7280;
            font-size: 16px;
          }
          
          .partner-name {
            font-size: 11px;
            color: #1f2937;
            font-weight: 500;
            line-height: 1.2;
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
          
          /* Category page styles */
          .category-page {
            background: #fefefe;
          }
          
          .category-header {
            margin-bottom: 30px;
          }
          
          .category-label {
            font-size: 14px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          
          .category-title {
            font-size: 36px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 20px;
          }
          
          .category-score-badge {
            display: inline-block;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 18px;
            font-weight: 700;
            color: white;
            margin-bottom: 20px;
          }
          
          .score-99 { background: #22c55e; }
          .score-80 { background: #eab308; }
          .score-60 { background: #ec4899; }
          
          .category-content {
            margin-bottom: 30px;
          }
          
          .category-content p {
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 15px;
            line-height: 1.7;
          }
          
          .strengths-weaknesses {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 30px;
          }
          
          .sw-section {
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          }
          
          .sw-section h4 {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
          }
          
          .sw-section ul {
            list-style: none;
            padding: 0;
          }
          
          .sw-section li {
            font-size: 14px;
            color: #1f2937;
            margin-bottom: 8px;
            padding-left: 20px;
            position: relative;
          }
          
          .sw-section li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #6b7280;
          }
          
          /* Conclusion page styles */
          .conclusion-page {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          }
          
          .conclusion-header h1 {
            font-size: 36px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 20px;
          }
          
          .conclusion-header h2 {
            font-size: 24px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 30px;
          }
          
          .recommendations {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
          }
          
          .recommendation-card {
            background: white;
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          }
          
          .recommendation-card h4 {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 10px;
          }
          
          .recommendation-card p {
            font-size: 14px;
            color: #374151;
            line-height: 1.6;
          }
          
          .overall-conclusion {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            margin-top: 30px;
          }
          
          .overall-conclusion p {
            font-size: 16px;
            color: #1f2937;
            line-height: 1.7;
          }
        </style>
      </head>
      <body>
        <!-- PAGE 1: Overview -->
        <div class="page overview-page">
          <button id="downloadBtn" class="download-btn">Download as PDF</button>
          <div class="header">
            <div class="title-section">
              <h2>COMPREHENSIVE ANALYSIS REPORT</h2>
              <h1>Is ${tokenDisplay || 'this token'} worth it?</h1>
            </div>
            <div class="verdict-banner verdict-${overallScore >= 75 ? 'green' : overallScore >= 50 ? 'yellow' : 'red'}">${overallScore >= 75 ? "Worth it" : overallScore >= 50 ? "Not too bad" : "Not Worth a Penny"}</div>
          </div>
          
          <div class="overall-score">
            <h3>OVERALL SCORE</h3>
            <p>YOUR QUICK GUIDE TO TRUST: THE CLOSER TO 100, THE STRONGER THE TOKEN'S OUTLOOK.</p>
            
            <div class="token-card">
              <div class="token-info">
                <div class="token-icon">${tokenInitial}</div>
                <div class="token-details">
                  <h4>${tokenDisplay || 'Token'}</h4>
                  <p>${tokenDisplay || 'Token'}</p>
                </div>
              </div>
              <div class="score-badge score-${overallScore >= 75 ? 'green' : overallScore >= 50 ? 'yellow' : 'red'}">
                <div class="score">${overallScore || 0}/100</div>
                <div class="label">WORTH POINTS</div>
              </div>
            </div>
          </div>
          
          <div class="category-ratings">
            <h3>CATEGORY RATINGS</h3>
            <div class="ratings-grid">
              ${categories.map(category => `
                <div class="rating-item">
                  <span class="name">${category.name}</span>
                  <span class="score score-${category.score >= 80 ? 'green' : category.score >= 50 ? 'yellow' : 'pink'}">${category.score}/100</span>
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
            <div class="page-number">1/8</div>
            <div class="generation-time">GENERATED: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }).toUpperCase()} AT ${new Date().toLocaleTimeString('en-US', { hour12: false })}</div>
          </div>
        </div>
        
        <!-- PAGE 2: Market Metrics -->
        <div class="page category-page">
          <div class="category-header">
            <div class="category-label">CATEGORY 1</div>
            <h1 class="category-title">Market Metrics</h1>
            <div class="category-score-badge ${ (s=> s>=80?'score-99': s>=60?'score-80':'score-60')( (categories.find(c=> (c.name||'').toLowerCase()==='market metrics'.toLowerCase())||{}).score || 0 ) }">${ ((categories.find(c=> (c.name||'').toLowerCase()==='market metrics'.toLowerCase())||{}).score || 0) }/100</div>
          </div>
          
          <div class="category-content">
            <p>${analysisData.token || 'This token'} has shown significant market presence since its launch, with a market capitalization that places it among the top cryptocurrencies. The token has experienced price volatility but maintained strong trading volume, indicating sustained investor interest and market activity.</p>
            <p>Market dominance has been challenged by newer projects and competitors in the layer-1 space, but the established presence and liquidity provide a solid foundation for continued growth.</p>
          </div>
          
          <div class="strengths-weaknesses">
            <div class="sw-section">
              <h4>Strengths</h4>
              <ul>
                <li>Strong market capitalization and liquidity</li>
                <li>Established presence in the cryptocurrency market</li>
              </ul>
            </div>
            <div class="sw-section">
              <h4>Weaknesses</h4>
              <ul>
                <li>Price volatility can deter long-term investors</li>
                <li>Competitive pressure from other blockchain platforms</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <div class="app-logo">
              <div class="logo-square">W</div>
              <span>ITSWORTH.APP</span>
            </div>
            <div class="page-number">2/8</div>
            <div class="generation-time">GENERATED: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }).toUpperCase()} AT ${new Date().toLocaleTimeString('en-US', { hour12: false })}</div>
          </div>
        </div>
        
        <!-- PAGE 3: Tokenomics -->
        <div class="page category-page">
          <div class="category-header">
            <div class="category-label">CATEGORY 2</div>
            <h1 class="category-title">Tokenomics</h1>
            <div class="category-score-badge ${ (s=> s>=80?'score-99': s>=60?'score-80':'score-60')( (categories.find(c=> (c.name||'').toLowerCase()==='tokenomics')||{}).score || 0 ) }">${ ((categories.find(c=> (c.name||'').toLowerCase()==='tokenomics')||{}).score || 0) }/100</div>
          </div>
          
          <div class="category-content">
            <p>${analysisData.token || 'This token'}'s tokenomics is well-structured, with a carefully designed supply model that promotes long-term sustainability. The staking mechanism allows users to earn rewards, promoting network security and engagement while providing passive income opportunities.</p>
            <p>The inflation rate is gradually decreasing, which supports the token's value over time and creates a deflationary pressure that benefits long-term holders.</p>
          </div>
          
          <div class="strengths-weaknesses">
            <div class="sw-section">
              <h4>Strengths</h4>
              <ul>
                <li>Sustainable supply model with staking rewards</li>
                <li>Active community participation in governance</li>
              </ul>
            </div>
            <div class="sw-section">
              <h4>Weaknesses</h4>
              <ul>
                <li>Large circulating supply could pressure the price</li>
                <li>Dependence on staking could deter non-participating investors</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <div class="app-logo">
              <div class="logo-square">W</div>
              <span>ITSWORTH.APP</span>
            </div>
            <div class="page-number">3/8</div>
            <div class="generation-time">GENERATED: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }).toUpperCase()} AT ${new Date().toLocaleTimeString('en-US', { hour12: false })}</div>
          </div>
        </div>
        
        <!-- PAGE 4: Development Activity -->
        <div class="page category-page">
          <div class="category-header">
            <div class="category-label">CATEGORY 3</div>
            <h1 class="category-title">Development Activity</h1>
            <div class="category-score-badge ${ (s=> s>=80?'score-99': s>=60?'score-80':'score-60')( (categories.find(c=> (c.name||'').toLowerCase()==='development activity')||{}).score || 0 ) }">${ ((categories.find(c=> (c.name||'').toLowerCase()==='development activity')||{}).score || 0) }/100</div>
          </div>
          
          <div class="category-content">
            <p>${analysisData.token || 'This token'} is known for its rigorous development process, emphasizing peer-reviewed research and academic rigor. The platform has consistently rolled out upgrades and improvements, enhancing smart contract capabilities and overall functionality.</p>
            <p>GitHub activity is robust, with a high number of commits and contributions from various developers, indicating sustained interest and development momentum that bodes well for future innovation.</p>
          </div>
          
          <div class="strengths-weaknesses">
            <div class="sw-section">
              <h4>Strengths</h4>
              <ul>
                <li>Strong emphasis on research-driven development</li>
                <li>Continuous upgrades and improvements</li>
              </ul>
            </div>
            <div class="sw-section">
              <h4>Weaknesses</h4>
              <ul>
                <li>Slow rollout of features can frustrate users expecting rapid innovation</li>
                <li>Perception of being behind in terms of real-world application compared to competitors</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <div class="app-logo">
              <div class="logo-square">W</div>
              <span>ITSWORTH.APP</span>
            </div>
            <div class="page-number">4/8</div>
            <div class="generation-time">GENERATED: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }).toUpperCase()} AT ${new Date().toLocaleTimeString('en-US', { hour12: false })}</div>
          </div>
        </div>
        
        <!-- PAGE 5: Social Metrics -->
        <div class="page category-page">
          <div class="category-header">
            <div class="category-label">CATEGORY 4</div>
            <h1 class="category-title">Social Metrics</h1>
            <div class="category-score-badge ${ (s=> s>=80?'score-99': s>=60?'score-80':'score-60')( (categories.find(c=> (c.name||'').toLowerCase()==='social metrics')||{}).score || 0 ) }">${ ((categories.find(c=> (c.name||'').toLowerCase()==='social metrics')||{}).score || 0) }/100</div>
          </div>
          
          <div class="category-content">
            <p>${analysisData.token || 'This token'} has a passionate community, with significant engagement on social platforms like Twitter and Reddit. The number of active users and followers has grown steadily, demonstrating strong community support and interest.</p>
            <p>However, social sentiment fluctuates based on market conditions and development updates, leading to periods of negativity that can impact investor confidence and market perception.</p>
          </div>
          
          <div class="strengths-weaknesses">
            <div class="sw-section">
              <h4>Strengths</h4>
              <ul>
                <li>Active and engaged community</li>
                <li>Strong social media presence</li>
              </ul>
            </div>
            <div class="sw-section">
              <h4>Weaknesses</h4>
              <ul>
                <li>Vulnerability to negative sentiment during market downturns</li>
                <li>Competition for social engagement with other cryptocurrencies</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <div class="app-logo">
              <div class="logo-square">W</div>
              <span>ITSWORTH.APP</span>
            </div>
            <div class="page-number">5/8</div>
            <div class="generation-time">GENERATED: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }).toUpperCase()} AT ${new Date().toLocaleTimeString('en-US', { hour12: false })}</div>
          </div>
        </div>
        
        <!-- PAGE 6: Team & Investors -->
        <div class="page category-page">
          <div class="category-header">
            <div class="category-label">CATEGORY 5</div>
            <h1 class="category-title">Team & Investors</h1>
            <div class="category-score-badge ${ (s=> s>=80?'score-99': s>=60?'score-80':'score-60')( (categories.find(c=> (c.name||'').toLowerCase()==='team & investors')||{}).score || 0 ) }">${ ((categories.find(c=> (c.name||'').toLowerCase()==='team & investors')||{}).score || 0) }/100</div>
          </div>
          
          <div class="category-content">
            <p>${analysisData.token || 'This token'} was founded by experienced professionals with strong backgrounds in blockchain technology and cryptography. The team has demonstrated expertise and commitment to the project's long-term success.</p>
            <p>The backing from notable investors and partnerships with educational institutions provides credibility and resources that support continued development and market expansion.</p>
          </div>
          
          <div class="strengths-weaknesses">
            <div class="sw-section">
              <h4>Strengths</h4>
              <ul>
                <li>Experienced and reputable leadership team</li>
                <li>Strong academic partnerships enhancing credibility</li>
              </ul>
            </div>
            <div class="sw-section">
              <h4>Weaknesses</h4>
              <ul>
                <li>Centralized decision-making structure could raise concerns about governance</li>
                <li>Heavy reliance on the founder's vision and public persona</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <div class="app-logo">
              <div class="logo-square">W</div>
              <span>ITSWORTH.APP</span>
            </div>
            <div class="page-number">6/8</div>
            <div class="generation-time">GENERATED: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }).toUpperCase()} AT ${new Date().toLocaleTimeString('en-US', { hour12: false })}</div>
          </div>
        </div>
        
        <!-- PAGE 7: Risk Assessment -->
        <div class="page category-page">
          <div class="category-header">
            <div class="category-label">CATEGORY 6</div>
            <h1 class="category-title">Risk Assessment</h1>
            <div class="category-score-badge ${ (s=> s>=80?'score-99': s>=60?'score-80':'score-60')( (categories.find(c=> (c.name||'').toLowerCase()==='risk assessment')||{}).score || 0 ) }">${ ((categories.find(c=> (c.name||'').toLowerCase()==='risk assessment')||{}).score || 0) }/100</div>
          </div>
          
          <div class="category-content">
            <p>The risks associated with ${analysisData.token || 'this token'} stem from regulatory scrutiny, market competition, and technological challenges. While the platform has positioned itself as a scalable and secure solution, the evolving regulatory landscape could pose risks to operations and adoption.</p>
            <p>Additionally, competition from other smart contract platforms remains a significant threat, requiring continuous innovation and development to maintain market position.</p>
          </div>
          
          <div class="strengths-weaknesses">
            <div class="sw-section">
              <h4>Strengths</h4>
              <ul>
                <li>Established protocol with a focus on security and scalability</li>
                <li>Active risk management strategies in place</li>
              </ul>
            </div>
            <div class="sw-section">
              <h4>Weaknesses</h4>
              <ul>
                <li>Regulatory risks could impact market perception</li>
                <li>Rapid technological advancements from competitors can outpace development</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <div class="app-logo">
              <div class="logo-square">W</div>
              <span>ITSWORTH.APP</span>
            </div>
            <div class="page-number">7/8</div>
            <div class="generation-time">GENERATED: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }).toUpperCase()} AT ${new Date().toLocaleTimeString('en-US', { hour12: false })}</div>
          </div>
        </div>
        
        <!-- PAGE 8: Insights & Tips -->
        <div class="page conclusion-page">
          <div class="conclusion-header">
            <h1>Insights & Tips</h1>
            <h2>CONCLUSION</h2>
          </div>
          
          <div class="recommendations">
            <div class="recommendation-card">
              <h4>Enhance Community Engagement</h4>
              <p>Focus on building a more robust community outreach program to maintain positive sentiment and reduce volatility during market downturns.</p>
            </div>
            <div class="recommendation-card">
              <h4>Accelerate Development Roadmap</h4>
              <p>While the academic approach is valuable, consider strategies to speed up the deployment of new features and improvements.</p>
            </div>
            <div class="recommendation-card">
              <h4>Diversify Use Cases</h4>
              <p>Encourage the development of real-world applications and partnerships to enhance the utility beyond staking and governance.</p>
            </div>
            <div class="recommendation-card">
              <h4>Strengthen Regulatory Compliance</h4>
              <p>Proactively engage with regulators to ensure compliance and build trust within the investor community.</p>
            </div>
          </div>
          
          <div class="overall-conclusion">
            <p>In conclusion, while ${analysisData.token || 'this token'} demonstrates a solid foundation and potential for growth, addressing its weaknesses and leveraging its strengths will be crucial for future success in the competitive cryptocurrency landscape.</p>
          </div>
          
          <div class="footer">
            <div class="app-logo">
              <div class="logo-square">W</div>
              <span>ITSWORTH.APP</span>
            </div>
            <div class="page-number">8/8</div>
            <div class="generation-time">GENERATED: ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }).toUpperCase()} AT ${new Date().toLocaleTimeString('en-US', { hour12: false })}</div>
          </div>
        </div>
      </body>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js"></script>
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          var btn = document.getElementById('downloadBtn');
          if (!btn) return;
          btn.addEventListener('click', function () {
            if (window.html2pdf) {
              var opt = {
                margin: 0,
                filename: 'token-analysis-${tokenDisplay}.pdf',
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css'], after: '.page' }
              };
              window.html2pdf().set(opt).from(document.querySelector('body')).save();
            } else {
              window.print();
            }
          });
        });
      </script>
      </html>
    `;
    
    // Persist the generated HTML and open a friendly URL page that renders it
    try {
      sessionStorage.setItem('itsworth_report_html', fullHtml);
      sessionStorage.setItem('itsworth_report_title', `Token Analysis Report – ${tokenDisplay}`);
    } catch (e) {
      // Fallback to localStorage if sessionStorage is unavailable
      try {
        localStorage.setItem('itsworth_report_html', fullHtml);
        localStorage.setItem('itsworth_report_title', `Token Analysis Report – ${tokenDisplay}`);
      } catch (e2) { /* ignore */ }
    }
    // Open a dedicated page (relative path works on GitHub Pages and Netlify)
    window.open('report.html', '_blank');
    
    console.log('=== PREMIUM PDF GENERATION SUCCESS ===');
    console.log('8-page professional report opened in new window');
    console.log('Use Ctrl+P (or Cmd+P on Mac) to save as PDF');
    
  } catch (error) {
    console.error('=== PREMIUM PDF GENERATION ERROR ===');
    console.error('Error details:', error);
    alert('Error generating premium PDF report: ' + error.message);
  }
};

// Helper function to draw category item
const drawCategoryItem = (doc, category, x, y, getScoreColor) => {
  const scoreColor = getScoreColor(category.score);
  
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(category.name, x, y);
  
  doc.setFontSize(12);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${category.score}/100`, x, y + 8);
  
  // Draw mini score bar
  const barWidth = 60;
  const barHeight = 4;
  const scoreBarWidth = (category.score / 100) * barWidth;
  
  // Background
  doc.setFillColor(229, 231, 235);
  doc.rect(x, y + 10, barWidth, barHeight, 'F');
  
  // Score
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.rect(x, y + 10, scoreBarWidth, barHeight, 'F');
  
  // Border
  doc.setDrawColor(209, 213, 219);
  doc.rect(x, y + 10, barWidth, barHeight, 'S');
};

// App Context
const AppContext = createContext();

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// App Provider
const AppProvider = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [tokenAnalysis, setTokenAnalysis] = useState(null);
  const [email, setEmail] = useState('');

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      tokenAnalysis,
      setTokenAnalysis,
      email,
      setEmail,
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Logo Component
const Logo = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors duration-200"
      aria-label="Go Home"
    >
      <img src="assets/logo-w.png" alt="ItsWorth Logo" className="w-8 h-8 rounded-lg" onError={(e)=>{e.target.style.display='none';}} />
      <span>CryptoAnalyzer</span>
    </button>
  );
};

// Trending Tokens Component
const TrendingTokens = () => {
  const { setCurrentScreen, setTokenAnalysis } = useAppContext();
  const [trendingTokens, setTrendingTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = React.useRef(null);

  // Fetch real-time crypto data
  useEffect(() => {
    const loadCryptoData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCryptoData();
        setTrendingTokens(data);
      } catch (error) {
        console.error('Error loading crypto data:', error);
        setTrendingTokens(getMockCryptoData());
      } finally {
        setIsLoading(false);
      }
    };

    loadCryptoData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadCryptoData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (!scrollContainerRef.current || trendingTokens.length === 0) return;

    const scrollContainer = scrollContainerRef.current;
    let currentScroll = 0;
    const scrollStep = 2; // Pixels per frame
    const scrollSpeed = 50; // Milliseconds per frame

    console.log('Starting auto-scroll with', trendingTokens.length, 'tokens');

    const autoScroll = () => {
      // Get current scroll width
      const scrollWidth = scrollContainer.scrollWidth;
      const clientWidth = scrollContainer.clientWidth;
      const maxScroll = scrollWidth - clientWidth;

      console.log('Scroll debug:', { scrollWidth, clientWidth, maxScroll, currentScroll });

      if (maxScroll <= 0) {
        console.log('No scroll needed - container fits');
        return;
      }

      currentScroll += scrollStep;

      // Reset to beginning when reaching the end
      if (currentScroll >= maxScroll) {
        currentScroll = 0;
        console.log('Reset scroll to beginning');
      }

      // Apply scroll directly
      scrollContainer.scrollLeft = currentScroll;
    };

    // Start scrolling after a short delay to ensure DOM is ready
    const startDelay = setTimeout(() => {
      const interval = setInterval(autoScroll, scrollSpeed);
      
      // Store interval ID for cleanup
      scrollContainer._scrollInterval = interval;
    }, 1000);

    return () => {
      clearTimeout(startDelay);
      if (scrollContainer._scrollInterval) {
        clearInterval(scrollContainer._scrollInterval);
      }
    };
  }, [trendingTokens]);

  const handleTokenClick = (token) => {
    setCurrentScreen('loading');
    
    setTimeout(() => {
      const mockAnalysis = {
        token: token.symbol,
        score: Math.floor(Math.random() * 4) + 6,
        summary: `${token.name} is a trending cryptocurrency with strong market presence and active community. The token shows promising growth potential and solid fundamentals.`,
        metrics: {
          marketCap: token.marketCap,
          volume24h: `$${(Math.random() * 500 + 100).toFixed(0)}M`,
          liquidityScore: Math.floor(Math.random() * 3) + 7,
          devScore: Math.floor(Math.random() * 3) + 6,
          socialScore: Math.floor(Math.random() * 3) + 7,
          tokenomics: `Supply: ${Math.floor(Math.random() * 1000 + 500)}M tokens`
        }
      };
      setTokenAnalysis(mockAnalysis);
      setTimeout(() => setCurrentScreen('result'), 350);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Trending now:
        </h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Trending now:
      </h2>
      
      <div className="relative">
        {/* Gradient overlays for smooth scroll effect */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>
        
        {/* Scrollable container with auto-scroll */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 auto-scroll-container pb-4 px-4"
        >
          {trendingTokens.map((token) => (
            <div 
              key={token.id} 
              className="flex-shrink-0 w-48 group cursor-pointer"
              onClick={() => handleTokenClick(token)}
            >
              <div className="card hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-primary-200 relative overflow-hidden">
                {/* Logo with real image if available */}
                <div className={`w-12 h-12 bg-gradient-to-br ${token.color} rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 relative`}>
                  {token.image ? (
                    <img 
                      src={token.image} 
                      alt={token.name}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <span className="text-white text-xl font-bold" style={{ display: token.image ? 'none' : 'block' }}>
                    {token.logo}
                  </span>
                </div>
                
                {/* Token Info */}
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-primary-600 transition-colors duration-200">
                    {token.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{token.symbol}</p>
                  
                  {/* Price and Change */}
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 text-sm">{token.price}</p>
                    <p className={`text-xs font-medium ${token.change24h >= 0 ? 'text-crypto-green' : 'text-crypto-red'}`}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                    </p>
                  </div>
                  
                  {/* Market Cap */}
                  <p className="text-xs text-gray-500 mt-2">{token.marketCap}</p>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Live indicator */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-crypto-green rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Auto-scroll indicator */}
        <div className="text-center mt-2">
          <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-crypto-green rounded-full animate-pulse"></div>
            Auto-scrolling • Live data
          </span>
        </div>
      </div>
    </div>
  );
};

// Token Search Component
const TokenSearch = () => {
  const { setCurrentScreen, setTokenAnalysis } = useAppContext();
  const [tokenInput, setTokenInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [trendingTokens, setTrendingTokens] = useState([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);

  // Load trending tokens on component mount
  useEffect(() => {
    const loadTrendingTokens = async () => {
      setIsLoadingTokens(true);
      try {
        const data = await fetchCryptoData();
        // Take first 4 tokens for trending section with real ranks
        const topTokens = data.slice(0, 4).map(token => ({
          ...token,
          rank: token.market_cap_rank ? `#${token.market_cap_rank} CMC` : '#— CMC'
        }));
        setTrendingTokens(topTokens);
      } catch (error) {
        console.error('Error loading trending tokens:', error);
        // Fallback to mock data
        setTrendingTokens([
          { name: 'Ethereum', symbol: 'ETH', rank: '#2 CMC', image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
          { name: 'Bitcoin', symbol: 'BTC', rank: '#1 CMC', image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
          { name: 'Cardano', symbol: 'ADA', rank: '#8 CMC', image: 'https://assets.coingecko.com/coins/images/975/large/Cardano.png' },
          { name: 'Solana', symbol: 'SOL', rank: '#5 CMC', image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png' }
        ]);
      } finally {
        setIsLoadingTokens(false);
      }
    };

    loadTrendingTokens();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsSubmitting(true);
    setShowError(false);
    setCurrentScreen('loading');

    // PROMPT ДЛЯ OPENAI
    const prompt = `Execute In‑depth token analysis\nAfter receiving the token name, carry out a sequential deep‑dive analysis across the following categories and criteria. Prioritize data from CoinMarketCap and LunarCrush, but also consult other authoritative sources (CoinGecko, DefiLlama, Dune Analytics, Etherscan, etc.). Where figures conflict, perform cross‑validation.\n\nCategories and criteria of analysis\n📊 Category 1 – Market metrics\nCriteria for Category 1\n\nCoinMarketCap rank\nMarket cap\nCurrent price\nAll‑time high (ATH)\nCurrent price relative to ATH\nAll‑time low (ATL)\nCurrent price relative to ATL\nMax supply\nCirculating supply\nFully diluted valuation (FDV)\nCirculating supply vs total supply\n24 h volume\n24 h volume relative to market cap\nPrice volatility (short‑term and long‑term)\nLiquidity on key exchanges\nOrder‑book depth\n\n💰 Category 2 – Tokenomics\nCriteria for Category 2\n\nToken Generation Event and total supply at launch\nToken distribution (team, investors, founders, etc.)\nToken emission (inflationary or deflationary)\nVesting schedule\nUtility (Why does the token exist? How useful and forward‑looking is it? Governance? Fees? Staking? Collateral? If none—this is negative.)\n\n👨‍💻 Category 3 – Development & GitHub activity\nCriteria for Category 3\n\nCommit frequency over the last 30 days\nDeveloper activity (number of contributors, open issues)\n\n📣 Category 4 – Social metrics\nCriteria for Category 4\n\nMention count (LunarCrush)\nTwitterScore\nSocial sentiment\n\n🧑‍💼 Category 5 – Team & investors\nCriteria for Category 5\n\nReputation and experience of founders and key team members\nPresence of significant investors (funds, public figures)\nFund entry price (token price at the time investors/funds entered, based on TradingView data for that month)\n\n⚠️ Category 6 – Risks\nCriteria for Category 6\n\nRegulatory risks\nTechnological risks\nFinancial risks\n\nStage 3: Findings for each criterion\nFor every criterion, provide a short summary (1–3 sentences), cite your sources, and assign a score from 0 to 100 (at your discretion, based on the quality, reliability, and timeliness of the data).\n\nStage 4: Category‑level analysis\nCombine the criteria into their respective categories and:\n\nAssign each criterion a weight, using current market conditions and best practices.\nCalculate the final score for each category (weighted average of its criteria).\nProvide a concise, actionable conclusion for each category (3–5 sentences).\n\nStage 5: Overall analysis\nAssign each category a weight, using current market conditions and best practices.\nCalculate the token's overall score from 0 to 100 (weighted average of the categories).\nOffer a brief, practical conclusion (3–5 sentences) on the token's reliability and investment appeal, taking into account current market conditions and Web3 trends.`;

    try {
      // Запрос к нашему backend-прокси
      const response = await fetch(`${BACKEND_API_URL}/analyze-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tokenName: tokenInput.trim(),
          prompt: prompt
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTokenAnalysis({
          token: data.token,
          summary: data.analysis,
          usage: data.usage
        });
        setTimeout(() => setCurrentScreen('result'), 350); // короткая пауза: видны финальные галочки
      } else {
        console.error('Backend error:', data);
        setShowError(true);
        setCurrentScreen('home');
      }
    } catch (error) {
      console.error('Network error:', error);
      setShowError(true);
      setCurrentScreen('home');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit(e);
    }
  };

  const handleClearInput = () => {
    setTokenInput('');
    setShowError(false);
  };

  const handleLogoClick = () => {
    setCurrentScreen('home');
  };

  const handleTokenAnalyze = async (token) => {
    setTokenInput(token.name);
    setIsSubmitting(true);
    setShowError(false);
    setCurrentScreen('loading');

    // PROMPT ДЛЯ OPENAI
    const prompt = `Execute In‑depth token analysis\nAfter receiving the token name, carry out a sequential deep‑dive analysis across the following categories and criteria. Prioritize data from CoinMarketCap and LunarCrush, but also consult other authoritative sources (CoinGecko, DefiLlama, Dune Analytics, Etherscan, etc.). Where figures conflict, perform cross‑validation.\n\nCategories and criteria of analysis\n📊 Category 1 – Market metrics\nCriteria for Category 1\n\nCoinMarketCap rank\nMarket cap\nCurrent price\nAll‑time high (ATH)\nCurrent price relative to ATH\nAll‑time low (ATL)\nCurrent price relative to ATL\nMax supply\nCirculating supply\nFully diluted valuation (FDV)\nCirculating supply vs total supply\n24 h volume\n24 h volume relative to market cap\nPrice volatility (short‑term and long‑term)\nLiquidity on key exchanges\nOrder‑book depth\n\n💰 Category 2 – Tokenomics\nCriteria for Category 2\n\nToken Generation Event and total supply at launch\nToken distribution (team, investors, founders, etc.)\nToken emission (inflationary or deflationary)\nVesting schedule\nUtility (Why does the token exist? How useful and forward‑looking is it? Governance? Fees? Staking? Collateral? If none—this is negative.)\n\n👨‍💻 Category 3 – Development & GitHub activity\nCriteria for Category 3\n\nCommit frequency over the last 30 days\nDeveloper activity (number of contributors, open issues)\n\n📣 Category 4 – Social metrics\nCriteria for Category 4\n\nMention count (LunarCrush)\nTwitterScore\nSocial sentiment\n\n🧑‍💼 Category 5 – Team & investors\nCriteria for Category 5\n\nReputation and experience of founders and key team members\nPresence of significant investors (funds, public figures)\nFund entry price (token price at the time investors/funds entered, based on TradingView data for that month)\n\n⚠️ Category 6 – Risks\nCriteria for Category 6\n\nRegulatory risks\nTechnological risks\nFinancial risks\n\nStage 3: Findings for each criterion\nFor every criterion, provide a short summary (1–3 sentences), cite your sources, and assign a score from 0 to 100 (at your discretion, based on the quality, reliability, and timeliness of the data).\n\nStage 4: Category‑level analysis\nCombine the criteria into their respective categories and:\n\nAssign each criterion a weight, using current market conditions and best practices.\nCalculate the final score for each category (weighted average of its criteria).\nProvide a concise, actionable conclusion for each category (3–5 sentences).\n\nStage 5: Overall analysis\nAssign each category a weight, using current market conditions and best practices.\nCalculate the token's overall score from 0 to 100 (weighted average of the categories).\nOffer a brief, practical conclusion (3–5 sentences) on the token's reliability and investment appeal, taking into account current market conditions and Web3 trends.`;

    try {
      const response = await fetch(`${BACKEND_API_URL}/analyze-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tokenName: token.name,
          prompt: prompt
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTokenAnalysis({
          token: data.token,
          summary: data.analysis,
          usage: data.usage
        });
        setTimeout(() => setCurrentScreen('result'), 350);
      } else {
        console.error('Backend error:', data);
        setShowError(true);
        setCurrentScreen('home');
      }
    } catch (error) {
      console.error('Network error:', error);
      setShowError(true);
      setCurrentScreen('home');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showError) {
  return (
      <div className="card">
        <div className="error-card">
          <div className="error-title">Oops</div>
          <div className="error-message">WE CAN'T FIND THIS TOKEN</div>
        </div>
      </div>
    );
  }

  console.log('TokenSearch component rendering...');
  return (
    <div className="w-full">
      {/* Main Search Card */}
      <div className="card">
        <div className="worth-badge">WORTH OS 1.0</div>
        
        <div className="main-question">
          <div className="question-part question-worth">worth</div>
          <div className="question-to">to</div>
          <div className="question-part question-invest">invest?</div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-container">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyPress={handleKeyPress}
              placeholder="Enter Token name or address"
              className="input-field"
            disabled={isSubmitting}
          />
            {tokenInput && (
          <button
                type="button"
                onClick={handleClearInput}
                className="clear-button"
              >
                ×
          </button>
            )}
        </div>
      </form>
      </div>

      {/* Trending Tokens Card */}
      <div className="card">
        <div className="token-list">
          {isLoadingTokens ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            trendingTokens.map((token, index) => (
              <div key={index} className="token-item">
                <div className="token-info">
                  <div className="token-icon">
                    {token.image ? (
                      <img 
                        src={token.image} 
                        alt={token.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold" 
                         style={{ display: token.image ? 'none' : 'flex' }}>
                      {token.symbol[0]}
                    </div>
                  </div>
                  <div className="token-details">
                    <h3>{token.name}</h3>
                    <p>{token.symbol}</p>
                  </div>
                </div>
                <div className="token-spacer"></div>
                <div className="token-actions">
                  <div className="token-rank">{token.rank}</div>
                  <button 
                    className="analyse-button"
                    onClick={() => handleTokenAnalyze(token)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Analyzing...' : 'Analyse →'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Social links - Fixed Position Top Right */}
      <div className="fixed top-4 right-4 flex gap-3 z-40">
        <a href="https://x.com/itsworth_app" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-gray-800 shadow-sm hover:bg-amber-100 transition-colors">Twitter</a>
        <a href="https://www.reddit.com/r/Its_worth_app/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-gray-800 shadow-sm hover:bg-amber-100 transition-colors">Reddit</a>
        <a href="https://t.me/+AUgtdKZ7FqQ3NzAy" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-gray-800 shadow-sm hover:bg-amber-100 transition-colors">Telegram</a>
      </div>

      {/* Logo Button - Fixed Position */}
      <button
        onClick={handleLogoClick}
        className="fixed top-4 left-4 w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center hover:bg-green-500 transition-colors duration-200 z-50"
        style={{ backgroundColor: '#D9FF00' }}
      >
        <span className="text-white text-xl font-bold">W</span>
      </button>
    </div>
  );
};

// Loading Screen Component with step-by-step loaders
const LoadingScreen = () => {
  const { setCurrentScreen } = useAppContext();
  const steps = [
    'Market Metrics',
    'Tokenomics',
    'Development Activity',
    'Social Metrics',
    'Team & Investors',
    'Risk Assessment',
  ];

  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    // Start with zero completed, progressively tick steps
    setCompleted(0);
    const interval = setInterval(() => {
      setCompleted((prev) => Math.min(prev + 1, steps.length));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const renderIcon = (index) => {
    if (index < completed) {
      return (
        <div className="w-8 h-8 bg-crypto-green rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    // loader
    return (
      <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-2 border-t-blue-400 animate-spin"></div>
    );
  };

  useEffect(() => {
    // оставляем экран с заполненными галочками; переход на result делает код, который завершает анализ
    if (completed >= steps.length) {
      return;
    }
  }, [completed, steps.length, setCurrentScreen]);

  return (
    <div className="card">
      <div className="text-center">
        <div className="loading-spinner"></div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Analyzing token...
        </h2>

        <p className="text-gray-600 mb-8">
          Our AI is processing market data, social sentiment, and technical indicators
        </p>

        <div className="space-y-4">
          {steps.map((label, idx) => (
            <div key={label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{label}</span>
              {renderIcon(idx)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Result Screen Component
const ResultScreen = () => {
  const { tokenAnalysis, email, setState, setCurrentScreen, setTokenAnalysis } = useAppContext();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [newTokenInput, setNewTokenInput] = useState('');
  const [isAnalyzingNew, setIsAnalyzingNew] = useState(false);

  // Initialize Stripe Elements when payment modal opens (must be before any conditional returns)
  React.useEffect(() => {
    if (showPaymentModal && elements && !cardElement) {
      const card = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
          invalid: {
            color: '#9e2146',
          },
        },
      });
      card.mount('#card-element');
      setCardElement(card);
    }
  }, [showPaymentModal, elements, cardElement]);

  if (!tokenAnalysis) {
    return null;
  }

  // Parsed data for UI
  const { categories: parsedCategories, overallScore: parsedOverall, tokenName, tokenSymbol } = parseAnalysisSummary(tokenAnalysis.summary);
  const categories = parsedCategories || [];
  const overallScore = (parsedOverall == null && categories.length)
    ? Math.round(categories.reduce((a, c) => a + (c.score || 0), 0) / categories.length)
    : (parsedOverall || 0);
  const tokenDisplay = (tokenName || tokenAnalysis.token || '').toString();
  const tokenTicker = (tokenSymbol || tokenDisplay.replace(/[^A-Za-z]/g, '').slice(0, 3) || 'TOK').toUpperCase();

  const scoreBand = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const band = scoreBand(overallScore);
  const bandPill = band === 'green' ? 'bg-lime-400 text-white' : band === 'yellow' ? 'bg-amber-400 text-white' : 'bg-pink-400 text-white';
  const bandBorder = band === 'green' ? 'border-lime-400' : band === 'yellow' ? 'border-amber-400' : 'border-pink-400';
  const bandBg = band === 'green' ? 'bg-lime-300' : band === 'yellow' ? 'bg-amber-300' : 'bg-pink-300';
  const verdictText = band === 'green' ? "It's worth!" : band === 'yellow' ? 'Not too bad' : 'Not Worth a Penny';

  const handleNewTokenSubmit = async (e) => {
    e.preventDefault();
    if (!newTokenInput.trim()) return;

    setIsAnalyzingNew(true);
    setCurrentScreen('loading');

    // PROMPT ДЛЯ OPENAI
    const prompt = `Execute In‑depth token analysis\nAfter receiving the token name, carry out a sequential deep‑dive analysis across the following categories and criteria. Prioritize data from CoinMarketCap and LunarCrush, but also consult other authoritative sources (CoinGecko, DefiLlama, Dune Analytics, Etherscan, etc.). Where figures conflict, perform cross‑validation.\n\nCategories and criteria of analysis\n📊 Category 1 – Market metrics\nCriteria for Category 1\n\nCoinMarketCap rank\nMarket cap\nCurrent price\nAll‑time high (ATH)\nCurrent price relative to ATH\nAll‑time low (ATL)\nCurrent price relative to ATL\nMax supply\nCirculating supply\nFully diluted valuation (FDV)\nCirculating supply vs total supply\n24 h volume\n24 h volume relative to market cap\nPrice volatility (short‑term and long‑term)\nLiquidity on key exchanges\nOrder‑book depth\n\n💰 Category 2 – Tokenomics\nCriteria for Category 2\n\nToken Generation Event and total supply at launch\nToken distribution (team, investors, founders, etc.)\nToken emission (inflationary or deflationary)\nVesting schedule\nUtility (Why does the token exist? How useful and forward‑looking is it? Governance? Fees? Staking? Collateral? If none—this is negative.)\n\n👨‍💻 Category 3 – Development & GitHub activity\nCriteria for Category 3\n\nCommit frequency over the last 30 days\nDeveloper activity (number of contributors, open issues)\n\n📣 Category 4 – Social metrics\nCriteria for Category 4\n\nMention count (LunarCrush)\nTwitterScore\nSocial sentiment\n\n🧑‍💼 Category 5 – Team & investors\nCriteria for Category 5\n\nReputation and experience of founders and key team members\nPresence of significant investors (funds, public figures)\nFund entry price (token price at the time investors/funds entered, based on TradingView data for that month)\n\n⚠️ Category 6 – Risks\nCriteria for Category 6\n\nRegulatory risks\nTechnological risks\nFinancial risks\n\nStage 3: Findings for each criterion\nFor every criterion, provide a short summary (1–3 sentences), cite your sources, and assign a score from 0 to 100 (at your discretion, based on the quality, reliability, and timeliness of the data).\n\nStage 4: Category‑level analysis\nCombine the criteria into their respective categories and:\n\nAssign each criterion a weight, using current market conditions and best practices.\nCalculate the final score for each category (weighted average of its criteria).\nProvide a concise, actionable conclusion for each category (3–5 sentences).\n\nStage 5: Overall analysis\nAssign each category a weight, using current market conditions and best practices.\nCalculate the token's overall score from 0 to 100 (weighted average of the categories).\nOffer a brief, practical conclusion (3–5 sentences) on the token's reliability and investment appeal, taking into account current market conditions and Web3 trends.`;

    try {
      const response = await fetch(`${BACKEND_API_URL}/analyze-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          tokenName: newTokenInput.trim(),
          prompt: prompt
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTokenAnalysis({
          token: data.token,
          summary: data.analysis,
          usage: data.usage
        });
        setCurrentScreen('result');
    } else {
        console.error('Backend error:', data);
        alert('Error analyzing token. Please try again.');
        setCurrentScreen('result');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error. Please try again.');
      setCurrentScreen('result');
    } finally {
      setIsAnalyzingNew(false);
    }
  };

  const handleNewTokenKeyPress = (e) => {
    if (e.key === 'Enter' && !isAnalyzingNew) {
      handleNewTokenSubmit(e);
    }
  };

  

  const handlePremiumDownload = async () => {
    try {
      setPaymentProcessing(true);
      
      // Создаем Payment Intent
      const response = await fetch(`${BACKEND_API_URL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 999 }) // $9.99
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания платежа');
      }
      
      // Инициализируем Stripe
      const stripeInstance = Stripe(data.publishableKey);
      setStripe(stripeInstance);
      
      // Сохраняем client secret
      setClientSecret(data.clientSecret);
      
      // Создаем элементы
      const elementsInstance = stripeInstance.elements();
      setElements(elementsInstance);
      
      setShowPaymentModal(true);
      
    } catch (error) {
      console.error('Ошибка инициализации платежа:', error);
      alert('Ошибка при инициализации платежа: ' + error.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePaymentSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !cardElement) {
      return;
    }
    
    setPaymentProcessing(true);
    
    try {
          const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: email,
            },
          },
        }
      );
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (paymentIntent.status === 'succeeded') {
        // Платеж успешен, скачиваем премиум отчет
        setShowPaymentModal(false);
        generatePDFReport(tokenAnalysis, email, true); // true = premium
        alert('Платеж успешен! Премиум отчет скачивается...');
        setHasPaid(true);
      }
      
    } catch (error) {
      console.error('Ошибка платежа:', error);
      alert('Ошибка платежа: ' + error.message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Social links - Fixed Position Top Right (visible on results too) */}
      <div className="fixed top-4 right-4 flex gap-3 z-40">
        <a href="https://x.com/itsworth_app" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-gray-800 shadow-sm hover:bg-amber-100 transition-colors">Twitter</a>
        <a href="https://www.reddit.com/r/Its_worth_app/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-gray-800 shadow-sm hover:bg-amber-100 transition-colors">Reddit</a>
        <a href="https://t.me/+AUgtdKZ7FqQ3NzAy" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-100 text-gray-800 shadow-sm hover:bg-amber-100 transition-colors">Telegram</a>
      </div>
      {/* New Token Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleNewTokenSubmit}>
          <div className="relative">
            <input
              type="text"
              value={newTokenInput}
              onChange={(e) => setNewTokenInput(e.target.value)}
              onKeyPress={handleNewTokenKeyPress}
              placeholder="Enter Token name or address"
              className="w-full px-4 py-3 pr-12 bg-white rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-gray-900 placeholder-gray-500"
              disabled={isAnalyzingNew}
            />
            <button
              type="submit"
              disabled={isAnalyzingNew || !newTokenInput.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzingNew ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Removed top success title and subtitle per design request */}

      {/* Central block layout */}
      <div className="mb-8" style={{ width: 1200, height: 724, maxWidth: '1200px', display: 'flex', gap: 8, opacity: 1 }}>
        {/* Left hero card */}
        <div>
          <div className={`overflow-hidden border ${bandBorder}`} style={{ backgroundImage: "url('assets/result-left-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', width: 560, height: 724, maxWidth: '560px', borderRadius: 24, display: 'flex', flexDirection: 'column', gap: '8px', opacity: 1 }}>
            <div className="bg-white/70 p-6">
              {/* Token header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                    {(tokenDisplay || 'T').charAt(0)}
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-gray-900">{tokenDisplay || 'Token'}</div>
                    <div className="text-xs uppercase text-gray-500">{tokenTicker}</div>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-full text-2xl font-bold ${bandPill}`}>{overallScore}/100</div>
              </div>

              {/* Unlock button */}
              <div className="mt-6">
                {hasPaid ? (
                  <button onClick={() => generatePDFReport(tokenAnalysis, email, true)} className="btn-download-premium w-full">Download full report</button>
                ) : (
                  <button onClick={handlePremiumDownload} disabled={paymentProcessing} className="btn-download-premium w-full">{paymentProcessing ? 'Processing…' : 'Unlock full report'}</button>
                )}
              </div>
            </div>
            {/* Verdict stripe */}
            <div className={`px-6 py-4 ${bandBg} flex items-center justify-between`}>
              <div className="text-lg font-bold text-gray-900">{verdictText}</div>
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center text-gray-700">?</button>
                <button className="w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center text-gray-700">✈️</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        {/* Right column */}
        <div className="space-y-2" style={{ width: 632, height: 718, display: 'flex', flexDirection: 'column', gap: 8, opacity: 1 }}>
          {/* Categories overview */}
          <div className="card" style={{ width: 632, height: 330, opacity: 1 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Market Metrics','Social Metrics','Tokenomics','Team & Investors','Development Activity','Risk Assessment'].map((name) => {
                const c = categories.find((x) => (x.name||'').toLowerCase() === name.toLowerCase()) || { score: 0 };
                const b = scoreBand(c.score);
                const pill = b === 'green' ? 'bg-lime-300' : b === 'yellow' ? 'bg-amber-300' : 'bg-pink-300';
                return (
                  <div key={name} className="flex items-center justify-between p-4 rounded-lg bg-white/80 border">
                    <span className="text-gray-800 text-sm font-medium">{name}</span>
                    <span
                      className={`rounded-full text-xs font-bold ${pill}`}
                      style={{
                        width: 100,
                        height: 40,
                        borderRadius: 156,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        opacity: 1,
                      }}
                    >
                      {c.score}/100
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blurred full report teaser */}
          <div className="relative" style={{ width: 632, height: 380, opacity: 1 }}>
            <div className="card backdrop-blur-sm bg-white/30 overflow-hidden" style={{ backgroundImage: "url('assets/result-right-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="h-full w-full bg-white/40 backdrop-blur-[2px] rounded-lg"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              {hasPaid ? (
                <button onClick={() => generatePDFReport(tokenAnalysis, email, true)} className="btn-download-premium">Download full report</button>
              ) : (
                <button onClick={handlePremiumDownload} disabled={paymentProcessing} className="btn-download-premium">Unlock full report</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Complete Payment
            </h3>
            
            <p className="text-gray-600 mb-4">
              Enter your card details to download the premium report.
            </p>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div id="card-element" className="mb-4"></div>
                <div id="card-errors" className="text-red-500 text-sm"></div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="btn-download-premium flex-1"
                >
                  {paymentProcessing ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span>Pay $9.99</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="btn-check-another flex-1"
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
const AppContent = () => {
  const { currentScreen, setCurrentScreen } = useAppContext();
  console.log('AppContent rendered, currentScreen:', currentScreen);

  return (
    <div className="w-full">
      <main className="w-full">
        {currentScreen === 'home' && (
          <TokenSearch />
        )}
        
        {currentScreen === 'loading' && (
          <LoadingScreen />
        )}
        
        {currentScreen === 'result' && (
          <ResultScreen />
        )}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

// Render the app
console.log('Starting React app...');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  ReactDOM.render(<App />, rootElement);
  console.log('React app rendered successfully');
} else {
  console.error('Root element not found!');
}


