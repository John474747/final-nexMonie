
'use client';

import React, { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In production, you might log this to a service like Sentry
      // During development, this surfaces rich context
      toast({
        variant: "destructive",
        title: "Security Permission Denied",
        description: `You don't have permission to ${error.operation} at ${error.path}. Please check security rules.`,
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Contextual Security Error:', error);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}
