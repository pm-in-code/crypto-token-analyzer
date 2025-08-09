# 🚀 Crypto Token Analyzer

AI-powered cryptocurrency token analysis tool with comprehensive market insights.

## ✨ Features

- 🔍 **Real-time Token Analysis** - Analyze any cryptocurrency token
- 📊 **6-Dimensional Scoring** - Market Metrics, Tokenomics, Development, Social, Team, Risk
- 🎨 **Modern UI** - Beautiful Worth OS design system
- 📱 **Responsive Design** - Works on all devices
- 📄 **PDF Reports** - Download detailed analysis reports
- 💳 **Premium Features** - Enhanced analysis with Stripe integration

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, Babel
- **Backend**: Node.js, Express
- **AI**: OpenAI GPT-4
- **Payments**: Stripe
- **Deployment**: Vercel + GitHub Pages

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- OpenAI API key
- (Optional) Stripe account for payments

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/crypto-token-analyzer.git
   cd crypto-token-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm start
   
   # Terminal 2: Frontend
   python3 server.py
   ```

5. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# OpenAI API Key (Required)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Stripe Keys (Optional - for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## 🌐 Deployment

### Option 1: Vercel + GitHub Pages (Recommended)

1. **Deploy backend to Vercel**
   - Connect your GitHub repo to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy

2. **Update frontend backend URL**
   ```javascript
   const BACKEND_API_URL = 'https://your-backend.vercel.app';
   ```

3. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Select source: Deploy from branch
   - Choose main branch

### Option 2: Netlify (All-in-one)

1. **Connect to Netlify**
   - Import from GitHub
   - Set environment variables
   - Deploy

## 📁 Project Structure

```
crypto-token-analyzer/
├── backend/                 # Node.js backend
│   ├── server.js           # Express server
│   ├── package.json        # Backend dependencies
│   └── .env               # Backend environment variables
├── public/                 # Static files
│   ├── index.html         # Main HTML file
│   └── app.js             # React application
├── index.html             # Development HTML file
├── app.js                 # Development React app
├── server.py              # Python development server
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🔧 Development

### Backend Development

```bash
cd backend
npm install
npm start
```

### Frontend Development

```bash
python3 server.py
# or
python server.py
```

### Building for Production

```bash
# Backend is ready for Vercel deployment
# Frontend is ready for GitHub Pages
```

## 🎨 Design System

The project uses a custom "Worth OS" design system:

- **Colors**: Light blue background, green accents
- **Typography**: Inter font family
- **Components**: Cards, buttons, inputs
- **Responsive**: Mobile-first design

## 🔒 Security

- ✅ API keys stored in environment variables
- ✅ Backend deployed separately from frontend
- ✅ CORS properly configured
- ✅ No sensitive data in public repository

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🆘 Support

- 📧 Email: your-email@example.com
- 🐛 Issues: GitHub Issues
- 📖 Docs: See DEPLOYMENT.md for detailed deployment instructions

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Stripe for payment processing
- Vercel for hosting
- GitHub for version control # Force redeploy
