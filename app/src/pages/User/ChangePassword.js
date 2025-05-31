import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export default function ChangePassword() {
    const navigate = useNavigate();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChangePassword = async () => {

        if (!newPassword) {
            setError('Please enter a new password.');
            return;
        }
        if (newPassword !== newPasswordConfirm) {
            setError("Passwords don't match!");
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // verfiy with old password
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, oldPassword);
            await reauthenticateWithCredential(user, credential);

            // update password
            await updatePassword(user, newPassword);
            setSuccessMessage('Password updated successfully!');
        } catch (error) {
            if (error.code === 'auth/invalid-credential') {
                setError('Old password is incorrect.');
            } else {
                setError(error.message || 'Failed to update password.');
            }        
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-5">

            {/* back */}
            <button onClick={() => navigate(-1)} className="absolute top-4 left-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
                    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
                </svg>
            </button>

            <h1 className="mt-12 text-2xl font-semibold">Change Password</h1>

            <div className="mt-10 px-6 py-8 w-full max-w-sm flex flex-col gap-6">
                {/* old password */}
                <div className="flex flex-col relative bg-white rounded-lg px-4 py-3 border border-[#0A4A6E]">
                    <label className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">Old Password</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="pt-4 bg-transparent outline-none text-[#0A4A6E]"
                    />
                </div>

                {/* new password */}
                <div className="flex flex-col relative bg-white rounded-lg px-4 py-3 border border-[#0A4A6E]">
                    <label className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">New Password</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pt-4 bg-transparent outline-none text-[#0A4A6E]"
                    />
                </div>

                {/* new password confirm*/}
                <div className="flex flex-col relative bg-white rounded-lg px-4 py-3 border border-[#0A4A6E]">
                    <label className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">New Password Confirm</label>
                    <input
                        type="password"
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        className="pt-4 bg-transparent outline-none text-[#0A4A6E]"
                    />
                </div>

                {/* change button */}
                <button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className={`py-2 px-4 mt-3 rounded-lg font-medium text-center transition-colors text-white ${isLoading ? 'bg-[#0A4A6E]/50' : 'bg-[#0A4A6E]'
                        }`}
                >
                    {isLoading ? 'Updating...' : 'Update Password'}
                </button>

                {/* errors */}
                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                {/* success message */}
                {successMessage && (
                    <div className="max-w-xs mt-4 p-3 text-[#0A4A6E] text-sm font-medium space-y-1">
                        {successMessage}
                    </div>
                )}
            </div>
        </div>
    );
}