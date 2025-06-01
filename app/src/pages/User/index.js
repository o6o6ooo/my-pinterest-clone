import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function UserSettings() {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [icon, setIcon] = useState('😊');
    const [bgColour, setbgColour] = useState('#FEEB6C');

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
                setIcon(data.icon || '😊');
                setbgColour(data.bgColour || '#FEEB6C');
            }
        };
        fetchUserIcon();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/signin');
        } catch (error) {
            console.error('Sign out error:', error);
            alert('Failed to sign out. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-4 pt-10">
            <div className="mt-10 relative w-24 h-24 rounded-full" style={{ backgroundColor: bgColour }}>
                <span className="text-5xl flex items-center justify-center h-full">{icon}</span>

                {/* ペンアイコンの小さい丸バッジ */}
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-200">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-[#0A4A6E]"
                    >
                        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                    </svg>
                </button>
            </div>

            {/* user name */}
            <h1 className="mt-8 text-xl font-semibold">{displayName}</h1>

            <div className="w-full max-w-sm mt-10 space-y-2">
                {/* email */}
                <div onClick={() => navigate('/user/change-email')} className="flex justify-between items-center py-4 cursor-pointer text-lg">
                    <span>Email</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{userEmail}</span> {/* 右に寄せて表示 */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                            <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                {/* password */}
                <div onClick={() => navigate('/user/change-password')} className="flex justify-between items-center py-4 cursor-pointer text-lg">
                    <span>Password</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* your groups */}
                <div onClick={() => navigate('/user/edit-group')} className="flex justify-between items-center py-4 cursor-pointer text-lg">
                    <span>Your groups</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* create a group */}
                <div onClick={() => navigate('/user/create-group')} className="flex justify-between items-center py-4 cursor-pointer text-lg">
                    <span>Create a group</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* tabs in home feed */}
                <div className="flex justify-between items-center py-4 cursor-pointer text-lg">
                    <span>Tabs in home feed</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* sign out */}
                <div className="flex justify-between items-center py-4 cursor-pointer text-lg" onClick={handleSignOut}>
                    <span>Sign out</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    );
}