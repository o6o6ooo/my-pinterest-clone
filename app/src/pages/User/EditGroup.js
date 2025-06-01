import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from '../../firebase';

export default function EditGroup() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
    const [groupName, setGroupName] = useState('');
    const [groupId, setGroupId] = useState('');
    const [groupLink, setGroupLink] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [members, setMembers] = useState([]);

    // get group info
    useEffect(() => {
        const fetchGroups = async () => {
            if (!auth.currentUser) return;
            const snapshot = await getDocs(collection(db, 'groups'));
            const userGroups = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(group => group.members.includes(auth.currentUser.uid));

            setGroups(userGroups);
            if (userGroups.length > 0) {
                const firstGroup = userGroups[0];
                setGroupName(firstGroup.group_name);
                setGroupId(firstGroup.group_id);
                setGroupLink(firstGroup.group_link);
            }
        };
        fetchGroups();
    }, []);

    // get member info
    useEffect(() => {
        const fetchMembers = async () => {
            const group = groups[currentGroupIndex];
            if (!group) return;

            const memberUIDs = group.members || [];
            const userDocs = await Promise.all(
                memberUIDs.map(uid => getDoc(doc(db, 'users', uid)))
            );

            const memberData = userDocs.map(userDoc => {
                const userData = userDoc.data();
                return {
                    icon: userData.icon,
                    colour: userData.bgColour,
                };
            });

            setMembers(memberData);
        };
        fetchMembers();
    }, [groups, currentGroupIndex]);

    // switch groups
    const handleSwitchGroup = (index) => {
        const group = groups[index];
        setCurrentGroupIndex(index);
        setGroupName(group.group_name);
        setGroupId(group.group_id);
        setGroupLink(group.group_link);
        setErrors([]);
        setSuccessMessage('');
    };

    // save
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

    // share
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Check this out!',
                text: 'Join my group on Kuusi!',
                url: groupLink,
            }).then(() => console.log('Shared successfully!'))
                .catch((error) => console.error('Error sharing:', error));
        } else {
            alert('Sharing is not supported on this browser.');
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

            <h1 className="text-2xl font-semibold">Your groups</h1>

            {/* group swtich button */}
            <div className="flex flex-wrap gap-3 mt-5 max-w-sm px-6">
                {groups.map((group, index) => (
                    <button
                        key={index}
                        onClick={() => handleSwitchGroup(index)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${index === currentGroupIndex ? 'bg-[#0A4A6E] text-white' : 'bg-white text-[#0A4A6E]'}`}
                    >
                        {group.group_name}
                    </button>
                ))}
            </div>

            <div className="px-6 py-8 w-full max-w-sm flex flex-col gap-6">
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

                {/* Member icons */}
                {members.length > 0 && (
                    <div className="flex items-center justify-center space-x-[-10px]">
                        {members.map((member, idx) => (
                            <div
                                key={idx}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xl border-2 border-white shadow-md"
                                style={{ backgroundColor: member.colour }}
                            >
                                {member.icon}
                            </div>
                        ))}
                    </div>
                )}

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