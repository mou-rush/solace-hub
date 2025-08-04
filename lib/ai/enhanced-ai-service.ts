import { GoogleGenerativeAI } from "@google/generative-ai";
import { RAGService } from "./rag-service";
import { SentimentAnalyzer } from "./sentiment-analyser";

export interface EnhancedAIResponse {
  response: string;
  sentiment: {
    score: number;
    label: string;
    confidence: number;
  };
  sources?: Array<{
    title: string;
    category: string;
    relevance: number;
  }>;
  recommendations?: string[];
  context?: {
    themes: string[];
    mood_trend: string;
    session_progress: string;
  };
}

export interface ConversationContext {
  userId: string;
  conversationHistory: Array<{ text: string; sender: string; timestamp: Date }>;
  currentMood?: string;
  sessionGoals?: string[];
  responseStyle?: string;
}

export class EnhancedAIService {
  private genAI: GoogleGenerativeAI;
  private ragService: RAGService;
  private sentimentAnalyzer: SentimentAnalyzer;
  private initialized = false;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Google AI API key is required");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.ragService = new RAGService();
    this.sentimentAnalyzer = new SentimentAnalyzer();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await Promise.all([
        this.ragService.initialize(),
        this.sentimentAnalyzer.initialize(),
      ]);
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize Enhanced AI Service:", error);
      throw error;
    }
  }

  async generateTherapyResponse(
    prompt: string,
    context: ConversationContext
  ): Promise<EnhancedAIResponse> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      /* Analyze sentiment of user input */

      const sentiment = await this.sentimentAnalyzer.analyzeSentiment(prompt);

      /* Get RAG-enhanced response */

      const ragResponse = await this.ragService.query(
        prompt,
        context.userId,
        context.conversationHistory
      );

      /* Generate contextual recommendations */

      const recommendations = await this.generateRecommendations(
        prompt,
        context,
        ragResponse.sources
      );

      {
        /* Analyze conversation context */
      }
      const conversationContext = this.analyzeConversationContext(
        context.conversationHistory,
        sentiment
      );

      return {
        response: ragResponse.answer,
        sentiment,
        sources: ragResponse.sources.map((source) => ({
          title: source.metadata.title,
          category: source.metadata.category,
          relevance: ragResponse.confidence,
        })),
        recommendations,
        context: conversationContext,
      };
    } catch (error) {
      console.error("Enhanced AI response generation failed:", error);

      /* Fallback to basic response */
      return await this.fallbackResponse(prompt, context);
    }
  }

  async analyzeJournalEntry(
    entry: string,
    userId: string,
    previousEntries: string[] = []
  ): Promise<{
    insight: string;
    sentiment: any;
    themes: string[];
    patterns: string[];
    recommendations: string[];
  }> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      /* Analyze sentiment*/
      const sentiment = await this.sentimentAnalyzer.analyzeSentiment(entry);

      /*Extract themes and patterns */

      const themes = this.extractThemes([entry]);
      const patterns = this.detectPatterns([entry, ...previousEntries]);

      /* Generate AI insight using RAG */
      const ragResponse = await this.ragService.query(
        `Analyze this journal entry for therapeutic insights: ${entry}`,
        userId,
        []
      );

      /* Generate personalized recommendations */
      const recommendations = await this.generateJournalRecommendations(
        entry,
        themes,
        sentiment
      );

      return {
        insight: ragResponse.answer,
        sentiment,
        themes,
        patterns,
        recommendations,
      };
    } catch (error) {
      console.error("Journal analysis failed:", error);
      throw error;
    }
  }

  async getMoodBasedRecommendations(
    mood: string,
    userId: string,
    conversationHistory: Array<{ text: string; sender: string }>
  ): Promise<string[]> {
    try {
      const moodQueries = {
        anxious: "anxiety management techniques and coping strategies",
        sad: "depression support and mood improvement activities",
        stressed: "stress reduction and relaxation techniques",
        angry: "anger management and emotional regulation",
        happy: "maintaining positive mental health and wellness",
        neutral: "general mental health maintenance and self-care",
      };

      const query = moodQueries[mood.toLowerCase()] || moodQueries["neutral"];
      const resources = await this.ragService.searchResources(query);

      return resources
        .slice(0, 3)
        .map(
          (resource) =>
            `${resource.metadata.title}: ${resource.content.substring(
              0,
              150
            )}...`
        );
    } catch (error) {
      console.error("Mood-based recommendations failed:", error);
      return [];
    }
  }

  async getProgressInsights(
    userId: string,
    moodHistory: Array<{ mood: string; timestamp: Date }>,
    conversationHistory: Array<{ text: string; sender: string }>
  ): Promise<{
    overall_trend: string;
    key_insights: string[];
    recommendations: string[];
    mood_patterns: string[];
  }> {
    try {
      const moodTrend = this.analyzeMoodTrend(moodHistory);

      const conversationInsights =
        this.extractConversationInsights(conversationHistory);

      const patterns = this.detectMoodPatterns(moodHistory);

      /* Generate AI-powered insights */
      const insightsQuery = `Analyze mental health progress based on mood trend: ${moodTrend} and conversation themes: ${conversationInsights.join(
        ", "
      )}`;
      const ragResponse = await this.ragService.query(
        insightsQuery,
        userId,
        []
      );

      return {
        overall_trend: moodTrend,
        key_insights: [ragResponse.answer, ...conversationInsights],
        recommendations: await this.generateProgressRecommendations(
          moodTrend,
          patterns
        ),
        mood_patterns: patterns,
      };
    } catch (error) {
      console.error("Progress insights generation failed:", error);
      throw error;
    }
  }

  private async generateRecommendations(
    prompt: string,
    context: ConversationContext,
    sources: any[]
  ): Promise<string[]> {
    const recommendations = [];

    /* Based on conversation themes */
    const themes = this.extractThemes(
      context.conversationHistory.map((msg) => msg.text)
    );

    for (const theme of themes.slice(0, 2)) {
      const resources = await this.ragService.searchResources(
        theme,
        "Coping Strategies"
      );
      if (resources.length > 0) {
        recommendations.push(resources[0].metadata.title);
      }
    }

    /* Based on mood */
    if (context.currentMood) {
      const moodRecs = await this.getMoodBasedRecommendations(
        context.currentMood,
        context.userId,
        context.conversationHistory
      );
      recommendations.push(...moodRecs.slice(0, 1));
    }

    return recommendations.slice(0, 3);
  }

  private analyzeConversationContext(
    history: Array<{ text: string; sender: string }>,
    currentSentiment: any
  ): any {
    const userMessages = history
      .filter((msg) => msg.sender === "user")
      .map((msg) => msg.text);

    return {
      themes: this.extractThemes(userMessages),
      mood_trend: this.determineMoodTrend(userMessages, currentSentiment),
      session_progress: this.assessSessionProgress(history),
    };
  }

  private extractThemes(messages: string[]): string[] {
    const themes = new Set<string>();
    const themeKeywords = {
      anxiety: ["anxious", "worry", "nervous", "panic", "fear"],
      depression: ["sad", "depressed", "down", "hopeless"],
      stress: ["stressed", "overwhelmed", "pressure"],
      relationships: ["relationship", "family", "friends", "social"],
      work: ["work", "job", "career", "workplace"],
      "self-care": ["sleep", "exercise", "nutrition", "relaxation"],
    };

    const allText = messages.join(" ").toLowerCase();

    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some((keyword) => allText.includes(keyword))) {
        themes.add(theme);
      }
    }

    return Array.from(themes);
  }

  private determineMoodTrend(
    messages: string[],
    currentSentiment: any
  ): string {
    const positiveWords = ["better", "good", "improving", "positive", "happy"];
    const negativeWords = [
      "worse",
      "bad",
      "terrible",
      "difficult",
      "struggling",
    ];

    const recentText = messages.slice(-3).join(" ").toLowerCase();

    const positiveCount = positiveWords.filter((word) =>
      recentText.includes(word)
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      recentText.includes(word)
    ).length;

    if (currentSentiment.score > 0.3) return "improving";
    if (currentSentiment.score < -0.3) return "declining";
    if (positiveCount > negativeCount) return "stable_positive";
    if (negativeCount > positiveCount) return "stable_negative";
    return "neutral";
  }

  private assessSessionProgress(
    history: Array<{ text: string; sender: string }>
  ): string {
    const messageCount = history.length;

    if (messageCount < 4) return "early_stage";
    if (messageCount < 10) return "building_rapport";
    if (messageCount < 20) return "active_discussion";
    return "deep_exploration";
  }

  private detectPatterns(entries: string[]): string[] {
    const patterns = [];

    /* Time-based patterns (ToDo: would need timestamp analysis in real implementation) */
    const morningWords = ["morning", "wake", "start of day"];
    const eveningWords = ["evening", "night", "end of day"];

    const allText = entries.join(" ").toLowerCase();

    if (morningWords.some((word) => allText.includes(word))) {
      patterns.push("morning_reflections");
    }

    if (eveningWords.some((word) => allText.includes(word))) {
      patterns.push("evening_processing");
    }

    /* Emotional patterns */
    if (allText.includes("always") || allText.includes("never")) {
      patterns.push("absolute_thinking");
    }

    return patterns;
  }

  private analyzeMoodTrend(
    moodHistory: Array<{ mood: string; timestamp: Date }>
  ): string {
    if (moodHistory.length < 3) return "insufficient_data";

    const recent = moodHistory.slice(-7); /* Last 7 entries */
    const moodScores = recent.map((entry) => this.moodToScore(entry.mood));

    const trend = moodScores.reduce((sum, score, index) => {
      if (index === 0) return 0;
      return sum + (score - moodScores[index - 1]);
    }, 0);

    if (trend > 2) return "improving";
    if (trend < -2) return "declining";
    return "stable";
  }

  private moodToScore(mood: string): number {
    const moodScores = {
      "😊 Great": 5,
      Great: 5,
      "😌 Good": 4,
      Good: 4,
      "😐 Okay": 3,
      Okay: 3,
      "😔 Low": 2,
      Low: 2,
      "😢 Struggling": 1,
      Struggling: 1,
    };
    return moodScores[mood] || 3;
  }

  private extractConversationInsights(
    history: Array<{ text: string; sender: string }>
  ): string[] {
    const insights = [];
    const userMessages = history
      .filter((msg) => msg.sender === "user")
      .map((msg) => msg.text);

    /* Look for breakthrough moments */
    const breakthroughWords = [
      "realize",
      "understand",
      "clarity",
      "makes sense",
    ];
    const recentText = userMessages.slice(-5).join(" ").toLowerCase();

    if (breakthroughWords.some((word) => recentText.includes(word))) {
      insights.push("User showing increased self-awareness and insight");
    }

    /* Look for coping strategy mentions */
    const copingWords = ["breathing", "meditation", "exercise", "journal"];
    if (copingWords.some((word) => recentText.includes(word))) {
      insights.push("User actively engaging with coping strategies");
    }

    return insights;
  }

  private detectMoodPatterns(
    moodHistory: Array<{ mood: string; timestamp: Date }>
  ): string[] {
    const patterns = [];

    if (moodHistory.length < 7) return patterns;

    // Weekly pattern detection would go here
    // For now, return basic patterns
    const moodTypes = moodHistory.map((entry) => entry.mood);
    const uniqueMoods = new Set(moodTypes);

    if (uniqueMoods.size === 1) {
      patterns.push("consistent_mood");
    } else if (uniqueMoods.size > 3) {
      patterns.push("mood_variability");
    }

    return patterns;
  }

  private async generateProgressRecommendations(
    trend: string,
    patterns: string[]
  ): Promise<string[]> {
    const recommendations = [];

    switch (trend) {
      case "improving":
        recommendations.push("Continue current positive strategies");
        recommendations.push("Set new wellness goals");
        break;
      case "declining":
        recommendations.push("Consider additional support resources");
        recommendations.push("Review and adjust coping strategies");
        break;
      case "stable":
        recommendations.push("Maintain current wellness routine");
        recommendations.push("Explore new growth opportunities");
        break;
    }

    return recommendations;
  }

  private async generateJournalRecommendations(
    entry: string,
    themes: string[],
    sentiment: any
  ): Promise<string[]> {
    const recommendations = [];

    if (sentiment.score < -0.5) {
      recommendations.push("Consider practicing self-compassion exercises");
      recommendations.push("Reach out to your support system");
    }

    if (themes.includes("anxiety")) {
      recommendations.push("Try the 5-4-3-2-1 grounding technique");
    }

    if (themes.includes("stress")) {
      recommendations.push("Practice deep breathing exercises");
    }

    return recommendations;
  }

  private async fallbackResponse(
    prompt: string,
    context: ConversationContext
  ): Promise<EnhancedAIResponse> {
    /* Fallback to basic Gemini response */
    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash-001",
    });

    const therapyPrompt = `As an AI therapist, respond empathetically to: "${prompt}"`;

    const result = await model.generateContent(therapyPrompt);
    const response = result.response.text();

    return {
      response,
      sentiment: { score: 0, label: "neutral", confidence: 0.5 },
    };
  }
}
