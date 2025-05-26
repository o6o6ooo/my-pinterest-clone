import React from 'react';
import SplashAnimation from './SplashAnimation';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';

export default function Splash() {

    const navigate = useNavigate();

    useEffect(() => {
        // 2秒間スプラッシュを表示してからチェック
        const timer = setTimeout(() => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    navigate('/home');
                } else {
                    navigate('/auth');
                }
            });
        }, 2000); // 2秒間表示

        return () => clearTimeout(timer);
    }, [navigate]);


    return (
        <div className="flex justify-center items-center h-screen bg-[#A5C3DE]">
            <SplashAnimation />
        </div>
    );
}