import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export default function HomeFeed() {
    const handleSignOut = async () => {
        try {
            await signOut(auth);
            console.log('Signed out!');
        } catch (err) {
            console.error('Failed to sign out:', err);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E]">
            <h1 className="text-xl font-semibold mb-4">Home Feed</h1>
        </div>
    );
}