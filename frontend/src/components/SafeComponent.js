import React from 'react';
import { AlertTriangle } from 'lucide-react';

const SafeComponent = ({ children, fallback = null, onError = null }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleError = (error) => {
      console.error('Component error:', error);
      setHasError(true);
      setError(error);
      if (onError) onError(error);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, [onError]);

  if (hasError) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-700 font-medium">Something went wrong</p>
          <p className="text-red-600 text-sm mt-1">Please refresh the page</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default SafeComponent;