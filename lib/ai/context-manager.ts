export interface UserContext {
  userId: string;
  sessionCount: number;
  totalMessages: number;
  moodPatterns: string[];
  themes: string[];
  lastInteraction: Date;
  preferences: {
    responseStyle: string;
    focusAreas: string[];
  };
  conversationSummary: string;
  recentTopics: string[];
}

export interface ConversationMemory {
  shortTerm: Array<{ text: string; sender: string; timestamp: Date }>;
  longTerm: {
    keyInsights: string[];
    recurringThemes: string[];
    progressNotes: string[];
    goals: string[];
  };
}

export class ContextManager {
  private userContexts: Map<string, UserContext> = new Map();
  private conversationMemories: Map<string, ConversationMemory> = new Map();
  private readonly maxShortTermMemory = 20;
  private readonly maxLongTermInsights = 10;

  constructor() {
    this.loadFromStorage();
  }

  updateContext(
    userId: string,
    conversationHistory: Array<{
      text: string;
      sender: string;
      timestamp?: Date;
    }>
  ): void {
    try {
      let context = this.userContexts.get(userId);

      if (!context) {
        context = this.createNewUserContext(userId);
      }

      /* Update basic metrics */
      context.totalMessages = conversationHistory.length;
      context.lastInteraction = new Date();

      /* Analyze conversation for patterns and themes */
      const userMessages = conversationHistory
        .filter((msg) => msg.sender === "user")
        .map((msg) => msg.text);

      context.themes = this.extractThemes(userMessages);
      context.recentTopics = this.extractRecentTopics(userMessages.slice(-5));
      context.moodPatterns = this.analyzeMoodPatterns(userMessages);

      /* Update conversation memory */
      this.updateConversationMemory(userId, conversationHistory);

      /* Generate conversation summary */
      context.conversationSummary =
        this.generateConversationSummary(userMessages);

      this.userContexts.set(userId, context);
      this.saveToStorage();
    } catch (error) {
      console.error("Failed to update context:", error);
    }
  }

  private createNewUserContext(userId: string): UserContext {
    return {
      userId,
      sessionCount: 0,
      totalMessages: 0,
      moodPatterns: [],
      themes: [],
      lastInteraction: new Date(),
      preferences: {
        responseStyle: "balanced",
        focusAreas: [],
      },
      conversationSummary: "",
      recentTopics: [],
    };
  }

  private updateConversationMemory(
    userId: string,
    conversationHistory: Array<{
      text: string;
      sender: string;
      timestamp?: Date;
    }>
  ): void {
    let memory = this.conversationMemories.get(userId);

    if (!memory) {
      memory = {
        shortTerm: [],
        longTerm: {
          keyInsights: [],
          recurringThemes: [],
          progressNotes: [],
          goals: [],
        },
      };
    }

    /* Update short-term memory (recent messages) */
    memory.shortTerm = conversationHistory
      .slice(-this.maxShortTermMemory)
      .map((msg) => ({
        ...msg,
        timestamp: msg.timestamp || new Date(),
      }));

    /* Extract insights for long-term memory */
    const userMessages = conversationHistory
      .filter((msg) => msg.sender === "user")
      .map((msg) => msg.text);

    const newInsights = this.extractInsights(userMessages);
    memory.longTerm.keyInsights = [
      ...memory.longTerm.keyInsights,
      ...newInsights,
    ].slice(-this.maxLongTermInsights);

    /* Update recurring themes */
    memory.longTerm.recurringThemes = this.findRecurringThemes(
      memory.shortTerm
        .filter((msg) => msg.sender === "user")
        .map((msg) => msg.text)
    );

    this.conversationMemories.set(userId, memory);
  }

