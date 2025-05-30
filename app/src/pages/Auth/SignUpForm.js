import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import EyeIcon from '../../components/EyeIcon';
import EyeSlashIcon from '../../components/EyeSlashIcon';

export default function SignUpForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords don't match!");
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
            await sendEmailVerification(userCredential.user);
            console.log('Verification email sent');
            navigate('/verify-email');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This email address is already registered.');
            } else {
                setError('Failed to sign up. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6 px-6 py-8 rounded-lg bg-transparent max-w-md mx-auto">
            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

            {/* name */}
            <div className="relative w-full">
                <label htmlFor="name" className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">
                    Name
                </label>
                <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all"
                    required
                    disabled={loading}
                />
            </div>

            {/* Email */}
            <div className="relative w-full">
                <label htmlFor="email" className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all"
                    required
                    disabled={loading}
                />
            </div>

            {/* Password */}
            <div className="relative w-full">
                <label htmlFor="password" className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">
                    Password
                </label>
                <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all"
                    required
                    disabled={loading}
                />
            </div>

            {/* Confirm Password */}
            <div className="relative w-full">
                <label htmlFor="confirmPassword" className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">
                    Confirm Password
                </label>
                <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pr-10 pb-3 text-[#0A4A6E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all"
                    required
                    disabled={loading}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[#0A4A6E] hover:text-[#08324E]"
                    aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                    disabled={loading}
                >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center w-full py-3 rounded-lg font-medium transition-colors ${loading ? 'bg-[#0A4A6E] opacity-50 cursor-not-allowed' : 'bg-[#0A4A6E] hover:bg-[#08324E] text-white'
                    }`}
            >
                {loading ? (
                    <>
                        Signing up...
                        <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full slow-spin ml-2"></div>
                    </>
                ) : (
                    'Sign Up'
                )}
            </button>
        </form>
    );
}