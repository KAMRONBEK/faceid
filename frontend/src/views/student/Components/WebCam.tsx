import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Box, Typography, CircularProgress, Card, Alert } from '@mui/material';
import swal from 'sweetalert';
import { useDetectObjects } from '../../../utils/computer-vision/useDetectObjects';
import FaceRecognitionCam from '../../../components/face-recognition/FaceRecognitionCam';

interface WebCamProps {
  onCheatingDetected?: (event: { type: string; timestamp: string }) => void;
  showStats?: boolean;
  showAlerts?: boolean;
  interval?: number;
  style?: React.CSSProperties;
}

export default function WebCam({
  onCheatingDetected,
  showStats = true,
  showAlerts = true,
  interval = 1500,
  style = {}
}: WebCamProps) {
  // For managing pending events that need to be reported to the parent
  const pendingCheatingEvent = useRef<{ type: string; timestamp: string } | null>(null);

  // Use our custom detection hook
  const {
    webcamRef,
    canvasRef,
    loading,
    error,
    stats,
    isRunning
  } = useDetectObjects({
    interval,
    enableLogging: true,
    onDetection: (result) => {
      // Only process events if we have a callback
      if (!onCheatingDetected) return;

      // Handle no face detected
      if (result.events.noFace) {
        reportCheating('no_face');
        if (showAlerts) swal('Face Not Visible', 'Action has been Recorded', 'error');
      }

      // Handle cell phone
      if (result.events.hasCellPhone) {
        reportCheating('cell_phone');
        if (showAlerts) swal('Cell Phone Detected', 'Action has been Recorded', 'error');
      }

      // Handle book
      if (result.events.hasBook) {
        reportCheating('book');
        if (showAlerts) swal('Prohibited Object Detected', 'Action has been Recorded', 'error');
      }

      // Handle multiple faces
      if (result.events.multipleFaces) {
        reportCheating('multiple_faces');
        if (showAlerts) swal('Multiple Faces Detected', 'Action has been Recorded', 'error');
      }
    }
  });

  // Check if multiple people are detected
  const hasMultiplePeople = (stats.persons > 1) || (stats.faces > 1);
  const hasNoFace = stats.persons === 0 && stats.faces === 0;

  // Function to report cheating to the parent component
  const reportCheating = (type: string) => {
    if (!onCheatingDetected) return;

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

  // For debugging webcam issues
  useEffect(() => {
    console.log('Webcam ref in WebCam component:', webcamRef.current);
  }, [webcamRef.current]);

  return (
    <Box sx={{
      position: 'relative',
      width: '100%',
      height: '100%',
      ...style
    }}>
      {/* Status alerts */}
      {showAlerts && hasMultiplePeople && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            fontWeight: 'bold',
            '& .MuiAlert-icon': { fontSize: '1.5rem' }
          }}
        >
          Multiple people detected - Only one person allowed!
        </Alert>
      )}

      {showAlerts && !loading && !error && hasNoFace && (
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            fontWeight: 'bold',
            '& .MuiAlert-icon': { fontSize: '1.5rem' }
          }}
        >
          No person detected - Please position yourself in the frame
        </Alert>
      )}

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
            Loading object detection models...
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
        <Card variant="outlined" sx={{
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
          border: hasMultiplePeople ? '3px solid #ff0000' : '1px solid rgba(0,0,0,0.12)'
        }}>
          {/* Status indicator */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 20,
              backgroundColor: isRunning ? 'rgba(0, 200, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)',
              borderRadius: '50%',
              width: '12px',
              height: '12px',
              boxShadow: '0 0 8px white',
              border: '1px solid white'
            }}
          />

          {/* Webcam for object detection */}
          <Webcam
            ref={webcamRef}
            muted={true}
            mirrored={false}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 640,
              height: 480,
              facingMode: 'user'
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Canvas for object detection drawing */}
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 8,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          />

          {/* Face similarity overlay - uses the same webcamRef */}
          <FaceRecognitionCam
            interval={2000}
            webcamRef={webcamRef}
          />

          {/* Multiple people warning overlay */}
          {hasMultiplePeople && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255, 0, 0, 0.15)',
                zIndex: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  textShadow: '0 0 10px rgba(0,0,0,0.8)',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  transform: 'rotate(-15deg)',
                  backgroundColor: 'rgba(255,0,0,0.7)',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '2px solid white'
                }}
              >
                MULTIPLE PEOPLE DETECTED
              </Typography>
            </Box>
          )}

          {/* Stats display with better visibility - moved to bottom left */}
          {showStats && (
            <Box sx={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              background: 'rgba(0,0,0,0.7)',
              p: 1.5,
              borderRadius: 2,
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
              zIndex: 15
            }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 0.5 }}>
                Detection Status
              </Typography>
              <Typography variant="caption" component="div" sx={{
                display: 'flex',
                justifyContent: 'space-between',
                color: stats.persons > 1 ? '#ff8c8c' : 'inherit',
                fontWeight: stats.persons > 1 ? 'bold' : 'normal'
              }}>
                <span>Persons:</span> <strong>{stats.persons}</strong>
              </Typography>
              <Typography variant="caption" component="div" sx={{
                display: 'flex',
                justifyContent: 'space-between',
                color: stats.faces > 1 ? '#ff8c8c' : 'inherit',
                fontWeight: stats.faces > 1 ? 'bold' : 'normal'
              }}>
                <span>Faces:</span> <strong>{stats.faces}</strong>
              </Typography>
              <Typography variant="caption" component="div" sx={{
                display: 'flex',
                justifyContent: 'space-between',
                color: stats.cellPhones > 0 ? '#ff8c8c' : 'inherit',
                fontWeight: stats.cellPhones > 0 ? 'bold' : 'normal'
              }}>
                <span>Cell Phones:</span> <strong>{stats.cellPhones}</strong>
              </Typography>
              <Typography variant="caption" component="div" sx={{
                display: 'flex',
                justifyContent: 'space-between',
                color: stats.books > 0 ? '#ff8c8c' : 'inherit',
                fontWeight: stats.books > 0 ? 'bold' : 'normal'
              }}>
                <span>Books:</span> <strong>{stats.books}</strong>
              </Typography>
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
}
