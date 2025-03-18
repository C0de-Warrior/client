// src/pages/FeedbackCount.js
import React, { useEffect, useState, useCallback } from 'react';
import styles from './FeedbackCount.module.css';

function FeedbackCount() {
  const [count, setCount] = useState(0);
  const backendURL = process.env.REACT_APP_BACKEND_URL; // e.g., https://your-backend-domain.onrender.com
  const websocketURL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:8080/';

  // Fetch the count of feedback submissions
  const fetchCount = useCallback(async () => {
    if (!backendURL) {
      console.error("REACT_APP_BACKEND_URL is not set!");
      return;
    }
    try {
      const response = await fetch(`${backendURL}/submissions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCount(Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error('Error fetching feedback count:', error);
    }
  }, [backendURL]);

  useEffect(() => {
    // Initial fetch
    fetchCount();
    // Set up WebSocket for real-time updates
    const ws = new WebSocket(websocketURL);
    ws.onmessage = (message) => {
      console.log('WebSocket message:', message.data);
      if (message.data === 'new_submission') {
        fetchCount();
      }
    };
    ws.onerror = (error) => console.error('WebSocket error:', error);
    ws.onclose = () => console.log('WebSocket closed');
    return () => ws.close();
  }, [fetchCount, websocketURL]);

  return <span className={styles.badge}>{count}</span>;
}

export default FeedbackCount;
