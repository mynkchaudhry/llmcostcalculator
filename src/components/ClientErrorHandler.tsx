'use client';

import { useEffect } from 'react';
import { initializeErrorHandler } from '@/utils/errorHandler';

// Client-side component to initialize error handling
export default function ClientErrorHandler() {
  useEffect(() => {
    initializeErrorHandler();
  }, []);

  return null; // This component doesn't render anything
}