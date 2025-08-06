import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  EnhancedAIService,
  ConversationContext,
} from "@/lib/ai/enhanced-ai-service";
import { SentimentAnalyzer } from "@/lib/ai/sentiment-analyser";

/* Keep backward compatibility with existing functions */
let enhancedAI: EnhancedAIService | null = null;
let sentimentAnalyzer: SentimentAnalyzer | null = null;

async function getEnhancedAI(): Promise<EnhancedAIService> {
  if (!enhancedAI) {
    enhancedAI = new EnhancedAIService();
    await enhancedAI.initialize();
  }
  return enhancedAI;
}

async function getSentimentAnalyzer(): Promise<SentimentAnalyzer> {
  if (!sentimentAnalyzer) {
    sentimentAnalyzer = new SentimentAnalyzer();
    await sentimentAnalyzer.initialize();
  }
  return sentimentAnalyzer;
}

export async function generateTherapyResponse(
  prompt: string,
  aiResponseStyle: string,
  userId?: string,
  conversationHistory?: Array<{
    text: string;
    sender: string;
    timestamp?: Date;
  }>,
  currentMood?: string,
  sessionGoals?: string[]
) {
  try {
    /* If enhanced context is available, use RAG system */
    if (userId && conversationHistory) {
      const enhancedAI = await getEnhancedAI();

      const context: ConversationContext = {
        userId,
        conversationHistory: conversationHistory.map((msg) => ({
          ...msg,
          timestamp: msg.timestamp || new Date(),
        })),
        currentMood,
        sessionGoals,
        responseStyle: aiResponseStyle,
      };

      const result = await enhancedAI.generateTherapyResponse(prompt, context);
      return result.response;
    }

    /* Fallback to original implementation */
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error("Google AI API key is missing");
      return "I'm sorry, there's a configuration issue. Please contact support.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    const therapyPrompt = `As an AI therapist, respond to the following message with empathy, 
    insight, and therapeutic techniques. Maintain a supportive tone and offer thoughtful 
    perspectives. Keep responses concise but meaningful, without any additional text.
    Response style: "${aiResponseStyle}"
    User message: "${prompt}"`;
    /*  Generate content with safety settings */
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: therapyPrompt }] }],
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

    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error("Error generating therapy response:", error);

    if (error?.message?.includes("authentication")) {
      console.error("Authentication error - check API key");
      return "I'm experiencing connection issues. This may be due to an API configuration problem.";
    }

    return "I'm sorry, I'm having trouble responding right now. Please try again in a moment.";
  }
}

export async function analyzeJournalEntry(
  entry: string,
  userId?: string,
  previousEntries?: string[]
) {
  try {
    /*  If enhanced context is available, use advanced analysis */
    if (userId) {
      const enhancedAI = await getEnhancedAI();
      const result = await enhancedAI.analyzeJournalEntry(
        entry,
        userId,
        previousEntries
      );
      return result.insight;
    }

    /* Fallback to original implementation */
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.error("Google AI API key is missing");
      return "I'm sorry, there's a configuration issue. Please contact support.";
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    const analysisPrompt = `As a therapeutic AI assistant, please analyze the following journal entry 
    and provide thoughtful, empathetic insights. Focus on emotional patterns, potential areas for 
    growth, and positive observations:
    
    "${entry}"
    
    Provide a single, specific insight that might be helpful for reflection, without any additional text.`;
    /* Generate content with safety settings    */
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: analysisPrompt }] }],
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

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error analyzing journal entry:", error);
    return "I couldn't analyze your journal entry right now. Please try again later.";
  }
}

/* Enhanced/advanced functions */
export async function getEnhancedTherapyResponse(
  prompt: string,
  context: ConversationContext
) {
  try {
    const enhancedAI = await getEnhancedAI();
    return await enhancedAI.generateTherapyResponse(prompt, context);
  } catch (error) {
    console.error("Enhanced therapy response failed:", error);
    throw error;
  }
}

export async function getAdvancedJournalAnalysis(
  entry: string,
  userId: string,
  previousEntries: string[] = []
) {
  try {
    const enhancedAI = await getEnhancedAI();
    return await enhancedAI.analyzeJournalEntry(entry, userId, previousEntries);
  } catch (error) {
    console.error("Advanced journal analysis failed:", error);
    throw error;
  }
}

export async function analyzeSentiment(text: string) {
  try {
    const analyzer = await getSentimentAnalyzer();
    return await analyzer.analyzeSentiment(text);
  } catch (error) {
    console.error("Sentiment analysis failed:", error);
    throw error;
  }
}

export async function getMoodBasedRecommendations(
  mood: string,
  userId: string,
  conversationHistory: Array<{ text: string; sender: string }>
) {
  try {
    const enhancedAI = await getEnhancedAI();
    return await enhancedAI.getMoodBasedRecommendations(
      mood,
      userId,
      conversationHistory
    );
  } catch (error) {
    console.error("Mood-based recommendations failed:", error);
    return [];
  }
}

export async function getProgressInsights(
  userId: string,
  moodHistory: Array<{ mood: string; timestamp: Date }>,
  conversationHistory: Array<{ text: string; sender: string }>
) {
  try {
    const enhancedAI = await getEnhancedAI();
    return await enhancedAI.getProgressInsights(
      userId,
      moodHistory,
      conversationHistory
    );
  } catch (error) {
    console.error("Progress insights failed:", error);
    throw error;
  }
}

export async function searchMentalHealthResources(
  query: string,
  category?: string
) {
  try {
    const enhancedAI = await getEnhancedAI();
    /* Access the RAG service through the enhanced AI */
    const ragService = (enhancedAI as any).ragService;
    return await ragService.searchResources(query, category);
  } catch (error) {
    console.error("Resource search failed:", error);
    return [];
  }
}

export async function getConversationInsights(
  userId: string,
  conversationHistory: Array<{ text: string; sender: string; timestamp: Date }>
) {
  try {
    const analyzer = await getSentimentAnalyzer();
    const userMessages = conversationHistory
      .filter((msg) => msg.sender === "user")
      .map((msg) => ({
        sentiment: analyzer.analyzeSentiment(msg.text),
        timestamp: msg.timestamp,
      }));

    const sentimentResults = await Promise.all(
      userMessages.map(async (msg) => ({
        sentiment: await msg.sentiment,
        timestamp: msg.timestamp,
      }))
    );

    const trendAnalysis = await analyzer.analyzeMoodTrend(sentimentResults);

    return {
      sentimentHistory: sentimentResults,
      moodTrend: trendAnalysis,
      totalMessages: conversationHistory.length,
      userMessageCount: conversationHistory.filter(
        (msg) => msg.sender === "user"
      ).length,
    };
  } catch (error) {
    console.error("Conversation insights failed:", error);
    throw error;
  }
}
