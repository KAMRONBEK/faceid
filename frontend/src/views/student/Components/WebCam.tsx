import React, { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { Box, Card } from '@mui/material';
import swal from 'sweetalert';
import { useDetectObjects } from '../../../utils/computer-vision/useDetectObjects';

export default function Home({ onCheatingDetected }) {
  // For managing pending events that need to be reported to the parent
  const pendingCheatingEvent = useRef(null);
  
  // Use our custom detection hook
  const {
    webcamRef,
    canvasRef,
    loading
  } = useDetectObjects({
    interval: 1500,
    enableLogging: true,
    onDetection: (result) => {
      // Handle no face detected
      if (result.events.noFace) {
        reportCheating('no_face');
        swal('Face Not Visible', 'Action has been Recorded', 'error');
      }
      
      // Handle cell phone
      if (result.events.hasCellPhone) {
        reportCheating('cell_phone');
        swal('Cell Phone Detected', 'Action has been Recorded', 'error');
      }
      
      // Handle book
      if (result.events.hasBook) {
        reportCheating('book');
        swal('Prohibited Object Detected', 'Action has been Recorded', 'error');
      }
      
      // Handle multiple faces
      if (result.events.multipleFaces) {
        reportCheating('multiple_faces');
        swal('Multiple Faces Detected', 'Action has been Recorded', 'error');
      }
    }
  });
  
  // Function to report cheating to the parent component
  const reportCheating = (type) => {
    // Store the event for processing in useEffect
    pendingCheatingEvent.current = {
      type,
      timestamp: new Date().toISOString(),
    };
  };
  
  // Effect to send cheating events to parent
  useEffect(() => {
    if (pendingCheatingEvent.current && onCheatingDetected) {
      // If we have a pending event, report it to the parent component
      onCheatingDetected(pendingCheatingEvent.current);
      // Clear the pending event
      pendingCheatingEvent.current = null;
    }
  });

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Card variant="outlined" sx={{ height: '100%', overflow: 'hidden' }}>
        <Webcam
          ref={webcamRef}
          muted={true}
          mirrored={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 8,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        />
      </Card>
    </Box>
  );
}
