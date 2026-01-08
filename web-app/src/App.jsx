import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import StatsSidebar from './components/StatsSidebar';
import Home from './pages/Home';
import PlayModeSelection from './pages/PlayModeSelection';
import SoloPlay from './pages/SoloPlay';
import MultiplayerLobby from './pages/MultiplayerLobby';
import MultiplayerGame from './pages/MultiplayerGame';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import History from './pages/History';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Contact from './pages/Contact';
import HowToPlay from './pages/HowToPlay';
import ScrollToTop from './components/ScrollToTop';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { GameProvider } from './context/GameContext';
import { HelmetProvider } from 'react-helmet-async';

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <HelmetProvider>
        <AuthProvider>
          <SocketProvider>
            <GameProvider>
              <div className="app-layout">
                <Navbar />

                <div className="main-container">
                  {/* Sidebar (Desktop Only - or collapsable) */}
                  <div className="sidebar-wrapper">
                    <StatsSidebar />
                  </div>

                  {/* Main Content Area */}
                  <main className="content-area">
                    <div className="content-scrollable">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        {/* Play mode selection */}
                        <Route path="/play" element={<PlayModeSelection />} />
                        <Route path="/play/solo" element={<SoloPlay />} />
                        <Route path="/play/multiplayer" element={<MultiplayerLobby />} />
                        <Route path="/play/multiplayer/room/:roomId" element={<MultiplayerGame />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/profile/:id" element={<PublicProfile />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/how-to-play" element={<HowToPlay />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/privacy" element={<Privacy />} />
                      </Routes>
                  </main>
                </div>
                <Footer />
              </div>
            </GameProvider>
          </SocketProvider>
        </AuthProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
};

export default App;
