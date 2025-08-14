# 🚀 AI Mock Interview Platform

A cutting-edge web application that leverages artificial intelligence to provide personalized mock interview experiences. Practice with AI-generated questions, receive instant feedback, and build confidence for your next job interview.

## ✨ Features

- **🤖 AI-Powered Interviews**: Generate personalized interview questions using Google's Generative AI
- **🎯 Role-Specific Questions**: Tailored questions for different job positions and industries
- **📹 Video Recording**: Practice with webcam integration for realistic interview simulation
- **🎤 Speech-to-Text**: Convert your spoken responses to text for better analysis
- **📊 Performance Analytics**: Track your progress and identify areas for improvement
- **🔐 Secure Authentication**: Built-in user management with Clerk authentication
- **📱 Responsive Design**: Optimized for desktop and mobile devices
- **🎨 Modern UI/UX**: Beautiful interface built with Tailwind CSS and Radix UI

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives

### Backend & Services
- **Firebase** - Database and backend services
- **Google Generative AI** - AI-powered question generation
- **Clerk** - Authentication and user management

### Additional Libraries
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Firebase project setup
- Google AI API key
- Clerk authentication setup

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Ai-Mock-Interview
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

4. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # Base UI components (Button, etc.)
│   ├── container.tsx  # Layout container component
│   ├── header.tsx     # Navigation header
│   └── footer.tsx     # Footer component
├── layouts/            # Layout components
│   ├── auth-layout.tsx    # Authentication layout
│   ├── main-layout.tsx    # Main application layout
│   ├── protected-layout.tsx # Protected routes layout
│   └── public-layout.tsx   # Public routes layout
├── routes/             # Page components
│   ├── home.tsx           # Landing page
│   ├── sign-in.tsx        # Sign in page
│   ├── sign-up.tsx        # Sign up page
│   ├── dashboard.tsx      # User dashboard
│   ├── create-edit-page.tsx # Interview creation/editing
│   ├── mock-interview-page.tsx # Interview simulation
│   └── feedback.tsx       # Interview feedback
├── lib/                # Utility functions and helpers
│   ├── helper.ts       # Helper functions
│   └── utils.ts        # Utility functions
└── main.tsx            # Application entry point
```

## 🔧 Available Scripts

- **`pnpm dev`** - Start development server
- **`pnpm build`** - Build for production
- **`pnpm preview`** - Preview production build
- **`pnpm lint`** - Run ESLint

## 🎯 How to Use

1. **Sign Up/Login**: Create an account or sign in to access the platform
2. **Generate Interview**: Use the AI to generate role-specific interview questions
3. **Practice**: Record yourself answering questions using the webcam
4. **Get Feedback**: Receive instant AI-powered feedback on your responses
5. **Track Progress**: Monitor your improvement over time

## 🔐 Authentication

The application uses Clerk for secure user authentication. Users can:
- Sign up with email/password
- Sign in with existing credentials
- Access protected routes after authentication

## 🗄️ Database

Firebase Firestore is used to store:
- User profiles and preferences
- Interview sessions and responses
- Performance metrics and feedback
- Generated questions and templates

## 🎨 UI Components

Built with a modern design system using:
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Lucide React** for consistent icons
- **Custom components** for specific functionality

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile devices

## 🚀 Deployment


### Deploy to Firebase Hosting

Deployed Link :-https://ai-mock-interview-1a75a.web.app


### Firebase Configuration Files

Your project should include these Firebase configuration files:

- **`.firebaserc`** - Project configuration
- **`firebase.json`** - Hosting and build settings
- **`firestore.rules`** - Database security rules (if using Firestore)

### Environment Variables for Production

Make sure to set these environment variables in your Firebase project:
- Firebase configuration (already configured)
- Google AI API key
- Clerk publishable key

### Alternative: Deploy to Vercel/Netlify
1. Build the project
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables in your hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/Ai-Mock-Interview/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- **Google Generative AI** for intelligent question generation
- **Clerk** for secure authentication
- **Firebase** for reliable backend services
- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS approach

---

**Built with ❤️ using modern web technologies**
