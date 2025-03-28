import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Detection } from '../../components/computer-vision/types';
import { detectObjects } from './detection';
import { drawRect } from './drawRect';

interface DetectionStats {
  persons: number;
  cellPhones: number;
  books: number;
  faces: number;
}

interface DetectionEvents {
  noFace: boolean;
  hasCellPhone: boolean;
  hasBook: boolean;
  multipleFaces: boolean;
}

interface DetectionResult {
  relevantObjects: Detection[];
  stats: DetectionStats;
  events: DetectionEvents;
}

interface DetectionHookOptions {
  /** Detection interval in milliseconds */
  interval?: number;
  /** Face detection model options */
  faceDetectionOptions?: {
    maxFaces?: number;
    modelType?: 'short' | 'full';
  };
  /** Callback when objects are detected */
  onDetection?: (result: DetectionResult) => void;
  /** Whether to log to console */
  enableLogging?: boolean;
  /** Whether to draw detection boxes on canvas */
  drawBoxes?: boolean;
}

interface DetectionHookReturn {
  /** Reference to set on your webcam component */
  webcamRef: React.RefObject<any>;
  /** Reference to set on your canvas element */
  canvasRef: React.RefObject<HTMLCanvasElement>;
  /** Whether models are currently loading */
  loading: boolean;
  /** Error message if model loading failed */
  error: string | null;
  /** Latest detection statistics */
  stats: DetectionStats;
  /** Manually trigger detection (normally called automatically at interval) */
  detectNow: () => Promise<DetectionResult | null>;
  /** Whether detection is currently running */
  isRunning: boolean;
  /** Start detection (automatically called after models load) */
  startDetection: () => void;
  /** Stop detection */
  stopDetection: () => void;
}

/**
 * Custom hook for object and face detection using TensorFlow.js
 * 
 * @param options Hook configuration options
 * @returns References and state for detection
 */
