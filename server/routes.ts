import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { canvasService } from "./services/canvas";
import { openaiService } from "./services/openai";
import { documentProcessor } from "./services/documentProcessor";
import rateLimit from "express-rate-limit";
import { config, getSensitiveOperationRateLimit, getOpenAIRateLimit } from "./config";
import { 
  insertCourseSchema,
  insertAssignmentSchema,
  insertDocumentSchema,
  insertConceptSchema,
  insertConceptProgressSchema,
  insertFlashcardSchema,
  insertLearningAssessmentSchema,
  insertChatSessionSchema,
  insertInterleavedSessionSchema,
  insertInterleavedQuestionSchema
} from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads with enhanced security
const upload = multer({
  dest: config.UPLOAD_PATH,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

// Rate limiting for sensitive operations
const sensitiveOperationLimiter = rateLimit(getSensitiveOperationRateLimit());

const openaiLimiter = rateLimit(getOpenAIRateLimit());

// Input validation schemas
const conceptProgressSchema = z.object({
  status: z.enum(['study', 'known', 'reviewing']),
  confidence: z.number().min(1).max(5).optional(),
});

const flashcardUpdateSchema = z.object({
  quality: z.number().min(0).max(5),
});

const chatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  mode: z.enum(['active_recall', 'feynman', 'interleaved']),
  courseId: z.string().optional(),
  sessionId: z.number().optional(),
});

const interleavedSessionSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  concepts: z.array(z.number()).min(2).max(10),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      // Don't expose sensitive fields like tokens
      const { canvasAccessToken, canvasRefreshToken, canvasTokenExpiry, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Canvas OAuth routes
  app.get('/api/canvas/auth', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
      const authUrl = canvasService.generateAuthUrl(state);
      res.json({ authUrl });
    } catch (error) {
      console.error("Error generating Canvas auth URL:", error);
      res.status(500).json({ message: "Failed to generate Canvas auth URL" });
    }
  });

  app.get('/api/canvas/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.status(400).json({ message: "Missing code or state parameter" });
      }

      const { userId } = JSON.parse(Buffer.from(state as string, 'base64').toString());
      const tokenResponse = await canvasService.exchangeCodeForToken(code as string);
      
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokenResponse.expires_in);
      
      await storage.updateCanvasTokens(
        userId,
        tokenResponse.access_token,
        tokenResponse.refresh_token,
        expiresAt
      );

      // Sync Canvas data
      await syncCanvasData(userId, tokenResponse.access_token);

      res.redirect('/dashboard');
    } catch (error) {
      console.error("Error handling Canvas callback:", error);
      res.status(500).json({ message: "Failed to handle Canvas callback" });
    }
  });

  // Course routes
  app.get('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courses = await storage.getCoursesByUserId(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Assignment routes
  app.get('/api/assignments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { upcoming } = req.query;
      
      let assignments;
      if (upcoming) {
        assignments = await storage.getUpcomingAssignments(userId, 30); // Next 30 days
      } else {
        assignments = await storage.getAssignmentsByUserId(userId);
      }
      
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Document upload and processing with enhanced security
  app.post('/api/documents', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      const { courseId } = req.body;

      if (!file) {
        return res.status(400).json({ message: "No file provided" });
      }

      // Validate courseId if provided
      if (courseId) {
        const courses = await storage.getCoursesByUserId(userId);
        const course = courses.find(c => c.id === parseInt(courseId));
        if (!course) {
          return res.status(400).json({ message: "Invalid course ID" });
        }
      }

      // Process the document
      const processed = await documentProcessor.processFile(file.path, file.mimetype);
      
      // Create document record
      const documentData = insertDocumentSchema.parse({
        userId,
        courseId: courseId ? parseInt(courseId) : null,
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        content: processed.content,
        chunks: processed.chunks,
      });

      const document = await storage.createDocument(documentData);

      // Extract concepts using AI
      if (courseId) {
        const courses = await storage.getCoursesByUserId(userId);
        const course = courses.find(c => c.id === parseInt(courseId));
        if (course) {
          const conceptsResult = await openaiService.extractConcepts(
            processed.content,
            course.name
          );

          // Save extracted concepts
          for (const conceptData of conceptsResult.concepts) {
            const concept = await storage.createConcept({
              userId,
              courseId: parseInt(courseId),
              documentId: document.id,
              title: conceptData.title,
              description: conceptData.description,
              difficulty: conceptData.difficulty,
              tags: conceptData.tags,
            });
          }
        }
      }

      // Cleanup uploaded file
      documentProcessor.cleanupFile(file.path);

      res.json(document);
    } catch (error) {
      console.error("Error processing document:", error);
      if (req.file) {
        documentProcessor.cleanupFile(req.file.path);
      }
      res.status(500).json({ message: "Failed to process document" });
    }
  });

  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseId } = req.query;
      
      let documents;
      if (courseId) {
        // Verify user owns the course
        const courses = await storage.getCoursesByUserId(userId);
        const course = courses.find(c => c.id === parseInt(courseId));
        if (!course) {
          return res.status(403).json({ message: "Access denied" });
        }
        documents = await storage.getDocumentsByCourseId(parseInt(courseId));
      } else {
        documents = await storage.getDocumentsByUserId(userId);
      }
      
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Concept routes with authorization
  app.get('/api/concepts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseId } = req.query;
      
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }
      
      // Verify user owns the course
      const courses = await storage.getCoursesByUserId(userId);
      const course = courses.find(c => c.id === parseInt(courseId));
      if (!course) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const concepts = await storage.getConceptsByCourseId(parseInt(courseId));
      res.json(concepts);
    } catch (error) {
      console.error("Error fetching concepts:", error);
      res.status(500).json({ message: "Failed to fetch concepts" });
    }
  });

  app.post('/api/concepts/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conceptId = parseInt(req.params.id);
      
      if (!conceptId || isNaN(conceptId)) {
        return res.status(400).json({ message: "Invalid concept ID" });
      }
      
      // Validate input
      const validatedData = conceptProgressSchema.parse(req.body);
      
      // Verify concept exists and user has access
      const concepts = await storage.getConceptsByUserId(userId);
      const concept = concepts.find(c => c.id === conceptId);
      if (!concept) {
        return res.status(404).json({ message: "Concept not found" });
      }

      const progressData = insertConceptProgressSchema.parse({
        userId,
        conceptId,
        ...validatedData,
        lastReviewed: new Date(),
      });

      const progress = await storage.upsertConceptProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating concept progress:", error);
      res.status(500).json({ message: "Failed to update concept progress" });
    }
  });

  // Flashcard routes with authorization
  app.get('/api/flashcards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { due } = req.query;
      
      let flashcards;
      if (due === 'true') {
        flashcards = await storage.getDueFlashcards(userId);
      } else {
        flashcards = await storage.getFlashcardsByUserId(userId);
      }
      
      res.json(flashcards);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      res.status(500).json({ message: "Failed to fetch flashcards" });
    }
  });

  app.post('/api/flashcards', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const flashcardData = insertFlashcardSchema.parse({
        ...req.body,
        userId,
        nextReview: new Date().toISOString().split('T')[0], // Today
      });

      const flashcard = await storage.createFlashcard(flashcardData);
      res.json(flashcard);
    } catch (error) {
      console.error("Error creating flashcard:", error);
      res.status(500).json({ message: "Failed to create flashcard" });
    }
  });

  app.patch('/api/flashcards/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const flashcardId = parseInt(req.params.id);
      
      if (!flashcardId || isNaN(flashcardId)) {
        return res.status(400).json({ message: "Invalid flashcard ID" });
      }
      
      // Validate input
      const validatedData = flashcardUpdateSchema.parse(req.body);
      
      // Verify flashcard exists and user owns it
      const flashcards = await storage.getFlashcardsByUserId(userId);
      const current = flashcards.find(f => f.id === flashcardId);
      
      if (!current) {
        return res.status(404).json({ message: "Flashcard not found" });
      }

      const sm2Result = calculateSM2(validatedData.quality, current);
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + sm2Result.interval);

      const updates = {
        difficulty: sm2Result.difficulty,
        interval: sm2Result.interval,
        repetitions: sm2Result.repetitions,
        easeFactor: sm2Result.easeFactor.toString(),
        nextReview: nextReview.toISOString().split('T')[0],
      };

      const updatedFlashcard = await storage.updateFlashcard(flashcardId, updates);
      res.json(updatedFlashcard);
    } catch (error) {
      console.error("Error updating flashcard:", error);
      res.status(500).json({ message: "Failed to update flashcard" });
    }
  });

  // Learning assessment routes
  app.post('/api/assessment', isAuthenticated, openaiLimiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const responses = req.body;

      // Use AI to analyze responses and generate learning style scores
      const scores = await openaiService.assessLearningStyle(responses);
      
      const assessmentData = insertLearningAssessmentSchema.parse({
        userId,
        ...scores,
      });

      const assessment = await storage.createLearningAssessment(assessmentData);
      res.json(assessment);
    } catch (error) {
      console.error("Error creating learning assessment:", error);
      res.status(500).json({ message: "Failed to create learning assessment" });
    }
  });

  app.get('/api/assessment/latest', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assessment = await storage.getLatestLearningAssessment(userId);
      res.json(assessment);
    } catch (error) {
      console.error("Error fetching latest assessment:", error);
      res.status(500).json({ message: "Failed to fetch latest assessment" });
    }
  });

  // Chat routes with rate limiting
  app.post('/api/chat', isAuthenticated, openaiLimiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate input
      const validatedData = chatMessageSchema.parse(req.body);
      const { message, mode, courseId, sessionId } = validatedData;

      let chatSession;
      if (sessionId) {
        const sessions = await storage.getChatSessionsByUserId(userId);
        chatSession = sessions.find(s => s.id === sessionId);
        if (!chatSession) {
          return res.status(404).json({ message: "Chat session not found" });
        }
      }

      if (!chatSession) {
        // Create new chat session
        const sessionData = insertChatSessionSchema.parse({
          userId,
          courseId: courseId ? parseInt(courseId) : null,
          mode,
          title: `${mode} Session`,
          messages: [],
        });
        chatSession = await storage.createChatSession(sessionData);
      }

      const messages = (chatSession.messages as any[]) || [];
      messages.push({ role: 'user', content: message });

      let aiResponse = '';
      const context = await getContextForChat(userId, courseId);

      if (mode === 'active_recall') {
        aiResponse = await openaiService.generateActiveRecallQuestion(context, messages);
      } else if (mode === 'feynman') {
        aiResponse = await openaiService.generateFeynmanResponse(message, context, messages);
      }

      messages.push({ role: 'assistant', content: aiResponse });

      // Update chat session
      await storage.updateChatSession(chatSession.id, {
        messages,
        updatedAt: new Date(),
      });

      res.json({ response: aiResponse, sessionId: chatSession.id });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: "Failed to process chat" });
    }
  });

  app.get('/api/chat/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getChatSessionsByUserId(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  // Sync Canvas data with rate limiting
  app.post('/api/canvas/sync', isAuthenticated, sensitiveOperationLimiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.canvasAccessToken) {
        return res.status(400).json({ message: "Canvas not connected" });
      }

      await syncCanvasData(userId, user.canvasAccessToken);
      res.json({ message: "Canvas data synced successfully" });
    } catch (error) {
      console.error("Error syncing Canvas data:", error);
      res.status(500).json({ message: "Failed to sync Canvas data" });
    }
  });

  // Interleaved Study Session routes with enhanced security
  app.post('/api/interleaved-sessions', isAuthenticated, openaiLimiter, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate input
      const validatedData = interleavedSessionSchema.parse(req.body);
      const { title, description, concepts, difficulty } = validatedData;

      // Validate concepts exist and belong to user
      const userConcepts = await storage.getConceptsByUserId(userId);
      const validConcepts = concepts.filter((id: number) => 
        userConcepts.some(c => c.id === id)
      );

      if (validConcepts.length < 2) {
        return res.status(400).json({ message: "Invalid concepts provided" });
      }

      // Create interleaved session
      const sessionData = insertInterleavedSessionSchema.parse({
        userId,
        title,
        description,
        concepts: validConcepts,
        difficulty,
        totalQuestions: validConcepts.length * 5, // 5 questions per concept
      });

      const session = await storage.createInterleavedSession(sessionData);

      // Generate questions for each concept
      const questions = [];
      for (const conceptId of validConcepts) {
        const concept = userConcepts.find(c => c.id === conceptId);
        if (concept) {
          const conceptQuestions = await openaiService.generateInterleavedQuestions(
            concept,
            difficulty,
            5 // 5 questions per concept
          );

          for (let i = 0; i < conceptQuestions.length; i++) {
            const questionData = insertInterleavedQuestionSchema.parse({
              sessionId: session.id,
              conceptId,
              question: conceptQuestions[i].question,
              answer: conceptQuestions[i].answer,
              questionType: conceptQuestions[i].type,
              options: conceptQuestions[i].options,
              orderInSession: questions.length + i,
            });
            questions.push(await storage.createInterleavedQuestion(questionData));
          }
        }
      }

      // Shuffle questions to create interleaved order
      const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
      
      // Update question order
      for (let i = 0; i < shuffledQuestions.length; i++) {
        await storage.updateInterleavedQuestionOrder(shuffledQuestions[i].id, i);
      }

      res.json(session);
    } catch (error) {
      console.error("Error creating interleaved session:", error);
      res.status(500).json({ message: "Failed to create interleaved session" });
    }
  });

  app.get('/api/interleaved-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getInterleavedSessionsByUserId(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching interleaved sessions:", error);
      res.status(500).json({ message: "Failed to fetch interleaved sessions" });
    }
  });

  app.get('/api/interleaved-sessions/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!req.params.sessionId || isNaN(Number(req.params.sessionId))) {
        return res.status(400).json({ message: "Invalid sessionId" });
      }
      const sessionId = parseInt(req.params.sessionId);
      
      const session = await storage.getInterleavedSessionById(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching interleaved session:", error);
      res.status(500).json({ message: "Failed to fetch interleaved session" });
    }
  });

  app.get('/api/interleaved-sessions/:sessionId/questions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!req.params.sessionId || isNaN(Number(req.params.sessionId))) {
        return res.status(400).json({ message: "Invalid sessionId" });
      }
      const sessionId = parseInt(req.params.sessionId);
      
      const session = await storage.getInterleavedSessionById(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Session not found" });
      }

      const questions = await storage.getInterleavedQuestionsBySessionId(sessionId);
      const concepts = await storage.getConceptsByUserId(userId);
      
      // Add concept titles to questions
      const questionsWithConcepts = questions.map(q => ({
        ...q,
        conceptTitle: concepts.find(c => c.id === q.conceptId)?.title || "Unknown Concept"
      }));

      res.json(questionsWithConcepts);
    } catch (error) {
      console.error("Error fetching interleaved questions:", error);
      res.status(500).json({ message: "Failed to fetch interleaved questions" });
    }
  });

  app.post('/api/interleaved-questions/:questionId/answer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!req.params.questionId || isNaN(Number(req.params.questionId))) {
        return res.status(400).json({ message: "Invalid questionId" });
      }
      const questionId = parseInt(req.params.questionId);
      const { answer, timeSpent } = req.body;

      const question = await storage.getInterleavedQuestionById(questionId);
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Verify user owns the session
      const session = await storage.getInterleavedSessionById(question.sessionId);
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if answer is correct
      const isCorrect = await openaiService.checkAnswer(question.question, question.answer, answer);

      // Update question with user's answer
      await storage.updateInterleavedQuestionAnswer(questionId, answer, isCorrect, timeSpent);

      // Update session progress
      await storage.updateInterleavedSessionProgress(question.sessionId);

      res.json({ isCorrect, correctAnswer: question.answer });
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  app.post('/api/interleaved-sessions/:sessionId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!req.params.sessionId || isNaN(Number(req.params.sessionId))) {
        return res.status(400).json({ message: "Invalid sessionId" });
      }
      const sessionId = parseInt(req.params.sessionId);

      const session = await storage.getInterleavedSessionById(sessionId);
      if (!session || session.userId !== userId) {
        return res.status(404).json({ message: "Session not found" });
      }

      await storage.completeInterleavedSession(sessionId);
      res.json({ message: "Session completed successfully" });
    } catch (error) {
      console.error("Error completing session:", error);
      res.status(500).json({ message: "Failed to complete session" });
    }
  });

  // Ensure uploaded files are not served directly
  // If you ever add a route to serve files from /uploads, always check authentication and user ownership!
  // Example (do NOT enable without auth):
  // app.use('/uploads', isAuthenticated, express.static(path.join(__dirname, '../uploads')));

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
async function syncCanvasData(userId: string, accessToken: string) {
  try {
    // Fetch and sync courses
    const canvasCourses = await canvasService.getCourses(accessToken);
    
    for (const canvasCourse of canvasCourses) {
      const courseData = insertCourseSchema.parse({
        canvasId: canvasCourse.id.toString(),
        userId,
        name: canvasCourse.name,
        courseCode: canvasCourse.course_code,
        enrollmentState: canvasCourse.workflow_state,
        startDate: canvasCourse.start_at ? new Date(canvasCourse.start_at).toISOString().split('T')[0] : null,
        endDate: canvasCourse.end_at ? new Date(canvasCourse.end_at).toISOString().split('T')[0] : null,
      });

      await storage.createCourse(courseData);
    }

    // Fetch and sync assignments
    const courseIds = canvasCourses.map(c => c.id.toString());
    const canvasAssignments = await canvasService.getAllAssignments(accessToken, courseIds);

    for (const canvasAssignment of canvasAssignments) {
      const courses = await storage.getCoursesByUserId(userId);
      const course = courses.find(c => c.canvasId === canvasAssignment.course_id.toString());

      if (course) {
        const assignmentData = insertAssignmentSchema.parse({
          canvasId: canvasAssignment.id.toString(),
          courseId: course.id || null,
          userId,
          name: canvasAssignment.name,
          description: canvasAssignment.description,
          dueDate: canvasAssignment.due_at ? new Date(canvasAssignment.due_at) : null,
          pointsPossible: canvasAssignment.points_possible?.toString() || null,
          submissionTypes: canvasAssignment.submission_types,
          workflowState: canvasAssignment.workflow_state,
        });

        await storage.createAssignment(assignmentData);
      }
    }
  } catch (error) {
    console.error('Error syncing Canvas data:', error);
    throw error;
  }
}

async function getContextForChat(userId: string, courseId?: string): Promise<string> {
  try {
    let documents;
    if (courseId) {
      const courseIdNum = parseInt(courseId);
      if (!isNaN(courseIdNum)) {
        documents = await storage.getDocumentsByCourseId(courseIdNum);
      } else {
        documents = await storage.getDocumentsByUserId(userId);
      }
    } else {
      documents = await storage.getDocumentsByUserId(userId);
    }

    // Get recent document chunks for context
    const recentChunks = documents
      .slice(0, 3) // Last 3 documents
      .map(doc => (doc.chunks as string[])?.slice(0, 2)) // First 2 chunks each
      .flat()
      .filter(Boolean)
      .join('\n\n');

    return recentChunks || 'No course materials available for context.';
  } catch (error) {
    console.error('Error getting context for chat:', error);
    return 'No course materials available for context.';
  }
}

// SM-2 Algorithm for spaced repetition
function calculateSM2(quality: number, flashcard: any) {
  let { difficulty = 0, interval = 1, repetitions = 0, easeFactor = 2.5 } = flashcard;
  
  easeFactor = parseFloat(easeFactor);

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return {
    difficulty,
    interval,
    repetitions,
    easeFactor,
  };
}
