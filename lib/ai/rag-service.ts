import { GoogleGenerativeAI } from "@google/generative-ai";
import { VectorStore } from "./vector-store";
import { ContextManager } from "./context-manager";

export interface RAGDocument {
  id: string;
  content: string;
  metadata: {
    title: string;
    category: string;
    tags: string[];
    source: string;
  };
}

export interface RAGResponse {
  answer: string;
  sources: RAGDocument[];
  confidence: number;
}

export class RAGService {
  private genAI: GoogleGenerativeAI;
  private vectorStore: VectorStore;
  private contextManager: ContextManager;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Google AI API key is required");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.vectorStore = new VectorStore();
    this.contextManager = new ContextManager();
  }

  async initialize() {
    await this.vectorStore.initialize();
    await this.loadKnowledgeBase();
  }

  private async loadKnowledgeBase() {
    /* Mental health knowledge base */
    const knowledgeBase: RAGDocument[] = [
      {
        id: "anxiety_basics",
        content:
          "Anxiety is a normal human emotion characterized by feelings of tension, worried thoughts, and physical changes. Common symptoms include restlessness, fatigue, difficulty concentrating, irritability, muscle tension, and sleep disturbance. Anxiety becomes a disorder when these feelings are excessive, persistent, and interfere with daily life.",
        metadata: {
          title: "Understanding Anxiety Disorders",
          category: "Mental Health Conditions",
          tags: ["anxiety", "symptoms", "mental health"],
          source: "Clinical Guidelines",
        },
      },
      {
        id: "depression_overview",
        content:
          "Depression is a mood disorder that causes persistent feelings of sadness and loss of interest. It affects how you feel, think, and behave and can lead to various emotional and physical problems. Symptoms include persistent sad mood, loss of interest in activities, significant weight loss or gain, sleep disturbances, fatigue, feelings of worthlessness, and difficulty concentrating.",
        metadata: {
          title: "Depression: Signs and Symptoms",
          category: "Mental Health Conditions",
          tags: ["depression", "mood disorder", "symptoms"],
          source: "Clinical Guidelines",
        },
      },
      {
        id: "breathing_techniques",
        content:
          "Deep breathing exercises can help reduce anxiety and stress. The 4-7-8 technique involves inhaling for 4 counts, holding for 7 counts, and exhaling for 8 counts. Box breathing involves breathing in for 4 counts, holding for 4, exhaling for 4, and holding empty for 4. These techniques activate the parasympathetic nervous system and promote relaxation.",
        metadata: {
          title: "Breathing Techniques for Anxiety",
          category: "Coping Strategies",
          tags: ["breathing", "anxiety", "relaxation", "techniques"],
          source: "Therapeutic Interventions",
        },
      },
      {
        id: "grounding_techniques",
        content:
          "Grounding techniques help manage anxiety, panic attacks, and dissociation by focusing attention on the present moment. The 5-4-3-2-1 technique involves identifying 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste. Physical grounding includes holding ice cubes, focusing on your breathing, or doing progressive muscle relaxation.",
        metadata: {
          title: "Grounding Techniques for Anxiety",
          category: "Coping Strategies",
          tags: ["grounding", "anxiety", "panic attacks", "mindfulness"],
          source: "Therapeutic Interventions",
        },
      },
      {
        id: "sleep_hygiene",
        content:
          "Good sleep hygiene is essential for mental health. Maintain a consistent sleep schedule, create a relaxing bedtime routine, keep your bedroom cool and dark, avoid screens before bedtime, limit caffeine and alcohol, and avoid large meals before sleep. Poor sleep can worsen depression and anxiety symptoms.",
        metadata: {
          title: "Sleep Hygiene for Mental Health",
          category: "Self-Care",
          tags: ["sleep", "hygiene", "depression", "anxiety"],
          source: "Health Guidelines",
        },
      },
      {
        id: "cognitive_distortions",
        content:
          "Cognitive distortions are negative thought patterns that contribute to depression and anxiety. Common types include all-or-nothing thinking, overgeneralization, mental filter, disqualifying the positive, jumping to conclusions, magnification, emotional reasoning, should statements, labeling, and personalization. Recognizing these patterns is the first step in challenging them.",
        metadata: {
          title: "Common Cognitive Distortions",
          category: "Cognitive Behavioral Therapy",
          tags: ["CBT", "cognitive distortions", "negative thinking"],
          source: "Therapeutic Techniques",
        },
      },
      {
        id: "mindfulness_meditation",
        content:
          "Mindfulness meditation involves focusing attention on the present moment without judgment. Start with 5-10 minutes daily, find a quiet space, sit comfortably, focus on your breath, notice when your mind wanders and gently return attention to breathing. Regular practice can reduce anxiety, depression, and improve overall well-being.",
        metadata: {
          title: "Mindfulness Meditation Basics",
          category: "Mindfulness",
          tags: ["mindfulness", "meditation", "anxiety", "depression"],
          source: "Therapeutic Interventions",
        },
      },
      {
        id: "stress_management",
        content:
          "Effective stress management involves identifying stressors, developing healthy coping strategies, maintaining work-life balance, exercising regularly, eating a healthy diet, getting adequate sleep, practicing relaxation techniques, and seeking social support. Chronic stress can contribute to various mental and physical health problems.",
        metadata: {
          title: "Stress Management Strategies",
          category: "Self-Care",
          tags: ["stress", "management", "coping", "health"],
          source: "Health Guidelines",
        },
      },
      {
        id: "self_compassion",
        content:
          "Self-compassion involves treating yourself with kindness during difficult times, recognizing that suffering is part of human experience, and maintaining mindful awareness of your emotions without over-identification. Practice self-compassion by speaking to yourself as you would a good friend, acknowledging your humanity, and observing your thoughts and feelings without judgment.",
        metadata: {
          title: "Practicing Self-Compassion",
          category: "Self-Care",
          tags: ["self-compassion", "kindness", "mindfulness"],
          source: "Therapeutic Concepts",
        },
      },
      {
        id: "social_support",
        content:
          "Social support is crucial for mental health recovery and maintenance. It includes emotional support (empathy, caring), instrumental support (practical help), informational support (advice, suggestions), and appraisal support (feedback, affirmation). Build social connections through community involvement, maintaining friendships, family relationships, and professional support when needed.",
        metadata: {
          title: "The Importance of Social Support",
          category: "Social Connection",
          tags: [
            "social support",
            "relationships",
            "community",
            "mental health",
          ],
          source: "Research Findings",
        },
      },
    ];

    // Add documents to vector store
    for (const doc of knowledgeBase) {
      await this.vectorStore.addDocument(doc);
    }
  }

  async query(
    userQuestion: string,
    userId: string,
    conversationHistory: Array<{ text: string; sender: string }> = []
  ): Promise<RAGResponse> {
    try {
      /* Store conversation context */
      this.contextManager.updateContext(userId, conversationHistory);

      // Get relevant documents from vector store
      const relevantDocs = await this.vectorStore.similaritySearch(
        userQuestion,
        3
      );

      /* Get conversation context */
      const context = this.contextManager.getContext(userId);

      /* Create enhanced prompt with retrieved context */
      const contextText = relevantDocs
        .map((doc) => `Source: ${doc.metadata.title}\nContent: ${doc.content}`)
        .join("\n\n");

      const conversationContext = conversationHistory
        .slice(-6) /*Last 6 messages for context */
        .map((msg) => `${msg.sender}: ${msg.text}`)
        .join("\n");

      const enhancedPrompt = this.buildRAGPrompt(
        userQuestion,
        contextText,
        conversationContext,
        context
      );

      /* Generate response using Gemini */
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-001",
      });

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: enhancedPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      });

      const response = result.response.text();

      /* Calculate confidence based on document relevance */
      const confidence = this.calculateConfidence(relevantDocs, userQuestion);

      return {
        answer: response,
        sources: relevantDocs,
        confidence,
      };
    } catch (error) {
      console.error("RAG query error:", error);
      throw new Error("Failed to process RAG query");
    }
  }

  private buildRAGPrompt(
    question: string,
    context: string,
    conversationHistory: string,
    userContext: any
  ): string {
    return `You are an AI mental health therapy assistant with access to professional knowledge resources. Use the provided context to give accurate, empathetic, and evidence-based responses.

KNOWLEDGE BASE CONTEXT:
${context}

CONVERSATION HISTORY:
${conversationHistory}

USER CONTEXT:
- Recent mood patterns: ${userContext?.moodPatterns || "No data"}
- Common themes: ${userContext?.themes?.join(", ") || "No themes identified"}
- Session count: ${userContext?.sessionCount || 0}

USER QUESTION: ${question}

INSTRUCTIONS:
1. Use the knowledge base context to inform your response
2. Reference specific techniques, strategies, or information from the context when relevant
3. Maintain a warm, empathetic, and professional tone
4. If the knowledge base doesn't contain relevant information, draw on general therapeutic principles
5. Always prioritize user safety and recommend professional help for serious concerns
6. Keep responses concise but comprehensive (200-400 words)
7. When referencing sources, mention them naturally (e.g., "Research shows..." or "A helpful technique is...")

RESPONSE:`;
  }

  private calculateConfidence(documents: RAGDocument[], query: string): number {
    if (documents.length === 0) return 0.3;

    const avgRelevance =
      documents.reduce((sum, doc) => {
        const titleMatch = doc.metadata.title
          .toLowerCase()
          .includes(query.toLowerCase())
          ? 0.3
          : 0;
        const contentMatch = doc.content
          .toLowerCase()
          .includes(query.toLowerCase())
          ? 0.4
          : 0;
        const tagMatch = doc.metadata.tags.some((tag) =>
          query.toLowerCase().includes(tag.toLowerCase())
        )
          ? 0.3
          : 0;

        return sum + (titleMatch + contentMatch + tagMatch);
      }, 0) / documents.length;

    return Math.min(0.9, Math.max(0.4, avgRelevance));
  }

  async addUserDocument(document: RAGDocument): Promise<void> {
    await this.vectorStore.addDocument(document);
  }

  async searchResources(
    query: string,
    category?: string
  ): Promise<RAGDocument[]> {
    const results = await this.vectorStore.similaritySearch(query, 5);

    if (category) {
      return results.filter((doc) => doc.metadata.category === category);
    }

    return results;
  }

  async getRecommendations(
    userId: string,
    conversationHistory: Array<{ text: string; sender: string }>
  ): Promise<RAGDocument[]> {
    /* Analyze conversation to extract key themes */
    const recentMessages = conversationHistory
      .filter((msg) => msg.sender === "user")
      .slice(-5)
      .map((msg) => msg.text)
      .join(" ");

    /* Get contextually relevant resources */
    return await this.vectorStore.similaritySearch(recentMessages, 3);
  }
}
