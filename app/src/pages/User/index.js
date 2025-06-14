import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { PencilIcon } from '@heroicons/react/24/solid';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import ChangeEmail from './ChangeEmail';
import ChangePassword from './ChangePassword';
import SlideOver from '../../components/SlideOver';

export default function UserSettings() {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [icon, setIcon] = useState('');
    const [bgColour, setbgColour] = useState('');
    const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
    const [showChangeEmail, setShowChangeEmail] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);

    useEffect(() => {
        const currentUser = auth.currentUser;

        if (currentUser) {
            setUserEmail(currentUser.email);
            setDisplayName(currentUser.displayName);
        }

        const fetchUserIcon = async () => {
            const user = auth.currentUser;
            if (!user) return;
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setIcon(data.icon);
                setbgColour(data.bgColour);
            }
        };
        fetchUserIcon();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/auth', { replace: true });
        } catch (error) {
            console.error('Sign out error:', error);
            alert('Failed to sign out. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-4 pt-10">
            <div className="mt-10 relative w-24 h-24 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: bgColour }}>
                <span className="text-5xl flex items-center justify-center h-full">{icon}</span>

                {/* pen icon */}
                <button onClick={() => navigate('/user/edit-profile-icon')} className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-200">
                    <PencilIcon className="w-4 h-4 text-current" />
                </button>
            </div>

            {/* user name */}
            <h1 className="mt-8 text-xl font-semibold">{displayName}</h1>

            <div className="w-full max-w-sm mt-10 space-y-2">
                {/* email */}
                <div onClick={() => setShowChangeEmail(true)} className="flex justify-between items-center py-4 cursor-pointer text-lg">
                    <span>Email</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{userEmail}</span>
                        <ChevronRightIcon className="w-6 h-6 text-[#0A4A6E]" />
                    </div>
                </div>
                <SlideOver open={showChangeEmail} onClose={() => setShowChangeEmail(false)}>
                    <ChangeEmail onClose={() => setShowChangeEmail(false)} />
                </SlideOver>

                {/* password */}
                <div onClick={() => setShowChangePassword(true)} className="flex justify-between items-center py-4 cursor-pointer text-lg">
                    <span>Password</span>
                    <ChevronRightIcon className="w-6 h-6 text-[#0A4A6E]" />
                </div>
                <SlideOver open={showChangePassword} onClose={() => setShowChangePassword(false)}>
                    <ChangePassword onClose={() => setShowChangePassword(false)} />
                </SlideOver>

                {/* your groups */}
                <div onClick={() => navigate('/user/edit-group')} className="flex justify-between items-center py-4 cursor-pointer text-lg">
                    <span>Your groups</span>
                    <ChevronRightIcon className="w-6 h-6 text-[#0A4A6E]" />
                </div>

                {/* create a group */}
                <div onClick={() => navigate('/user/create-group')} className="flex justify-between items-center py-4 cursor-pointer text-lg">
                    <span>Create a group</span>
                    <ChevronRightIcon className="w-6 h-6 text-[#0A4A6E]" />
                </div>

                {/* hashtags */}
                <div onClick={() => navigate('/user/hashtags')} className="flex justify-between items-center py-4 cursor-pointer text-lg">
                    <span>Hashtags</span>
                    <ChevronRightIcon className="w-6 h-6 text-[#0A4A6E]" />
                </div>

                {/* sign out */}
                <div className="flex justify-between items-center py-4 cursor-pointer text-lg" onClick={handleSignOut}>
                    <span>Sign out</span>
                    <ChevronRightIcon className="w-6 h-6 text-[#0A4A6E]" />
                </div>

                {/* privacy policy */}
                <div className="flex justify-between items-center py-4 cursor-pointer text-sm" onClick={() => setIsPrivacyPolicyOpen(true)}>
                    <span>Privacy Policy</span>
                </div>
                {isPrivacyPolicyOpen && (
                    <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center" onClick={() => setIsPrivacyPolicyOpen(false)}>
                        <div className="bg-white rounded-xl shadow-lg p-4 w-70 max-h-[80vh] overflow-y-auto relative items-center border border-[#0A4A6E] mx-8" onClick={() => setIsPrivacyPolicyOpen(false)}>
                            <div className="flex flex-col gap-2 text-sm">
                                <h2 className="font-bold">Privacy & Security</h2>
                                <span>- Uploaded images cannot be accessed publicly</span>
                                <span>- Only signed-in users can upload or view photos
                                </span>
                                <span>- All photos data is protected from unauthorized access</span>
                                <span>- Image URLs are only generated after login and expire after 1 hour</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}