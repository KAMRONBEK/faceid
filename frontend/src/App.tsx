import React, { Suspense } from 'react';

// Theme Provider
import { CssBaseline, ThemeProvider } from '@mui/material';
import { baselightTheme } from './theme/DefaultColors';

// Router Provider
import { RouterProvider } from 'react-router-dom';

import Router from './routes/Router';

// Redux Provider
import { Provider } from 'react-redux';
import store from './store';

// Tostify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/container/ErrorBoundary';

const App: React.FC = () => {
  const theme = baselightTheme;
  const isDevelopment = import.meta.env.MODE === 'development';
  
  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <ToastContainer />
        <CssBaseline />
        <ErrorBoundary showDetails={isDevelopment}>
          <Suspense fallback={<div className="loading-screen">Loading...</div>}>
            <RouterProvider router={Router} />
          </Suspense>
        </ErrorBoundary>
      </Provider>
    </ThemeProvider>
  );
};

export default App; 