  private extractThemes(messages: string[]): string[] {
    const themes = new Set<string>();
    const themeKeywords = {
      anxiety: [
        "anxious",
        "worry",
        "worried",
        "nervous",
        "panic",
        "fear",
        "scared",
      ],
      depression: [
        "sad",
        "depressed",
        "down",
        "hopeless",
        "empty",
        "worthless",
      ],
      stress: ["stressed", "pressure", "overwhelmed", "burden", "exhausted"],
      relationships: [
        "relationship",
        "partner",
        "family",
        "friends",
        "social",
        "lonely",
      ],
      work: ["work", "job", "career", "boss", "colleague", "workplace"],
      sleep: ["sleep", "insomnia", "tired", "fatigue", "rest", "dreams"],
      "self-esteem": [
        "confidence",
        "self-worth",
        "insecure",
        "inadequate",
        "failure",
      ],
      trauma: ["trauma", "ptsd", "flashback", "trigger", "abuse", "assault"],
      grief: ["grief", "loss", "death", "mourning", "bereavement"],
    };

    const allText = messages.join(" ").toLowerCase();

    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      const matchCount = keywords.filter((keyword) =>
        allText.includes(keyword)
      ).length;

      if (matchCount >= 2) {
        themes.add(theme);
      }
    }

    return Array.from(themes);
  }

  private extractRecentTopics(recentMessages: string[]): string[] {
    if (recentMessages.length === 0) return [];

    const topics = new Set<string>();
    const topicKeywords = {
      "coping strategies": ["cope", "coping", "manage", "handle", "deal with"],
      "therapy techniques": [
        "breathing",
        "meditation",
        "mindfulness",
        "exercise",
      ],
      medication: [
        "medication",
        "pills",
        "prescription",
        "doctor",
        "psychiatrist",
      ],
      "support system": ["support", "help", "friends", "family", "therapist"],
      "daily routine": ["routine", "schedule", "daily", "habits", "activities"],
      goals: ["goal", "goals", "objective", "plan", "future", "improve"],
    };

    const recentText = recentMessages.join(" ").toLowerCase();

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      const hasKeyword = keywords.some((keyword) =>
        recentText.includes(keyword)
      );
      if (hasKeyword) {
        topics.add(topic);
      }
    }

    return Array.from(topics);
  }

  private analyzeMoodPatterns(messages: string[]): string[] {
    const patterns = [];
    const moodIndicators = {
      improving: ["better", "improving", "progress", "good", "positive"],
      declining: ["worse", "declining", "bad", "terrible", "awful"],
      stable: ["same", "stable", "consistent", "steady"],
      fluctuating: ["up and down", "varies", "changes", "different", "mixed"],
    };

    const recentText = messages.slice(-10).join(" ").toLowerCase();

    for (const [pattern, indicators] of Object.entries(moodIndicators)) {
      const matchCount = indicators.filter((indicator) =>
        recentText.includes(indicator)
      ).length;

      if (matchCount >= 1) {
        patterns.push(pattern);
      }
    }

    return patterns;
  }

  private generateConversationSummary(messages: string[]): string {
    if (messages.length === 0) return "No conversation history";

    const recentMessages = messages.slice(-5);
    const themes = this.extractThemes(recentMessages);
    const topics = this.extractRecentTopics(recentMessages);

    let summary = `Recent conversation focused on`;

    if (themes.length > 0) {
      summary += ` ${themes.join(", ")}`;
    }

    if (topics.length > 0) {
      summary += topics.length > 0 && themes.length > 0 ? `, discussing ` : ` `;
      summary += topics.join(", ");
    }

    if (themes.length === 0 && topics.length === 0) {
      summary += ` general mental health support`;
    }

    return summary + ".";
  }

  private extractInsights(messages: string[]): string[] {
    const insights = [];
    const insightPatterns = [
      {
        pattern: /i (realize|realized|understand|learned) (that )?(.+)/gi,
        type: "realization",
      },
      {
        pattern: /i (feel|felt) (better|worse|different) when (.+)/gi,
        type: "pattern recognition",
      },
      {
        pattern: /(.+) (helps|helped|works|worked) for me/gi,
        type: "coping strategy",
      },
      {
        pattern: /my goal is to (.+)/gi,
        type: "goal setting",
      },
    ];

    const allText = messages.join(" ");

    for (const { pattern, type } of insightPatterns) {
      const matches = allText.match(pattern);
      if (matches) {
        matches.slice(0, 2).forEach((match) => {
          insights.push(`${type}: ${match.trim()}`);
        });
      }
    }

    return insights;
  }

  private findRecurringThemes(messages: string[]): string[] {
    const themeCount = new Map<string, number>();

    /* Count theme occurrences across messages */
    messages.forEach((message) => {
      const themes = this.extractThemes([message]);
      themes.forEach((theme) => {
        themeCount.set(theme, (themeCount.get(theme) || 0) + 1);
      });
    });

    /* Return themes that appear in multiple messages */
    return Array.from(themeCount.entries())
      .filter(([, count]) => count >= 2)
      .map(([theme]) => theme);
  }

  getContext(userId: string): UserContext | null {
    return this.userContexts.get(userId) || null;
  }

  getConversationMemory(userId: string): ConversationMemory | null {
    return this.conversationMemories.get(userId) || null;
  }

  updateUserPreferences(
    userId: string,
    preferences: Partial<UserContext["preferences"]>
  ): void {
    const context = this.userContexts.get(userId);
    if (context) {
      context.preferences = { ...context.preferences, ...preferences };
      this.userContexts.set(userId, context);
      this.saveToStorage();
    }
  }

  incrementSessionCount(userId: string): void {
    const context = this.userContexts.get(userId);
    if (context) {
      context.sessionCount += 1;
      this.userContexts.set(userId, context);
      this.saveToStorage();
    }
  }

  addGoal(userId: string, goal: string): void {
    const memory = this.conversationMemories.get(userId);
    if (memory) {
      memory.longTerm.goals.push(goal);
      this.conversationMemories.set(userId, memory);
      this.saveToStorage();
    }
  }

  addProgressNote(userId: string, note: string): void {
    const memory = this.conversationMemories.get(userId);
    if (memory) {
      memory.longTerm.progressNotes.push(note);
      /* Keep only recent progress notes */
      memory.longTerm.progressNotes = memory.longTerm.progressNotes.slice(-5);
      this.conversationMemories.set(userId, memory);
      this.saveToStorage();
    }
  }

  private saveToStorage(): void {
    try {
      const contextData = Array.from(this.userContexts.entries());
      const memoryData = Array.from(this.conversationMemories.entries());

      localStorage.setItem("solace_user_contexts", JSON.stringify(contextData));
      localStorage.setItem(
        "solace_conversation_memories",
        JSON.stringify(memoryData)
      );
    } catch (error) {
      console.error("Failed to save context to storage:", error);
    }
  }

  private loadFromStorage(): void {
    try {
      const contextData = localStorage.getItem("solace_user_contexts");
      const memoryData = localStorage.getItem("solace_conversation_memories");

      if (contextData) {
        const contexts = JSON.parse(contextData);
        this.userContexts = new Map(contexts);
      }

      if (memoryData) {
        const memories = JSON.parse(memoryData);
        this.conversationMemories = new Map(memories);
      }
    } catch (error) {
      console.error("Failed to load context from storage:", error);
    }
  }

  clearUserData(userId: string): void {
    this.userContexts.delete(userId);
    this.conversationMemories.delete(userId);
    this.saveToStorage();
  }

  getAllUsers(): string[] {
    return Array.from(this.userContexts.keys());
  }

  getContextSummary(userId: string): string {
    const context = this.getContext(userId);
    const memory = this.getConversationMemory(userId);

    if (!context || !memory) {
      return "No context available";
    }

    return `User has had ${context.sessionCount} sessions with ${
      context.totalMessages
    } total messages. 
      Current themes: ${context.themes.join(", ") || "None identified"}. 
      Recent topics: ${context.recentTopics.join(", ") || "None"}. 
      Mood patterns: ${context.moodPatterns.join(", ") || "Stable"}.
      Active goals: ${memory.longTerm.goals.length}`;
  }
}
