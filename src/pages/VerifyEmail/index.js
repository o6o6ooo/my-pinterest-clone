import { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function VerifyEmail() {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(async () => {
            if (auth.currentUser) {
                await auth.currentUser.reload();
                if (auth.currentUser.emailVerified) {
                    clearInterval(interval);
                    navigate('/register-name'); // 認証済なら名前登録ページへ遷移
                }
            }
        }, 3000); // 3秒ごとにチェック

        return () => clearInterval(interval);
    }, [navigate]);

    const resendVerificationEmail = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await sendEmailVerification(user);
                setMessage('Verification email sent again!');
            } catch (err) {
                setMessage('Failed to resend email.');
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] px-4 text-[#0A4A6E]">
            <h1 className="text-lg font-semibold mb-4">Verify Your Email</h1>
            <p className="mb-4 text-center max-w-xs">Please check your email and click the verification link to activate your account.</p>

            <button
                onClick={resendVerificationEmail}
                className="mt-2 py-3 px-4 rounded-lg bg-[#0A4A6E] text-white font-medium hover:bg-[#08324E] transition-colors"
            >
                Resend Verification Email
            </button>

            {message && <p className="mt-2 text-sm font-medium">{message}</p>}
        </div>
    );
}