import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import Login from './components/Login'; // Placeholder component
import AdminDashboard from './components/AdminDashboard'; // Placeholder component
import ClientDashboard from './components/ClientDashboard'; // Placeholder component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/client" element={<ClientDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
