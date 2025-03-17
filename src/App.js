
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import IndexPage from './pages/IndexPage';
import FeedbackPage from './pages/FeedbackPage';

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<IndexPage />} />
                <Route path="/feedback" element={<FeedbackPage />} />
            </Routes>
        </Router>
    );
}

export default App;
