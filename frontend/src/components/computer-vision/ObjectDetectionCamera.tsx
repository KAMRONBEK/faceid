import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Box, Typography, CircularProgress } from '@mui/material';

interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

const ObjectDetectionCamera = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Load the COCO-SSD model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load model:', err);
        setError('Failed to load detection model');
        setLoading(false);
      }
    };

    loadModel();
  }, []);

  // Detect objects in the webcam feed
  useEffect(() => {
    if (!model || loading) return;

    const detectInterval = setInterval(() => {
      detect();
    }, 100); // Run detection every 100ms

    return () => clearInterval(detectInterval);
  }, [model, loading]);

  const detect = async () => {
    // Check if webcam and canvas are ready
    if (
      webcamRef.current && 
      webcamRef.current.video && 
      webcamRef.current.video.readyState === 4 &&
      canvasRef.current
    ) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Detect objects
      const detections = await model!.detect(video);
      
      // Clear the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw bounding boxes for detected objects
      detections.forEach((detection: Detection) => {
        const [x, y, width, height] = detection.bbox;
        
        // Draw rectangle
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Draw background for label
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(x, y - 20, width, 20);
        
        // Draw label text
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.fillText(
          `${detection.class} ${Math.round(detection.score * 100)}%`,
          x, 
          y - 5
        );
      });
    }
  };

  return (
    <Box 
      sx={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: '640px', 
        margin: '0 auto'
      }}
    >
      {loading ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '480px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading object detection model...
          </Typography>
        </Box>
      ) : error ? (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '480px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            color: 'error.main'
          }}
        >
          <Typography variant="body1">{error}</Typography>
        </Box>
      ) : (
        <>
          <Webcam
            ref={webcamRef}
            muted={true}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '4px'
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
        </>
      )}
    </Box>
  );
};

export default ObjectDetectionCamera; 