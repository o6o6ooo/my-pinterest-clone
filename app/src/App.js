import { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation, Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash';
import InvitationCode from './pages/InvitationCode';
import Auth from './pages/Auth';
import HomeFeed from './pages/Homefeed';
import BrowseByYear from './pages/BrowseByYear';
import User from './pages/User';
import VerifyEmail from './pages/VerifyEmail';
import AuthProvider from './AuthProvider';
import BottomNavBar from './components/BottomNavBar';
import MainLayout from './layouts/MainLayout';
import UploadOverlay from './components/UploadOverlay';
import Post from './pages/Post';
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

  const hideNavBarPaths = ['/auth', '/verify-email', '/invite'];
  const shouldShowNavBar = !hideNavBarPaths.some(path =>
    location.pathname.startsWith(path)
  );

  useEffect(() => {
    const saveLastActiveTime = () => {
      localStorage.setItem('lastActiveAt', Date.now().toString());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveLastActiveTime();
      }
    };

    window.addEventListener('beforeunload', saveLastActiveTime);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', saveLastActiveTime);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/invite" element={<InvitationCode />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/group/join/:groupId" element={<JoinGroup />} />
        <Route element={<MainLayout />}>
          <Route path="/home" element={<HomeFeed />} />
          <Route path="/browse-by-year" element={<BrowseByYear />} />
          <Route path="/upload" element={<Post />} />
          <Route path="/user" element={<User />} />
          <Route path="/post" element={<Post />} />
          <Route path="/user/create-group" element={<CreateGroup />} />
          <Route path="/user/change-email" element={<ChangeEmail />} />
          <Route path="/user/change-password" element={<ChangePassword />} />
          <Route path="/user/edit-group" element={<EditGroup />} />
          <Route path="/user/edit-profile-icon" element={<EditProfileIcon />} />
          <Route path="/user/hashtags" element={<Hashtags />} />
        </Route>
      </Routes>

      <UploadOverlay
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {shouldShowNavBar && (
        <BottomNavBar onUploadClick={() => setIsUploadOpen(true)} />
      )}
    </div>
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