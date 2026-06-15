import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Core Layout Component
const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="container">
        {children}
      </main>
      <Footer />
    </>
  );
};

// Example Usage
const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<h1>Welcome to Panamerican TKD Academy</h1>} />
          <Route path="/about" element={<h1>About Us</h1>} />
          {/* Add more routes as necessary */}
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
