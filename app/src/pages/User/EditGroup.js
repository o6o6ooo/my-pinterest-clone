import { useEffect, useState } from 'react';
import { updateDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from '../../firebase';
import cleanInput from '../../utils/cleanInput';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import { ArrowLeftCircleIcon } from '@heroicons/react/24/solid';
import { ShareIcon } from '@heroicons/react/24/solid';

export default function EditGroup({ onClose }) {
    const [groups, setGroups] = useState([]);
    const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
    const [groupName, setGroupName] = useState('');
    const [groupId, setGroupId] = useState('');
    const [groupLink, setGroupLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [members, setMembers] = useState([]);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

    // get group info
    useEffect(() => {
        const fetchGroups = async () => {
            if (!auth.currentUser) return;

            try {
                // get user groups
                const userRef = doc(db, 'users', auth.currentUser.uid);
                const userDoc = await getDoc(userRef);

                if (!userDoc.exists()) return;

                const userData = userDoc.data();
                const userGroupIds = userData.groups || [];

                if (userGroupIds.length === 0) {
                    setGroups([]);
                    return;
                }

                // get group data
                const groupDocs = await Promise.all(
                    userGroupIds.map(id => getDoc(doc(db, 'groups', id)))
                );

                const userGroups = groupDocs
                    .filter(docSnap => docSnap.exists())
                    .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

                setGroups(userGroups);

                if (userGroups.length > 0) {
                    const firstGroup = userGroups[0];
                    setGroupName(firstGroup.name);
                    setGroupId(firstGroup.id);
                    setGroupLink(firstGroup.link);
                }
            } catch (error) {
                console.error('Error fetching groups:', error);
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
                    name: userData.name,
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
        setGroupName(group.name);
        setGroupId(group.id);
        setGroupLink(group.link);
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

        setLoading(true);

        try {
            const updatedData = {
                name: groupName,
                link: groupLink,
            };

            const originalDocId = groups[currentGroupIndex].id;
            await updateDoc(doc(db, 'groups', originalDocId), updatedData);
            setSuccessMessage('Group updated successfully!');
            setGroupLink(updatedData.link);
        } catch (error) {
            console.error('Group update error:', error);
            setErrors(['Failed to update group.']);
        } finally {
            setLoading(false);
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
            <button onClick={onClose} className="absolute top-6 left-6">
                <ArrowLeftCircleIcon className="w-8 h-8 text-current" />
            </button>
            <h1 className="text-2xl font-semibold">Your groups</h1>

            {groups.length === 0 ? (
                <p className="mt-6 text-center text-[#0A4A6E] text-sm">
                    You haven't joined any group
                </p>
            ) : (
                <>
                    {/* group switch buttons */}
                    <div className="flex flex-wrap gap-3 mt-5 max-w-sm px-6">
                        {groups.map((group, index) => (
                            <button
                                key={index}
                                onClick={() => handleSwitchGroup(index)}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${index === currentGroupIndex ? 'bg-[#0A4A6E] text-white' : 'bg-white text-[#0A4A6E]'}`}
                            >
                                {group.name}
                            </button>
                        ))}
                    </div>

                    <div className="px-6 py-8 w-full max-w-sm flex flex-col gap-6">
                        {/* Group ID */}
                        <FormInput
                            label="Group ID"
                            id="groupId"
                            type="text"
                            value={groupId}
                            readOnly
                            disabled
                            variant="readonly"
                        />

                        {/* Group Name */}
                        <FormInput
                            label="Group name"
                            id="groupName"
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(cleanInput(e.target.value))}
                            required
                            disabled={loading}
                        />

                        {/* Group Link */}
                        <FormInput
                            label="Group link"
                            type="text"
                            value={groupLink}
                            readOnly
                            disabled
                            variant="readonly"
                        />

                        {/* share */}
                        <button className="ml-2 text-[#0A4A6E] flex items-center" onClick={handleShare}>
                            <ShareIcon className="w-5 h-5 text-current" />
                            <span className="ml-3">Share link</span>
                        </button>

                        {/* Member icons */}
                        {members.length > 0 && (
                            <div className="flex items-center justify-center space-x-[-10px]" onClick={() => setIsMemberModalOpen(true)}>
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
                        <FormButton
                            type="button"
                            onClick={handleSaveGroup}
                            loading={loading}
                            loadingText="Saving..."
                        >
                            Save
                        </FormButton>

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

                        {/* members */}
                        {isMemberModalOpen && (
                            <div className="fixed inset-0 bg-transparent z-50 flex items-center justify-center" onClick={() => setIsMemberModalOpen(false)}>
                                <div className="bg-white rounded-xl shadow-lg p-4 w-70 max-h-[80vh] overflow-y-auto relative items-center border border-[#0A4A6E]" onClick={() => setIsMemberModalOpen(false)}>
                                    <div className="flex flex-col gap-4">
                                        {members.map((member, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xl border-2 border-white shadow-md"
                                                    style={{ backgroundColor: member.colour }}
                                                >
                                                    {member.icon}
                                                </div>
                                                <span className="text-[#0A4A6E] text-sm font-semibold">{member.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}