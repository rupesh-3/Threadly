# 💬 Threadly - AI-Powered Conversation Strategist

Threadly is an intelligent communication assistant that analyzes conversation contexts and generates strategic response options with predicted outcomes. Get AI-driven coaching on how to communicate effectively in any scenario.

<img width="1358" height="2663" alt="image" src="https://github.com/user-attachments/assets/bf54677d-e58f-4e39-a056-029d48798a54" />

## 🎯 What is Threadly?

Threadly uses advanced AI (Google Gemini) to help you navigate complex conversations by:
- **Analyzing** the sentiment, dynamics, and urgency of your conversation
- **Generating** 3 strategic response options with different approaches
- **Predicting** likely outcomes and potential risks
- **Simulating** how conversations might unfold
- **Tracking** your communication patterns and outcomes

Perfect for professional networking, personal relationships, conflict resolution, romantic messaging, family discussions, and sales pitches.

## ✨ Key Features

### 🎭 6 Communication Scenarios
- **Professional**: Work & networking conversations
- **Personal**: Friends & social interactions
- **Romantic**: Dating & partner communication
- **Family**: Parent & relative discussions
- **Conflict**: Tension & dispute resolution
- **Sales**: Deals & pitch presentations

### 🎚️ Tone Control
Adjust your tone on a spectrum from casual (0) to formal (100) to match the conversation style you need.

### 🧠 Intelligent Response Generation
Each response includes:
- Strategy type (Recommended, Bold, Safe, or Caution)
- The actual message to send
- Predicted outcome of your response
- Risk assessment (Low/Medium/High)
- Detailed reasoning and follow-up guidance

### 🎬 Conversation Simulator
Preview how conversations might unfold with:
- Simulated response from the other person
- Suggested follow-up messages
- Predicted final reaction

### 📊 Dashboard & Analytics
- View your communication history
- Track response effectiveness
- Analyze patterns across scenarios
- Monitor feedback outcomes

<img width="1358" height="739" alt="image" src="https://github.com/user-attachments/assets/5ab97b6e-1f07-4bf7-b56c-7041ad62dc23" />

### 💾 Local Data Storage
- Stores your API key securely on your device using browser localStorage
- No cloud or backend storage — your data stays on your device only
- Lets you clear all saved data instantly using Purge Local Data
- Shows the number of stored records for transparency
- Ensures privacy-focused behaviour: no syncing, no tracking, no external logging

<img width="1358" height="886" alt="image" src="https://github.com/user-attachments/assets/280707db-37f1-4f8d-99a7-a5e6f2fbcb6c" />

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **Google Gemini API Key** (free tier available at [Google AI Studio](https://aistudio.google.com))

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd threadly
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your API key:**
   - Create a `.env.local` file in the project root
   - Add your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to `http://localhost:3000` to start using Threadly

## 📦 Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

## 🏗️ Project Structure

```
threadly/
├── App.tsx                 # Main application component
├── components/
│   ├── Dashboard.tsx      # Analytics & history view
│   ├── ResponseCard.tsx   # Individual response display
│   └── SimulatorModal.tsx # Conversation simulator
├── services/
│   └── geminiService.ts   # Google Gemini API integration
├── types.ts               # TypeScript type definitions
├── index.tsx              # React entry point
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Project dependencies
```

## 🛠️ Technologies Used

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **AI Integration**: Google Genai SDK
- **UI Components**: Lucide React Icons
- **Charting**: Recharts
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

## 🔧 Configuration

### Gemini API Setup
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Create API Key"
3. Copy your API key and add it to `.env.local`

### Environment Variables
```
VITE_GEMINI_API_KEY=your_key_here
```

The `VITE_` prefix ensures the variable is accessible in the frontend during build time.

## 💡 How to Use

1. **Select a Scenario**: Choose the type of conversation (Professional, Personal, etc.)
2. **Adjust Tone**: Set your preferred communication tone (Casual to Formal)
3. **Provide Context**: Add any relevant background information
4. **Paste History**: Include the conversation history you need help with
5. **Generate**: Click to analyze and get response suggestions
6. **Review Options**: See 3 different strategic approaches with risk assessments
7. **Simulate**: Test how conversations might unfold before sending
8. **Track Results**: Log how the response actually went for learning

## 📊 Dashboard Features

- **Response History**: See all your analyzed conversations
- **Feedback Analytics**: View outcomes of your used responses
- **Pattern Analysis**: Identify trends in your communication
- **Most Copied**: See which responses you trust most

## 🔐 Privacy & Data

- All feedback and history is stored locally in your browser
- No conversation data is sent to external servers
- Only your message and context go to Google Gemini API for analysis
- Clear data anytime from the Settings menu

## ⚠️ Important Notes

- The Gemini API may have rate limits depending on your account tier
- API usage may be subject to Google's terms of service
- This tool provides suggestions - use your judgment before sending messages
- Test conversations with the simulator before committing to real messages

## 🐛 Troubleshooting

### "API Key is missing or invalid"
- Check that `.env.local` exists in the project root
- Verify `VITE_GEMINI_API_KEY` is set correctly
- Restart the dev server after updating `.env.local`

### Port 3000 already in use
- Change the port in `vite.config.ts`
- Or kill the process using port 3000

### Dependencies won't install
- Delete `node_modules/` and `package-lock.json`
- Run `npm install` again

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and enhancement requests.

## 📧 Support

For questions or issues, please open a GitHub issue in this repository.

---

**Made with ❤️ to help you communicate better.**
