import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import Webcam from 'react-webcam';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { loadFaceDetectionModel, compareFaceWithEmbedding } from '../../utils/face-recognition/faceEmbedding';

interface FaceRecognitionCamProps {
    interval?: number; // How often to check similarity in ms
    webcamRef?: React.RefObject<Webcam>; // Optional external webcam ref
}

const FaceRecognitionCam: React.FC<FaceRecognitionCamProps> = ({
    interval = 1500, // Default to checking every 1.5 seconds
    webcamRef: externalWebcamRef // Renamed to avoid confusion
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [similarity, setSimilarity] = useState<number | null>(null);
    const [detector, setDetector] = useState<any>(null);
    const internalWebcamRef = useRef<Webcam>(null);
    const intervalRef = useRef<number | null>(null);

    // Use external webcam ref if provided, otherwise use internal one
    const webcamRef = externalWebcamRef || internalWebcamRef;

    // Get user info from Redux store
    const { userInfo } = useSelector((state: RootState) => state.auth);

    // Load face detection model
    useEffect(() => {
        const loadModel = async () => {
            try {
                setLoading(true);
                const model = await loadFaceDetectionModel();
                setDetector(model);
                setError(null);
            } catch (err) {
                console.error('Error loading face detection model:', err);
                setError('Failed to load face detection model');
            } finally {
                setLoading(false);
            }
        };

        loadModel();

        // Clean up interval on unmount
        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Start checking similarity when everything is ready
    useEffect(() => {
        // Only proceed if we have the detector, webcam is available, and user has face embedding
        if (
            !loading &&
            detector &&
            webcamRef.current &&
            userInfo?.faceEmbedding &&
            !intervalRef.current
        ) {
            // Start checking similarity at regular intervals
            intervalRef.current = window.setInterval(checkSimilarity, interval);

            // Immediately check once
            checkSimilarity();
        }

        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [loading, detector, userInfo?.faceEmbedding, interval, webcamRef]);

    // Function to check similarity between webcam face and stored embedding
    const checkSimilarity = async () => {
        if (!webcamRef.current || !userInfo?.faceEmbedding) return;

        try {
            // Get current image from webcam
            const imageSrc = webcamRef.current.getScreenshot();
            if (!imageSrc) {
                setSimilarity(null);
                return;
            }

            // Compare with stored embedding
            const similarityScore = await compareFaceWithEmbedding(
                imageSrc,
                userInfo.faceEmbedding
            );

            // Update similarity state
            setSimilarity(similarityScore);
        } catch (err: any) {
            console.error('Error checking face similarity:', err);
            // Don't show an error to user for failed matches, just set similarity to null
            setSimilarity(null);
        }
    };

    // Function to get color based on similarity score
    const getSimilarityColor = (score: number) => {
        if (score >= 75) return 'success.main';
        if (score >= 60) return 'warning.main';
        return 'error.main';
    };

    return (
        <Box sx={{ width: '100%', position: 'relative' }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={30} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : !userInfo?.faceEmbedding ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Face data not available. Please update your profile with face data.
                </Alert>
            ) : (
                <Box sx={{ position: 'relative' }}>
                    {/* Only render webcam if we're not using an external one */}
                    {!externalWebcamRef && (
                        <Webcam
                            audio={false}
                            ref={internalWebcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                width: 640,
                                height: 480,
                                facingMode: 'user'
                            }}
                            style={{
                                width: '100%',
                                borderRadius: '8px'
                            }}
                        />
                    )}

                    <Paper
                        elevation={3}
                        sx={{
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                            padding: '8px 12px',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            minWidth: 100,
                            textAlign: 'center',
                            zIndex: 20
                        }}
                    >
                        {similarity !== null ? (
                            <Typography
                                variant="h6"
                                sx={{
                                    color: getSimilarityColor(similarity),
                                    fontWeight: 'bold'
                                }}
                            >
                                {Math.round(similarity)}%
                            </Typography>
                        ) : (
                            <Typography variant="body2" sx={{ color: 'grey.400' }}>
                                No face detected
                            </Typography>
                        )}
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default FaceRecognitionCam; 