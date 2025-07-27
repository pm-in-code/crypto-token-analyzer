# 🚀 Crypto Token Analyzer

**AI-Powered Cryptocurrency Analysis Platform with Premium Reports**

A comprehensive web application that analyzes cryptocurrency tokens using OpenAI's GPT-4o-mini model and generates professional PDF reports. Features include real-time analysis, premium paid reports via Stripe, and beautiful visualizations.

## ✨ Features

### 🔍 **Token Analysis**
- **Real-time Analysis**: Powered by OpenAI GPT-4o-mini
- **Comprehensive Categories**: Market metrics, tokenomics, development, social metrics, team & investors, risks
- **Visual Score Display**: Progress bars and color-coded ratings
- **Trending Tokens**: Auto-scrolling cryptocurrency showcase

### 📄 **Report Generation**
- **Free Reports**: Basic analysis with email download
- **Premium Reports**: Enhanced analysis with Stripe payment ($9.99)
- **Professional PDFs**: Beautiful, structured reports with visual elements
- **Multiple Formats**: Both free and premium report types

### 💳 **Payment Integration**
- **Stripe Integration**: Secure payment processing
- **Premium Features**: Enhanced analysis and reporting
- **Sandbox Testing**: Ready for production deployment

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on all devices
- **Beautiful Animations**: Smooth transitions and hover effects
- **Professional Styling**: Tailwind CSS with custom gradients
- **Interactive Elements**: Real-time feedback and loading states

## 🏗️ Architecture

### **Frontend**
- **React** (CDN-based for simplicity)
- **TypeScript** concepts (Babel transpilation)
- **Tailwind CSS** for styling
- **jsPDF** for PDF generation
- **Stripe.js** for payment processing

### **Backend**
- **Node.js** with Express
- **OpenAI API** integration
- **Stripe API** integration
- **CORS** enabled for cross-origin requests
- **Environment variables** for security

### **File Structure**
```
crypto-token-analyzer/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── app.js            # React application
│   └── server.py         # Python HTTP server
├── backend/               # Node.js backend
│   ├── server.js         # Express server
│   ├── package.json      # Dependencies
│   └── .env              # Environment variables
├── scripts/               # Startup scripts
│   ├── start.sh          # Frontend server
│   ├── start-backend.sh  # Backend server
│   └── start-all.sh      # Both servers
└── docs/                  # Documentation
    ├── STRIPE_FIX.md     # Stripe integration guide
    ├── CATEGORIES_FIX.md # Categories display guide
    └── PDF_IMPROVEMENTS.md # PDF design guide
```

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ installed
- Python 3.x installed
- OpenAI API key
- Stripe account (for payments)

### **1. Clone Repository**
```bash
git clone <your-repo-url>
cd crypto-token-analyzer
```

### **2. Setup Backend**
```bash
cd backend
npm install
```

### **3. Configure Environment**
Create `backend/.env` file:
```env
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
PORT=3001
NODE_ENV=development
```

### **4. Start Application**
```bash
# Start both frontend and backend
./scripts/start-all.sh

# Or start separately:
./scripts/start.sh        # Frontend (port 8000)
./scripts/start-backend.sh # Backend (port 3001)
```

### **5. Access Application**
Open your browser and navigate to:
```
http://localhost:8000
```

## 🧪 Testing

### **Token Analysis**
1. Enter a token name (e.g., "Bitcoin", "Ethereum")
2. Click "Scan" button
3. Wait for AI analysis to complete
4. View results with category scores

### **Free Report Download**
1. Complete token analysis
2. Click "Download Free Report"
3. Enter your email
4. PDF will download automatically

### **Premium Report Purchase**
1. Complete token analysis
2. Click "Premium Report - $9.99"
3. Enter payment details in Stripe modal
4. Use test card: `4242 4242 4242 4242`
5. PDF will download after successful payment

## 🔧 Configuration

### **OpenAI Settings**
- **Model**: GPT-4o-mini (cost-effective)
- **Temperature**: Default
- **Max Tokens**: Auto-determined

### **Stripe Settings**
- **Environment**: Sandbox (for testing)
- **Currency**: USD
- **Amount**: $9.99 (999 cents)

### **Frontend Settings**
- **Port**: 8000 (Python server)
- **Cache**: Version-controlled for updates
- **CDN**: React, Tailwind, jsPDF, Stripe.js

## 📊 API Endpoints

### **Backend (Port 3001)**
- `GET /api/health` - Health check
- `POST /api/analyze-token` - Token analysis
- `POST /api/create-payment-intent` - Create Stripe payment
- `POST /api/confirm-payment` - Confirm payment status

### **Frontend (Port 8000)**
- Static file serving
- React application
- PDF generation

## 🎨 Design Features

### **Visual Elements**
- **Gradient Headers**: Blue gradient backgrounds
- **Progress Bars**: Color-coded score indicators
- **Rounded Cards**: Modern card design
- **Hover Effects**: Interactive button animations
- **Loading States**: Spinner animations

### **Color Scheme**
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#22C55E)
- **Warning**: Yellow (#EAB308)
- **Error**: Red (#EF4444)
- **Neutral**: Gray (#6B7280)

## 🔒 Security Features

### **API Key Protection**
- Backend proxy for OpenAI API calls
- Environment variables for sensitive data
- No API keys in frontend code

### **Payment Security**
- Stripe Elements for secure card input
- Server-side payment processing
- PCI compliance through Stripe

### **CORS Configuration**
- Backend configured for frontend requests
- Secure cross-origin communication

## 📈 Performance

### **Optimizations**
- **CDN Loading**: Fast library loading
- **Lazy Loading**: Components load as needed
- **Caching**: Browser cache management
- **Minification**: Optimized for production

### **Monitoring**
- **Console Logging**: Debug information
- **Error Handling**: Graceful error recovery
- **Loading States**: User feedback

## 🚀 Deployment

### **Production Setup**
1. **Environment Variables**: Set production API keys
2. **Stripe**: Switch to live mode
3. **Domain**: Configure custom domain
4. **SSL**: Enable HTTPS
5. **Monitoring**: Add error tracking

### **Hosting Options**
- **Vercel**: Frontend deployment
- **Heroku**: Backend deployment
- **AWS**: Full-stack deployment
- **DigitalOcean**: VPS deployment

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### **Code Style**
- **JavaScript**: ES6+ syntax
- **CSS**: Tailwind utility classes
- **Comments**: Clear documentation
- **Error Handling**: Comprehensive

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4o-mini API
- **Stripe** for payment processing
- **Tailwind CSS** for styling framework
- **jsPDF** for PDF generation
- **React** for UI framework

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation files
- Review the troubleshooting guides

---

**Built with ❤️ using modern web technologies** 