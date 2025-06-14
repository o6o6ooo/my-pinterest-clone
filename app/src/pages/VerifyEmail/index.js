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
        }, 3000); // check if verified in every 3 seconds

        return () => clearInterval(interval);
    }, [navigate]);

    const resendVerificationEmail = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                await user.reload(); // refresh user info
                await user.getIdToken(true); // refresh token

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
                // delete user in Firestore
                await deleteDoc(doc(db, "users", user.uid));

                // delete user in Authentication
                await deleteUser(user);

                // back to `/auth`
                navigate("/auth");
            } catch (error) {
                console.error("Failed to delete user:", error);
                alert("Failed to delete user. Please try again.");
            }
        }
    };

    return (
        <div className="px-6 py-8 flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E]" data-testid="verify-email">
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