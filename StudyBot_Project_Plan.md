# StudyMentor - AI-Powered Study Assistant

## Project Overview

StudyMentor is a comprehensive study assistant application that leverages AI to help students learn more effectively. It integrates with Canvas LMS, provides adaptive learning features, and offers multiple study techniques including flashcards, interleaved practice, and AI-powered tutoring.

## Core Features

### 🎯 **Learning Management**
- **Canvas Integration**: Seamless sync with Canvas courses and assignments
- **Document Processing**: Upload and analyze study materials (PDF, Word, text)
- **Concept Extraction**: AI-powered extraction of key concepts from documents
- **Progress Tracking**: Monitor learning progress across all subjects

### 🧠 **AI-Powered Learning**
- **Adaptive Tutoring**: Personalized study sessions based on learning style
- **Active Recall**: AI-generated questions to test knowledge retention
- **Feynman Technique**: AI helps explain complex concepts in simple terms
- **Interleaved Practice**: Mixed topic practice for better retention

### 📚 **Study Tools**
- **Smart Flashcards**: Spaced repetition with SM-2 algorithm
- **Learning Assessments**: Identify your learning style preferences
- **Study Sessions**: Timed, focused study periods with progress tracking
- **Concept Maps**: Visual organization of related concepts

### 🔐 **Authentication & Security**
- **Session-based Authentication**: Secure user sessions
- **Multiple Login Options**: Demo, local, and OAuth providers (Google, GitHub)
- **Canvas OAuth**: Secure integration with Canvas LMS
- **Rate Limiting**: Protection against abuse

## Technical Architecture

### **Frontend Stack**
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **React Query** for data fetching

### **Backend Stack**
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** with Drizzle ORM
- **Session-based Authentication** with multiple providers
- **OpenAI API** integration
- **Canvas API** integration

### **Database Schema**
- **Users**: Authentication and profile data
- **Courses**: Canvas course information
- **Assignments**: Canvas assignment tracking
- **Documents**: Uploaded study materials
- **Concepts**: Extracted learning concepts
- **Flashcards**: Spaced repetition cards
- **Learning Assessments**: User learning style data
- **Chat Sessions**: AI interaction history
- **Interleaved Sessions**: Mixed topic practice sessions

### **Security Features**
- **Helmet.js** for security headers
- **Rate limiting** for API protection
- **Input validation** with Zod schemas
- **CORS configuration** for cross-origin requests
- **Session management** with secure cookies

## Development Setup

### **Prerequisites**
- Node.js 18+
- PostgreSQL database
- OpenAI API key
- Canvas API credentials (optional)

### **Environment Variables**
```bash
# Database
DATABASE_URL=postgresql://...

# Security
SESSION_SECRET=your-super-secret-session-key-min-32-chars
COOKIE_SECRET=your-cookie-secret-min-32-chars

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Canvas LMS (optional)
CANVAS_CLIENT_ID=your-canvas-client-id
CANVAS_CLIENT_SECRET=your-canvas-client-secret
CANVAS_REDIRECT_URI=https://your-domain.com/api/canvas/callback

# Authentication (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
BASE_URL=https://your-domain.com

# Server
NODE_ENV=production
PORT=3000
```

### **Installation**
```bash
# Clone repository
git clone <repository-url>
cd StudyMentor

# Install dependencies
npm install

# Set up database
npm run db:push

# Start development server
npm run dev
```

## Deployment

### **Recommended Platforms**
- **Render** (Free tier available)
- **Vercel** (Free tier available)
- **Railway** (Free tier with $5 credit)
- **Fly.io** (Free tier available)

### **Deployment Steps**
1. **Database Setup**: Provision PostgreSQL database
2. **Environment Configuration**: Set all required environment variables
3. **Build & Deploy**: Use platform-specific deployment commands
4. **Domain Configuration**: Set up custom domain (optional)
5. **SSL Certificate**: Enable HTTPS (automatic on most platforms)

## Feature Implementation Status

