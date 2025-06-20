# StudyBot - AI-Powered Learning Platform

## Overview

StudyBot is a full-stack web application that integrates with Canvas LMS to provide AI-powered learning assistance. The platform offers active recall, Feynman mode learning, spaced repetition flashcards, and personalized learning assessments. Built with a modern React frontend and Express.js backend, it leverages OpenAI for content processing and Drizzle ORM with PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Session-based auth with Replit Auth integration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **File Processing**: Multer for uploads, PDF parsing capabilities
- **External APIs**: Canvas LMS integration, OpenAI GPT-4o for content analysis

### Database Schema
The application uses a comprehensive PostgreSQL schema with the following main entities:
- **Users**: Authentication and Canvas integration tokens
- **Courses**: Canvas course synchronization
- **Assignments**: Assignment tracking and due dates
- **Documents**: Uploaded study materials with processing status
- **Concepts**: AI-extracted learning concepts with difficulty levels
- **Flashcards**: Spaced repetition system with SM-2 algorithm
- **Learning Assessments**: Personalized learning style analysis
- **Chat Sessions**: Conversational learning history

## Key Components

### Authentication System
- Replit-based OIDC authentication
- Canvas OAuth2 integration for LMS access
- Session-based authentication with PostgreSQL storage
- Automatic token refresh handling

### Document Processing Pipeline
- Multi-format support (PDF, DOCX, TXT)
- Text chunking for AI processing
- Concept extraction using GPT-4o
- Automatic flashcard generation

### Learning Features
- **Active Recall**: AI-generated questions from course materials
- **Feynman Mode**: Conversational teaching simulation
- **Spaced Repetition**: SM-2 algorithm implementation
- **Learning Assessment**: Personalized learning style analysis

### Canvas Integration
- Course synchronization
- Assignment tracking
- Due date management
- OAuth2 token management

## Data Flow

1. **User Authentication**: Replit Auth → Session Storage → Canvas OAuth
2. **Course Data**: Canvas API → Local Database → Frontend Display
3. **Document Processing**: Upload → Text Extraction → AI Analysis → Concept Storage
4. **Learning Sessions**: User Interaction → AI Processing → Progress Tracking
5. **Flashcard System**: Spaced Repetition Algorithm → Due Card Calculation → Review Sessions

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **openai**: GPT-4o integration for content analysis
- **pdf-parse**: PDF document processing
- **multer**: File upload handling
- **passport**: Authentication middleware

### Frontend Dependencies
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing

### Development Dependencies
- **tsx**: TypeScript execution
- **esbuild**: Fast JavaScript bundling
- **vite**: Frontend build tool

## Deployment Strategy

### Development Environment
- Replit-optimized configuration
- Hot module replacement with Vite
- PostgreSQL database provisioning
- Environment variable management

### Production Build
- Frontend: Vite production build to `dist/public`
- Backend: ESBuild bundling to `dist/index.js`
- Database: Drizzle migrations with `db:push`
- Static file serving from Express

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API access
- `CANVAS_*`: Canvas LMS integration credentials
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier

## Changelog
- June 20, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.