import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { auth, db } from '../../firebase';

export default function EditGroup() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]); // そのユーザのグループ
    const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
    const [groupName, setGroupName] = useState('');
    const [groupId, setGroupId] = useState('');
    const [groupLink, setGroupLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    // 取得
    useEffect(() => {
        const fetchGroups = async () => {
            if (!auth.currentUser) return;
            const snapshot = await getDocs(collection(db, 'groups'));
            const userGroups = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(group => group.members.includes(auth.currentUser.uid));

            setGroups(userGroups);
            if (userGroups.length > 0) {
                setGroupName(userGroups[0].group_name);
                setGroupId(userGroups[0].group_id);
                setGroupLink(userGroups[0].group_link);
            }
        };

        fetchGroups();
    }, []);

    // グループ切り替え
    const handleSwitchGroup = (index) => {
        const group = groups[index];
        setCurrentGroupIndex(index);
        setGroupName(group.group_name);
        setGroupId(group.group_id);
        setGroupLink(group.group_link);
        setErrors([]);
        setSuccessMessage('');
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

    // 保存
    const handleSaveGroup = async () => {
        setErrors([]);
        setSuccessMessage('');

        if (!groupName.trim()) {
            setErrors(['Group name is required.']);
            return;
        }
        if (!groupId.trim()) {
            setErrors(['Group ID is required.']);
            return;
        }

        setIsLoading(true);

        try {
            const updatedData = {
                group_name: groupName,
                group_id: groupId.toLowerCase(),
                group_link: `https://my-pinterest-clone.com/group/${groupId.toLowerCase()}`,
            };

            await updateDoc(doc(db, 'groups', groupId.toLowerCase()), updatedData);
            setSuccessMessage('Group updated successfully!');
            setGroupLink(updatedData.group_link);
        } catch (error) {
            console.error('Group update error:', error);
            setErrors(['Failed to update group.']);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#A5C3DE] text-[#0A4A6E] px-5">

            {/* back */}
            <button onClick={() => navigate(-1)} className="absolute top-4 left-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8">
                    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
                </svg>
            </button>

            <h1 className="mt-12 text-2xl font-semibold">Edit Group</h1>

            {/* グループ切り替えボタン */}
            <div className="flex flex-wrap gap-3 mt-10 max-w-sm px-6">
                {groups.map((group, index) => (
                    <button
                        key={index}
                        onClick={() => handleSwitchGroup(index)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${index === currentGroupIndex ? 'bg-[#0A4A6E] text-white' : 'bg-white text-[#0A4A6E]'
                            }`}
                    >
                        {group.group_name}
                    </button>
                ))}
            </div>

            {/* フォーム */}
            <div className="mt-8 px-6 py-8 w-full max-w-sm flex flex-col gap-6">
                {/* Group ID */}
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

                {/* Save button */}
                <button
                    onClick={handleSaveGroup}
                    disabled={isLoading}
                    className={`py-2 px-4 mt-3 rounded-lg font-medium text-center transition-colors text-white ${isLoading ? 'bg-[#0A4A6E]/50' : 'bg-[#0A4A6E]'}`}
                >
                    {isLoading ? 'Saving...' : 'Save'}
                </button>

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="max-w-xs mt-4 p-3 text-red-600 text-sm font-medium space-y-1">
                        {errors.map((error, i) => (
                            <p key={i}>{error}</p>
                        ))}
                    </div>
                )}

                {/* Success */}
                {successMessage && (
                    <div className="max-w-xs mt-4 p-3 text-[#0A4A6E] text-sm font-medium">
                        {successMessage}
                    </div>
                )}
            </div>
        </div>
    );
}