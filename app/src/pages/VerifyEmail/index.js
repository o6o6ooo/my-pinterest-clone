import { useState, useEffect } from 'react';
import { sendEmailVerification, deleteUser } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { deleteDoc, doc } from "firebase/firestore";

export default function VerifyEmail() {
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(async () => {
            if (auth.currentUser) {
                await auth.currentUser.reload();
                if (auth.currentUser.emailVerified) {
                    clearInterval(interval);
                    navigate('/home');
                }
            }
        }, 3000); // 3秒ごとにチェック

        return () => clearInterval(interval);
    }, [navigate]);

    const resendVerificationEmail = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await user.reload(); // ユーザ情報を最新化
                // トークンを強制リフレッシュ（オプション）
                await user.getIdToken(true);

                await sendEmailVerification(user);
                setMessage(`Verification email sent to ${user.email} again!`);
            } catch (err) {
                console.error('Resend error:', err);
                setMessage('Failed to resend email.');
            }
        } else {
            setMessage('No authenticated user.');
        }
    };

    const handleDeleteAndRestart = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                // Firestore のユーザドキュメント削除
                await deleteDoc(doc(db, "users", user.uid));

                // Authentication のユーザ削除
                await deleteUser(user);

                // `/auth` に戻る
                navigate("/auth");
            } catch (error) {
                console.error("Failed to delete user:", error);
                alert("Failed to delete user. Please try again.");
            }
        }
    };

    return (
        <div className="px-6 py-8 flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] px-4 text-[#0A4A6E]">
            <h1 className="text-lg font-semibold mb-4">Verify Your Email</h1>
            <p className="mb-5 text-center max-w-xs">Please check your email and click the verification link to activate your account.</p>

            <button
                onClick={resendVerificationEmail}
                className="py-2 px-4 rounded-lg bg-[#0A4A6E] text-white font-medium text-sm hover:bg-[#08324E] transition-colors"
            >
                Resend Verification Email
            </button>

            {message && <p className="mt-5 text-sm font-medium text-center">{message}</p>}

            <p
                className="mt-4 text-sm text-[#0A4A6E] underline cursor-pointer select-none font-medium"
                onClick={handleDeleteAndRestart}
            >
                Restart Sign Up
            </p>
        </div>
    );
}