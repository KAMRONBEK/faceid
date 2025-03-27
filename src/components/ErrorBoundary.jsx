import React from 'react';
import { Typography, Button, Box, Container, Paper } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    // Clear the error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Optionally refresh the page
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <Typography variant="h4" color="error" gutterBottom>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              The application encountered an unexpected error. We apologize for the inconvenience.
            </Typography>
            
            {this.props.showDetails && this.state.error && (
              <Box sx={{ mt: 2, mb: 3, textAlign: 'left', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" component="div" sx={{ mb: 1 }}>
                  Error details:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#d32f2f',
                  fontSize: '0.8rem'
                }}>
                  {this.state.error.toString()}
                </Typography>
              </Box>
            )}
            
            <Button 
              variant="contained" 
              color="primary"
              onClick={this.handleReset}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 