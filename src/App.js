import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Landing from "./pages/landing/landing.js";
import Home from "./pages/home/home.js";

function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/home" element={<Home />} />

        </Routes>
    </Router>
  );
}

export default App;
