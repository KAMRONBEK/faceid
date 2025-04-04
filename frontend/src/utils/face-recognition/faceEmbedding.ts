import * as tf from '@tensorflow/tfjs';
import * as faceDetection from '@tensorflow-models/face-detection';

// Cache for models to avoid reloading
let faceDetector: faceDetection.FaceDetector | null = null;
let mobileNetModel: tf.GraphModel | null = null;

/**
 * Loads the face detection model
 */
export async function loadFaceDetectionModel(): Promise<faceDetection.FaceDetector> {
  if (faceDetector) return faceDetector;
  
  const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
  const detectorConfig = {
    runtime: 'tfjs' as const,
    modelType: 'short' as const,
  };
  
  faceDetector = await faceDetection.createDetector(model, detectorConfig);
  return faceDetector;
}

/**
 * Loads MobileNet model for face embeddings
 */
export async function loadMobileNetModel(): Promise<tf.GraphModel> {
  if (mobileNetModel) return mobileNetModel;
  
  // Use MobileNet as feature extractor
  mobileNetModel = await tf.loadGraphModel(
    'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1',
    { fromTFHub: true }
  );
  
  return mobileNetModel;
}

/**
 * Preprocesses an image for the neural network
 */
export async function preprocessImage(imgData: string): Promise<tf.Tensor3D> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Convert image to tensor and preprocess
      const tensor = tf.browser.fromPixels(img)
        .resizeBilinear([224, 224]) // MobileNet input size
        .toFloat()
        .div(tf.scalar(255.0)) // Normalize to [0,1]
        .expandDims(0); // Add batch dimension
      
      resolve(tensor as unknown as tf.Tensor3D);
    };
    img.onerror = () => {
      reject(new Error('Error loading image'));
    };
    img.src = imgData;
  });
}

/**
 * Generates embedding from a face image
 */
export async function generateFaceEmbedding(imgData: string): Promise<Float32Array> {
  try {
    const model = await loadMobileNetModel();
    const tensor = await preprocessImage(imgData);
    
    // Generate embedding
    const embedding = model.predict(tensor) as tf.Tensor;
    const embeddingData = await embedding.data() as Float32Array;
    
    // Cleanup tensors
    tensor.dispose();
    embedding.dispose();
    
    return embeddingData;
  } catch (error) {
    console.error('Error generating face embedding:', error);
    throw error;
  }
}

/**
 * Calculates cosine similarity between two embeddings
 * with improved scaling to create better separation between matched and unmatched faces
 */
export function calculateSimilarity(embedding1: Float32Array, embedding2: Float32Array): number {
  // Ensure embeddings are of same length
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embedding dimensions don\'t match');
  }
  
  // Calculate dot product
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    mag1 += embedding1[i] * embedding1[i];
    mag2 += embedding2[i] * embedding2[i];
  }
  
  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  // Raw cosine similarity in [-1,1] range
  const rawSimilarity = dotProduct / (mag1 * mag2);
  
  // Apply a non-linear transformation to increase separation:
  // - Values below 0.8 (raw similarity) drop more rapidly
  // - Values above 0.8 are stretched to fill the upper range
  // This creates better separation between authorized users and others
  
  // Convert raw similarity from [-1,1] to [0,1]
  const normalizedSimilarity = (rawSimilarity + 1) / 2;
  
  // Apply a power function to create more separation
  // Higher exponents create more separation but might be too aggressive
  const power = 4; // Increase this value to create sharper separation
  
  // Apply non-linear transformation and scale to percentage
  if (normalizedSimilarity >= 0.8) {
    // Stretch the upper range [0.8, 1.0] to [70, 100]
    return 70 + ((normalizedSimilarity - 0.8) / 0.2) * 30;
  } else {
    // Apply stronger drop-off to lower similarities
    return Math.pow(normalizedSimilarity / 0.8, power) * 70;
  }
}

/**
 * Extracts face from an image and generates embedding
 * Returns only the embedding, not the face image
 */
export async function extractFaceAndGenerateEmbedding(imgData: string): Promise<{
  embedding: Float32Array;
}> {
  try {
    // Load face detection model
    const detector = await loadFaceDetectionModel();
    
    // Detect faces
    const img = new Image();
    img.src = imgData;
    
    // Wait for image to load
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    
    const faces = await detector.estimateFaces(img);
    
    if (faces.length === 0) {
      throw new Error('No face detected');
    }
    
    if (faces.length > 1) {
      throw new Error('Multiple faces detected. Please ensure only one face is visible.');
    }
    
    // Extract face from image
    const face = faces[0];
    const box = face.box;
    
    // Create canvas to extract face
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    // Add padding to face bounding box
    const padding = Math.min(box.width, box.height) * 0.2;
    const x = Math.max(0, box.xMin - padding);
    const y = Math.max(0, box.yMin - padding);
    const width = Math.min(img.width - x, box.width + padding * 2);
    const height = Math.min(img.height - y, box.height + padding * 2);
    
    // Set canvas dimensions and draw face
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
    
    // Get face image as data URL (temporary, not saved)
    const faceImage = canvas.toDataURL('image/jpeg', 0.9);
    
    // Generate embedding from the face image
    const embedding = await generateFaceEmbedding(faceImage);
    
    // Return only the embedding, not the face image
    return { embedding };
  } catch (error) {
    console.error('Error processing face:', error);
    throw error;
  }
}

/**
 * Compares a live face image against a stored face embedding
 */
export async function compareFaceWithEmbedding(liveImage: string, storedEmbedding: number[]): Promise<number> {
  try {
    // Extract face and generate embedding from live image
    const { embedding: liveEmbedding } = await extractFaceAndGenerateEmbedding(liveImage);
    
    // Convert stored embedding array back to Float32Array
    const storedEmbeddingFloat32 = new Float32Array(storedEmbedding);
    
    // Calculate similarity between the two embeddings
    return calculateSimilarity(liveEmbedding, storedEmbeddingFloat32);
  } catch (error) {
    console.error('Error comparing face with embedding:', error);
    throw error;
  }
} 