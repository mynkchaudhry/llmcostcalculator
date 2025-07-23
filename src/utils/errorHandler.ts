// Global error handler for chunk loading errors
export const initializeErrorHandler = () => {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections (chunk loading errors)
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      
      // Check if it's a chunk loading error
      if (
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Loading CSS chunk') ||
        error?.message?.includes('Failed to import') ||
        error?.name === 'ChunkLoadError'
      ) {
        console.warn('Chunk loading error detected:', error);
        event.preventDefault(); // Prevent the error from appearing in console
        
        // Attempt to reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        return;
      }
      
      // Log other errors normally
      console.error('Unhandled promise rejection:', error);
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      const error = event.error;
      
      // Check if it's a chunk loading error
      if (
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Loading CSS chunk') ||
        event.filename?.includes('/_next/static/chunks/')
      ) {
        console.warn('Script loading error detected:', error);
        event.preventDefault();
        
        // Attempt to reload the page
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        
        return;
      }
      
      console.error('Global error:', error);
    });
  }
};

// Utility function to handle dynamic imports with retry
export const dynamicImportWithRetry = async <T>(
  importFn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error: any) {
      const isChunkError = 
        error?.message?.includes('Loading chunk') ||
        error?.message?.includes('Loading CSS chunk') ||
        error?.name === 'ChunkLoadError';
      
      if (isChunkError && i < retries - 1) {
        console.warn(`Chunk loading failed, retrying... (${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error('Max retries exceeded');
};