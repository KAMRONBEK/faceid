import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Container, Grid, Typography, CircularProgress } from '@mui/material';
import { testFaceSimilarity } from '../utils/face-recognition/test-similarity';

const FileUpload = ({ onFileSelect, label }: { onFileSelect: (file: File) => void, label: string }) => {
    return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
            <Button
                variant="contained"
                component="label"
            >
                {label}
                <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                            onFileSelect(files[0]);
                        }
                    }}
                />
            </Button>
        </Box>
    );
};

const ImagePreview = ({ imageUrl }: { imageUrl: string | null }) => {
    if (!imageUrl) return (
        <Box
            sx={{
                width: '100%',
                height: 200,
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Typography variant="body2" color="textSecondary">
                No image selected
            </Typography>
        </Box>
    );

    return (
        <Box sx={{ width: '100%', height: 200, overflow: 'hidden' }}>
            <img
                src={imageUrl}
                alt="Face"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                }}
            />
        </Box>
    );
};

const TestSimilarity: React.FC = () => {
    const [image1, setImage1] = useState<File | null>(null);
    const [image2, setImage2] = useState<File | null>(null);
    const [image1Url, setImage1Url] = useState<string | null>(null);
    const [image2Url, setImage2Url] = useState<string | null>(null);
    const [similarity, setSimilarity] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImage1Select = (file: File) => {
        setImage1(file);
        setImage1Url(URL.createObjectURL(file));
    };

    const handleImage2Select = (file: File) => {
        setImage2(file);
        setImage2Url(URL.createObjectURL(file));
    };

    const compareImages = async () => {
        if (!image1 || !image2) {
            setError('Please select two images to compare');
            return;
        }

        setLoading(true);
        setError(null);
        setSimilarity(null);

        try {
            // Convert images to base64
            const image1Base64 = await fileToBase64(image1);
            const image2Base64 = await fileToBase64(image2);

            // Compare faces
            const result = await testFaceSimilarity(image1Base64, image2Base64);
            setSimilarity(result);
        } catch (err) {
            console.error('Error comparing faces:', err);
            setError('Error comparing faces. Make sure both images contain clear faces.');
        } finally {
            setLoading(false);
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            // Check file size before processing
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        // Create a canvas to resize the image
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        // Calculate new dimensions while maintaining aspect ratio
                        const maxDimension = 800; // Max width or height
                        if (width > height && width > maxDimension) {
                            height = (height * maxDimension) / width;
                            width = maxDimension;
                        } else if (height > maxDimension) {
                            width = (width * maxDimension) / height;
                            height = maxDimension;
                        }

                        canvas.width = width;
                        canvas.height = height;

                        // Draw resized image to canvas
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);

                        // Get base64 from canvas with reduced quality
                        const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
                        resolve(resizedBase64);
                    };
                    img.onerror = () => reject(new Error('Failed to load image'));
                    img.src = e.target?.result as string;
                };
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            } else {
                // For smaller files, process normally
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const result = reader.result as string;
                    // Remove the data:image/jpeg;base64, part
                    const base64 = result.split(',')[1];
                    resolve(base64);
                };
                reader.onerror = error => reject(error);
            }
        });
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom align="center">
                Face Similarity Test
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                First Face
                            </Typography>
                            <ImagePreview imageUrl={image1Url} />
                            <FileUpload onFileSelect={handleImage1Select} label="Upload First Face" />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Second Face
                            </Typography>
                            <ImagePreview imageUrl={image2Url} />
                            <FileUpload onFileSelect={handleImage2Select} label="Upload Second Face" />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={compareImages}
                    disabled={!image1 || !image2 || loading}
                    sx={{ minWidth: 200 }}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Compare Faces'}
                </Button>
            </Box>

            {error && (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            )}

            {similarity !== null && (
                <Card sx={{ mt: 3 }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" gutterBottom>
                            Similarity: {similarity.toFixed(1)}%
                        </Typography>
                        <Typography color={similarity >= 80 ? 'success.main' : 'text.secondary'}>
                            {similarity >= 80 ? 'These appear to be the same person.' : 'These appear to be different people.'}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Container>
    );
};

export default TestSimilarity; 