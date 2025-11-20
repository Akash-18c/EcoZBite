import { useCallback } from 'react';
import toast from 'react-hot-toast';

export const useErrorHandler = () => {
  const handleError = useCallback((error, defaultMessage = 'An error occurred') => {
    console.error('Error:', error);
    
    let message = defaultMessage;
    
    if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }
    
    toast.error(message);
    return message;
  }, []);

  const handleApiCall = useCallback(async (apiCall, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      defaultErrorMessage = 'Operation failed',
      showSuccessToast = false,
      successMessage = 'Operation completed successfully'
    } = options;

    try {
      const result = await apiCall();
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = handleError(error, defaultErrorMessage);
      
      if (onError) {
        onError(error, errorMessage);
      }
      
      return { success: false, error: errorMessage };
    }
  }, [handleError]);

  return { handleError, handleApiCall };
};