import { useState } from 'react';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../../firebase';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import { ArrowLeftCircleIcon } from '@heroicons/react/24/solid';

export default function ChangePassword({ onClose }) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
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

        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const user = auth.currentUser;
            const credential = EmailAuthProvider.credential(user.email, oldPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setSuccessMessage('Password updated successfully!');
            setOldPassword('');
            setNewPassword('');
            setNewPasswordConfirm('');
        } catch (error) {
            if (error.code === 'auth/invalid-credential') {
                setError('Old password is incorrect.');
            } else {
                setError(error.message || 'Failed to update password.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-5">

            {/* back */}
            <button onClick={onClose} className="absolute top-6 left-6">
                <ArrowLeftCircleIcon className="w-8 h-8 text-current" />
            </button>

            <h2 className="text-xl font-semibold mb-6">Change Password</h2>

            <div className="mt-10 px-6 py-8 w-full max-w-sm flex flex-col gap-6">
                <FormInput
                    label="Old Password"
                    id="old-password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    disabled={loading}
                />
                <FormInput
                    label="New Password"
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                />
                <FormInput
                    label="Confirm New Password"
                    id="confirm-password"
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    required
                    disabled={loading}
                />

                <FormButton
                    type="button"
                    onClick={handleChangePassword}
                    loading={loading}
                    loadingText="Updating..."
                >
                    Update Password
                </FormButton>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                {successMessage && (
                    <p className="text-[#0A4A6E] text-sm font-medium">{successMessage}</p>
                )}
            </div>
        </div>
    );
}