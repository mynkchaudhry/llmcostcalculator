# 🔢 LLM Price Calculator

> A comprehensive web application for calculating and comparing costs across multiple AI models with professional cost analysis and reporting features.

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)

## 📸 Application Screenshots

<div align="center">

### LLM Cost Calculator
![LLM Cost Calculator](Screenshot%202025-07-23%20at%203.37.05%20AM.png)

### Usage Estimator
![Usage Estimator](Screenshot%202025-07-23%20at%203.37.26%20AM.png)

### Model Comparison
![Model Comparison](Screenshot%202025-07-23%20at%203.37.39%20AM.png)

### Comprehensive Analysis
![Comprehensive Analysis](Screenshot%202025-07-23%20at%203.37.50%20AM.png)

### Model Management
![Model Management](Screenshot%202025-07-23%20at%203.38.01%20AM.png)

### Personal Assistant Chat
![Personal Assistant Chat](Screenshot%202025-07-23%20at%203.38.17%20AM.png)

</div>

## ✨ Current Features

### 🧮 LLM Cost Calculator
- **Real-time pricing calculations** for 25+ AI models
- **Token-based cost estimation** with live preview
- **Provider comparison** (OpenAI, Anthropic, Google, Meta, Mistral, etc.)
- **Usage estimation** with monthly/yearly projections
- **PDF export** for cost reports

### 📊 Comprehensive Comparison
- **Advanced analytics** with cost distribution analysis
- **Smart insights** and efficiency rankings
- **Interactive charts** and data visualization
- **Export functionality** for professional reports
- **Multi-model performance analysis**

### 🧠 Model Management
- **Custom model addition** with detailed parameters
- **Favorites system** for quick access
- **Model search and filtering**
- **Import/export model configurations**
- **Usage tracking and analytics**

### 💬 Personal Assistant Chatbot
- **Pricing guidance** and cost optimization tips
- **Model recommendations** based on use cases
- **Interactive Q&A** for technical decisions
- **Context-aware responses** for LLM selection

### 👤 User Profile & Settings
- **Authentication** via GitHub OAuth
- **Personal preferences** and saved configurations
- **Usage history** and cost tracking
- **Export data** and reporting features

### 🎨 Modern UI/UX
- **Glassmorphism design** with backdrop blur effects
- **Responsive layout** with mobile-first approach
- **Dark theme** with gradient backgrounds
- **Smooth animations** powered by Framer Motion
- **Accessible design** (WCAG 2.1 compliant)

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Zustand** - State management
- **React Hook Form** - Form handling

### Backend & Database
- **MongoDB Atlas** - Document database
- **NextAuth.js** - Authentication
- **GitHub OAuth** - Social login

### AI & APIs
- **jsPDF** - PDF generation and reporting
- **Local AI responses** - Simple chatbot functionality

### UI Components
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **React Markdown** - Markdown rendering

## 📦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- GitHub OAuth app

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mynkchaudhry/llmcostcalculator.git
   cd llmcostcalculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your database URL and OAuth credentials:
   ```bash
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   GITHUB_ID=your_github_oauth_id
   GITHUB_SECRET=your_github_oauth_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Setup

### Required Setup

#### 1. MongoDB Atlas
- Sign up at [mongodb.com](https://www.mongodb.com/)
- Create a cluster and get connection string

#### 2. GitHub OAuth
- Go to GitHub Settings → Developer settings → OAuth Apps
- Create new OAuth app with:
  - Homepage URL: `http://localhost:3000`
  - Callback URL: `http://localhost:3000/api/auth/callback/github`

### NextAuth Configuration
Generate a secure secret:
```bash
openssl rand -base64 32
```

## 📱 Usage Guide

### 1. LLM Cost Calculator
- Select models from dropdown
- Enter input/output token counts
- View real-time cost calculations
- Compare multiple models side-by-side
- Export results to PDF

### 2. Model Comparison
- Add multiple models to comparison table
- View advanced analytics and charts
- Export detailed reports to PDF
- Get smart insights and recommendations
- Analyze cost efficiency rankings

