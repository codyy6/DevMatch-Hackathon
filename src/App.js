import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Landing from "./pages/landing/landing.js";
import Inheritance from "./pages/inheritance/inheritance.js";
import Check from "./pages/check certificate/check_certificate.js";

function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Landing />} />
            <Route path="/check" element={<Check />} />
            <Route path="/inheritance" element={<Inheritance />} />

        </Routes>
    </Router>
  );
}

export default App;
