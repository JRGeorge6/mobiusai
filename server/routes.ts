import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { setupSimpleAuth, isAuthenticated } from "./simpleAuth";
import { canvasService } from "./services/canvas";
import { openaiService } from "./services/openai";
import { documentProcessor } from "./services/documentProcessor";
import { 
  insertCourseSchema,
  insertAssignmentSchema,
  insertDocumentSchema,
  insertConceptSchema,
  insertConceptProgressSchema,
  insertFlashcardSchema,
  insertLearningAssessmentSchema,
  insertChatSessionSchema
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupSimpleAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
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

  // Document upload and processing
  app.post('/api/documents', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      const { courseId } = req.body;

      if (!file) {
        return res.status(400).json({ message: "No file provided" });
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

  // Concept routes
  app.get('/api/concepts', isAuthenticated, async (req: any, res) => {
    try {
      const { courseId } = req.query;
      
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
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
      const { status, confidence } = req.body;

      const progressData = insertConceptProgressSchema.parse({
        userId,
        conceptId,
        status,
        confidence,
        lastReviewed: new Date(),
      });

      const progress = await storage.upsertConceptProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating concept progress:", error);
      res.status(500).json({ message: "Failed to update concept progress" });
    }
  });

  // Flashcard routes
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
      const flashcardId = parseInt(req.params.id);
      const { quality } = req.body; // SM-2 quality rating (0-5)

      // Calculate next review date using SM-2 algorithm
      const flashcard = await storage.getFlashcardsByUserId(req.user.claims.sub);
      const current = flashcard.find(f => f.id === flashcardId);
      
      if (!current) {
        return res.status(404).json({ message: "Flashcard not found" });
      }

      const sm2Result = calculateSM2(quality, current);
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
  app.post('/api/assessment', isAuthenticated, async (req: any, res) => {
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

  // Chat routes
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message, mode, courseId, sessionId } = req.body;

      let chatSession;
      if (sessionId) {
        const sessions = await storage.getChatSessionsByUserId(userId);
        chatSession = sessions.find(s => s.id === sessionId);
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

  // Sync Canvas data
  app.post('/api/canvas/sync', isAuthenticated, async (req: any, res) => {
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
          courseId: course.id,
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
      documents = await storage.getDocumentsByCourseId(parseInt(courseId));
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
