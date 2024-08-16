import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Landing from "./pages/landing/landing.js";

function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<Landing />} />
        </Routes>
    </Router>
  );
}

export default App;
