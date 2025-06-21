import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  canvasAccessToken: text("canvas_access_token"),
  canvasRefreshToken: text("canvas_refresh_token"),
  canvasTokenExpiry: timestamp("canvas_token_expiry"),
  canvasUserId: varchar("canvas_user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Canvas courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  canvasId: varchar("canvas_id").unique().notNull(),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  courseCode: varchar("course_code"),
  color: varchar("color"),
  enrollmentState: varchar("enrollment_state"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Canvas assignments
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  canvasId: varchar("canvas_id").unique().notNull(),
  courseId: integer("course_id").references(() => courses.id),
  userId: varchar("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  pointsPossible: decimal("points_possible"),
  submissionTypes: text("submission_types").array(),
  workflowState: varchar("workflow_state"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents uploaded by users
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: varchar("mime_type").notNull(),
  size: integer("size").notNull(),
  content: text("content"), // Extracted text content
  chunks: jsonb("chunks"), // Text chunks for AI processing
  createdAt: timestamp("created_at").defaultNow(),
});

// Concepts extracted from documents
export const concepts = pgTable("concepts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  documentId: integer("document_id").references(() => documents.id),
  title: text("title").notNull(),
  description: text("description"),
  difficulty: varchar("difficulty"), // easy, moderate, hard
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User concept knowledge tracking
export const conceptProgress = pgTable("concept_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  conceptId: integer("concept_id").references(() => concepts.id),
  status: varchar("status").notNull(), // study, known, reviewing
  confidence: integer("confidence"), // 1-5 scale
  lastReviewed: timestamp("last_reviewed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Flashcards
export const flashcards = pgTable("flashcards", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  conceptId: integer("concept_id").references(() => concepts.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  tags: text("tags").array(),
  difficulty: integer("difficulty").default(0), // SM-2 algorithm difficulty
  interval: integer("interval").default(1), // Days until next review
  repetitions: integer("repetitions").default(0),
  easeFactor: decimal("ease_factor").default("2.5"),
  nextReview: date("next_review"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning style assessments
export const learningAssessments = pgTable("learning_assessments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  visual: decimal("visual").notNull(),
  auditory: decimal("auditory").notNull(),
  kinesthetic: decimal("kinesthetic").notNull(),
  reading: decimal("reading").notNull(),
  social: decimal("social").notNull(),
  logical: decimal("logical").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Chat sessions for AI interactions
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  mode: varchar("mode").notNull(), // active_recall, feynman, interleaved
  title: text("title"),
  messages: jsonb("messages"), // Array of chat messages
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interleaved study sessions
export const interleavedSessions = pgTable("interleaved_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  concepts: jsonb("concepts").notNull(), // Array of concept IDs to interleave
  currentConceptIndex: integer("current_concept_index").default(0),
  totalQuestions: integer("total_questions").default(0),
  questionsAnswered: integer("questions_answered").default(0),
  correctAnswers: integer("correct_answers").default(0),
  sessionDuration: integer("session_duration"), // in minutes
  difficulty: varchar("difficulty").default("medium"), // easy, medium, hard
  isActive: boolean("is_active").default(true),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interleaved study questions
export const interleavedQuestions = pgTable("interleaved_questions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => interleavedSessions.id),
  conceptId: integer("concept_id").references(() => concepts.id),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  questionType: varchar("question_type").notNull(), // multiple_choice, short_answer, true_false
  options: jsonb("options"), // For multiple choice questions
  userAnswer: text("user_answer"),
  isCorrect: boolean("is_correct"),
  timeSpent: integer("time_spent"), // in seconds
  orderInSession: integer("order_in_session").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  assignments: many(assignments),
  documents: many(documents),
  concepts: many(concepts),
  conceptProgress: many(conceptProgress),
  flashcards: many(flashcards),
  learningAssessments: many(learningAssessments),
  chatSessions: many(chatSessions),
  interleavedSessions: many(interleavedSessions),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  user: one(users, {
    fields: [courses.userId],
    references: [users.id],
  }),
  assignments: many(assignments),
  documents: many(documents),
  concepts: many(concepts),
  flashcards: many(flashcards),
  chatSessions: many(chatSessions),
}));

export const assignmentsRelations = relations(assignments, ({ one }) => ({
  course: one(courses, {
    fields: [assignments.courseId],
    references: [courses.id],
  }),
  user: one(users, {
    fields: [assignments.userId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [documents.courseId],
    references: [courses.id],
  }),
  concepts: many(concepts),
}));

export const conceptsRelations = relations(concepts, ({ one, many }) => ({
  user: one(users, {
    fields: [concepts.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [concepts.courseId],
    references: [courses.id],
  }),
  document: one(documents, {
    fields: [concepts.documentId],
    references: [documents.id],
  }),
  progress: many(conceptProgress),
  flashcards: many(flashcards),
}));

export const conceptProgressRelations = relations(conceptProgress, ({ one }) => ({
  user: one(users, {
    fields: [conceptProgress.userId],
    references: [users.id],
  }),
  concept: one(concepts, {
    fields: [conceptProgress.conceptId],
    references: [concepts.id],
  }),
}));

export const flashcardsRelations = relations(flashcards, ({ one }) => ({
  user: one(users, {
    fields: [flashcards.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [flashcards.courseId],
    references: [courses.id],
  }),
  concept: one(concepts, {
    fields: [flashcards.conceptId],
    references: [concepts.id],
  }),
}));

export const learningAssessmentsRelations = relations(learningAssessments, ({ one }) => ({
  user: one(users, {
    fields: [learningAssessments.userId],
    references: [users.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [chatSessions.courseId],
    references: [courses.id],
  }),
}));

export const interleavedSessionsRelations = relations(interleavedSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [interleavedSessions.userId],
    references: [users.id],
  }),
  questions: many(interleavedQuestions),
}));

export const interleavedQuestionsRelations = relations(interleavedQuestions, ({ one }) => ({
  session: one(interleavedSessions, {
    fields: [interleavedQuestions.sessionId],
    references: [interleavedSessions.id],
  }),
  concept: one(concepts, {
    fields: [interleavedQuestions.conceptId],
    references: [concepts.id],
  }),
}));

// Insert schemas
export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertConceptSchema = createInsertSchema(concepts).omit({
  id: true,
  createdAt: true,
});

export const insertConceptProgressSchema = createInsertSchema(conceptProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFlashcardSchema = createInsertSchema(flashcards).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearningAssessmentSchema = createInsertSchema(learningAssessments).omit({
  id: true,
  completedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInterleavedSessionSchema = createInsertSchema(interleavedSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInterleavedQuestionSchema = createInsertSchema(interleavedQuestions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Concept = typeof concepts.$inferSelect;
export type InsertConcept = z.infer<typeof insertConceptSchema>;
export type ConceptProgress = typeof conceptProgress.$inferSelect;
export type InsertConceptProgress = z.infer<typeof insertConceptProgressSchema>;
export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = z.infer<typeof insertFlashcardSchema>;
export type LearningAssessment = typeof learningAssessments.$inferSelect;
export type InsertLearningAssessment = z.infer<typeof insertLearningAssessmentSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type InterleavedSession = typeof interleavedSessions.$inferSelect;
export type InsertInterleavedSession = z.infer<typeof insertInterleavedSessionSchema>;
export type InterleavedQuestion = typeof interleavedQuestions.$inferSelect;
export type InsertInterleavedQuestion = z.infer<typeof insertInterleavedQuestionSchema>;
