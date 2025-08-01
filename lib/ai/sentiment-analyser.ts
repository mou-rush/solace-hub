export interface SentimentResult {
  score: number; // -1 to 1 scale
  label: string; // positive, negative, neutral
  confidence: number; // 0 to 1
  emotions: {
    anxiety: number;
    depression: number;
    happiness: number;
    anger: number;
    fear: number;
  };
}

export class SentimentAnalyzer {
  private positiveWords: Set<string>;
  private negativeWords: Set<string>;
  private emotionKeywords: Record<string, string[]>;
  private initialized = false;

  constructor() {
    this.positiveWords = new Set();
    this.negativeWords = new Set();
    this.emotionKeywords = {};
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    /* Positive words lexicon */
    const positiveWords = [
      "happy",
      "joy",
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "awesome",
      "brilliant",
      "perfect",
      "love",
      "like",
      "enjoy",
      "pleased",
      "satisfied",
      "content",
      "grateful",
      "thankful",
      "blessed",
      "lucky",
      "fortunate",
      "optimistic",
      "hopeful",
      "confident",
      "excited",
      "enthusiastic",
      "proud",
      "accomplished",
      "successful",
      "better",
      "improved",
      "progress",
      "healing",
      "recovery",
      "positive",
      "calm",
      "peaceful",
      "relaxed",
      "motivated",
      "inspired",
      "energetic",
    ];

    /* Negative words lexicon */
    const negativeWords = [
      "sad",
      "depressed",
      "unhappy",
      "miserable",
      "terrible",
      "awful",
      "horrible",
      "bad",
      "worse",
      "worst",
      "hate",
      "dislike",
      "angry",
      "furious",
      "mad",
      "annoyed",
      "frustrated",
      "irritated",
      "upset",
      "worried",
      "anxious",
      "nervous",
      "scared",
      "afraid",
      "fearful",
      "terrified",
      "panic",
      "stressed",
      "overwhelmed",
      "exhausted",
      "tired",
      "drained",
      "hopeless",
      "helpless",
      "worthless",
      "useless",
      "guilty",
      "ashamed",
      "embarrassed",
      "lonely",
      "isolated",
      "rejected",
      "abandoned",
      "betrayed",
      "hurt",
      "pain",
      "suffering",
      "struggling",
      "difficult",
      "hard",
      "challenging",
      "impossible",
      "failure",
      "failed",
      "broken",
      "damaged",
      "destroyed",
      "ruined",
      "devastated",
      "crushed",
    ];

    /* Emotion-specific keywords */
    this.emotionKeywords = {
      anxiety: [
        "anxious",
        "worried",
        "nervous",
        "panic",
        "fear",
        "scared",
        "afraid",
        "terrified",
        "overwhelmed",
        "stressed",
        "tense",
        "uneasy",
        "restless",
        "jittery",
        "on edge",
        "butterflies",
        "racing heart",
        "sweating",
        "trembling",
        "what if",
        "catastrophe",
        "disaster",
        "doom",
      ],
      depression: [
        "depressed",
        "sad",
        "down",
        "low",
        "blue",
        "hopeless",
        "helpless",
        "worthless",
        "empty",
        "numb",
        "tired",
        "exhausted",
        "drained",
        "unmotivated",
        "apathetic",
        "withdrawn",
        "isolated",
        "lonely",
        "crying",
        "tears",
        "sleep all day",
        "no energy",
        "pointless",
      ],
      happiness: [
        "happy",
        "joy",
        "joyful",
        "cheerful",
        "glad",
        "pleased",
        "content",
        "satisfied",
        "delighted",
        "thrilled",
        "excited",
        "elated",
        "ecstatic",
        "blissful",
        "euphoric",
        "optimistic",
        "hopeful",
        "grateful",
        "thankful",
        "blessed",
        "lucky",
        "smile",
        "laugh",
        "celebration",
      ],
      anger: [
        "angry",
        "mad",
        "furious",
        "rage",
        "enraged",
        "livid",
        "irate",
        "annoyed",
        "irritated",
        "frustrated",
        "aggravated",
        "pissed",
        "outraged",
        "indignant",
        "resentful",
        "bitter",
        "hostile",
        "aggressive",
        "violent",
        "explosive",
        "seething",
        "boiling",
      ],
      fear: [
        "fear",
        "scared",
        "afraid",
        "terrified",
        "frightened",
        "petrified",
        "horrified",
        "alarmed",
        "startled",
        "threatened",
        "vulnerable",
        "insecure",
        "paranoid",
        "phobia",
        "nightmare",
        "terror",
        "dread",
      ],
    };

    /* Initialize word sets */
    this.positiveWords = new Set(positiveWords);
    this.negativeWords = new Set(negativeWords);

    this.initialized = true;
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    const words = this.tokenize(text.toLowerCase());

    /* Calculate basic sentiment */
    let positiveScore = 0;
    let negativeScore = 0;
    let totalWords = words.length;

    for (const word of words) {
      if (this.positiveWords.has(word)) {
        positiveScore += 1;
      }
      if (this.negativeWords.has(word)) {
        negativeScore += 1;
      }
    }

    /* Normalize scores */
    const normalizedPositive = totalWords > 0 ? positiveScore / totalWords : 0;
    const normalizedNegative = totalWords > 0 ? negativeScore / totalWords : 0;

    /* Calculate overall sentiment score (-1 to 1) */
    const sentimentScore = normalizedPositive - normalizedNegative;

    /* Apply contextual modifiers */
    const modifiedScore = this.applyContextualModifiers(text, sentimentScore);

    /* Determine label and confidence */
    const { label, confidence } =
      this.calculateLabelAndConfidence(modifiedScore);

    /* Analyze emotions */
    const emotions = this.analyzeEmotions(words);

    return {
      score: modifiedScore,
      label,
      confidence,
      emotions,
    };
  }

