import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import InvitationCode from './pages/InvitationCode';
import Auth from './pages/Auth';
import HomeFeed from './pages/Homefeed';
import Search from './pages/Search';
import Upload from './pages/Upload';
import Notification from './pages/Notification';
import User from './pages/User';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/invite" element={<InvitationCode />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<HomeFeed />} />
        <Route path="/search" element={<Search />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/notifications" element={<Notification />} />
        <Route path="/user" element={<User />} />
      </Routes>
    </Router>
  );
}

export default App;
