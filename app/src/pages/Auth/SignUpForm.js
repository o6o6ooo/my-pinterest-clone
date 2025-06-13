import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import cleanInput from '../../utils/cleanInput';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';

export default function SignUpForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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
            const user = userCredential.user;

            await updateProfile(user, { displayName: name });

            await setDoc(doc(db, 'users', user.uid), {
                name: name,
                email: email,
                icon: '🌸',            // default icon
                bgColour: '#A5C3DE',   // default icon background
                createdAt: serverTimestamp(),
            });

            await sendEmailVerification(user);
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
            <FormInput
                label="Name"
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(cleanInput(e.target.value))}
                required
                disabled={loading}
            />

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

            {/* Confirm Password */}
            <FormInput
                label="Confirm Password"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
            />

            {/* Submit */}
            <FormButton loading={loading} loadingText="Signing up...">
                Sign Up
            </FormButton> 
        </form>
    );
}