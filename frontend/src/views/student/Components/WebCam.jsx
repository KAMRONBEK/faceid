import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
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
    const net = await cocossd.load();
    console.log('Ai models loaded.');

    setInterval(() => {
      detect(net);
    }, 1500);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      const obj = await net.detect(video);

      const ctx = canvasRef.current.getContext('2d');

      let person_count = 0;
      if (obj.length < 1) {
        // Directly notify parent with the correct type
        if (onCheatingDetected) {
          onCheatingDetected({
            timestamp: new Date().toISOString(),
            type: 'no_face',
            count: 1
          });
        }
        
        // Also update local state
        updateCheatingLog((prevLog) => ({
          ...prevLog,
          noFaceCount: prevLog.noFaceCount + 1,
        }));
        swal('Face Not Visible', 'Action has been Recorded', 'error');
      }
      obj.forEach((element) => {
        if (element.class === 'cell phone') {
          // Directly notify parent with the correct type
          if (onCheatingDetected) {
            onCheatingDetected({
              timestamp: new Date().toISOString(),
              type: 'cell_phone',
              count: 1
            });
          }
          
          // Also update local state
          updateCheatingLog((prevLog) => ({
            ...prevLog,
            cellPhoneCount: prevLog.cellPhoneCount + 1,
          }));
          swal('Cell Phone Detected', 'Action has been Recorded', 'error');
        }
        if (element.class === 'book') {
          // Directly notify parent with the correct type
          if (onCheatingDetected) {
            onCheatingDetected({
              timestamp: new Date().toISOString(),
              type: 'book',
              count: 1
            });
          }
          
          // Also update local state
          updateCheatingLog((prevLog) => ({
            ...prevLog,
            ProhibitedObjectCount: prevLog.ProhibitedObjectCount + 1,
          }));
          swal('Prohibited Object Detected', 'Action has been Recorded', 'error');
        }

        if (!element.class === 'person') {
          swal('Face Not Visible', 'Action has been Recorded', 'error');
        }
        if (element.class === 'person') {
          person_count++;
          if (person_count > 1) {
            // Directly notify parent with the correct type
            if (onCheatingDetected) {
              onCheatingDetected({
                timestamp: new Date().toISOString(),
                type: 'multiple_faces',
                count: 1
              });
            }
            
            // Also update local state
            updateCheatingLog((prevLog) => ({
              ...prevLog,
              multipleFaceCount: prevLog.multipleFaceCount + 1,
            }));
            swal('Multiple Faces Detected', 'Action has been Recorded', 'error');
            person_count = 0;
          }
        }
      });
    }
  };
  useEffect(() => {
    runCoco();
  }, []);

  return (
    <Box>
      <Card variant="outlined">
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
            zindex: 8,
            width: 240,
            height: 240,
          }}
        />
      </Card>
    </Box>
  );
}