export const useDetectObjects = (options: DetectionHookOptions = {}): DetectionHookReturn => {
  // Extract options with defaults
  const {
    interval = 1500,
    faceDetectionOptions = { maxFaces: 5, modelType: 'short' },
    onDetection,
    enableLogging = false,
    drawBoxes = true // Default to drawing boxes
  } = options;

  // References that don't trigger re-renders
  const webcamRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);
  const mountedRef = useRef<boolean>(true);
  
  // State that triggers UI updates
  const [objectModel, setObjectModel] = useState<cocossd.ObjectDetection | null>(null);
  const [faceModel, setFaceModel] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [detectionResults, setDetectionResults] = useState<Detection[]>([]);
  const [stats, setStats] = useState<DetectionStats>({
    persons: 0,
    cellPhones: 0,
    books: 0,
    faces: 0
  });

  // Ensure component is mounted for async operations
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Memoize options to prevent recreation
  const config = useMemo(() => ({
    interval,
    faceDetectionOptions: {
      maxFaces: faceDetectionOptions.maxFaces,
      modelType: faceDetectionOptions.modelType
    },
    onDetection,
    enableLogging,
    drawBoxes
  }), [
    interval, 
    faceDetectionOptions.maxFaces, 
    faceDetectionOptions.modelType, 
    onDetection, 
    enableLogging,
    drawBoxes
  ]);

  // Clear detection interval
  const clearDetectionInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Stop detection
  const stopDetection = useCallback(() => {
    clearDetectionInterval();
    if (mountedRef.current) {
      setIsRunning(false);
    }
  }, [clearDetectionInterval]);

  // Run detection once
  const detectNow = useCallback(async (): Promise<DetectionResult | null> => {
    if (!objectModel || 
        !webcamRef.current?.video || 
        webcamRef.current.video.readyState !== 4) {
      return null;
    }
    
    const video = webcamRef.current.video;
    
    // Size canvas to match video
    if (canvasRef.current) {
      canvasRef.current.width = video.videoWidth;
      canvasRef.current.height = video.videoHeight;
    }
    
    // Perform detection
    const result = await detectObjects(video, objectModel, faceModel, canvasRef.current);
    
    if (mountedRef.current) {
      // Log detection results for debugging
      console.log(`Detection found ${result.relevantObjects.length} objects to draw:`, 
        result.relevantObjects.map(obj => `${obj.class} at [${Math.round(obj.bbox[0])},${Math.round(obj.bbox[1])}]`));
      
      // Update state with results
      setDetectionResults(result.relevantObjects);
      setStats(result.stats);
      
      // Draw on canvas only if drawBoxes is true
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          // Ensure canvas dimensions match video
          if (canvasRef.current.width !== video.videoWidth || 
              canvasRef.current.height !== video.videoHeight) {
            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
            console.log(`Canvas size set to ${canvasRef.current.width}x${canvasRef.current.height}`);
          }
          
          // Clear the canvas regardless of drawBoxes setting
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          if (config.drawBoxes) {
            // Draw test rectangle to ensure canvas is working
            if (result.relevantObjects.length === 0) {
              // Draw a test box if no objects detected
              ctx.lineWidth = 5;
              ctx.strokeStyle = '#FF0000';
              ctx.strokeRect(20, 20, 100, 100);
              ctx.font = 'bold 20px Arial';
              ctx.fillStyle = '#FF0000';
              ctx.fillText('TEST BOX', 25, 70);
              console.log('Drew test box on canvas - no objects detected');
            } else {
              // Draw the detection rectangles
              console.log('Drawing detection boxes on canvas...');
              drawRect(result.relevantObjects, ctx);
              console.log('Finished drawing detection boxes');
            }
            
            if (config.enableLogging) {
              console.log(`Drew ${result.relevantObjects.length} objects on canvas`);
            }
          }
        } else {
          console.error('Failed to get canvas context for drawing');
        }
      } else {
        console.warn('Canvas reference is null, cannot draw detection boxes');
      }
      
      // Call callback if provided
      if (config.onDetection) {
        config.onDetection(result);
      }
    }
    
    return result;
  }, [objectModel, faceModel, config.onDetection, config.enableLogging, config.drawBoxes]);

  // Start detection loop
  const startDetection = useCallback(() => {
    if (isRunning || loading || !mountedRef.current) return;
    
    setIsRunning(true);
    clearDetectionInterval();
    
    intervalRef.current = window.setInterval(async () => {
      await detectNow();
    }, config.interval);
  }, [isRunning, loading, config.interval, detectNow, clearDetectionInterval]);

  // Main effect for model loading and auto-starting detection
  useEffect(() => {
    let isMounted = true;
    
    const loadModels = async () => {
      if (!isMounted) return;
      
      try {
        await tf.ready();
        
        // Load object detection model - try SSD COCO first (better for phones)
        console.log('Loading object detection model...');
        let objectDetector;
        try {
          // First try to load lite_mobilenet_v2 which might be better at detecting phones
          objectDetector = await cocossd.load({
            base: 'lite_mobilenet_v2',
            modelUrl: undefined
          });
          console.log('Loaded lite_mobilenet_v2 model');
        } catch (modelError) {
          console.warn('Failed to load lite_mobilenet_v2, falling back to mobilenet_v2', modelError);
          // Fallback to standard model
          objectDetector = await cocossd.load({ 
            base: 'mobilenet_v2'
          });
          console.log('Loaded mobilenet_v2 model');
        }
        
        if (!isMounted) return;
        
        setObjectModel(objectDetector);
        if (config.enableLogging) console.log('Object detection model loaded');
        
        // Load face detection model
        try {
          console.log('Loading face detection model...');
          const faceDetection = await import('@tensorflow-models/face-detection');
          const faceDetector = await faceDetection.createDetector(
            faceDetection.SupportedModels.MediaPipeFaceDetector,
            {
              runtime: 'tfjs',
              maxFaces: config.faceDetectionOptions.maxFaces,
              modelType: config.faceDetectionOptions.modelType
            }
          );
          
          if (!isMounted) return;
          setFaceModel(faceDetector);
          if (config.enableLogging) console.log('Face detection model loaded');
        } catch (faceError) {
          if (config.enableLogging && isMounted) {
            console.warn('Face detection model failed to load:', faceError);
          }
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load detection models:', err);
          setError('Failed to load detection models');
          setLoading(false);
        }
      }
    };

    loadModels();
    
    return () => {
      isMounted = false;
      stopDetection();
    };
  }, [config.faceDetectionOptions.maxFaces, config.faceDetectionOptions.modelType, config.enableLogging, stopDetection]);
  
  // Auto-start detection when models are loaded
  useEffect(() => {
    if (!loading && !error && objectModel && !isRunning && mountedRef.current) {
      startDetection();
    }
  }, [loading, error, objectModel, isRunning, startDetection]);
  
  return {
    webcamRef,
    canvasRef,
    loading,
    error,
    stats,
    detectNow,
    isRunning,
    startDetection,
    stopDetection
  };
}; 