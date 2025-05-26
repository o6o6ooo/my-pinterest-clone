import { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

export default function RegisterName() {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Please enter your name.');
            return;
        }

        try {
            await updateProfile(auth.currentUser, { displayName: name.trim() });
            navigate('/home');
        } catch (err) {
            setError('Failed to update profile.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] px-4 text-[#0A4A6E]">
            <h1 className="text-lg font-semibold mb-4">Register Your Name</h1>
            {error && <p className="text-red-600 mb-2">{error}</p>}
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full max-w-xs p-3 rounded-lg border border-[#0A4A6E] bg-white text-[#0A4A6E] mb-4 focus:outline-none focus:ring-1 focus:ring-[#0A4A6E]"
            />
            <button type="submit" className="w-full max-w-xs py-3 rounded-lg bg-[#0A4A6E] text-white font-medium hover:bg-[#08324E] transition-colors">
                Save
            </button>
        </form>
    );
}