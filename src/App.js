import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import InvitationCode from './pages/InvitationCode';
import Auth from './pages/Auth';
import HomeFeed from './pages/Homefeed';
import Gallery from './pages/Gallery';
import Upload from './pages/Upload';
import Notifications from './pages/Notifications';
import User from './pages/User';
import VerifyEmail from './pages/VerifyEmail';
import AuthProvider from './AuthProvider';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/invite" element={<InvitationCode />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<HomeFeed />} />
          <Route path="/Gallery" element={<Gallery />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/user" element={<User />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
