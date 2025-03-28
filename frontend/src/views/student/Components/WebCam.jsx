import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
// Import face detection conditionally later to avoid breaking the app
import Webcam from 'react-webcam';
import { drawRect } from './utilities';

import { Box, Card } from '@mui/material';
import swal from 'sweetalert';

export default function Home({ onCheatingDetected }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [localCheatingLog, setLocalCheatingLog] = useState({
    noFaceCount: 0,
    cellPhoneCount: 0,
    ProhibitedObjectCount: 0,
    multipleFaceCount: 0
  });

  // Function to update cheating log locally and also notify parent
  const updateCheatingLog = (updateFn) => {
    setLocalCheatingLog(prevLog => {
      const newLog = updateFn(prevLog);
      
      // Determine what type of cheating was detected
      const changedProperty = Object.keys(newLog).find(key => newLog[key] > prevLog[key]) || 'unknown';
      
      // Map to backend expected types
      let mappedType = 'other';
      if (changedProperty === 'cellPhoneCount') {
        mappedType = 'cell_phone';
      } else if (changedProperty === 'ProhibitedObjectCount') {
        mappedType = 'book';
      } else if (changedProperty === 'noFaceCount') {
        mappedType = 'no_face';
      } else if (changedProperty === 'multipleFaceCount') {
        mappedType = 'multiple_faces';
      }
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        type: mappedType,
        count: newLog[changedProperty] || 0
      };
      
      // Notify parent component about the cheating event
      if (onCheatingDetected) {
        onCheatingDetected(logEntry);
      }
      
      return newLog;
    });
  };

  const runCoco = async () => {
    try {
      // Initialize TensorFlow backend
      await tf.ready();
      
      // Load object detection model
      const objectModel = await cocossd.load({
        base: 'mobilenet_v2' // Use MobileNet for better performance
      });
      
      console.log('Object detection model loaded successfully');

      // Try to load face detection, but continue if it fails
      let faceModel = null;
      try {
        // Dynamically import face detection to prevent errors from breaking the app
        const faceDetection = await import('@tensorflow-models/face-detection').catch(err => {
          console.warn('Face detection model not available, using person detection instead:', err);
          return null;
        });
        
        if (faceDetection) {
          faceModel = await faceDetection.createDetector(
            faceDetection.SupportedModels.MediaPipeFaceDetector,
            {
              runtime: 'tfjs',
              maxFaces: 5,
              modelType: 'short'
            }
          );
          console.log('Face detection model loaded successfully');
        }
      } catch (faceError) {
        console.warn('Failed to load face detection model, using person detection instead:', faceError);
      }

      setInterval(() => {
        detect(objectModel, faceModel);
      }, 1500);
    } catch (error) {
      console.error('Error loading AI model:', error);
    }
  };

  const detect = async (objectModel, faceModel) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Run object detection with confidence threshold
      const objects = await objectModel.detect(video, 20, 0.6);
      
      // Try face detection if the model is available
      let faces = [];
      if (faceModel) {
        try {
          faces = await faceModel.estimateFaces(video, {
            flipHorizontal: false,
            staticImageMode: false,
            returnTensors: false,
            minDetectionConfidence: 0.5
          });
        } catch (error) {
          console.warn('Face detection failed:', error);
        }
      }

      const ctx = canvasRef.current.getContext('2d');
      // Clear previous drawings
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      // Filter objects to only those we're interested in highlighting and reporting
      let relevantObjects = [];
      let person_count = 0;
      let hasCellPhone = false;
      let hasBook = false;
      
      // Process all objects
      objects.forEach((element) => {
        if (element.class === 'person') {
          person_count++;
          // Only add person objects if face detection is not available
          if (!faceModel || faces.length === 0) {
            relevantObjects.push({
              ...element,
              isFace: true // Mark as face for consistent styling
            });
          }
        } else if (element.class === 'cell phone') {
          hasCellPhone = true;
          relevantObjects.push({
            ...element,
            isWarning: true
          });
        } else if (element.class === 'book') {
          hasBook = true;
          relevantObjects.push({
            ...element,
            isWarning: true
          });
        }
      });
      
      // Process faces if we have them
      let facesDetected = faces.length;
      faces.forEach(face => {
        try {
          // Face detection returns different formats based on the model
          // Handle both MediaPipe and BlazeFace formats
          let box;
          if (face.box) {
            // MediaPipe format
            box = face.box;
          } else if (face.locationData && face.locationData.relativeBoundingBox) {
            // Alternative format
            box = face.locationData.relativeBoundingBox;
          } else if (face.boundingBox) {
            // BlazeFace format
            box = face.boundingBox;
          }
          
          if (box) {
            // Get coordinates, making sure they're valid numbers
            const x = box.xMin || box.x || 0;
            const y = box.yMin || box.y || 0;
            const width = box.width || (box.xMax ? box.xMax - x : 100);
            const height = box.height || (box.yMax ? box.yMax - y : 100);
            
            // Make sure dimensions are reasonable
            if (width > 0 && height > 0 && width < videoWidth && height < videoHeight) {
              relevantObjects.push({
                bbox: [x, y, width, height],
                class: "face",
                score: face.score || (face.detection ? face.detection.score : 0.9),
                isFace: true
              });
            }
          }
        } catch (error) {
          console.warn('Error processing face:', error);
        }
      });
      
      // Draw all objects
      drawRect(relevantObjects, ctx);
      
      // Handle no face detected (using either face detection or person detection)
      if ((faceModel && facesDetected === 0) || (!faceModel && person_count === 0)) {
        updateCheatingLog((prevLog) => ({
          ...prevLog,
          noFaceCount: prevLog.noFaceCount + 1,
        }));
        
        if (onCheatingDetected) {
          onCheatingDetected({
            timestamp: new Date().toISOString(),
            type: 'no_face',
            count: 1
          });
        }
        swal('Face Not Visible', 'Action has been Recorded', 'error');
      }
      
      // Handle cell phone
      if (hasCellPhone) {
        updateCheatingLog((prevLog) => ({
          ...prevLog,
          cellPhoneCount: prevLog.cellPhoneCount + 1,
        }));
        
        if (onCheatingDetected) {
          onCheatingDetected({
            timestamp: new Date().toISOString(),
            type: 'cell_phone',
            count: 1
          });
        }
        swal('Cell Phone Detected', 'Action has been Recorded', 'error');
      }
      
      // Handle book
      if (hasBook) {
        updateCheatingLog((prevLog) => ({
          ...prevLog,
          ProhibitedObjectCount: prevLog.ProhibitedObjectCount + 1,
        }));
        
        if (onCheatingDetected) {
          onCheatingDetected({
            timestamp: new Date().toISOString(),
            type: 'book',
            count: 1
          });
        }
        swal('Prohibited Object Detected', 'Action has been Recorded', 'error');
      }
      
      // Handle multiple faces (using either face detection or person detection)
      if ((faceModel && facesDetected > 1) || (!faceModel && person_count > 1)) {
        updateCheatingLog((prevLog) => ({
          ...prevLog,
          multipleFaceCount: prevLog.multipleFaceCount + 1,
        }));
        
        if (onCheatingDetected) {
          onCheatingDetected({
            timestamp: new Date().toISOString(),
            type: 'multiple_faces',
            count: 1
          });
        }
        swal('Multiple Faces Detected', 'Action has been Recorded', 'error');
      }
    }
  };
  
  useEffect(() => {
    runCoco();
    
    // Clean up on component unmount
    return () => {
      // Cancel any pending animations or intervals
      const highestId = window.setTimeout(() => {}, 0);
      for (let i = highestId; i >= 0; i--) {
        window.clearInterval(i);
      }
    };
  }, []);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Card variant="outlined" sx={{ height: '100%', overflow: 'hidden' }}>
        <Webcam
          ref={webcamRef}
          muted={true}
          style={{
            left: 0,
            right: 0,
            textAlign: 'center',
            zindex: 9,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10
          }}
        />
      </Card>
    </Box>
  );
}
