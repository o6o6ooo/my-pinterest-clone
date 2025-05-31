import { useEffect, useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

export default function UserSettings() {
    const navigate = useNavigate();
    const [userEmail, setUserEmail] = useState('');
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUserEmail(currentUser.email);
            setDisplayName(currentUser.displayName);
        }
    }, []);

    const handleCreateGroup = () => {
        navigate('/user/create-group');
    };

    const handleChangeEmail = () => {
        navigate('/user/change-email');
    };    

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
        <div className="flex flex-col items-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-4">
            <div className="mt-10 w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
            </div>{/* user icon */}

            {/* user name */}
            <h1 className="mt-8 text-xl font-semibold">{displayName}</h1>

            <div className="w-full max-w-sm mt-10 space-y-2">
                {/* email */}
                <div onClick={handleChangeEmail} className="flex justify-between items-center py-4 cursor-pointer">
                    <span>Email</span>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">{userEmail}</span> {/* 右に寄せて表示 */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                            <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                {/* password */}
                <div className="flex justify-between items-center py-4 cursor-pointer">
                    <span>Password</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* your groups */}
                <div className="flex justify-between items-center py-4 cursor-pointer">
                    <span>Your groups</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* create a group */}
                <div className="flex justify-between items-center py-4 cursor-pointer " onClick={handleCreateGroup}>
                    <span>Create a group</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* tabs in home feed */}
                <div className="flex justify-between items-center py-4 cursor-pointer">
                    <span>Tabs in home feed</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* sign out */}
                <div className="flex justify-between items-center py-4 cursor-pointer" onClick={handleSignOut}>
                    <span>Sign out</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    );
}