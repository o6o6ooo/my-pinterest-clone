import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Splash from './pages/Splash';
import InvitationCode from './pages/InvitationCode';
import Auth from './pages/Auth';
import HomeFeed from './pages/Homefeed';
import Gallery from './pages/Gallery';
import Notifications from './pages/Notifications';
import User from './pages/User';
import VerifyEmail from './pages/VerifyEmail';
import AuthProvider from './AuthProvider';
import BottomNavBar from './components/BottomNavBar';
import MainLayout from './layouts/MainLayout';
import UploadOverlay from './components/UploadOverlay';

function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const location = useLocation();

  // UploadOverlayを表示するかどうか
  const showUploadOverlay = location.pathname === '/upload';

  return (
    <>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/invite" element={<InvitationCode />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomeFeed />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/upload" element={<HomeFeed />} /> {/* アップロード時も背景はホームにしておく */}
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/user" element={<User />} />
        </Route>
      </Routes>

      {/* アップロードオーバーレイ */}
      <UploadOverlay isOpen={showUploadOverlay} onClose={() => setIsUploadOpen(false)} />

      {/* ナビゲーションバー */}
      <BottomNavBar />
    </>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}