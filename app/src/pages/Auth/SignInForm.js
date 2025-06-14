import { useState } from 'react';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import cleanInput from '../../utils/cleanInput';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';

export default function SignInForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                    <FormInput
                        label="Email"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(cleanInput(e.target.value, { toLowerCase: false }))}
                        autoComplete="email"
                        required
                        disabled={loading}
                    />

                    {/* Password */}
                    <FormInput
                        label="Password"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        disabled={loading}
                    />

                    <FormButton loading={loading} loadingText="Signing in...">
                        Sign In
                    </FormButton>
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
                    <FormInput
                        label="Email"
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(cleanInput(e.target.value, { toLowerCase: false }))}
                        autoComplete="email"
                        required
                        disabled={loading}
                    />

                    <FormButton type="button" onClick={handleResetPassword} loading={loading} loadingText="Sending...">
                        Send Reset Email
                    </FormButton>
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