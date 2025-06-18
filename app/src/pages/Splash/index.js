import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import SplashAnimation from './SplashAnimation';

const auto_signout_ms = 3 * 60 * 1000;

export default function Splash() {
    const navigate = useNavigate();
    const mountedRef = useRef(true);

    useEffect(() => {
        const lastActiveAt = parseInt(localStorage.getItem('lastActiveAt'), 10);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            const now = Date.now();

            console.log('lastActiveAt:', new Date(lastActiveAt).toLocaleTimeString());

            if (user && lastActiveAt && now - lastActiveAt > auto_signout_ms) {
                await signOut(auth);
                navigate('/auth', { replace: true });
                return;
            }
            
            const hasInvitation = localStorage.getItem('invitationVerified');
            const invitationVerified = hasInvitation === 'true';
            if (!mountedRef.current) return;

            if (user) {
                navigate('/home', { replace: true });
            } else if (!invitationVerified) {
                navigate('/invite', { replace: true });
            } else {
                navigate('/auth', { replace: true });
            }
        });

        return () => {
            mountedRef.current = false;
            unsubscribe();
        };
    }, [navigate]);

    return (
        <div className="flex justify-center items-center h-screen bg-[#A5C3DE]" data-testid="splash-screen">
            <SplashAnimation />
        </div>
    );
}