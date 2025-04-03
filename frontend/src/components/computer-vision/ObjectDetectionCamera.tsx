import { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { Box, Typography, CircularProgress, Card, Alert } from '@mui/material';
import { drawRect } from '../../utils/computer-vision/drawRect';
import { useDetectObjects } from '../../utils/computer-vision/useDetectObjects';
import FaceRecognitionCam from '../face-recognition/FaceRecognitionCam';

const ObjectDetectionCamera = () => {
  // Use our custom detection hook
  const {
    webcamRef,
    canvasRef,
    loading,
    error,
    stats,
    isRunning
  } = useDetectObjects({
    interval: 1000,
    enableLogging: true,
    drawBoxes: false // Disable drawing boxes
  });

  // Check if multiple people are detected
  const hasMultiplePeople = (stats.persons > 1) || (stats.faces > 1);
  const hasNoFace = stats.persons === 0 && stats.faces === 0;

  // For debugging webcam issues
  useEffect(() => {
    console.log('Webcam ref in ObjectDetectionCamera:', webcamRef.current);
  }, [webcamRef.current]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '640px',
        margin: '0 auto'
      }}
    >
      {/* Status alerts */}
      {hasMultiplePeople && (
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

      {!loading && !error && !hasMultiplePeople && !hasNoFace && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            fontWeight: 'bold',
            '& .MuiAlert-icon': { fontSize: '1.5rem' }
          }}
        >
          Single person detected - Authorized ✓
        </Alert>
      )}

      {!loading && !error && hasNoFace && (
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
          position: 'relative',
          overflow: 'hidden',
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

          {/* Main visible webcam with face recognition */}
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
              height: 'auto',
              borderRadius: '4px'
            }}
          />

          {/* Face similarity overlay - uses the same webcam ref */}
          <FaceRecognitionCam
            webcamRef={webcamRef}
            interval={2000}
          />

          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 10,
              pointerEvents: 'none',
              mixBlendMode: 'normal', // Try 'multiply' if detection boxes aren't visible
              opacity: 1.0,
              border: '1px solid transparent' // Ensures canvas is visible for debugging
            }}
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
          <Box sx={{
            position: 'absolute',
            bottom: 10,
            left: 10, // Changed from right to left
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
        </Card>
      )}
    </Box>
  );
};

export default ObjectDetectionCamera; 