  private tokenize(text: string): string[] {
    /* Simple tokenization. splitting by spaces and remove punctuation */
    return text
      .replace(/[^\w\s]/gi, " ")
      .split(/\s+/)
      .filter((word) => word.length > 0);
  }

  private applyContextualModifiers(text: string, baseScore: number): number {
    let modifiedScore = baseScore;
    const lowerText = text.toLowerCase();

    /* Negation handling */
    const negationWords = [
      "not",
      "no",
      "never",
      "nothing",
      "nobody",
      "nowhere",
      "neither",
      "nor",
    ];
    const hasNegation = negationWords.some((word) => lowerText.includes(word));

    if (hasNegation) {
      /* Flip the sentiment if negation is present */
      modifiedScore = -modifiedScore * 0.8;
    }

    /* Intensifiers */
    const intensifiers = {
      very: 1.3,
      extremely: 1.5,
      really: 1.2,
      so: 1.2,
      quite: 1.1,
      totally: 1.4,
      completely: 1.4,
      absolutely: 1.5,
      incredibly: 1.4,
      amazingly: 1.3,
    };

    for (const [intensifier, multiplier] of Object.entries(intensifiers)) {
      if (lowerText.includes(intensifier)) {
        modifiedScore = modifiedScore * multiplier;
        break; /* Apply only the first intensifier found */
      }
    }

    const diminishers = {
      "a little": 0.7,
      somewhat: 0.8,
      "kind of": 0.7,
      "sort of": 0.7,
      rather: 0.8,
      fairly: 0.8,
      slightly: 0.6,
      barely: 0.5,
    };

    for (const [diminisher, multiplier] of Object.entries(diminishers)) {
      if (lowerText.includes(diminisher)) {
        modifiedScore = modifiedScore * multiplier;
        break;
      }
    }

    /* Mental health specific modifiers */
    if (
      lowerText.includes("feeling better") ||
      lowerText.includes("getting better")
    ) {
      modifiedScore = Math.max(modifiedScore, 0.3);
    }

    if (
      lowerText.includes("getting worse") ||
      lowerText.includes("feeling worse")
    ) {
      modifiedScore = Math.min(modifiedScore, -0.3);
    }

    /* Clamp to [-1, 1] range */
    return Math.max(-1, Math.min(1, modifiedScore));
  }

  private calculateLabelAndConfidence(score: number): {
    label: string;
    confidence: number;
  } {
    const absScore = Math.abs(score);

    let label: string;
    let confidence: number;

    if (absScore < 0.1) {
      label = "neutral";
      confidence =
        1 -
        absScore *
          5; /* Higher confidence for neutral when score is close to 0 */
    } else if (score > 0) {
      label = "positive";
      confidence = Math.min(0.95, absScore * 2);
    } else {
      label = "negative";
      confidence = Math.min(0.95, absScore * 2);
    }

    return { label, confidence: Math.max(0.1, confidence) };
  }

