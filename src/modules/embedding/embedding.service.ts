import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private genAI: GoogleGenerativeAI;
  private embeddingModel: any;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('llm.geminiApiKey');

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not set, embedding features will be disabled');
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
    this.logger.log('Embedding service initialized with Gemini text-embedding-004');
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text: string): Promise<number[] | null> {
    if (!this.embeddingModel) {
      this.logger.warn('Embedding model not initialized');
      return null;
    }

    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate embedding for a recipe (combines title, description, ingredients, tags)
   */
  async generateRecipeEmbedding(recipe: {
    title: string;
    description?: string;
    ingredients: string[];
    tags?: string[];
  }): Promise<number[] | null> {
    // Combine recipe attributes into a single text for embedding
    const textParts = [
      recipe.title,
      recipe.description || '',
      `Bahan: ${recipe.ingredients.join(', ')}`,
      recipe.tags ? `Tags: ${recipe.tags.join(', ')}` : '',
    ];

    const combinedText = textParts.filter(Boolean).join('. ');
    return this.generateEmbedding(combinedText);
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimension');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Find most similar embeddings from a list
   */
  findSimilar(
    targetEmbedding: number[],
    candidateEmbeddings: { id: string; embedding: number[] }[],
    topK: number = 5,
  ): { id: string; similarity: number }[] {
    const similarities = candidateEmbeddings.map((candidate) => ({
      id: candidate.id,
      similarity: this.cosineSimilarity(targetEmbedding, candidate.embedding),
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
}
