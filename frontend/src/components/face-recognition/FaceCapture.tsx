import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, CircularProgress, Alert, Stack } from '@mui/material';
import Webcam from 'react-webcam';
import { loadFaceDetectionModel, extractFaceAndGenerateEmbedding } from '../../utils/face-recognition/faceEmbedding';

interface FaceCaptureProps {
    onEmbeddingGenerated: (embedding: number[]) => void;
}

const FaceCapture: React.FC<FaceCaptureProps> = ({ onEmbeddingGenerated }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const webcamRef = useRef<Webcam>(null);
    const [detector, setDetector] = useState<any>(null);

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
                setError('Failed to load face detection model. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadModel();
    }, []);

    // Capture face image and generate embedding
    const handleCapture = async () => {
        if (!detector || !webcamRef.current) return;

        setIsCapturing(true);
        setError(null);

        try {
            // Get image data from webcam
            const imageSrc = webcamRef.current.getScreenshot();
            if (!imageSrc) {
                setError('Failed to capture image from webcam');
                setIsCapturing(false);
                return;
            }

            // Temporarily display the captured image
            setCapturedImage(imageSrc);

            // Process face and generate embedding
            const { embedding } = await extractFaceAndGenerateEmbedding(imageSrc);

            // Pass the embedding back to the parent component
            onEmbeddingGenerated(Array.from(embedding));
        } catch (err: any) {
            console.error('Error during face capture:', err);
            setError(err.message || 'Failed to process face. Please try again.');
            setCapturedImage(null);
        } finally {
            setIsCapturing(false);
        }
    };

    // Reset the capture process
    const handleRetry = () => {
        setCapturedImage(null);
        setError(null);
    };

    return (
        <Box sx={{ width: '100%' }}>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            ) : null}

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="center"
                justifyContent="center"
            >
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 400,
                        height: 300,
                        overflow: 'hidden',
                        border: '1px solid #ddd',
                        borderRadius: 1,
                    }}
                >
                    {capturedImage ? (
                        <Box
                            component="img"
                            src={capturedImage}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                            }}
                            alt="Captured face"
                        />
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{ facingMode: 'user' }}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    )}
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={capturedImage ? handleRetry : handleCapture}
                    disabled={loading || isCapturing || !detector}
                    sx={{ mt: { xs: 2, sm: 0 } }}
                >
                    {isCapturing ? 'Processing...' : capturedImage ? 'Retake Photo' : 'Capture Face'}
                </Button>
            </Stack>
        </Box>
    );
};

export default FaceCapture; 