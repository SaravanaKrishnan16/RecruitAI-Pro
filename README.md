# 🎤 Mock Interview Assistant

A modern AI-powered mock interview platform built with React and AWS services. Practice interviews with real-time speech recognition, AI evaluation, and personalized feedback.

![Interview Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![AWS](https://img.shields.io/badge/AWS-Integrated-orange)

## ✨ Features

- 🎙️ **Real-time Speech Recognition** - Capture answers with browser speech-to-text
- 🤖 **AI-Powered Evaluation** - Amazon Q transcription + MCP scoring system
- 📊 **Detailed Analytics** - Technical, Communication, and Completeness scores
- 💼 **Role-Specific Questions** - Frontend, Backend, Data Science, DevOps, and more
- ⏱️ **Timed Sessions** - 5-minute timer per question with progress tracking
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 💾 **Local Storage** - No backend required, data stored locally

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Chrome browser (recommended for speech recognition)
- Microphone access

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd mock-interview-assistant
```

2. **Install dependencies**
```bash
cd frontend
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Open your browser**
Navigate to `http://localhost:3000`

## 🎯 How to Use

1. **Select Your Role** - Choose from 10+ professional roles
2. **Upload Resume** (Optional) - PDF/DOCX parsing for personalized questions
3. **Start Interview** - Click "Start Recording" and speak your answers
4. **Get AI Feedback** - Receive detailed scores and improvement suggestions
5. **View Results** - Comprehensive analysis with strengths and weaknesses

## 🏗️ Project Structure

```
mock-interview-assistant/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Main application pages
│   │   ├── data/            # Role definitions and questions
│   │   ├── services/        # AWS service integrations
│   │   └── utils/           # Helper functions
│   ├── public/              # Static assets
│   └── package.json         # Dependencies and scripts
├── infrastructure/          # AWS CDK infrastructure (optional)
└── backend/                # API Gateway simulation (optional)
```

## 🎨 Available Roles

- **Frontend Developer** - React, JavaScript, CSS, UI/UX
- **Backend Developer** - APIs, Databases, System Design
- **Data Scientist** - ML, Statistics, Python, Analytics
- **DevOps Engineer** - CI/CD, Infrastructure, Automation
- **Mobile Developer** - React Native, Flutter, iOS, Android
- **Product Manager** - Strategy, Roadmaps, Stakeholder Management
- **UI/UX Designer** - Design Process, User Research, Prototyping
- **QA Engineer** - Testing Strategies, Automation, Quality Assurance
- **Cybersecurity Analyst** - Security Principles, Risk Assessment
- **Full Stack Developer** - End-to-end development skills

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://localhost:8001
REACT_APP_AWS_REGION=us-east-1
```

### Speech Recognition Settings
The app uses the Web Speech API (webkitSpeechRecognition):
- **Language**: English (US)
- **Continuous**: Yes
- **Interim Results**: Yes
- **Browser Support**: Chrome, Edge, Safari

## 📊 Scoring System

### Evaluation Criteria
- **Technical Score** (0-100) - Domain knowledge and terminology
- **Communication Score** (0-100) - Clarity and structure
- **Completeness Score** (0-100) - Depth and coverage
- **Overall Score** - Average of all three scores

### AI Processing
1. **Amazon Q Transcription** - Converts speech to text
2. **MCP Scoring** - Analyzes content for keywords and concepts
3. **Feedback Generation** - Provides improvement suggestions

## 🛠️ Development

### Available Scripts
```bash
npm start          # Start development server
npm build          # Build for production
npm test           # Run test suite
npm run eject      # Eject from Create React App
```

### Adding New Roles
1. Edit `frontend/src/data/roles.js`
2. Add role definition with questions
3. Update expected answers in `Interview.js`

### Customizing Evaluation
Modify the scoring algorithm in `frontend/src/pages/Interview.js`:
- `evaluateAnswer()` - Main evaluation logic
- `calculateKeywordMatch()` - Keyword scoring
- `calculateConceptMatch()` - Concept coverage
- `generateDetailedFeedback()` - Feedback generation

## 🌐 Browser Compatibility

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Speech Recognition | ✅ | ✅ | ❌ | ✅ |
| Media Recorder | ✅ | ✅ | ✅ | ✅ |
| Local Storage | ✅ | ✅ | ✅ | ✅ |

**Recommended**: Chrome for the best experience

## 🚀 Deployment

### Netlify/Vercel
```bash
npm run build
# Upload build/ folder to your hosting platform
```

### AWS Amplify
```bash
# Connect your GitHub repository to AWS Amplify
# Amplify will automatically build and deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Speech Recognition Not Working**
- Use Chrome browser
- Allow microphone permissions
- Check microphone hardware
- Ensure stable internet connection

**Low Scores**
- Speak clearly and loudly
- Use technical terminology
- Provide specific examples
- Structure your answers well

**Build Errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version (18+)

## 📞 Support

For issues and questions:
- Check browser console for errors
- Verify microphone permissions
- Ensure Chrome browser is being used
- Review the troubleshooting section above

---

**Built with ❤️ using React, AWS, and modern web technologies**

🌟 **Star this repo if you found it helpful!**