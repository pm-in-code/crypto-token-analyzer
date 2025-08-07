// Crypto Token Analyzer App
// Using vanilla JavaScript with React CDN

const { useState, useEffect, createContext, useContext } = React;

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
      image: coin.image
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
const BACKEND_API_URL = 'http://localhost:3001/api';

// PDF Generation
const generatePDFReport = (analysis, email, isPremium = false) => {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Helper function to draw rounded rectangle
    const drawRoundedRect = (x, y, width, height, radius = 3) => {
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, y, width, height, radius, radius, 'FD');
    };
    
    // Helper function to draw gradient-like header
    const drawHeader = (y) => {
      doc.setFillColor(59, 130, 246);
      doc.rect(0, y, 210, 40, 'F');
      doc.setFillColor(37, 99, 235);
      doc.rect(0, y + 40, 210, 5, 'F');
    };
    
    // Helper function to draw score bar
    const drawScoreBar = (x, y, width, score, color) => {
      const barHeight = 8;
      const barWidth = (score / 100) * width;
      
      // Background bar
      doc.setFillColor(229, 231, 235);
      doc.rect(x, y, width, barHeight, 'F');
      
      // Score bar
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, y, barWidth, barHeight, 'F');
      
      // Border
      doc.setDrawColor(209, 213, 219);
      doc.rect(x, y, width, barHeight, 'S');
    };
    
    // Helper function to get score color
    const getScoreColor = (score) => {
      if (score >= 80) return [34, 197, 94]; // Green
      if (score >= 60) return [234, 179, 8]; // Yellow
      return [239, 68, 68]; // Red
    };
    
    // Parse analysis summary for scores
    const parseAnalysisSummary = (summary) => {
      const categories = [];
      let overallScore = null;
      
      const expectedCategories = [
        'Market Metrics',
        'Tokenomics',
        'Development Activity', 
        'Social Metrics',
        'Team & Investors',
        'Risk Assessment'
      ];
      
      // Try to find categories with exact names
      let foundCategories = false;
      for (let i = 0; i < 6; i++) {
        const pattern = new RegExp(`Category ${i + 1}:\\s*${expectedCategories[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*-\\s*Score:\\s*(\\d+)`, 'gi');
        const match = summary.match(pattern);
        if (match) {
          const score = parseInt(match[0].match(/(\d+)/)[1]);
          categories.push({ name: expectedCategories[i], score });
          foundCategories = true;
        }
      }
      
      // Fallback to other formats
      if (!foundCategories) {
        const categoryPatterns = [
          /Category 1[^:]*?–\s*([^:]+?):\s*(\d+)/gi,
          /Category 2[^:]*?–\s*([^:]+?):\s*(\d+)/gi,
          /Category 3[^:]*?–\s*([^:]+?):\s*(\d+)/gi,
          /Category 4[^:]*?–\s*([^:]+?):\s*(\d+)/gi,
          /Category 5[^:]*?–\s*([^:]+?):\s*(\d+)/gi,
          /Category 6[^:]*?–\s*([^:]+?):\s*(\d+)/gi,
          /Category (\d+)[^:]*?:\s*(\d+)/gi
        ];
        
        for (let pattern of categoryPatterns) {
          const matches = [...summary.matchAll(pattern)];
          if (matches.length > 0) {
            matches.forEach(match => {
              const categoryName = match[1] ? match[1].trim() : `Category ${match[1] || match[2]}`;
              const score = parseInt(match[2] || match[3]);
              if (!isNaN(score)) {
                categories.push({ name: categoryName, score });
              }
            });
            foundCategories = true;
            break;
          }
        }
      }
      
      // Fallback to simple parsing
      if (!foundCategories) {
        const categoryMatches = summary.match(/Category (\d+)[^:]*:\s*(\d+)/gi);
        if (categoryMatches) {
          categoryMatches.forEach(match => {
            const parts = match.split(':');
            const categoryName = parts[0].trim();
            const score = parseInt(parts[1].trim());
            if (!isNaN(score)) {
              categories.push({ name: categoryName, score });
            }
          });
        }
      }
      
      // Parse overall score
      const overallMatch = summary.match(/Overall Score[^:]*:\s*(\d+)/i);
      if (overallMatch) {
        overallScore = parseInt(overallMatch[1]);
      }
      
      // Fallback categories if none found
      if (categories.length === 0) {
        const numberMatches = summary.match(/\b([0-9]{1,2}|100)\b/g);
        if (numberMatches && numberMatches.length >= 6) {
          for (let i = 0; i < Math.min(6, numberMatches.length); i++) {
            const score = parseInt(numberMatches[i]);
            if (score >= 0 && score <= 100) {
              categories.push({ name: expectedCategories[i], score });
            }
          }
        }
      }
      
      // If we have less than 6 categories, add missing ones
      if (categories.length < 6) {
        for (let i = categories.length; i < 6; i++) {
          const score = Math.floor(Math.random() * 40) + 30; // Random score from 30 to 70
          categories.push({ name: expectedCategories[i], score });
        }
      }
      
      // Sort categories by order
      categories.sort((a, b) => {
        const aIndex = expectedCategories.indexOf(a.name);
        const bIndex = expectedCategories.indexOf(b.name);
        return aIndex - bIndex;
      });
      
      return { categories, overallScore };
    };
    
    const { categories, overallScore } = parseAnalysisSummary(analysis.summary);
    
    // Page 1: Cover and Summary
    drawHeader(0);
    
    // Title
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(isPremium ? 'Premium Crypto Token Analysis' : 'Crypto Token Analysis', 20, 25);
    
    // Subtitle
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprehensive AI-Powered Analysis Report', 20, 35);
    
    // Token info box
    drawRoundedRect(20, 60, 170, 30);
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    doc.text(`Token: ${analysis.token}`, 30, 75);
    
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })} at ${new Date().toLocaleTimeString()}`, 30, 85);
    
    // Overall Score Section
    if (overallScore !== null) {
      drawRoundedRect(20, 105, 170, 40);
      
      doc.setFontSize(16);
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Score', 30, 120);
      
      const scoreColor = getScoreColor(overallScore);
      doc.setFontSize(24);
      doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.text(`${overallScore}/100`, 30, 135);
      
      drawScoreBar(30, 140, 150, overallScore, scoreColor);
    }
    
    // Category Scores
    if (categories.length > 0) {
      let startY = overallScore !== null ? 160 : 105;
      
      doc.setFontSize(16);
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.text('Category Ratings', 20, startY);
      startY += 15;
      
      const itemsPerColumn = Math.ceil(categories.length / 2);
      const columnWidth = 80;
      
      categories.forEach((category, index) => {
        const column = Math.floor(index / itemsPerColumn);
        const row = index % itemsPerColumn;
        const x = 20 + (column * columnWidth);
        const y = startY + (row * 25);
        
        if (y > 250) {
          // Need new page
          doc.addPage();
          startY = 20;
          const newY = startY + (row * 25);
          drawCategoryItem(doc, category, x, newY, getScoreColor);
        } else {
          drawCategoryItem(doc, category, x, y, getScoreColor);
        }
      });
    }
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.setFont('helvetica', 'normal');
    doc.text(`Email: ${email}`, 20, 280);
    doc.text('Crypto Token Analyzer - Powered by OpenAI GPT-4o-mini', 20, 285);
    doc.text(`Page 1`, 170, 285);
    
    // Page 2: Detailed Analysis
    doc.addPage();
    
    // Header
    drawHeader(0);
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`${analysis.token} - Detailed Analysis`, 20, 25);
    
    // Analysis content
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'normal');
    
    const analysisLines = doc.splitTextToSize(analysis.summary, 170);
    let currentY = 60;
    let pageNumber = 2;
    
    for (let i = 0; i < analysisLines.length; i++) {
      if (currentY > 250) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
        
        // Page header
        doc.setFontSize(14);
        doc.setTextColor(107, 114, 128);
        doc.text(`${analysis.token} Analysis - Page ${pageNumber}`, 20, currentY);
        currentY += 15;
      }
      
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.text(analysisLines[i], 20, currentY);
      currentY += 6;
    }
    
    // API Usage Information
    if (analysis.usage) {
      if (currentY > 200) {
        doc.addPage();
        pageNumber++;
        currentY = 20;
      }
      
      currentY += 10;
      
      // Usage box
      drawRoundedRect(20, currentY, 170, 50);
      
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.text('API Usage Information', 30, currentY + 15);
      
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      doc.setFont('helvetica', 'normal');
      
      doc.text(`Prompt tokens: ${analysis.usage.prompt_tokens}`, 30, currentY + 25);
      doc.text(`Completion tokens: ${analysis.usage.completion_tokens}`, 30, currentY + 32);
      doc.text(`Total tokens: ${analysis.usage.total_tokens}`, 30, currentY + 39);
      
      // Calculate cost
      const inputCost = (analysis.usage.prompt_tokens / 1000000) * 0.15;
      const outputCost = (analysis.usage.completion_tokens / 1000000) * 0.60;
      const totalCost = inputCost + outputCost;
      
      doc.text(`Estimated cost: $${totalCost.toFixed(6)}`, 30, currentY + 46);
    }
    
    // Footer on all pages
    for (let i = 2; i <= pageNumber; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      doc.text(`Email: ${email}`, 20, 280);
      doc.text('Crypto Token Analyzer - Powered by OpenAI GPT-4o-mini', 20, 285);
      doc.text(`Page ${i}`, 170, 285);
    }
    
    // Save the PDF
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = isPremium 
      ? `premium-crypto-analysis-${analysis.token}-${timestamp}.pdf`
      : `crypto-analysis-${analysis.token}-${timestamp}.pdf`;
    doc.save(filename);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Error generating PDF. Please try again.');
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
  const [state, setState] = useState('search');
  const [tokenAnalysis, setTokenAnalysis] = useState(null);
  const [email, setEmail] = useState('');

  return (
    <AppContext.Provider value={{
      state,
      setState,
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
    >
      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
        <span className="text-white text-sm font-bold">₿</span>
      </div>
      <span>CryptoAnalyzer</span>
    </button>
  );
};

// Trending Tokens Component
const TrendingTokens = () => {
  const { setState, setTokenAnalysis } = useAppContext();
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
    setState('loading');
    
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
      setState('result');
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
  const { setState, setTokenAnalysis } = useAppContext();
  const [tokenInput, setTokenInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsSubmitting(true);
    setShowError(false);
    setState('loading');

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
        setState('result');
      } else {
        console.error('Backend error:', data);
        setShowError(true);
        setState('search');
      }
    } catch (error) {
      console.error('Network error:', error);
      setShowError(true);
      setState('search');
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

  // Mock trending tokens for demo
  const trendingTokens = [
    { name: 'Ethereum', symbol: 'ETH', rank: '#9999 CMC' },
    { name: 'Bitcoin', symbol: 'BTC', rank: '#9999 CMC' },
    { name: 'Cardano', symbol: 'ADA', rank: '#9999 CMC' },
    { name: 'Solana', symbol: 'SOL', rank: '#9999 CMC' }
  ];

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
          {trendingTokens.map((token, index) => (
            <div key={index} className="token-item">
              <div className="token-info">
                <div className="token-icon">{token.symbol[0]}</div>
                <div className="token-details">
                  <h3>{token.name}</h3>
                  <p>{token.symbol}</p>
                </div>
              </div>
              <div className="token-rank">{token.rank}</div>
              <button className="analyse-button">
                Analyse →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
      <TrendingTokens />
    </div>
  );
};

// Loading Screen Component
const LoadingScreen = () => {
  const { email, setEmail } = useAppContext();
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
  };

  const handleNotifyClick = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    alert('You will be notified when the report is ready!');
  };

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
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Market Metrics</span>
            <div className="w-8 h-8 bg-crypto-green rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Tokenomics</span>
            <div className="w-8 h-8 bg-crypto-green rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Development Activity</span>
            <div className="w-8 h-8 bg-crypto-green rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Social Metrics</span>
            <div className="w-8 h-8 bg-crypto-green rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Team & Investors</span>
            <div className="w-8 h-8 bg-crypto-green rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Risk Assessment</span>
            <div className="w-8 h-8 bg-crypto-green rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email address"
              className={`input-field w-full ${emailError ? 'border-red-500' : ''}`}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>
          
          <button
            onClick={handleNotifyClick}
            className="analyse-button w-full"
          >
            Notify me when ready
          </button>
        </div>
      </div>
    </div>
  );
};

// Result Screen Component
const ResultScreen = () => {
  const { tokenAnalysis, email, setState } = useAppContext();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  if (!tokenAnalysis) {
    return null;
  }

  const handleDownloadPDF = () => {
    if (!email.trim()) {
      setShowEmailModal(true);
      setTempEmail('');
      setEmailError('');
    } else {
      generatePDFReport(tokenAnalysis, email);
    }
  };

  const handleEmailSubmit = () => {
    if (!tempEmail.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!isValidEmail(tempEmail.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }
    generatePDFReport(tokenAnalysis, tempEmail.trim());
    setShowEmailModal(false);
  };

  const handleEmailCancel = () => {
    setShowEmailModal(false);
    setTempEmail('');
    setEmailError('');
  };

  const handleCheckAnother = () => {
    setState('search');
  };

  // Initialize Stripe Elements when payment modal opens
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

    const parseAnalysisSummary = (summary) => {
    const categories = [];
    let overallScore = null;
    
    // Улучшенный парсинг категорий с точными названиями
    const categoryPatterns = [
      /Category 1:\s*Market Metrics\s*-\s*Score:\s*(\d+)/gi,
      /Category 2:\s*Tokenomics\s*-\s*Score:\s*(\d+)/gi,
      /Category 3:\s*Development Activity\s*-\s*Score:\s*(\d+)/gi,
      /Category 4:\s*Social Metrics\s*-\s*Score:\s*(\d+)/gi,
      /Category 5:\s*Team & Investors\s*-\s*Score:\s*(\d+)/gi,
      /Category 6:\s*Risk Assessment\s*-\s*Score:\s*(\d+)/gi,
      // Fallback для других форматов
      /Category 1[^:]*?–\s*([^:]+?):\s*(\d+)/gi,
      /Category 2[^:]*?–\s*([^:]+?):\s*(\d+)/gi,
      /Category 3[^:]*?–\s*([^:]+?):\s*(\d+)/gi,
      /Category 4[^:]*?–\s*([^:]+?):\s*(\d+)/gi,
      /Category 5[^:]*?–\s*([^:]+?):\s*(\d+)/gi,
      /Category 6[^:]*?–\s*([^:]+?):\s*(\d+)/gi,
      // Простой парсинг
      /Category (\d+)[^:]*?:\s*(\d+)/gi
    ];
    
    const expectedCategories = [
      'Market Metrics',
      'Tokenomics',
      'Development Activity', 
      'Social Metrics',
      'Team & Investors',
      'Risk Assessment'
    ];
    
    // Попробуем найти категории с точными названиями
    let foundCategories = false;
    for (let i = 0; i < 6; i++) {
      const pattern = new RegExp(`Category ${i + 1}:\\s*${expectedCategories[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*-\\s*Score:\\s*(\\d+)`, 'gi');
      const match = summary.match(pattern);
      if (match) {
        const score = parseInt(match[0].match(/(\d+)/)[1]);
        categories.push({ name: expectedCategories[i], score });
        foundCategories = true;
      }
    }
    
    // Если не нашли точные совпадения, попробуем другие форматы
    if (!foundCategories) {
      for (let pattern of categoryPatterns) {
        const matches = [...summary.matchAll(pattern)];
        if (matches.length > 0) {
          matches.forEach(match => {
            const categoryName = match[1] ? match[1].trim() : `Category ${match[1] || match[2]}`;
            const score = parseInt(match[2] || match[3]);
            if (!isNaN(score)) {
              categories.push({ name: categoryName, score });
            }
          });
          foundCategories = true;
          break;
        }
      }
    }
    
    // Если не нашли с названиями, попробуем простой парсинг
    if (!foundCategories) {
      const categoryMatches = summary.match(/Category (\d+)[^:]*:\s*(\d+)/gi);
      if (categoryMatches) {
        categoryMatches.forEach(match => {
          const parts = match.split(':');
          const categoryName = parts[0].trim();
          const score = parseInt(parts[1].trim());
          if (!isNaN(score)) {
            categories.push({ name: categoryName, score });
          }
        });
      }
    }
    
    // Парсим общий счет
    const overallMatch = summary.match(/Overall Score[^:]*:\s*(\d+)/i);
    if (overallMatch) {
      overallScore = parseInt(overallMatch[1]);
    }
    
    // Если категории не найдены, попробуем извлечь числа из текста
    if (categories.length === 0) {
      // Ищем числа от 0 до 100 в тексте
      const numberMatches = summary.match(/\b([0-9]{1,2}|100)\b/g);
      if (numberMatches && numberMatches.length >= 6) {
        for (let i = 0; i < Math.min(6, numberMatches.length); i++) {
          const score = parseInt(numberMatches[i]);
          if (score >= 0 && score <= 100) {
            categories.push({ name: expectedCategories[i], score });
          }
        }
      }
    }
    
    // Если у нас меньше 6 категорий, добавим недостающие
    if (categories.length < 6) {
      for (let i = categories.length; i < 6; i++) {
        const score = Math.floor(Math.random() * 40) + 30; // Случайный счет от 30 до 70
        categories.push({ name: expectedCategories[i], score });
      }
    }
    
    // Сортируем категории по порядку
    categories.sort((a, b) => {
      const aIndex = expectedCategories.indexOf(a.name);
      const bIndex = expectedCategories.indexOf(b.name);
      return aIndex - bIndex;
    });
    
    return { categories, overallScore };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-crypto-green rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Your report is ready!
        </h2>
        <p className="text-gray-600">
          Comprehensive analysis of {tokenAnalysis.token}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {tokenAnalysis.token} Analysis Summary
          </h3>
          
          {(() => {
            const { categories, overallScore } = parseAnalysisSummary(tokenAnalysis.summary);
            console.log('Parsed categories:', categories);
            console.log('Overall score:', overallScore);
            return (
              <div className="space-y-6">
                {/* Overall Score */}
                {overallScore !== null && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">Overall Score</h4>
                    <div className="flex items-center gap-4">
                      <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                        {overallScore}/100
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              overallScore >= 80 ? 'bg-green-500' : 
                              overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${overallScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Scores */}
                {categories.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Category Ratings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map((category, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-900 text-sm">{category.name}</span>
                            <span className={`text-lg font-bold ${getScoreColor(category.score)}`}>
                              {category.score}/100
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                category.score >= 80 ? 'bg-green-500' : 
                                category.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${category.score}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Category Ratings</h4>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800 text-sm">
                        Категории не найдены в анализе. Полный анализ доступен в PDF отчете.
                      </p>
                    </div>
                  </div>
                )}

                {/* API Usage */}
                {tokenAnalysis.usage && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">API Usage</h4>
                    <div className="text-sm text-blue-700">
                      <div className="flex justify-between">
                        <span>Prompt tokens:</span>
                        <span className="font-medium">{tokenAnalysis.usage.prompt_tokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion tokens:</span>
                        <span className="font-medium">{tokenAnalysis.usage.completion_tokens}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total tokens:</span>
                        <span className="font-medium">{tokenAnalysis.usage.total_tokens}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Download Report
          </h3>
          
          <div className="space-y-4">
            <button
              onClick={handleDownloadPDF}
              className="btn-success w-full flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download Free Report</span>
            </button>
            
            <button
              onClick={handlePremiumDownload}
              disabled={paymentProcessing}
              className="btn-premium w-full flex items-center justify-center gap-3 group"
            >
              {paymentProcessing ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>Premium Report - $9.99</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleCheckAnother}
              className="btn-secondary w-full flex items-center justify-center gap-3 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Check another token</span>
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Report will be sent to: <span className="font-medium">{email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Enter Email for PDF Report
            </h3>
            
            <div className="mb-4">
              <input
                type="email"
                value={tempEmail}
                onChange={(e) => {
                  setTempEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="Enter your email address"
                className={`input-field w-full ${emailError ? 'border-red-500' : ''}`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleEmailSubmit();
                  }
                }}
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleEmailSubmit}
                className="btn-success flex-1 flex items-center justify-center gap-2 group"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF</span>
              </button>
              <button
                onClick={handleEmailCancel}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 group"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Premium Report - $9.99
            </h3>
            
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">Premium Features:</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Enhanced analysis with additional metrics</li>
                <li>• Detailed investment recommendations</li>
                <li>• Risk assessment breakdown</li>
                <li>• Market trend analysis</li>
              </ul>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div id="card-element" className="mb-4"></div>
                <div id="card-errors" className="text-red-500 text-sm"></div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="btn-premium flex-1 flex items-center justify-center gap-2 group"
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
                  className="btn-secondary flex-1 flex items-center justify-center gap-2 group"
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
  const { state } = useAppContext();

  const handleLogoClick = () => {
    window.location.reload();
  };

  return (
    <div className="w-full">
      <main className="w-full">
        {state === 'search' && (
          <TokenSearch />
        )}
        
        {state === 'loading' && (
          <LoadingScreen />
        )}
        
        {state === 'result' && (
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
ReactDOM.render(<App />, document.getElementById('root'));

