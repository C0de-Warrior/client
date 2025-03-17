// src/pages/FeedbackPage.js
import React, { useState, useEffect, useCallback } from 'react';
import styles from './FeedbackPage.module.css';

function FeedbackPage() {
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch feedback data from the backend
  const fetchFeedback = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/submissions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFeedbackData(data);
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
      console.error('Error fetching feedback data:', err);
    }
  }, []);

  // Initial fetch when the component mounts
  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // WebSocket setup: listen for new submissions and trigger a fetch
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080/');
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (message) => {
      console.log('WebSocket message:', message.data);
      if (message.data === 'new_submission') {
        fetchFeedback();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed');
    };

    // Clean up the connection when the component unmounts
    return () => {
      ws.close();
    };
  }, [fetchFeedback]);

  if (loading) {
    return <div className={styles.container}><p>Loading data...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p>Error: {error.message}</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1>Feedback Page</h1>
      <table className={styles.feedbackTable}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>AI Response</th>
          </tr>
        </thead>
        <tbody>
          {feedbackData.map((feedback) => (
            <tr key={feedback._id}>
              <td>{feedback.name}</td>
              <td>{feedback.email}</td>
              <td>{feedback.message}</td>
              <td>{feedback.aiResponse || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FeedbackPage;
