import { GoogleGenerativeAI } from "@google/generative-ai";
import { RAGDocument } from "./rag-service";

interface VectorEntry {
  id: string;
  vector: number[];
  document: RAGDocument;
}

export class VectorStore {
  private documents: Map<string, VectorEntry> = new Map();
  private genAI: GoogleGenerativeAI;
  private initialized = false;

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Google AI API key is required");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      /* Load existing vectors from localStorage if available */
      const stored = localStorage.getItem("solace_vector_store");
      if (stored) {
        const data = JSON.parse(stored);
        this.documents = new Map(data.map((item: any) => [item.id, item]));
      }
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize vector store:", error);
      this.initialized = true; /* Continue without stored data */
    }
  }

  async addDocument(document: RAGDocument): Promise<void> {
    try {
      /* Create text for embedding (combine title and content) */
      const textToEmbed = `${document.metadata.title} ${
        document.content
      } ${document.metadata.tags.join(" ")}`;

      /* Generate embedding using Gemini's embedding model */
      const vector = await this.generateEmbedding(textToEmbed);

      const entry: VectorEntry = {
        id: document.id,
        vector,
        document,
      };

      this.documents.set(document.id, entry);

      /* Persist to localStorage */
      this.saveToStorage();
    } catch (error) {
      console.error("Failed to add document to vector store:", error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use a simple TF-IDF-like approach for client-side embedding
      // In production, I have to use proper embedding models
      return this.simpleTextEmbedding(text);
    } catch (error) {
      console.error("Failed to generate embedding:", error);
      throw error;
    }
  }

  private simpleTextEmbedding(text: string): number[] {
    // Simple bag-of-words embedding for demonstration
    // This creates a 100-dimensional vector based on text characteristics
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(100).fill(0);

    /* Mental health keyword weights */
    const mentalHealthTerms = {
      anxiety: 1.5,
      depression: 1.5,
      stress: 1.3,
      panic: 1.4,
      worry: 1.2,
      fear: 1.2,
      sad: 1.3,
      mood: 1.3,
      therapy: 1.4,
      counseling: 1.4,
      treatment: 1.3,
      breathing: 1.2,
      relaxation: 1.2,
      mindfulness: 1.3,
      meditation: 1.3,
      exercise: 1.1,
      sleep: 1.2,
      support: 1.2,
      help: 1.1,
      coping: 1.3,
      technique: 1.2,
    };

    words.forEach((word, index) => {
      const weight = mentalHealthTerms[word] || 1.0;
      const hash1 = this.simpleHash(word) % 100;
      const hash2 = this.simpleHash(word + "salt") % 100;

      embedding[hash1] += weight;
      embedding[hash2] += weight * 0.5;
    });

    /* Normalize the vector */
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    return magnitude > 0 ? embedding.map((val) => val / magnitude) : embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; /* Convert to 32-bit integer */
    }
    return Math.abs(hash);
  }

  async similaritySearch(query: string, k: number = 5): Promise<RAGDocument[]> {
    if (this.documents.size === 0) {
      return [];
    }

    try {
      /* Generate embedding for query */
      const queryVector = await this.generateEmbedding(query);

      /* Calculate similarities */
      const similarities: Array<{ document: RAGDocument; similarity: number }> =
        [];

      for (const entry of this.documents.values()) {
        const similarity = this.cosineSimilarity(queryVector, entry.vector);
        similarities.push({ document: entry.document, similarity });
      }

      /* Sort by similarity and return top */
      similarities.sort((a, b) => b.similarity - a.similarity);

      return similarities.slice(0, k).map((item) => item.document);
    } catch (error) {
      console.error("Similarity search failed:", error);
      return [];
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.documents.values());
      localStorage.setItem("solace_vector_store", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save vector store to localStorage:", error);
    }
  }

  async removeDocument(id: string): Promise<void> {
    this.documents.delete(id);
    this.saveToStorage();
  }

  async clear(): Promise<void> {
    this.documents.clear();
    localStorage.removeItem("solace_vector_store");
  }

  getDocumentCount(): number {
    return this.documents.size;
  }

  async getDocumentsByCategory(category: string): Promise<RAGDocument[]> {
    const results: RAGDocument[] = [];

    for (const entry of this.documents.values()) {
      if (entry.document.metadata.category === category) {
        results.push(entry.document);
      }
    }

    return results;
  }

  async getDocumentsByTags(tags: string[]): Promise<RAGDocument[]> {
    const results: RAGDocument[] = [];

    for (const entry of this.documents.values()) {
      const docTags = entry.document.metadata.tags;
      const hasMatchingTag = tags.some((tag) =>
        docTags.some((docTag) =>
          docTag.toLowerCase().includes(tag.toLowerCase())
        )
      );

      if (hasMatchingTag) {
        results.push(entry.document);
      }
    }

    return results;
  }
}
