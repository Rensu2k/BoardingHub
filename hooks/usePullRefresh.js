import { useCallback, useState } from "react";

/**
 * Custom hook for pull-to-refresh functionality
 * @param {Function} onRefresh - Callback function to execute when refresh is triggered
 * @param {Object} options - Configuration options
 * @param {number} options.delay - Minimum delay before hiding refresh indicator (default: 1000ms)
 * @returns {Object} - Object containing refreshing state and refresh handler
 */
export const usePullRefresh = (onRefresh, options = {}) => {
  const [refreshing, setRefreshing] = useState(false);
  const { delay = 1000 } = options;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      // Create a promise for the minimum delay
      const delayPromise = new Promise((resolve) => setTimeout(resolve, delay));

      // Execute the refresh function and wait for both the function and delay
      const refreshPromise = onRefresh ? onRefresh() : Promise.resolve();

      await Promise.all([refreshPromise, delayPromise]);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, delay]);

  return {
    refreshing,
    onRefresh: handleRefresh,
  };
};
