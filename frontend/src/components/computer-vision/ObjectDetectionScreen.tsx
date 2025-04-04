import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import WebCam from '../../views/student/Components/WebCam';

const ObjectDetectionScreen = () => {
  const [isDetecting, setIsDetecting] = useState<boolean>(true);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Object Detection
      </Typography>

      <Typography variant="body1" color="textSecondary" paragraph>
        This demo uses TensorFlow.js and the COCO-SSD model to detect objects in your webcam feed.
        Objects will be highlighted with bounding boxes and labeled in real-time.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isDetecting}
                  onChange={(e) => setIsDetecting(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable detection"
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {isDetecting ? (
            <WebCam
              showStats={true}
              showAlerts={true}
              interval={1000}
              style={{
                maxWidth: '640px',
                margin: '0 auto'
              }}
            />
          ) : (
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
              <Typography variant="body1">
                Detection is paused. Enable the switch above to start detection.
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="textSecondary">
              Note: Object detection requires camera access and may use significant CPU/GPU resources.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ObjectDetectionScreen; 