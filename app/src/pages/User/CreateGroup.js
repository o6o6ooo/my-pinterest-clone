import { useState } from 'react';
import { getDoc, setDoc, doc, serverTimestamp, arrayUnion, updateDoc } from "firebase/firestore";
import { auth, db } from '../../firebase';
import cleanInput from '../../utils/cleanInput';
import FormInput from '../../components/FormInput';
import FormButton from '../../components/FormButton';
import { ArrowLeftCircleIcon } from '@heroicons/react/24/solid';
import { ShareIcon } from '@heroicons/react/24/solid';

export default function CreateGroup({ onClose }) {
    const [groupName, setGroupName] = useState('');
    const [groupId, setGroupId] = useState('');
    const [groupLink, setGroupLink] = useState('');
    const [loading, setLoading] = useState(false);
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

        setLoading(true);

        try {
            // check duplicate record on group id
            const groupDoc = await getDoc(doc(db, 'groups', lowerGroupId));
            if (groupDoc.exists()) {
                newErrors.push('This group ID is already taken.');
                return;
            }

            // Store the group in Firestore
            const groupData = {
                name: groupName,
                link: `https://kuusi-f06ab.web.app/group/join/${lowerGroupId}`,
                members: [currentUser.uid],
                created_at: serverTimestamp(),
            };

            await setDoc(doc(db, 'groups', lowerGroupId), groupData);

            // Add groupId to current user's `groups` field
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                groups: arrayUnion(lowerGroupId)
            });
            console.log('Group created:', groupData);

            setSuccessMessage('Group created successfully!');

        } catch (error) {
            console.error('Group creation error:', error);
            alert('Failed to create group.');
        } finally {
            setLoading(false);
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
            <button onClick={onClose} className="absolute top-6 left-6">
                <ArrowLeftCircleIcon className="w-8 h-8 text-current" />
            </button>
            <h1 className="text-2xl font-semibold">Create a group</h1>
            <div className="mt-10 px-6 py-8 w-full max-w-sm flex flex-col gap-6">
                {/* Group id */}
                <FormInput
                    label="Group ID"
                    id="groupId"
                    type="text"
                    value={groupId}
                    onChange={(e) => {
                        const cleanedId = cleanInput(e.target.value, { toLowerCase: true });
                        setGroupId(cleanedId);
                        setGroupLink(`https://kuusi-f06ab.web.app/group/join/${cleanedId}`);
                    }}
                    required
                    disabled={loading}
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

                {/* Create button */}
                <FormButton
                    type="button"
                    onClick={handleCreateGroup}
                    loading={loading}
                    loadingText="UpdaSavingting..."
                >
                    Create
                </FormButton>

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