import {  ObjectDetection, FaceDetection, DetectionResult } from '../../components/computer-vision/types';

// Basic lists of prohibited objects
const PROHIBITED_OBJECTS = ['cell phone', 'book', 'laptop', 'remote', 'keyboard'];
const ALLOWED_OBJECTS = ['cup', 'bottle', 'glasses', 'pen', 'pencil', 'mouse', 'paper', 'notebook'];

/**
 * Simplified object detection function
 */
export const detectObjects = async (
  video: HTMLVideoElement,
  objectModel: {
    detect: (input: HTMLVideoElement) => Promise<ObjectDetection[]>;
  },
  faceModel: {
    estimateFaces: (input: HTMLVideoElement) => Promise<FaceDetection[]>;
  } | null,
  canvas: HTMLCanvasElement | null
): Promise<DetectionResult> => {
  // Initialize results
  const result: DetectionResult = {
    relevantObjects: [],
    stats: {
      cellPhones: 0,
      books: 0,
      faces: 0
    },
    events: {
      noFace: false,
      hasCellPhone: false,
      hasBook: false,
      multipleFaces: false
    }
  };

  if (!video || !objectModel) {
    return result;
  }

  try {
    // Basic object detection
    const objects: ObjectDetection[] = await objectModel.detect(video);
    
    // Basic face detection
    let faces: FaceDetection[] = [];
    if (faceModel) {
      try {
        faces = await faceModel.estimateFaces(video);
      } catch (error) {
        console.warn('Face detection failed:', error);
      }
    }
    
    // Update face stats
    result.stats.faces = faces.length;
    
    // Update events
    result.events.noFace = (result.stats.faces === 0);
    result.events.multipleFaces = (result.stats.faces > 1);
    
    // Process objects (excluding persons)
    objects.forEach((object: ObjectDetection) => {
      const objectClass = object.class.toLowerCase();
      
      // Skip person objects
      if (objectClass === "person") {
        return;
      }
      
      // Check if object is prohibited or allowed
      const isProhibited = PROHIBITED_OBJECTS.some(item => objectClass.includes(item));
      const isAllowed = ALLOWED_OBJECTS.some(item => objectClass.includes(item));
      
      // Handle specific objects
      if (objectClass === 'cell phone') {
        result.stats.cellPhones++;
        result.events.hasCellPhone = true;
        result.relevantObjects.push({
          ...object,
          isWarning: true,
          isProhibited: true
        });
      } else if (objectClass === 'book') {
        result.stats.books++;
        result.events.hasBook = true;
        result.relevantObjects.push({
          ...object,
          isWarning: true,
          isProhibited: true
        });
      } else {
        // Other objects
        result.relevantObjects.push({
          ...object,
          isProhibited,
          isAllowed: isAllowed && !isProhibited
        });
      }
    });
    
    // Add faces to relevant objects
    if (faces.length > 0) {
      faces.forEach((face: FaceDetection, index: number) => {
        // Try to extract face box data from different formats
        let box = null;
        if (face.box) {
          box = face.box;
        } else if (face.boundingBox) {
          box = face.boundingBox;
        }
        
        if (box) {
          // Convert coordinates to pixel values if needed
          let x = box.xMin !== undefined ? box.xMin : (box.x !== undefined ? box.x : 0);
          let y = box.yMin !== undefined ? box.yMin : (box.y !== undefined ? box.y : 0);
          let width = box.width !== undefined ? box.width : 100;
          let height = box.height !== undefined ? box.height : 100;
          
          if (width < 1 && height < 1) {
            x = x * video.videoWidth;
            y = y * video.videoHeight;
            width = width * video.videoWidth;
            height = height * video.videoHeight;
          }
          
          result.relevantObjects.push({
            bbox: [x, y, width, height] as [number, number, number, number],
            class: faces.length === 1 ? "Face (Allowed)" : `Face (Not Allowed)`,
            score: face.score || 0.9,
            isFace: true,
            isAllowed: faces.length === 1,
            isProhibited: faces.length > 1,
            isWarning: faces.length > 1
          });
        }
      });
    }
  } catch (error) {
    console.error('Error during detection:', error);
  }

  return result;
}; 