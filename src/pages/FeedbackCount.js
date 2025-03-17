import React, { useEffect, useState, useCallback } from 'react';
import styles from './FeedbackCount.module.css';

function FeedbackCount() {
  const [count, setCount] = useState(0);

  // Fetch the count of feedback submissions
  const fetchCount = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/submissions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCount(data.length);
    } catch (error) {
      console.error('Error fetching feedback count:', error);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchCount();

    // Set up WebSocket for real-time updates
    const ws = new WebSocket('ws://localhost:8080/');
    ws.onmessage = (message) => {
      console.log('WebSocket message:', message.data);
      if (message.data === 'new_submission') {
        fetchCount();
      }
    };

    return () => {
      ws.close();
    };
  }, [fetchCount]);

  return (
    <span className={styles.badge}>
      {count}
    </span>
  );
}

export default FeedbackCount;
