import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './IndexPage.module.css';

function IndexPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitType, setSubmitType] = useState(''); // "success" or "error"
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const navigate = useNavigate();

  // Monitor online/offline status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let formErrors = {};
    if (!formData.name.trim()) {
      formErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      formErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = 'Email is invalid';
    }
    if (!formData.message.trim()) {
      formErrors.message = 'Feedback is required';
    }
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:5000/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Submission successful:', data);
      // Reset form fields
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
      setSubmitMessage('Your comment has been successfully added!');
      setSubmitType('success');

      // Clear the message after 3 seconds (keep index page visible)
      setTimeout(() => {
        setSubmitMessage('');
        setSubmitType('');
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (!navigator.onLine) {
        setSubmitMessage('You are offline. Your message has been saved and will be submitted when you get back online.');
      } else {
        setSubmitMessage('There was an error submitting your comment. Please try again.');
      }
      setSubmitType('error');
      setTimeout(() => {
        setSubmitMessage('');
        setSubmitType('');
      }, 3000);
    }
  };

  return (
    <div className={styles.container}>
      {isOffline && (
        <div className={styles.offlineNotice}>
          You are currently offline. Some functionality may be limited.
        </div>
      )}
      <h1>Welcome to Fresh Farm Services</h1>
      <p>Thank you for choosing Fresh Farm Services. We truly value your feedback!</p>
      <p>If you have any suggestions or comments, please let us know below:</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.name && <p className={styles.error}>{errors.name}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
          />
          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="message" className={styles.label}>Feedback:</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            className={styles.textarea}
          />
          {errors.message && <p className={styles.error}>{errors.message}</p>}
        </div>
        <button type="submit" className={styles.submitButton}>
          Submit Feedback
        </button>
      </form>
      {submitMessage && (
        <div className={`${styles.messageBox} ${submitType === 'success' ? styles.success : styles.errorMsg}`}>
          {submitMessage}
        </div>
      )}
    </div>
  );
}

export default IndexPage;
