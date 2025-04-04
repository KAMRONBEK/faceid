import { extractFaceAndGenerateEmbedding, calculateSimilarity } from './faceEmbedding';

/**
 * Tests face similarity between two face images
 * @param image1Base64 Base64 encoded first image 
 * @param image2Base64 Base64 encoded second image
 * @returns Promise with similarity score
 */
export async function testFaceSimilarity(image1Base64: string, image2Base64: string): Promise<number> {
  try {
    console.log('Starting face similarity test...');
    
    // Extract face features
    console.log('Extracting features from first image...');
    const { embedding: features1 } = await extractFaceAndGenerateEmbedding(image1Base64);
    
    console.log('Extracting features from second image...');
    const { embedding: features2 } = await extractFaceAndGenerateEmbedding(image2Base64);
    
    // Calculate similarity
    console.log('Calculating similarity with facial landmarks...');
    const similarity = calculateSimilarity(features1, features2);
    
    console.log(`Face similarity score: ${similarity.toFixed(2)}%`);
    return similarity;
  } catch (error) {
    console.error('Error testing face similarity:', error);
    throw error;
  }
} 