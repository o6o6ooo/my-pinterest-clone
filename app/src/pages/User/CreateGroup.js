import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, db } from '../../firebase';

export default function CreateGroup() {
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState('');
    const [groupId, setGroupId] = useState('');
    const [groupLink, setGroupLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const currentUser = auth.currentUser;
    const lowerGroupId = groupId.toLowerCase();

    const handleCreateGroup = async () => {
        setErrors([]);
        setSuccessMessage('');

        // validation check
        const newErrors = [];
        if (!groupName.trim()) newErrors.push('Group name is required.');
        if (!groupId.trim()) newErrors.push('Group ID is required.');
        setErrors(newErrors);
        if (newErrors.length > 0) return;

        setIsLoading(true);

        try {
            // check duplicate record on group id
            const docRef = doc(db, 'groups', groupId);
            const groupDoc = await getDoc(doc(db, 'groups', lowerGroupId));
            if (groupDoc.exists()) {
                newErrors.push('This group ID is already taken.');
                return;
            }

            // Store the group in Firestore
            const groupData = {
                group_name: groupName,
                group_id: lowerGroupId,
                group_link: `https://my-pinterest-clone.com/group/${lowerGroupId}`,
                members: [currentUser.uid],
                created_at: serverTimestamp(),
            };

            await setDoc(doc(db, 'groups', lowerGroupId), groupData);
            console.log('Group created:', groupData);

            setSuccessMessage('Group created successfully!');

        } catch (error) {
            console.error('Group creation error:', error);
            alert('Failed to create group.');
        } finally {
            setIsLoading(false);
        }
    };

    // open share window *needs to be fixed after releasing
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Check this out!',
                text: 'Join my group on Kuusi!',
                url: groupLink,
            })
                .then(() => console.log('Shared successfully!'))
                .catch((error) => console.error('Error sharing:', error));
        } else {
            alert('Sharing is not supported on this browser.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-5">

            {/* back */}
            <button onClick={() => navigate(-1)} className="absolute top-4 left-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
                </svg>
            </button>

            <h1 className="mt-12 text-2xl font-semibold">Create Group</h1>

            <div className="mt-10 px-6 py-8 w-full max-w-sm flex flex-col gap-6">
                {/* Group id */}
                <div className="flex flex-col relative bg-white rounded-lg px-4 py-3 border border-[#0A4A6E]">
                    <label className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">Group ID</label>
                    <input
                        type="text"
                        value={groupId}
                        onChange={(e) => {
                            const id = e.target.value;
                            setGroupId(id);
                            setGroupLink(`https://your-app.com/group/join/${id.toLowerCase()}`);
                          }}
                        className="pt-4 bg-transparent outline-none text-[#0A4A6E]"
                    />
                </div>

                {/* Group Name */}
                <div className="flex flex-col relative bg-white rounded-lg px-4 py-3 border border-[#0A4A6E]">
                    <label className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">Group name</label>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="pt-4 bg-transparent outline-none text-[#0A4A6E]"
                    />
                </div>

                {/* Group Link */}
                <div className="flex flex-col relative bg-[#dfdfdf] rounded-lg px-4 py-3 border border-[#0A4A6E]">
                    <label className="absolute left-3 top-2 text-xs text-[#0A4A6E] font-medium pointer-events-none">Group link</label>
                    <div className="flex items-center pt-4">
                        <input
                            type="text"
                            value={groupLink}
                            readOnly
                            className="flex-1 bg-transparent outline-none text-gray-600"
                        />
                    </div>
                </div>

                {/* share */}
                <button className="ml-2 text-[#0A4A6E] flex items-center" onClick={handleShare}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                        <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-3">Share link</span>
                </button>

                {/* Create button */}
                <button
                    onClick={handleCreateGroup}
                    className="py-2 px-4 mt-3 rounded-lg font-medium text-center transition-colors bg-[#0A4A6E] text-white"
                >
                    Create
                </button>

                {/* validation errors */}
                {errors.length > 0 && (
                    <div className="max-w-xs mt-4 p-3 text-red-600 text-sm font-medium space-y-1">
                        {errors.map((error, i) => (
                            <p key={i}>{error}</p>
                        ))}
                    </div>
                )}

                {/* success message */}
                {successMessage && (
                    <div className="max-w-xs mt-4 p-3 text-[#0A4A6E] text-sm font-medium space-y-1">
                        {successMessage}
                    </div>
                )}
            </div>
        </div>
    );
}