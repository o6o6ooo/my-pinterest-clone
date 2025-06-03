import { useState, useEffect } from 'react';
import { updateEmail, getAuth } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import cleanInput from '../../utils/cleanInput';

export default function ChangeEmail() {
    const [oldEmail, setOldEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
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
            setIsLoading(true);

            // update in authentication
            await updateEmail(auth.currentUser, newEmail);

            // update in firestore
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

            <h1 className="text-2xl font-semibold">Change Email</h1>

            <div className="mt-10 px-6 py-8 w-full max-w-sm flex flex-col gap-6">
                {/* old email */}
                <div className="flex flex-col relative bg-[#dfdfdf] rounded-lg px-4 py-3 border border-[#0A4A6E]">
                    <label className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">Old Email</label>
                    <div className="flex items-center pt-4">
                        <input
                            type="text"
                            value={oldEmail}
                            readOnly
                            className="flex-1 bg-transparent outline-none text-gray-600"
                        />
                    </div>
                </div>

                {/* new email */}
                <div className="flex flex-col relative bg-white rounded-lg px-4 py-3 border border-[#0A4A6E]">
                    <label className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">New Email</label>
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(cleanInput(e.target.value, { toLowerCase: false }))}
                        className="pt-4 bg-transparent outline-none text-[#0A4A6E]"
                    />
                </div>

                {/* change button */}
                <button
                    onClick={handleChangeEmail}
                    disabled={isLoading}
                    className={`py-2 px-4 mt-3 rounded-lg font-medium text-center transition-colors bg-[#0A4A6E] text-white ${isLoading ? 'bg-[#0A4A6E]/50' : 'bg-[#0A4A6E]'
                    }`}
                    >
                    {isLoading ? 'Updating...' : 'Update Email'}
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