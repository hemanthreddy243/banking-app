import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { subscribeToTransactions } from './socket';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/DashBoard';
import './App.css'; // Import your styles

const App = () => {
  const [showDashboard, setShowDashboard] = useState(true); // State to control dashboard visibility

  useEffect(() => {
    subscribeToTransactions((data) => {
      console.log('New transaction:', data);
      // Update UI with new transaction
    });
  }, []);

  return (
    <Router>
      <div className="App">
        <h1 className="app-title">Banking App</h1>
        {showDashboard && (
          <Dashboard />
        )}
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          {/* Add more routes as needed */}
        </Routes>
        <div className="links">
          <Link to="/login">Login</Link> | <Link to="/register">Register</Link>
        </div>
      </div>
    </Router>
  );
};

export default App;
