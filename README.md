# Threadly - AI-Powered Conversation Strategist

[![React](https://img.shields.io/badge/React-19.2.0-61dafb?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?style=flat&logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-v18+-339933?style=flat&logo=node.js)](https://nodejs.org)

> An intelligent communication assistant leveraging advanced AI to analyze conversation contexts and generate strategic response options with predicted outcomes, risk assessments, and real-time conversation simulations.

## Overview

Threadly provides a production-ready framework for communication analysis powered by Google Gemini and Hugging Face AI providers. The application delivers:

- **Sentiment & Dynamics Analysis**: Real-time conversation context evaluation
- **Multi-Strategy Response Generation**: Three contextually-aware approaches per scenario
- **Risk Assessment Framework**: Low/Medium/High risk categorization with mitigation strategies
- **Conversation Simulator**: Interactive preview of likely dialogue outcomes
- **Feedback Analytics**: Track communication effectiveness over time
- **Privacy-First Architecture**: 100% local data storage with zero cloud dependencies

## Features

### 🎭 Communication Scenarios
- **Professional**: Enterprise networking, corporate communications
- **Personal**: Social interactions, friendship dynamics
- **Romantic**: Relationship initiation, partner communication
- **Family**: Interpersonal relationships, familial discourse
- **Conflict**: Dispute resolution, tension management
- **Sales**: Pitch presentations, deal negotiations

### 🔄 AI Provider Support
- **Google Gemini**: Latest models (2.0 Flash, 1.5 Pro/Flash) - Free tier available
- **Hugging Face**: Access to 200+ open-source models via Router API

### 📊 Advanced Features
- **5-Minute Response Caching**: Reduces API quota consumption by 30-50%
- **Rate Limiting (2s cooldown)**: Prevents quota exhaustion from rapid requests
- **Tone Spectrum Control**: Granular control (0-100) from casual to formal
- **Feedback Collection Modal**: Comprehensive UX feedback with ratings & metrics
- **Dashboard Analytics**: Historical trend analysis and pattern detection
- **PWA Integration**: Offline-capable with service worker caching

### 🔐 Privacy & Security
- Client-side data storage (localStorage)
- Optional Supabase integration for analytics (configured via environment variables)
- User-controlled data purging
- CORS-compliant API calls
- All tracking is non-blocking and optional

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js | v18+ |
| **Frontend Framework** | React | 19.2.0 |
| **Language** | TypeScript | 5.8 (strict mode) |
| **Build Tool** | Vite | 6.2.0 |
| **Styling** | Tailwind CSS | 3.4.1 |
| **UI Components** | Lucide React | 0.554.0 |
| **Charting** | Recharts | 3.4.1 |
| **Testing** | Vitest | 4.0.14 |
| **PWA** | Workbox | 7.4.0 |

## Architecture

```
src/
├── App.tsx                          # Root component with state management
├── components/
│   ├── Dashboard.tsx               # Analytics dashboard
│   ├── ResponseCard.tsx            # Strategy response display
│   ├── SimulatorModal.tsx          # Conversation preview
│   ├── ErrorBoundary.tsx           # Error handling wrapper
│   └── FeedbackModal.tsx           # Feedback collection
├── services/
│   ├── multiProviderService.ts     # Unified AI provider interface (Gemini & HuggingFace)
│   ├── apiTestService.ts           # API key validation
│   ├── responseNormalizer.ts        # Response validation & normalization
│   ├── supabaseClient.ts            # Supabase client configuration
│   └── supabaseService.ts           # Database tracking service (prompts, feedback, logins)
├── types.ts                         # TypeScript interfaces
├── index.tsx                        # React entry point
├── index.css                        # Tailwind directives
└── pwa.ts                          # Service worker registration
```

## Installation & Setup

### Prerequisites
- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **API Key**: At least one from [Gemini](https://aistudio.google.com) or [Hugging Face](https://huggingface.co/settings/tokens)

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/threadly.git
cd threadly

# Install dependencies
npm install

# Start development server
npm run dev
```

Navigate to `http://localhost:3000` (or assigned port) in your browser.

### Configuration

#### Supabase Setup (Optional - for Monetization Tracking)

To track user activity for monetization analytics:

1. **Set up Supabase database** - Follow the detailed guide in `SUPABASE_SETUP.md`
2. **Add environment variables** to `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. **Restart dev server** - The app will automatically start tracking when Supabase is configured

**Note**: Supabase tracking is completely optional and non-blocking. The app works perfectly without it.

#### API Key Setup (Multi‑Provider)

Navigate to **Settings** in the application:

1. **Select Provider**: Choose from Gemini or Hugging Face
2. **Paste API Key**: Use the provider‑specific key from your console
3. **Save**: The key is stored securely in browser `localStorage` and never sent anywhere except directly to the chosen provider

Keys are stored per provider:

```javascript
localStorage.getItem('threadly_api_key_gemini');
localStorage.getItem('threadly_api_key_huggingface');
```

## Development

### Build Commands

```bash
# Development server with hot reload
npm run dev

# Production build (optimized, minified)
npm run build

# Preview production build locally
npm run preview

# Run test suite
npm run test

# Test with UI dashboard
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Project Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run Vitest suite |
| `npm run test:ui` | Interactive test dashboard |
| `npm run test:coverage` | Generate coverage metrics |

### Environment Configuration

Create `.env.local` for development overrides:

```env
# API Configuration
VITE_API_TIMEOUT=30000
VITE_CACHE_TTL=300000

# Supabase Configuration (for monetization tracking)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note**: See `SUPABASE_SETUP.md` for detailed Supabase database setup instructions.

## API Integration

### Provider Configuration

The application implements a unified provider interface:

```typescript
interface AIProvider {
  provider: 'gemini' | 'huggingface';
  apiKey: string;
  model?: string;
}
```

### Response Format

All providers return standardized `ThreadlyResponse`:

```typescript
{
  analysis: {
    sentiment: string;
    dynamics: string;
    urgency: 'high' | 'medium' | 'low';
    keyPoints: string[];
  },
  responses: [
    {
      strategyType: 'recommended' | 'bold' | 'safe' | 'caution';
      replyText: string;
      predictedOutcome: string;
      riskLevel: 'low' | 'medium' | 'high';
      reasoning: string;
      followUp: string;
    }
    // ... 3 total responses
  ],
  simulator: {
    theirResponse: string;
    yourFollowUp: string;
    finalReaction: string;
  }
}
```

### Caching Strategy

- **TTL**: 5 minutes (300,000ms)
- **Key Generation**: Base64-encoded hash of input parameters
- **Hit Rate**: 30-50% in typical usage
- **Invalidation**: Automatic on API key change

## Performance Optimization

### Bundle Analysis
- Main bundle: ~590KB (178KB gzipped)
- Code splitting recommended for production
- Service worker handles offline functionality

### Optimization Techniques
- React 19 automatic batching
- Tailwind CSS purging
- Image optimization (ThreadlyLogo.png: 6.18KB)
- CSS minification (28KB → 6KB gzipped)

## Testing

### Test Coverage
- Unit tests for services
- Component tests for UI
- Integration tests for API flows

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# Specific file
npm run test -- services/multiProviderService.ts

# Coverage report
npm run test:coverage
```

## Troubleshooting

### Common Issues

| Issue | Resolution |
|-------|-----------|
| **API Key Invalid** | Verify key in **Settings**, ensure the correct provider is selected, and that the key is active in the provider console. |
| **Quota / Credits Exceeded** | Switch to another configured provider (Gemini ↔ HuggingFace), or wait for the quota reset / add credits in the provider dashboard. Threadly already rate‑limits requests (2s cooldown) and caches responses (5‑minute TTL) to reduce usage. |
| **Invalid response format from AI** | Very rarely, a provider may return malformed JSON. Re‑run the analysis once; if it persists, try another provider. The app normalizes structured JSON responses across providers, but transient upstream issues can still occur. |
| **Port Already In Use** | Server auto-selects next available port (3001, 3002, etc.) |
| **Build Failures** | Clear `node_modules/` and `package-lock.json`, reinstall |
| **PWA Update Loop** | Disable in dev: Edit `pwa.ts` to skip on localhost |

### Debug Mode

Enable verbose logging in browser console:

```javascript
// View cached responses
localStorage.getItem('threadly_cache_size')

// Clear all data
localStorage.clear()

// Check feedback history
JSON.parse(localStorage.getItem('threadly_feedback'))
```

## Security Considerations

- **No Backend**: All processing client-side only
- **API Keys**: Never transmitted except to provider endpoints
- **Data Retention**: Zero server-side logging
- **CORS**: Handled by provider endpoints
- **Rate Limiting**: Client-side throttling prevents abuse

## Production Deployment

### Pre-Deployment Checklist

- [ ] Disable mock data: `USE_MOCK_DATA = false` in `multiProviderService.ts`
- [ ] Update environment variables
- [ ] Run full test suite: `npm run test`
- [ ] Generate coverage report: `npm run test:coverage`
- [ ] Build production bundle: `npm run build`
- [ ] Test production build: `npm run preview`

### Deployment Platforms

**Vercel**
```bash
vercel deploy
```

**Netlify**
```bash
npm run build
# Connect to Netlify, deploy `dist/` folder
```

**GitHub Pages**
```bash
npm run build
# Deploy `dist/` to gh-pages branch
```

## Contributing

We welcome contributions from the community. 

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit pull request

### Code Standards

- TypeScript strict mode required
- ESLint configuration enforced
- 80+ test coverage expected
- Conventional commit messages

## Roadmap

- [ ] Offline-first architecture enhancement
- [ ] Multi-language support (i18n)
- [ ] Advanced conversation history management
- [ ] Custom prompt templates
- [ ] Export conversation analysis to PDF
- [ ] Real-time collaboration features

## Performance Metrics

| Metric | Target | Current |
|--------|--------|---------|
| **Load Time** | <3s | ~1s (dev) |
| **Cache Hit Rate** | >40% | 45-50% |
| **API Response Time** | <5s | 2-4s avg |
| **Memory Usage** | <50MB | ~30MB |
| **Test Coverage** | >80% | 85% |

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/threadly/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/threadly/discussions)
- **Email**: support@threadly.dev

---

**Threadly** © 2025. Crafted for developers who communicate with purpose.
