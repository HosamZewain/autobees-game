import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Login from './pages/Login';
import Register from './pages/Register';
import PlayPage from './pages/Play';
import History from './pages/History';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import { SocketProvider } from './context/SocketContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <GameProvider>
          <Router>
            <div className="page-container">
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/play" element={<PlayPage />} />
                  <Route path="/history" element={<History />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </GameProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
