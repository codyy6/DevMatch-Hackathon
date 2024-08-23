import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Inheritance from "./pages/inheritance/inheritance.js";

function App() {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<Inheritance />} />
        </Routes>
    </Router>
  );
}

export default App;
