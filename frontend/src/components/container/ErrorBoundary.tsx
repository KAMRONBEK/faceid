/// <reference types="react" />
import React, { ErrorInfo, ReactNode } from 'react';
import { Typography, Button, Box, Container, Paper } from '@mui/material';

// Define the props and state interfaces using type instead of interface
export type ErrorBoundaryProps = {
  children?: ReactNode; // Make children optional
  showDetails?: boolean;
};

export type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

/**
 * Error boundary component to catch and handle errors in the component tree
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  /**
   * @param {ErrorBoundaryProps} props
   */
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  };

  /**
   * @param {Error} error
   * @returns {Partial<ErrorBoundaryState>}
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  };

  /**
   * @param {Error} error
   * @param {ErrorInfo} errorInfo
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  };

  handleReset = (): void => {
    // Clear the error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Optionally refresh the page
    window.location.reload();
  };

  render(): React.ReactNode {
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
              backgroundColor: '#ffebee',  // Light red background
              border: '1px solid #f44336', // Red border
              boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)' // Red shadow
            }}
          >
            <Typography variant="h4" color="error" gutterBottom>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ mb: 3 }}>
              The application encountered an unexpected error. We apologize for the inconvenience.
            </Typography>
            
            {this.props.showDetails && this.state.error && (
              <Box sx={{ mt: 2, mb: 3, textAlign: 'left', bgcolor: '#fff', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" component="div" sx={{ mb: 1 }}>
                  Error details:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#d32f2f',
                  fontSize: '0.8rem',
                  maxHeight: '200px',
                  overflow: 'auto',
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}>
                  {this.state.error.toString()}
                </Typography>
                
                {this.state.errorInfo && (
                  <>
                    <Typography variant="subtitle2" component="div" sx={{ mt: 2, mb: 1 }}>
                      Component stack:
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: '#666',
                      fontSize: '0.8rem',
                      maxHeight: '200px',
                      overflow: 'auto',
                      padding: '8px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '4px'
                    }}>
                      {this.state.errorInfo.componentStack}
                    </Typography>
                  </>
                )}
              </Box>
            )}
            
            <Button 
              variant="contained" 
              color="error"
              onClick={this.handleReset}
              sx={{ mt: 2 }}
            >
              Try Again
            </Button>
          </Paper>
        </Container>
      );
    }

    // Return children if provided, otherwise return null
    return this.props.children || null;
  }
}

export default ErrorBoundary; 