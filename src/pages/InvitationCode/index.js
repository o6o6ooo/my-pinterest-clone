import { useState } from 'react';
import './index.css';

export default function InvitationCode() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const validCode = 'Helsinki';

        if (code.trim() === '') {
            setError('Please enter the invitation code.');
        } else if (code !== validCode) {
            setError('The invitation code is incorrect.');
        } else {
            setError('');
            console.log('Correct code!');
            // ページ遷移処理など
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] font-sans px-4 text-[#0A4A6E]">
            <h1 className="text-lg font-semibold mb-4">Invitation Code</h1>

            <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-xs">
                {error && (
                    <p className="text-red-600 text-sm mb-2 font-medium animate-fadeIn">{error}</p>
                )}

                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your code"
                    className="w-full p-3 border border-[#0A4A6E] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-colors bg-white placeholder-gray-400 text-[#0A4A6E]"
                />

                <button
                    type="submit"
                    className="mt-4 py-3 rounded-lg bg-[#0A4A6E] text-white hover:bg-[#08324E] transition-colors font-medium"
                >
                    Verify
                </button>
            </form>
        </div>
    );
}