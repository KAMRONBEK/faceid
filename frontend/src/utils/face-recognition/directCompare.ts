import { extractFaceAndGenerateEmbedding, calculateSimilarity } from './faceEmbedding';

/**
 * A direct utility to compare two face images without any UI dependencies
 * Returns the similarity score as a percentage
 */
export async function directCompareFaces(image1Base64: string, image2Base64: string): Promise<number> {
  try {
    console.log('Starting direct face comparison...');
    
    // Extract embeddings from first image
    console.log('Processing first image...');
    const { embedding: embedding1 } = await extractFaceAndGenerateEmbedding(image1Base64);
    
    // Extract embeddings from second image
    console.log('Processing second image...');
    const { embedding: embedding2 } = await extractFaceAndGenerateEmbedding(image2Base64);
    
    // Calculate similarity between the embeddings
    console.log('Calculating similarity...');
    const similarity = calculateSimilarity(embedding1, embedding2);
    
    console.log(`Direct comparison result: ${Math.round(similarity)}% similarity`);
    return similarity;
  } catch (error) {
    console.error('Error in direct face comparison:', error);
    throw error;
  }
} 