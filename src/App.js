import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import InvitationCode from './pages/InvitationCode';
import Auth from './pages/Auth';
import HomeFeed from './pages/Homefeed';
import Gallery from './pages/Gallery';
import Notifications from './pages/Notifications';
import User from './pages/User';
import VerifyEmail from './pages/VerifyEmail';
import AuthProvider from './AuthProvider';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/invite" element={<InvitationCode />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* ここからはタブ付きページ用レイアウト */}
          <Route element={<MainLayout />}>
            <Route path="/home" element={<HomeFeed />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/user" element={<User />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;