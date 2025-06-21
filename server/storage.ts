import {
  users,
  courses,
  assignments,
  documents,
  concepts,
  conceptProgress,
  flashcards,
  learningAssessments,
  chatSessions,
  interleavedSessions,
  interleavedQuestions,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Assignment,
  type InsertAssignment,
  type Document,
  type InsertDocument,
  type Concept,
  type InsertConcept,
  type ConceptProgress,
  type InsertConceptProgress,
  type Flashcard,
  type InsertFlashcard,
  type LearningAssessment,
  type InsertLearningAssessment,
  type ChatSession,
  type InsertChatSession,
  type InterleavedSession,
  type InsertInterleavedSession,
  type InterleavedQuestion,
  type InsertInterleavedQuestion,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lte, gte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Course operations
  getCoursesByUserId(userId: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCanvasTokens(userId: string, accessToken: string, refreshToken: string, expiresAt: Date): Promise<void>;
  
  // Assignment operations
  getAssignmentsByUserId(userId: string): Promise<Assignment[]>;
  getUpcomingAssignments(userId: string, days: number): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByUserId(userId: string): Promise<Document[]>;
  getDocumentsByCourseId(courseId: number): Promise<Document[]>;
  
  // Concept operations
  createConcept(concept: InsertConcept): Promise<Concept>;
  getConceptsByCourseId(courseId: number): Promise<Concept[]>;
  getConceptsByUserId(userId: string): Promise<Concept[]>;
  
  // Concept progress operations
  upsertConceptProgress(progress: InsertConceptProgress): Promise<ConceptProgress>;
  getConceptProgressByUserId(userId: string): Promise<ConceptProgress[]>;
  
  // Flashcard operations
  createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard>;
  getFlashcardsByUserId(userId: string): Promise<Flashcard[]>;
  getDueFlashcards(userId: string): Promise<Flashcard[]>;
  updateFlashcard(id: number, updates: Partial<Flashcard>): Promise<Flashcard>;
  
  // Learning assessment operations
  createLearningAssessment(assessment: InsertLearningAssessment): Promise<LearningAssessment>;
  getLatestLearningAssessment(userId: string): Promise<LearningAssessment | undefined>;
  
  // Chat session operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession>;
  getChatSessionsByUserId(userId: string): Promise<ChatSession[]>;
  
  // Interleaved session operations
  createInterleavedSession(session: InsertInterleavedSession): Promise<InterleavedSession>;
  getInterleavedSessionsByUserId(userId: string): Promise<InterleavedSession[]>;
  getInterleavedSessionById(sessionId: number): Promise<InterleavedSession | undefined>;
  updateInterleavedSessionProgress(sessionId: number): Promise<void>;
  completeInterleavedSession(sessionId: number): Promise<void>;
  
  // Interleaved question operations
  createInterleavedQuestion(question: InsertInterleavedQuestion): Promise<InterleavedQuestion>;
  getInterleavedQuestionsBySessionId(sessionId: number): Promise<InterleavedQuestion[]>;
  getInterleavedQuestionById(questionId: number): Promise<InterleavedQuestion | undefined>;
  updateInterleavedQuestionAnswer(questionId: number, userAnswer: string, isCorrect: boolean, timeSpent: number): Promise<void>;
  updateInterleavedQuestionOrder(questionId: number, order: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Course operations
  async getCoursesByUserId(userId: string): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.userId, userId));
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCanvasTokens(userId: string, accessToken: string, refreshToken: string, expiresAt: Date): Promise<void> {
    await db.update(users)
      .set({
        canvasAccessToken: accessToken,
        canvasRefreshToken: refreshToken,
        canvasTokenExpiry: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Assignment operations
  async getAssignmentsByUserId(userId: string): Promise<Assignment[]> {
    return await db.select().from(assignments)
      .where(eq(assignments.userId, userId))
      .orderBy(desc(assignments.dueDate));
  }

  async getUpcomingAssignments(userId: string, days: number): Promise<Assignment[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return await db.select().from(assignments)
      .where(
        and(
          eq(assignments.userId, userId),
          gte(assignments.dueDate, now),
          lte(assignments.dueDate, futureDate)
        )
      )
      .orderBy(assignments.dueDate);
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db.insert(assignments).values(assignment).returning();
    return newAssignment;
  }

  // Document operations
  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async getDocumentsByUserId(userId: string): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }

  async getDocumentsByCourseId(courseId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.courseId, courseId));
  }

  // Concept operations
  async createConcept(concept: InsertConcept): Promise<Concept> {
    const [newConcept] = await db.insert(concepts).values(concept).returning();
    return newConcept;
  }

  async getConceptsByCourseId(courseId: number): Promise<Concept[]> {
    return await db.select().from(concepts).where(eq(concepts.courseId, courseId));
  }

  async getConceptsByUserId(userId: string): Promise<Concept[]> {
    return await db.select().from(concepts).where(eq(concepts.userId, userId));
  }

  // Concept progress operations
  async upsertConceptProgress(progress: InsertConceptProgress): Promise<ConceptProgress> {
    const [result] = await db.insert(conceptProgress)
      .values(progress)
      .onConflictDoUpdate({
        target: [conceptProgress.userId, conceptProgress.conceptId],
        set: {
          ...progress,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async getConceptProgressByUserId(userId: string): Promise<ConceptProgress[]> {
    return await db.select().from(conceptProgress).where(eq(conceptProgress.userId, userId));
  }

  // Flashcard operations
  async createFlashcard(flashcard: InsertFlashcard): Promise<Flashcard> {
    const [newFlashcard] = await db.insert(flashcards).values(flashcard).returning();
    return newFlashcard;
  }

  async getFlashcardsByUserId(userId: string): Promise<Flashcard[]> {
    return await db.select().from(flashcards).where(eq(flashcards.userId, userId));
  }

  async getDueFlashcards(userId: string): Promise<Flashcard[]> {
    const today = new Date().toISOString().split('T')[0];
    return await db.select().from(flashcards)
      .where(
        and(
          eq(flashcards.userId, userId),
          lte(flashcards.nextReview, today)
        )
      );
  }

  async updateFlashcard(id: number, updates: Partial<Flashcard>): Promise<Flashcard> {
    const [updatedFlashcard] = await db.update(flashcards)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(flashcards.id, id))
      .returning();
    return updatedFlashcard;
  }

  // Learning assessment operations
  async createLearningAssessment(assessment: InsertLearningAssessment): Promise<LearningAssessment> {
    const [newAssessment] = await db.insert(learningAssessments).values(assessment).returning();
    return newAssessment;
  }

  async getLatestLearningAssessment(userId: string): Promise<LearningAssessment | undefined> {
    const [assessment] = await db.select().from(learningAssessments)
      .where(eq(learningAssessments.userId, userId))
      .orderBy(desc(learningAssessments.completedAt))
      .limit(1);
    return assessment;
  }

  // Chat session operations
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db.insert(chatSessions).values(session).returning();
    return newSession;
  }

  async updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession> {
    const [updatedSession] = await db.update(chatSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(chatSessions.id, id))
      .returning();
    return updatedSession;
  }

  async getChatSessionsByUserId(userId: string): Promise<ChatSession[]> {
    return await db.select().from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));
  }

  // Interleaved session operations
  async createInterleavedSession(session: InsertInterleavedSession): Promise<InterleavedSession> {
    const [newSession] = await db.insert(interleavedSessions).values(session).returning();
    return newSession;
  }

  async getInterleavedSessionsByUserId(userId: string): Promise<InterleavedSession[]> {
    return await db.select().from(interleavedSessions)
      .where(eq(interleavedSessions.userId, userId))
      .orderBy(desc(interleavedSessions.createdAt));
  }

  async getInterleavedSessionById(sessionId: number): Promise<InterleavedSession | undefined> {
    const [session] = await db.select().from(interleavedSessions).where(eq(interleavedSessions.id, sessionId));
    return session;
  }

  async updateInterleavedSessionProgress(sessionId: number): Promise<void> {
    const questions = await this.getInterleavedQuestionsBySessionId(sessionId);
    const answeredQuestions = questions.filter(q => q.userAnswer !== null);
    const correctAnswers = answeredQuestions.filter(q => q.isCorrect === true).length;

    await db.update(interleavedSessions)
      .set({
        questionsAnswered: answeredQuestions.length,
        correctAnswers,
        updatedAt: new Date(),
      })
      .where(eq(interleavedSessions.id, sessionId));
  }

  async completeInterleavedSession(sessionId: number): Promise<void> {
    await db.update(interleavedSessions)
      .set({
        isActive: false,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(interleavedSessions.id, sessionId));
  }

  // Interleaved question operations
  async createInterleavedQuestion(question: InsertInterleavedQuestion): Promise<InterleavedQuestion> {
    const [newQuestion] = await db.insert(interleavedQuestions).values(question).returning();
    return newQuestion;
  }

  async getInterleavedQuestionsBySessionId(sessionId: number): Promise<InterleavedQuestion[]> {
    return await db.select().from(interleavedQuestions)
      .where(eq(interleavedQuestions.sessionId, sessionId))
      .orderBy(interleavedQuestions.orderInSession);
  }

  async getInterleavedQuestionById(questionId: number): Promise<InterleavedQuestion | undefined> {
    const [question] = await db.select().from(interleavedQuestions).where(eq(interleavedQuestions.id, questionId));
    return question;
  }

  async updateInterleavedQuestionAnswer(questionId: number, userAnswer: string, isCorrect: boolean, timeSpent: number): Promise<void> {
    await db.update(interleavedQuestions)
      .set({
        userAnswer,
        isCorrect,
        timeSpent,
      })
      .where(eq(interleavedQuestions.id, questionId));
  }

  async updateInterleavedQuestionOrder(questionId: number, order: number): Promise<void> {
    await db.update(interleavedQuestions)
      .set({
        orderInSession: order,
      })
      .where(eq(interleavedQuestions.id, questionId));
  }
}

export const storage = new DatabaseStorage();
