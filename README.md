# Gemini Chat

A modern AI-powered chat application built with Next.js 15, featuring dark/light mode, real-time messaging, and Google Gemini AI integration.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **AI Integration**: Google Gemini AI API
- **State Management**: Zustand for lightweight global state
- **Styling**: Tailwind CSS with dark/light mode support
- **Form Validation**: React Hook Form + Zod
- **Notifications**: react-hot-toast
- **Icons**: react-icons
- **Animations**: framer-motion
- **Markdown Rendering**: react-markdown with syntax highlighting

## ✨ Features

- 🤖 **AI-Powered Chat**: Integration with Google Gemini AI
- 🌓 **Dark/Light Mode**: Toggle between themes with persistent preference
- 💬 **Real-time Messaging**: Send and receive messages with AI responses
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🎨 **Smooth Animations**: Framer Motion animations for better UX
- 📝 **Markdown Support**: Rich text rendering with code syntax highlighting
- 🔍 **Search Functionality**: Search through chatrooms
- 📁 **File Attachments**: Support for images and documents
- ⚡ **Performance Optimized**: Built with Next.js 15 and modern React

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd gemini-chat

# Install dependencies
npm install

# Set up environment variables
cp env.template .env.local
# Edit .env.local and add your Gemini API key

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Required: Get your API key from https://makersuite.google.com/app/apikey
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Model configuration
NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with theme provider
│   ├── page.tsx           # Home page with auth
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles with theme variables
├── components/             # React components
│   ├── Chat.tsx           # Main chat interface
│   ├── ChatForm.tsx       # Message input with attachments
│   ├── ChatMessages.tsx   # Messages with markdown support
│   ├── ChatroomList.tsx   # Chatroom management
│   ├── ThemeToggle.tsx    # Dark/light mode toggle
│   └── ...                # Other UI components
└── lib/                   # Utility libraries
    ├── store.ts           # Zustand stores
    ├── theme-store.ts     # Theme state management
    ├── gemini-api.ts      # Gemini AI integration
    └── ...                # Other utilities
```

## 🎯 Key Features

### AI Integration
- **Google Gemini AI**: Powered by Google's latest AI models
- **Multiple Models**: Support for Gemini 1.5 Flash, Pro, and 2.0 Flash
- **Real-time Responses**: Streaming AI responses with typing indicators
- **Error Handling**: Graceful handling of API limits and errors

### Theme System
- **Dark/Light Mode**: Complete theme support with CSS variables
- **Persistent Preference**: Theme choice saved in localStorage
- **Smooth Transitions**: Animated theme switching
- **Accessible Design**: High contrast and proper color usage

### Chat Features
- **Multiple Chatrooms**: Organize conversations by topic
- **Message History**: Persistent chat history with pagination
- **File Attachments**: Support for images and documents
- **Markdown Support**: Rich text with code syntax highlighting
- **Search**: Find messages and chatrooms quickly

## 🛠️ Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 🚀 Deployment

### GitHub Setup

1. **Initialize Git Repository**:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Create GitHub Repository**:
   - Go to GitHub and create a new repository
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/yourusername/gemini-chat.git
git branch -M main
git push -u origin main
```

### Vercel Deployment

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**:
   - In your Vercel project dashboard, go to Settings → Environment Variables
   - Add the following variables:
     ```
     NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
     NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
     ```

3. **Deploy**:
   - Vercel will automatically detect Next.js and deploy
   - Your app will be available at `https://your-project.vercel.app`

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key
NEXT_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
```

## 📦 Dependencies

### Core Dependencies
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework

### State & Forms
- **Zustand**: Lightweight state management
- **React Hook Form**: Form handling with validation
- **Zod**: TypeScript-first schema validation

### UI & UX
- **Framer Motion**: Animation library
- **React Icons**: Icon library
- **React Hot Toast**: Toast notifications
- **React Markdown**: Markdown rendering

### AI Integration
- **@google/generative-ai**: Official Google Gemini SDK

## 🔧 Customization

### Adding New Features
- **New Components**: Add to `src/components/`
- **State Logic**: Extend Zustand stores in `src/lib/`
- **API Integration**: Add to `src/lib/gemini-api.ts`
- **Styling**: Use Tailwind classes or add custom CSS

### Theme Customization
The app uses CSS variables for theming. Modify `src/app/globals.css`:

```css
:root {
  --background: #1a1a1a;
  --foreground: #ffffff;
  /* Add more variables */
}

.light {
  --background: #ffffff;
  --foreground: #1f2937;
  /* Light mode variables */
}
```

## 🐛 Troubleshooting

### Common Issues

1. **API Key Not Working**:
   - Ensure your Gemini API key is valid
   - Check if you have sufficient quota
   - Verify the key is set in environment variables

2. **Build Errors**:
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript errors with `npm run lint`
   - Ensure all environment variables are set

3. **Theme Not Working**:
   - Clear localStorage and refresh
   - Check browser console for errors
   - Verify CSS variables are properly defined

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for the AI capabilities
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [Vercel](https://vercel.com/) for the deployment platform

---

**Note**: Make sure to replace `your-repo-url` and `yourusername` with your actual GitHub repository URL and username.
