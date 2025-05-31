import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AuthProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const publicPages = ['/auth', '/verify-email'];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                if (!user.emailVerified) {
                    if (location.pathname !== '/verify-email') {
                        navigate('/verify-email');
                    }
                } else {
                    // 認証済みで、かつ今が /home じゃなければ遷移
                    if (!['/home', '/gallery', '/upload', '/notifications', '/user', '/post', '/user/create-group', '/user/change-email', '/user/change-password', '/user/edit-group'].includes(location.pathname)) {
                        navigate('/home');
                    }
                }
            } else {
                if (location.pathname !== '/auth') {
                    navigate('/auth');
                }
            }
        });
        return () => unsubscribe();
    }, [navigate, location]);

    return children;
}