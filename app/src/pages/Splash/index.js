import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import SplashAnimation from './SplashAnimation';

export default function Splash() {
    const navigate = useNavigate();
    const mountedRef = useRef(true);

    useEffect(() => {
        console.log('Splash component mounted');
        console.log('Current user:', auth.currentUser);
        console.log('invitationVerified:', localStorage.getItem('invitationVerified'));

        const handleNavigation = () => {
            if (!mountedRef.current) return;

            const hasInvitation = localStorage.getItem('invitationVerified');
            const invitationVerified = hasInvitation === 'true';

            console.log('Navigation check:');
            console.log('Current user:', auth.currentUser);
            console.log('invitationVerified:', hasInvitation);
            console.log('invitationVerified boolean:', invitationVerified);

            if (auth.currentUser) {
                console.log('Navigating to /home');
                navigate('/home', { replace: true });
            } else if (hasInvitation === null || !invitationVerified) {
                console.log('Navigating to /invite');
                navigate('/invite', { replace: true });
            } else {
                console.log('Navigating to /auth');
                navigate('/auth', { replace: true });
            }
        };

        // 2秒後にナビゲーションを実行
        const timer = setTimeout(handleNavigation, 2000);

        // クリーンアップ関数
        return () => {
            console.log('Cleaning up Splash component');
            mountedRef.current = false;
            clearTimeout(timer);
        };
    }, [navigate]);

    return (
        <div className="flex justify-center items-center h-screen bg-[#A5C3DE]" data-testid="splash-screen">
            <SplashAnimation />
        </div>
    );
}