// ChangeEmailContent.js
import { useState, useEffect } from 'react';
import { updateEmail, getAuth } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import cleanInput from '../../utils/cleanInput';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import { ArrowLeftCircleIcon } from '@heroicons/react/24/solid';

export default function ChangeEmail({ onClose }) {
    const [oldEmail, setOldEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const auth = getAuth();
        if (auth.currentUser) {
            setOldEmail(auth.currentUser.email);
        }
    }, []);

    const handleChangeEmail = async () => {
        setError('');
        setSuccessMessage('');

        if (!newEmail) {
            setError('Please enter a new email.');
            return;
        }

        try {
            setLoading(true);
            await updateEmail(auth.currentUser, newEmail);
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userDocRef, {
                email: newEmail,
                updated_at: new Date(),
            });
            setSuccessMessage('Email updated successfully!');
        } catch (err) {
            console.error(err);
            setError('Failed to update email.');
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

            <h1 className="text-2xl font-semibold">Change Email</h1>

            <div className="mt-10 px-6 py-8 w-full max-w-sm flex flex-col gap-6">
                <FormInput
                    label="Old Email"
                    type="text"
                    value={oldEmail}
                    readOnly
                    disabled
                    variant="readonly"
                />

                <FormInput
                    label="New Email"
                    id="email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(cleanInput(e.target.value, { toLowerCase: false }))}
                    required
                    disabled={loading}
                />

                <FormButton
                    type="button"
                    onClick={handleChangeEmail}
                    loading={loading}
                    loadingText="Updating..."
                >
                    Update Email
                </FormButton>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                {successMessage && (
                    <div className="max-w-xs mt-4 p-3 text-[#0A4A6E] text-sm font-medium space-y-1">
                        {successMessage}
                    </div>
                )}
            </div>
        </div>
    );
}