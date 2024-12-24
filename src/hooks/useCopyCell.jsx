import { useEffect } from 'react';

// Custom hook to listen for Ctrl+C key press
export const useCopyCell = (callback) => {
  useEffect(() => {
    // Handler for the keydown event
    const handleKeyPress = (event) => {
      // Check if the user presses "Ctrl" or "Cmd" + "C"
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        callback(); // Call the passed callback function when Ctrl+C is pressed
      }
    };

    // Add event listener when component mounts
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup event listener when component unmounts
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [callback]); // Dependency array to ensure callback updates if necessary
};