### 3. Usage Estimator
- Calculate daily, monthly, and yearly costs
- Include conversation history in calculations
- Export usage estimates to PDF
- Get optimization recommendations
- Track different usage scenarios

### 4. Personal Assistant
- Get pricing guidance and tips
- Ask questions about model selection
- Receive context-aware responses
- Access cost optimization advice

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   └── auth/              # Authentication components
├── data/                  # Static data (models, GPUs, etc.)
├── lib/                   # Utilities and configurations
├── services/              # API services and integrations
├── stores/                # Zustand state management
├── types/                 # TypeScript type definitions
└── utils/                 # Helper functions
```

## 🔬 Key Features Deep Dive

### Intelligent Cost Analysis
- Smart insights and recommendations based on usage patterns
- Advanced analytics with cost distribution analysis
- Efficiency rankings and optimization suggestions

### Precise Calculations
- **Token Pricing**: Real-time calculations with provider-specific rates
- **Usage Projections**: Daily, monthly, and yearly cost estimates
- **Comparison Analytics**: Multi-model efficiency and cost analysis

### Responsive Design
- Mobile-first approach with collapsible sidebar
- Optimized for screens from 320px to 4K
- Touch-friendly interactions on mobile devices

## 🚦 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Database
npm run db:seed      # Seed database with sample data
```

## 📊 Pre-configured Data

### LLM Models (25+)
- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus/Sonnet/Haiku
- **Google**: Gemini Pro, Gemini Pro Vision
- **Meta**: Llama 2/3 (7B, 13B, 70B)
- **Mistral**: Mixtral 8x7B, Mistral Medium/Large
- **And more**: Yi, Phi, Gemma, Falcon models

### Pre-configured Models
All major LLM providers with up-to-date pricing and specifications

## 🔒 Security & Privacy

- Secure authentication with NextAuth.js
- API keys stored as environment variables
- MongoDB connection with authentication
- Input validation and sanitization
- No sensitive data logged or stored

## 🌍 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Docker
```bash
docker build -t llm-calculator .
docker run -p 3000:3000 llm-calculator
```

### Manual Deployment
```bash
npm run build
npm start
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Development Guidelines
- Use TypeScript for all new code
- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Green scores for all pages
- **Bundle Size**: Optimized with Next.js 15
- **Loading Time**: < 2s first contentful paint

## 🐛 Known Issues

- PDF export may timeout on large datasets
- Mobile keyboard may affect chatbot positioning
- Search results limited to 5 per query

## 📋 Roadmap

### Current Features (v1.0)
- ✅ LLM Cost Calculator with 25+ models
- ✅ Comprehensive model comparison and analytics
- ✅ Usage estimation with PDF export
- ✅ Model management system
- ✅ Personal assistant chatbot
- ✅ GitHub OAuth authentication

### Upcoming Features (v2.0)
- [ ] **Vector Database Calculator** - Cost comparison for vector databases
  - Pinecone, Milvus, Qdrant, Chroma, Weaviate, pgvector
  - Managed vs Self-hosted cost analysis
  - Storage and operations cost breakdown
- [ ] **GPU vRAM Calculator** - GPU requirements for LLM deployment
  - vRAM calculations for different model sizes
  - GPU recommendations (NVIDIA, AMD, Intel, Apple)
  - Optimization strategies for deployment

### Future Enhancements (v3.0+)
- [ ] Multi-language support
- [ ] Advanced cost forecasting with ML predictions
- [ ] Custom model training cost calculator
- [ ] API rate limiting dashboard
- [ ] Webhook integrations for real-time updates
- [ ] Enterprise analytics and reporting

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mynkchaudhry/llmcostcalculator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mynkchaudhry/llmcostcalculator/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vercel** for hosting and deployment
- **MongoDB Atlas** for database services
- **Next.js team** for the amazing framework
- Open source community for various libraries and tools

---

**Built with ❤️ for the AI/ML developer community**

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mynkchaudhry/llmcostcalculator)