### ✅ **Completed Features**
- **Project Structure**: Full-stack monorepo setup
- **Database Schema**: Complete PostgreSQL schema with relations
- **Authentication System**: Session-based auth with multiple providers
- **API Routes**: Complete REST API for all features
- **Frontend Components**: Modern UI with Tailwind CSS
- **Canvas Integration**: OAuth and API integration
- **Document Processing**: PDF, Word, and text file support
- **AI Integration**: OpenAI API for concept extraction and tutoring
- **Flashcard System**: Spaced repetition with SM-2 algorithm
- **Study Sessions**: Timed practice sessions with progress tracking
- **Security**: Rate limiting, input validation, CORS configuration

### 🚧 **In Progress**
- **Learning Style Assessment**: Questionnaire and analysis
- **Interleaved Practice**: Mixed topic study sessions
- **Progress Analytics**: Detailed learning progress tracking

### 📋 **Planned Features**
- **Mobile App**: React Native version
- **Offline Support**: Service worker for offline access
- **Collaborative Study**: Group study sessions
- **Advanced Analytics**: Machine learning insights
- **Integration APIs**: Support for other LMS platforms

## Performance Optimization

### **Frontend**
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Service worker for static assets
- **Bundle Optimization**: Tree shaking and minification

### **Backend**
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **Caching**: Redis for frequently accessed data
- **Compression**: Gzip compression for responses

### **AI Integration**
- **Request Batching**: Group similar AI requests
- **Response Caching**: Cache AI responses when appropriate
- **Rate Limiting**: Respect OpenAI API limits
- **Error Handling**: Graceful fallbacks for AI failures

## Security Considerations

### **Authentication**
- **Session Security**: Secure session configuration
- **Password Hashing**: bcrypt for password storage
- **OAuth Security**: Proper OAuth flow implementation
- **Token Management**: Secure token storage and rotation

### **Data Protection**
- **Input Sanitization**: Prevent XSS and injection attacks
- **File Upload Security**: Validate and sanitize uploaded files
- **API Security**: Rate limiting and request validation
- **Database Security**: Parameterized queries and access control

### **Privacy**
- **Data Minimization**: Only collect necessary user data
- **User Consent**: Clear privacy policy and consent mechanisms
- **Data Retention**: Automatic cleanup of old data
- **GDPR Compliance**: Right to access and delete user data

## Monitoring & Analytics

### **Application Monitoring**
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time and resource usage
- **User Analytics**: Learning progress and feature usage
- **Health Checks**: Application and database health monitoring

### **Business Metrics**
- **User Engagement**: Active users and session duration
- **Learning Outcomes**: Progress tracking and success rates
- **Feature Adoption**: Usage of different study tools
- **Retention Analysis**: User retention and churn rates

## Future Roadmap

### **Phase 1: Core Platform (Current)**
- ✅ Complete authentication system
- ✅ Canvas integration
- ✅ Basic AI features
- ✅ Flashcard system

### **Phase 2: Advanced Learning (Next)**
- 🚧 Learning style assessments
- 🚧 Interleaved practice sessions
- 📋 Advanced progress analytics
- 📋 Collaborative features

### **Phase 3: Platform Expansion (Future)**
- 📋 Mobile application
- 📋 Additional LMS integrations
- 📋 Advanced AI features
- 📋 Enterprise features

## Contributing

### **Development Guidelines**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Testing**: Unit and integration tests
- **Documentation**: Comprehensive code documentation

### **Code Review Process**
- **Pull Request Reviews**: Required for all changes
- **Automated Testing**: CI/CD pipeline with tests
- **Security Review**: Security-focused code review
- **Performance Review**: Performance impact assessment

## Support & Documentation

### **User Documentation**
- **Getting Started Guide**: Quick setup instructions
- **Feature Documentation**: Detailed feature explanations
- **Troubleshooting**: Common issues and solutions
- **Video Tutorials**: Step-by-step video guides

### **Developer Documentation**
- **API Documentation**: Complete API reference
- **Architecture Guide**: System design and patterns
- **Deployment Guide**: Platform-specific deployment instructions
- **Contributing Guide**: Development setup and guidelines

---

**StudyMentor** - Empowering students with AI-powered learning tools for better academic success.