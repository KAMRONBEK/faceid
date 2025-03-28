import * as cocoSsd from '@tensorflow-models/coco-ssd';

export interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
  isWarning?: boolean;
  isFace?: boolean;
  isAllowed?: boolean;
  isProhibited?: boolean;
}

/**
 * Uses the TensorFlow COCO-SSD detection type
 * 
 * COCO-SSD model can detect 80 classes of objects including:
 * 'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
 * 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog',
 * 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella',
 * 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite',
 * 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
 * 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
 * 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant',
 * 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
 * 'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors',
 * 'teddy bear', 'hair drier', 'toothbrush'
 * 
 * @see https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd
 */
export type ObjectDetection = cocoSsd.DetectedObject;

export interface FaceDetection {
  box?: {
    xMin?: number;
    yMin?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    xMax?: number;
    yMax?: number;
  };
  boundingBox?: {
    xMin?: number;
    yMin?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    xMax?: number;
    yMax?: number;
  };
  score?: number;
}

export interface DetectionResult {
  relevantObjects: Detection[];
  stats: {
    persons: number;
    cellPhones: number;
    books: number;
    faces: number;
  };
  events: {
    noFace: boolean;
    hasCellPhone: boolean;
    hasBook: boolean;
    multipleFaces: boolean;
  };
} 