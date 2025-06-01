import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import Post from './pages/Post';
import UserDashboard from './pages/User';
import CreateGroup from './pages/User/CreateGroup';
import ChangeEmail from './pages/User/ChangeEmail';
import ChangePassword from './pages/User/ChangePassword';
import EditGroup from './pages/User/EditGroup';
import JoinGroup from './pages/User/JoinGroup';
import EditProfileIcon from './pages/User/EditProfileIcon';
import Hashtags from './pages/User/Hashtags';

function App() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const location = useLocation();
  const showUploadOverlay = location.pathname === '/upload';
  const navigate = useNavigate();

  const openUploadOverlay = () => {
    navigate('/upload');
  };

  const closeUploadOverlay = () => {
    navigate(-1);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/invite" element={<InvitationCode />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/group/join/:groupId" element={<JoinGroup />} />
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomeFeed />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/upload" element={<Post />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/user" element={<User />} />
          <Route path="/post" element={<Post />} />
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/user/create-group" element={<CreateGroup />} />
          <Route path="/user/change-email" element={<ChangeEmail />} />
          <Route path="/user/change-password" element={<ChangePassword />} />
          <Route path="/user/edit-group" element={<EditGroup />} />
          <Route path="/user/edit-profile-icon" element={<EditProfileIcon />} />
          <Route path="/user/hashtags" element={<Hashtags />} />
        </Route>
      </Routes>

      {/* upload overlay */}
      <UploadOverlay
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)} // close overlay
      />

      {/* nav bar */}
      <BottomNavBar
        onUploadClick={() => setIsUploadOpen(true)} // open overlay
      />
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