  private analyzeEmotions(words: string[]): SentimentResult["emotions"] {
    const emotions = {
      anxiety: 0,
      depression: 0,
      happiness: 0,
      anger: 0,
      fear: 0,
    };

    const totalWords = words.length;
    if (totalWords === 0) return emotions;

    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      let emotionScore = 0;

      for (const word of words) {
        if (keywords.includes(word)) {
          emotionScore += 1;
        }
      }

      /* Normalize emotion scores */
      emotions[emotion as keyof typeof emotions] = emotionScore / totalWords;
    }

    return emotions;
  }

  async batchAnalyzeSentiment(texts: string[]): Promise<SentimentResult[]> {
    const results: SentimentResult[] = [];

    for (const text of texts) {
      const result = await this.analyzeSentiment(text);
      results.push(result);
    }

    return results;
  }

  async analyzeMoodTrend(
    sentimentHistory: Array<{ sentiment: SentimentResult; timestamp: Date }>
  ): Promise<{
    trend: "improving" | "declining" | "stable";
    averageScore: number;
    emotionalProfile: SentimentResult["emotions"];
    volatility: number;
  }> {
    if (sentimentHistory.length < 2) {
      return {
        trend: "stable",
        averageScore: 0,
        emotionalProfile: {
          anxiety: 0,
          depression: 0,
          happiness: 0,
          anger: 0,
          fear: 0,
        },
        volatility: 0,
      };
    }

    const scores = sentimentHistory.map((item) => item.sentiment.score);
    const recent = scores.slice(-7); /* Last 7 entries */
    const older = scores.slice(-14, -7); /* Previous 7 entries */

    /* Calculate averages */
    const recentAvg =
      recent.reduce((sum, score) => sum + score, 0) / recent.length;
    const olderAvg =
      older.length > 0
        ? older.reduce((sum, score) => sum + score, 0) / older.length
        : recentAvg;

    /* Determining trend */
    const trendDiff = recentAvg - olderAvg;
    let trend: "improving" | "declining" | "stable";

    if (trendDiff > 0.1) {
      trend = "improving";
    } else if (trendDiff < -0.1) {
      trend = "declining";
    } else {
      trend = "stable";
    }

    /* Calculating overall average */
    const averageScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    /* Calculate emotional profile (average emotions) */
    const emotionalProfile = {
      anxiety: 0,
      depression: 0,
      happiness: 0,
      anger: 0,
      fear: 0,
    };

    for (const item of sentimentHistory) {
      for (const [emotion, value] of Object.entries(item.sentiment.emotions)) {
        emotionalProfile[emotion as keyof typeof emotionalProfile] += value;
      }
    }

    /* Normalizing emotional profile */
    for (const emotion in emotionalProfile) {
      emotionalProfile[emotion as keyof typeof emotionalProfile] /=
        sentimentHistory.length;
    }

    /* Calculating volatility (standard deviation of scores) */
    const variance =
      scores.reduce((sum, score) => {
        return sum + Math.pow(score - averageScore, 2);
      }, 0) / scores.length;
    const volatility = Math.sqrt(variance);

    return {
      trend,
      averageScore,
      emotionalProfile,
      volatility,
    };
  }

  getDominantEmotion(emotions: SentimentResult["emotions"]): {
    emotion: string;
    intensity: number;
  } {
    let maxEmotion = "neutral";
    let maxIntensity = 0;

    for (const [emotion, intensity] of Object.entries(emotions)) {
      if (intensity > maxIntensity) {
        maxEmotion = emotion;
        maxIntensity = intensity;
      }
    }

    return {
      emotion: maxEmotion,
      intensity: maxIntensity,
    };
  }

  getEmotionInsights(emotions: SentimentResult["emotions"]): string[] {
    const insights: string[] = [];
    const threshold = 0.05; /* 5% threshold for emotion detection */

    if (emotions.anxiety > threshold) {
      insights.push(
        `Anxiety levels detected (${(emotions.anxiety * 100).toFixed(1)}%)`
      );
    }

    if (emotions.depression > threshold) {
      insights.push(
        `Signs of depression detected (${(emotions.depression * 100).toFixed(
          1
        )}%)`
      );
    }

    if (emotions.happiness > threshold) {
      insights.push(
        `Positive emotions present (${(emotions.happiness * 100).toFixed(1)}%)`
      );
    }

    if (emotions.anger > threshold) {
      insights.push(
        `Anger indicators found (${(emotions.anger * 100).toFixed(1)}%)`
      );
    }

    if (emotions.fear > threshold) {
      insights.push(
        `Fear-related content detected (${(emotions.fear * 100).toFixed(1)}%)`
      );
    }

    return insights;
  }
}
