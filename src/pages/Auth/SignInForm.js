import { useState } from 'react';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import EyeIcon from '../../components/EyeIcon';
import EyeSlashIcon from '../../components/EyeSlashIcon';

export default function SignInForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [resetMode, setResetMode] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [resetIsError, setResetIsError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Signed in successfully!');
        } catch (err) {
            setError('Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setResetMessage('');
        setResetIsError(false);
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, resetEmail);
            setResetMessage('Password reset email sent!');
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                setResetMessage('This email address is not registered.');
                setResetIsError(true);
            } else {
                setResetMessage('Failed to send reset email.');
                setResetIsError(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-6 py-8 rounded-lg bg-transparent max-w-md mx-auto relative">
            {!resetMode ? (
                <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                    {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

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
                            autoComplete="current-password"
                            className="w-full border border-[#0A4A6E] rounded-lg p-3 pt-6 pb-3 text-[#0A4A6E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all"
                            required
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-[#0A4A6E] hover:text-[#08324E]"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            disabled={loading}
                        >
                            {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center justify-center w-full py-3 rounded-lg font-medium transition-colors ${loading ? 'bg-[#0A4A6E] opacity-50 cursor-not-allowed' : 'bg-[#0A4A6E] hover:bg-[#08324E] text-white'
                            }`}
                    >
                        {loading ? (
                            <>
                                Signing in...
                                <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full slow-spin ml-2"></div>
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>                    
                    <p
                        className="mt-4 text-sm text-[#0A4A6E] underline cursor-pointer select-none"
                        onClick={() => {
                            setResetMode(true);
                            setResetMessage('');
                            setResetEmail(email);
                        }}
                    >
                        Forgot password?
                    </p>
                </form>
            ) : (
                <div className="flex flex-col space-y-4">
                    <p className="text-[#0A4A6E] font-semibold">Reset Password</p>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full border border-[#0A4A6E] rounded-lg p-3 text-[#0A4A6E] bg-white focus:outline-none focus:ring-1 focus:ring-[#0A4A6E] transition-all"
                        required
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={loading}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${loading ? 'bg-[#0A4A6E] opacity-50 cursor-not-allowed' : 'bg-[#0A4A6E] hover:bg-[#08324E] text-white'
                            }`}
                    >
                        {loading ? 'Sending...' : 'Send Reset Email'}
                    </button>
                    {resetMessage && (
                        <p className={`text-sm font-medium ${resetIsError ? 'text-red-600' : 'text-[#0A4A6E]'}`}>
                            {resetMessage}
                        </p>
                    )}
                    <p
                        className="mt-4 text-sm text-[#0A4A6E] underline cursor-pointer select-none"
                        onClick={() => setResetMode(false)}
                    >
                        Back to Sign In
                    </p>
                </div>
            )}
        </div>
    );
}