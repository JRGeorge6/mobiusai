import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ConceptExtractionResult {
  concepts: Array<{
    title: string;
    description: string;
    difficulty: 'easy' | 'moderate' | 'hard';
    tags: string[];
  }>;
}

export interface QuizQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export interface InterleavedQuestion {
  question: string;
  answer: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  options?: string[];
}

export class OpenAIService {
  async extractConcepts(text: string, courseTitle: string): Promise<ConceptExtractionResult> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert educator analyzing course materials for ${courseTitle}. Extract key concepts from the provided text and categorize them by difficulty. Return JSON in this format: { "concepts": [{ "title": string, "description": string, "difficulty": "easy"|"moderate"|"hard", "tags": string[] }] }`
          },
          {
            role: "user",
            content: `Extract key concepts from this text:\n\n${text}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content || '{"concepts": []}');
    } catch (error) {
      console.error('Error extracting concepts:', error);
      return { concepts: [] };
    }
  }

  async generateActiveRecallQuestion(context: string, userHistory: ChatMessage[]): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI tutor using Active Recall methodology. Generate challenging questions that test understanding of the provided context. Focus on application, analysis, and synthesis rather than simple recall. Be encouraging and provide hints when appropriate."
          },
          ...userHistory.slice(-6), // Include recent conversation history
          {
            role: "user",
            content: `Based on this context, generate an active recall question:\n\n${context}`
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return response.choices[0].message.content || "Can you explain the main concept from the material we just covered?";
    } catch (error) {
      console.error('Error generating active recall question:', error);
      return "Can you explain the main concept from the material we just covered?";
    }
  }

  async generateFeynmanResponse(userExplanation: string, context: string, userHistory: ChatMessage[]): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI tutor using the Feynman Technique. The user is trying to teach you a concept. Ask probing questions to help them identify gaps in their understanding. Be curious, encouraging, and guide them to deeper insights through Socratic questioning."
          },
          ...userHistory.slice(-6), // Include recent conversation history
          {
            role: "user",
            content: `The user is explaining: "${userExplanation}"\n\nContext: ${context}\n\nRespond as a curious student asking for clarification or deeper explanation.`
          }
        ],
        temperature: 0.8,
        max_tokens: 300,
      });

      return response.choices[0].message.content || "That's interesting! Can you explain that in simpler terms?";
    } catch (error) {
      console.error('Error generating Feynman response:', error);
      return "That's interesting! Can you explain that in simpler terms?";
    }
  }

  async generateFlashcard(concept: string, context: string): Promise<{ question: string; answer: string }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Generate a flashcard question and answer for the given concept. The question should test understanding, not just memorization. Return JSON in this format: { \"question\": string, \"answer\": string }"
          },
          {
            role: "user",
            content: `Generate a flashcard for this concept: ${concept}\n\nContext: ${context}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return {
        question: result.question || `What is ${concept}?`,
        answer: result.answer || "No answer generated"
      };
    } catch (error) {
      console.error('Error generating flashcard:', error);
      return {
        question: `What is ${concept}?`,
        answer: "No answer generated"
      };
    }
  }

  async generateInterleavedQuestions(concept: any, difficulty: string, count: number): Promise<InterleavedQuestion[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Generate ${count} diverse questions for interleaved studying about the concept "${concept.title}". 
            Mix question types: multiple choice, short answer, and true/false. 
            Difficulty: ${difficulty}. 
            Return JSON array: [{ "question": string, "answer": string, "type": "multiple_choice"|"short_answer"|"true_false", "options": string[] (for multiple choice only) }]`
          },
          {
            role: "user",
            content: `Concept: ${concept.title}\nDescription: ${concept.description}\nTags: ${concept.tags?.join(', ') || 'none'}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || '[]');
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Error generating interleaved questions:', error);
      // Fallback questions
      return [
        {
          question: `What is ${concept.title}?`,
          answer: concept.description || "A key concept in the course",
          type: "short_answer" as const
        },
        {
          question: `True or False: ${concept.title} is an important concept to understand.`,
          answer: "true",
          type: "true_false" as const
        }
      ];
    }
  }

  async checkAnswer(question: string, correctAnswer: string, userAnswer: string): Promise<boolean> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI tutor evaluating student answers. Compare the user's answer with the correct answer. Be flexible with wording but strict with accuracy. Return only 'true' if the answer is correct, 'false' otherwise."
          },
          {
            role: "user",
            content: `Question: ${question}\nCorrect Answer: ${correctAnswer}\nUser Answer: ${userAnswer}\n\nIs the user's answer correct? Respond with only 'true' or 'false'.`
          }
        ],
        temperature: 0.1,
        max_tokens: 10,
      });

      const result = response.choices[0].message.content?.toLowerCase().trim();
      return result === 'true';
    } catch (error) {
      console.error('Error checking answer:', error);
      // Fallback to simple string comparison
      return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    }
  }

  async assessLearningStyle(responses: Record<string, any>): Promise<{
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading: number;
    social: number;
    logical: number;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Analyze learning assessment responses and return learning style scores (0-1 scale). Return JSON in this format: { \"visual\": number, \"auditory\": number, \"kinesthetic\": number, \"reading\": number, \"social\": number, \"logical\": number }"
          },
          {
            role: "user",
            content: `Analyze these learning assessment responses: ${JSON.stringify(responses)}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const scores = JSON.parse(response.choices[0].message.content || '{}');
      return {
        visual: scores.visual || 0.5,
        auditory: scores.auditory || 0.5,
        kinesthetic: scores.kinesthetic || 0.5,
        reading: scores.reading || 0.5,
        social: scores.social || 0.5,
        logical: scores.logical || 0.5,
      };
    } catch (error) {
      console.error('Error assessing learning style:', error);
      return {
        visual: 0.5,
        auditory: 0.5,
        kinesthetic: 0.5,
        reading: 0.5,
        social: 0.5,
        logical: 0.5,
      };
    }
  }
}

export const openaiService = new OpenAIService();
